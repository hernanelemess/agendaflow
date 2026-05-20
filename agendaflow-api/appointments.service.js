const repo        = require('./appointments.repository');
const svcRepo     = require('../services/services.repository');
const schedRepo   = require('../schedules/schedules.repository');
const profRepo    = require('../professionals/professionals.repository');
const { AppError } = require('../../shared/AppError');

// Converte "HH:MM" em minutos desde meia-noite — facilita comparações
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Calcula os slots livres de um profissional em um dia, dado um serviço (duração)
async function getAvailableSlots({ professional_id, service_id, date }) {
  const prof = await profRepo.findById(professional_id);
  if (!prof || !prof.active) throw AppError('Profissional não encontrado ou inativo.', 404);

  const service = await svcRepo.findById(service_id);
  if (!service || !service.active) throw AppError('Serviço não encontrado ou inativo.', 404);

  // Descobre o dia da semana da data pedida (0=Dom ... 6=Sab)
  const targetDate  = new Date(date + 'T00:00:00');
  const weekday     = targetDate.getDay();

  // Busca a grade de horários do profissional nesse dia
  const allSchedules = await schedRepo.findByProfessional(professional_id);
  const schedule     = allSchedules.find((s) => s.weekday === weekday);

  if (!schedule) {
    return { date, slots: [] }; // profissional não trabalha nesse dia
  }

  const workStart  = toMinutes(schedule.start_time);
  const workEnd    = toMinutes(schedule.end_time);
  const duration   = service.duration_min;

  // Busca todos os agendamentos existentes do profissional nesse dia
  const booked = await repo.findByProfessionalAndDate(professional_id, date);

  // Monta lista de intervalos já ocupados em minutos
  const busySlots = booked.map((apt) => {
    const s = new Date(apt.starts_at);
    const e = new Date(apt.ends_at);
    return {
      start: s.getHours() * 60 + s.getMinutes(),
      end:   e.getHours() * 60 + e.getMinutes(),
    };
  });

  // Gera todos os slots possíveis dentro do expediente
  const slots = [];
  for (let cursor = workStart; cursor + duration <= workEnd; cursor += 30) {
    const slotEnd = cursor + duration;

    // Verifica se algum agendamento existente conflita com esse slot
    const conflict = busySlots.some(
      (busy) => cursor < busy.end && slotEnd > busy.start
    );

    if (!conflict) {
      // Formata o slot como "HH:MM"
      const hh = String(Math.floor(cursor / 60)).padStart(2, '0');
      const mm = String(cursor % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }

  return { date, slots };
}

async function create(clientId, { professional_id, service_id, starts_at, notes }) {
  const service = await svcRepo.findById(service_id);
  if (!service || !service.active) throw AppError('Serviço não encontrado ou inativo.', 404);

  const prof = await profRepo.findById(professional_id);
  if (!prof || !prof.active) throw AppError('Profissional não encontrado ou inativo.', 404);

  // Calcula ends_at somando a duração do serviço
  const startsAt = new Date(starts_at);
  const endsAt   = new Date(startsAt.getTime() + service.duration_min * 60 * 1000);

  // Verifica o expediente do profissional nesse dia
  const weekday      = startsAt.getDay();
  const allSchedules = await schedRepo.findByProfessional(professional_id);
  const schedule     = allSchedules.find((s) => s.weekday === weekday);

  if (!schedule) {
    throw AppError('O profissional não atende nesse dia da semana.', 422);
  }

  const workStart  = toMinutes(schedule.start_time);
  const workEnd    = toMinutes(schedule.end_time);
  const slotStart  = startsAt.getHours() * 60 + startsAt.getMinutes();
  const slotEnd    = endsAt.getHours()   * 60 + endsAt.getMinutes();

  if (slotStart < workStart || slotEnd > workEnd) {
    throw AppError('Horário fora do expediente do profissional.', 422);
  }

  // Checa conflito com agendamentos existentes
  const conflicts = await repo.findConflicts({
    professionalId: professional_id,
    startsAt: startsAt.toISOString().slice(0, 19).replace('T', ' '),
    endsAt:   endsAt.toISOString().slice(0, 19).replace('T', ' '),
  });

  if (conflicts.length > 0) {
    throw AppError('Este horário já está reservado. Escolha outro.', 409);
  }

  const id = await repo.create({
    professionalId: professional_id,
    serviceId:      service_id,
    clientId,
    startsAt: startsAt.toISOString().slice(0, 19).replace('T', ' '),
    endsAt:   endsAt.toISOString().slice(0, 19).replace('T', ' '),
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
  const apt = await getById(id);

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
