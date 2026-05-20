const service = require('./professionals.service');
const { createSchema, updateSchema } = require('./professionals.validator');

async function create(req, res) {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const prof = await service.create(req.user.id, req.user.role, value);
  return res.status(201).json({ professional: prof });
}

async function listByEstablishment(req, res) {
  const list = await service.listByEstablishment(Number(req.params.establishmentId));
  return res.json({ professionals: list });
}

async function getById(req, res) {
  const prof = await service.getById(Number(req.params.id));
  return res.json({ professional: prof });
}

async function update(req, res) {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const prof = await service.update(
    Number(req.params.id),
    req.user.id,
    req.user.role,
    value
  );
  return res.json({ professional: prof });
}

async function remove(req, res) {
  await service.remove(Number(req.params.id), req.user.id, req.user.role);
  return res.status(204).send();
}

module.exports = { create, listByEstablishment, getById, update, remove };