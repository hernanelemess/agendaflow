const repo    = require('./services.repository');
const estRepo = require('../establishments/establishments.repository');
const { AppError } = require('../../shared/AppError');

async function assertOwner(establishmentId, userId, role) {
  const est = await estRepo.findById(establishmentId);
  if (!est) throw AppError('Estabelecimento não encontrado.', 404);
  if (role !== 'admin' && est.owner_id !== userId) throw AppError('Acesso negado.', 403);
}

async function create(userId, role, { establishment_id, name, description, duration_min, price }) {
  await assertOwner(establishment_id, userId, role);
  const id = await repo.create({ establishmentId: establishment_id, name, description, duration_min, price });
  return repo.findById(id);
}

async function listByEstablishment(establishmentId) {
  return repo.findByEstablishment(establishmentId);
}

async function getById(id) {
  const svc = await repo.findById(id);
  if (!svc) throw AppError('Serviço não encontrado.', 404);
  return svc;
}

async function update(id, userId, role, data) {
  const svc = await getById(id);
  await assertOwner(svc.establishment_id, userId, role);
  await repo.updateById(id, data);
  return repo.findById(id);
}

async function remove(id, userId, role) {
  const svc = await getById(id);
  await assertOwner(svc.establishment_id, userId, role);
  await repo.deleteById(id);
}

module.exports = { create, listByEstablishment, getById, update, remove };