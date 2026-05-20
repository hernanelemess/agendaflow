const repo = require('./admin.repository');
const userRepo = require('../users/users.repository');
const estRepo  = require('../establishments/establishments.repository');
const { AppError } = require('../../shared/AppError');

async function getStats() {
  return repo.getStats();
}

async function listUsers(query) {
  return repo.listUsers(query);
}

async function toggleUser(id, active) {
  const user = await userRepo.findById(id);
  if (!user) throw AppError('Usuário não encontrado.', 404);
  await repo.setUserActive(id, active);
  return userRepo.findById(id);
}

async function listEstablishments(query) {
  return repo.listEstablishments(query);
}

async function toggleEstablishment(id, active) {
  const est = await estRepo.findById(id);
  if (!est) throw AppError('Estabelecimento não encontrado.', 404);
  await repo.setEstablishmentActive(id, active);
  return estRepo.findById(id);
}

module.exports = { getStats, listUsers, toggleUser, listEstablishments, toggleEstablishment };