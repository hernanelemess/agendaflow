const bcrypt = require('bcryptjs');
const repo   = require('./users.repository');
const { AppError } = require('../../shared/AppError');

async function getProfile(id) {
  const user = await repo.findById(id);
  if (!user) throw AppError('Usuário não encontrado.', 404);
  return user;
}

async function updateProfile(id, data) {
  await getProfile(id);
  await repo.updateById(id, data);
  return repo.findById(id);
}

async function changePassword(id, { currentPassword, newPassword }) {
  const { pool } = require('../../../database/connection');
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [id]);
  if (!rows[0]) throw AppError('Usuário não encontrado.', 404);

  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) throw AppError('Senha atual incorreta.', 401);

  const hash = await bcrypt.hash(newPassword, 10);
  await repo.updatePassword(id, hash);
}

module.exports = { getProfile, updateProfile, changePassword };