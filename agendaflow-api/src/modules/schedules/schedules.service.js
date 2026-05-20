const repo     = require('./schedules.repository');
const profRepo = require('../professionals/professionals.repository');
const { AppError } = require('../../shared/AppError');

async function assertOwner(professionalId, userId, role) {
  const prof = await profRepo.findById(professionalId);
  if (!prof) throw AppError('Profissional não encontrado.', 404);
  if (role !== 'admin' && prof.owner_id !== userId) throw AppError('Acesso negado.', 403);
}

// Cria um novo intervalo (não sobrescreve mais — permite múltiplos por dia)
async function create(userId, role, { professional_id, weekday, start_time, end_time, label }) {
  await assertOwner(professional_id, userId, role);

  if (start_time >= end_time) {
    throw AppError('O horário de início deve ser anterior ao de término.', 422);
  }

  const id = await repo.create({ professionalId: professional_id, weekday, start_time, end_time, label });
  return repo.findByProfessional(professional_id);
}

async function listByProfessional(professionalId) {
  return repo.findByProfessional(professionalId);
}

// Remove um intervalo específico pelo ID
async function removeById(userId, role, id, professionalId) {
  await assertOwner(professionalId, userId, role);
  await repo.deleteById(id);
}

// Remove todos os intervalos de um dia
async function removeByWeekday(userId, role, professionalId, weekday) {
  await assertOwner(professionalId, userId, role);
  await repo.deleteByProfessionalAndWeekday(professionalId, weekday);
}

module.exports = { create, listByProfessional, removeById, removeByWeekday };