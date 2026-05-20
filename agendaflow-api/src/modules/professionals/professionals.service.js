const repo    = require('./professionals.repository');
const estRepo = require('../establishments/establishments.repository');
const { AppError } = require('../../shared/AppError');

async function assertOwner(establishmentId, userId, role) {
  const est = await estRepo.findById(establishmentId);
  if (!est) throw AppError('Estabelecimento não encontrado.', 404);
  if (role !== 'admin' && est.owner_id !== userId) {
    throw AppError('Acesso negado.', 403);
  }
}

async function create(userId, role, { establishment_id, name, bio }) {
  await assertOwner(establishment_id, userId, role);
  const id = await repo.create({ establishmentId: establishment_id, name, bio });
  return repo.findById(id);
}

async function listByEstablishment(establishmentId) {
  return repo.findByEstablishment(establishmentId);
}

async function getById(id) {
  const prof = await repo.findById(id);
  if (!prof) throw AppError('Profissional não encontrado.', 404);
  return prof;
}

async function update(id, userId, role, data) {
  const prof = await getById(id);
  await assertOwner(prof.establishment_id, userId, role);
  await repo.updateById(id, data);
  return repo.findById(id);
}

async function remove(id, userId, role) {
  const prof = await getById(id);
  await assertOwner(prof.establishment_id, userId, role);
  await repo.deleteById(id);
}

module.exports = { create, listByEstablishment, getById, update, remove };