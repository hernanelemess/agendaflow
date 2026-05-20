const service = require('./establishments.service');
const { createSchema, updateSchema } = require('./establishments.validator');

async function create(req, res) {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const est = await service.create(req.user.id, value);
  return res.status(201).json({ establishment: est });
}

async function listMine(req, res) {
  const list = await service.listMine(req.user.id);
  return res.json({ establishments: list });
}

async function listAll(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const data  = await service.listAll({ page, limit });
  return res.json(data);
}

async function getById(req, res) {
  const est = await service.getById(Number(req.params.id));
  return res.json({ establishment: est });
}

async function update(req, res) {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const est = await service.update(
    Number(req.params.id),
    req.user.id,
    req.user.role,
    value
  );
  return res.json({ establishment: est });
}

async function remove(req, res) {
  await service.remove(Number(req.params.id), req.user.id, req.user.role);
  return res.status(204).send();
}

module.exports = { create, listMine, listAll, getById, update, remove };