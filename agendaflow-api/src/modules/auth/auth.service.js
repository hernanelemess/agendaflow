const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const repo    = require('./auth.repository');
const { AppError } = require('../../shared/AppError');

async function register({ name, email, password, role }) {
  const existing = await repo.findByEmail(email);
  if (existing) throw AppError('E-mail já cadastrado.', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const id = await repo.create({ name, email, passwordHash, role });

  return { id, name, email, role };
}

async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user) throw AppError('Credenciais inválidas.', 401);
  if (!user.active) throw AppError('Conta desativada.', 403);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw AppError('Credenciais inválidas.', 401);

  const payload = { id: user.id, email: user.email, role: user.role };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { register, login };