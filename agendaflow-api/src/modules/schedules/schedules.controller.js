const service = require('./schedules.service');
const { createSchema } = require('./schedules.validator');

async function create(req, res) {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const schedules = await service.create(req.user.id, req.user.role, value);
  return res.json({ schedules });
}

async function listByProfessional(req, res) {
  const list = await service.listByProfessional(Number(req.params.professionalId));
  return res.json({ schedules: list });
}

async function removeById(req, res) {
  await service.removeById(
    req.user.id,
    req.user.role,
    Number(req.params.id),
    Number(req.query.professional_id)
  );
  return res.status(204).send();
}

async function removeByWeekday(req, res) {
  await service.removeByWeekday(
    req.user.id,
    req.user.role,
    Number(req.params.professionalId),
    Number(req.params.weekday)
  );
  return res.status(204).send();
}

module.exports = { create, listByProfessional, removeById, removeByWeekday };