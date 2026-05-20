const service   = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validator');

async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const user = await service.register(value);
  return res.status(201).json({ message: 'Usuário criado com sucesso.', user });
}

async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const result = await service.login(value);
  return res.json(result);
}

async function me(req, res) {
  // req.user foi injetado pelo middleware authenticate
  return res.json({ user: req.user });
}

module.exports = { register, login, me };