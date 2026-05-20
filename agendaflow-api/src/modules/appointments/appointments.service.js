const repo        = require('./appointments.repository');
const svcRepo     = require('../services/services.repository');
const schedRepo   = require('../schedules/schedules.repository');
const profRepo    = require('../professionals/professionals.repository');
const { AppError } = require('../../shared/AppError');

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function parseLocalDate(str) {
  if (str instanceof Date) return str;
  return new Date(str.replace('T', ' ').replace('Z', ''));
}

function toLocalString(date) {
  // Formata para "YYYY-MM-DD HH:MM:SS" sem conversão UTC
  return date.toLocaleString('sv-SE').replace('T', ' ').slice(0, 19);
}

async function getAvailableSlots({ professional_id, service_id, date }) {
  const prof = await profRepo.findById(professional_id);
  if (!prof || !prof.active) throw AppError('Profissional não encontrado ou inativo.', 404);

  const service = await svcRepo.findById(service_id);
  if (!service || !service.active) throw AppError('Serviço não encontrado ou inativo.', 404);

  const targetDate   = new Date(date + 'T00:00:00');
  const weekday      = targetDate.getDay();
  const allSchedules = await schedRepo.findByProfessional(professional_id);
  const daySchedules = allSchedules.filter((s) => s.weekday === weekday);

  if (daySchedules.length === 0) return { date, slots: [] };

  const duration = service.duration_min;
  const booked   = await repo.findByProfessionalAndDate(professional_id, date);

  const busySlots = booked.map((apt) => {
    // MySQL pode retornar datetime como string "2025-06-10 10:30:00" ou como objeto Date
    const sStr = typeof apt.starts_at === 'string'
      ? apt.starts_at.replace(' ', 'T')
      : apt.starts_at.toISOString();
    const eStr = typeof apt.ends_at === 'string'
      ? apt.ends_at.replace(' ', 'T')
      : apt.ends_at.toISOString();

    const s = parseLocalDate(sStr);
    const e = parseLocalDate(eStr);

    return {
      start: s.getHours() * 60 + s.getMinutes(),
      end:   e.getHours() * 60 + e.getMinutes(),
    };
  });

  const slots = [];

  for (const schedule of daySchedules) {
    const workStart = toMinutes(schedule.start_time);
    const workEnd   = toMinutes(schedule.end_time);

    for (let cursor = workStart; cursor + duration <= workEnd; cursor += duration) {
      const slotEnd  = cursor + duration;
      const conflict = busySlots.some((busy) => cursor < busy.end && slotEnd > busy.start);
      const hh = String(Math.floor(cursor / 60)).padStart(2, '0');
      const mm = String(cursor % 60).padStart(2, '0');
      slots.push({ time: `${hh}:${mm}`, available: !conflict });
    }
  }

  slots.sort((a, b) => a.time.localeCompare(b.time));
  return { date, slots };
}

async function create(clientId, { professional_id, service_id, starts_at, notes }) {
  const service = await svcRepo.findById(service_id);
  if (!service || !service.active) throw AppError('Serviço não encontrado ou inativo.', 404);

  const prof = await profRepo.findById(professional_id);
  if (!prof || !prof.active) throw AppError('Profissional não encontrado ou inativo.', 404);

  // Interpreta horário como local, sem conversão UTC
  const startsAt = parseLocalDate(starts_at);
  const endsAt   = new Date(startsAt.getTime() + service.duration_min * 60 * 1000);

  const weekday      = startsAt.getDay();
  const allSchedules = await schedRepo.findByProfessional(professional_id);
  const daySchedules = allSchedules.filter((s) => s.weekday === weekday);

  if (daySchedules.length === 0) throw AppError('O profissional não atende nesse dia da semana.', 422);

  const slotStart      = startsAt.getHours() * 60 + startsAt.getMinutes();
  const slotEnd        = endsAt.getHours()   * 60 + endsAt.getMinutes();
  const fitsInSchedule = daySchedules.some((s) => {
    const workStart = toMinutes(s.start_time);
    const workEnd   = toMinutes(s.end_time);
    return slotStart >= workStart && slotEnd <= workEnd;
  });

  if (!fitsInSchedule) throw AppError('Horário fora do expediente do profissional.', 422);

  const conflicts = await repo.findConflicts({
    professionalId: professional_id,
    startsAt: toLocalString(startsAt),
    endsAt:   toLocalString(endsAt),
  });

  if (conflicts.length > 0) throw AppError('Este horário já está reservado. Escolha outro.', 409);

  const id = await repo.create({
    professionalId: professional_id,
    serviceId:      service_id,
    clientId,
    startsAt: toLocalString(startsAt),
    endsAt:   toLocalString(endsAt),
    notes,
  });

  return repo.findById(id);
}

async function getById(id) {
  const apt = await repo.findById(id);
  if (!apt) throw AppError('Agendamento não encontrado.', 404);
  return apt;
}

async function listByClient(clientId, query) {
  return repo.findByClient(clientId, query);
}

async function listByProfessional(professionalId, query) {
  return repo.findByProfessional(professionalId, query);
}

async function updateStatus(id, userId, role, newStatus) {
  const apt            = await getById(id);
  const isOwnerOrAdmin = role === 'admin' || role === 'owner';
  const isClient       = apt.client_id === userId;

  if (newStatus === 'cancelled') {
    if (!isClient && !isOwnerOrAdmin) throw AppError('Acesso negado.', 403);
  } else {
    if (!isOwnerOrAdmin) throw AppError('Apenas o estabelecimento pode alterar este status.', 403);
  }

  if (apt.status === 'completed') throw AppError('Agendamento já concluído não pode ser alterado.', 422);
  if (apt.status === 'cancelled') throw AppError('Agendamento já cancelado não pode ser alterado.', 422);

  await repo.updateStatus(id, newStatus);
  return repo.findById(id);
}

module.exports = { getAvailableSlots, create, getById, listByClient, listByProfessional, updateStatus };