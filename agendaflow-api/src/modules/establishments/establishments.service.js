const repo = require('./establishments.repository');
const { AppError } = require('../../shared/AppError');

async function create(ownerId, data) {
  const id = await repo.create({ ownerId, ...data });
  return repo.findById(id);
}

async function listMine(ownerId) {
  return repo.findByOwnerId(ownerId);
}

async function listAll(query) {
  return repo.findAll(query);
}

async function getById(id) {
  const est = await repo.findById(id);
  if (!est) throw AppError('Estabelecimento não encontrado.', 404);
  return est;
}

// Garante que apenas o dono (ou admin) pode alterar
async function update(id, userId, role, data) {
  const est = await getById(id);
  if (role !== 'admin' && est.owner_id !== userId) {
    throw AppError('Você não tem permissão para editar este estabelecimento.', 403);
  }
  await repo.updateById(id, data);
  return repo.findById(id);
}

async function remove(id, userId, role) {
  const est = await getById(id);
  if (role !== 'admin' && est.owner_id !== userId) {
    throw AppError('Você não tem permissão para remover este estabelecimento.', 403);
  }
  await repo.deleteById(id);
}

module.exports = { create, listMine, listAll, getById, update, remove };