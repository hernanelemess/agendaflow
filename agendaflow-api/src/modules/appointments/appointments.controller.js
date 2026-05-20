const service = require('./appointments.service');
const {
  createSchema,
  updateStatusSchema,
  availabilitySchema,
} = require('./appointments.validator');

// GET /appointments/availability?professional_id=1&service_id=2&date=2025-06-10
async function getAvailableSlots(req, res) {
  const { error, value } = availabilitySchema.validate(req.query, { abortEarly: false });
  if (error) throw error;

  const result = await service.getAvailableSlots(value);
  return res.json(result);
}

// POST /appointments
async function create(req, res) {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const apt = await service.create(req.user.id, value);
  return res.status(201).json({ appointment: apt });
}

// GET /appointments/:id
async function getById(req, res) {
  const apt = await service.getById(Number(req.params.id));
  return res.json({ appointment: apt });
}

// GET /appointments/me — agendamentos do cliente logado
async function listMine(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const list  = await service.listByClient(req.user.id, { page, limit });
  return res.json({ appointments: list });
}

// GET /appointments/professional/:professionalId
async function listByProfessional(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const list  = await service.listByProfessional(Number(req.params.professionalId), { page, limit });
  return res.json({ appointments: list });
}

// PATCH /appointments/:id/status
async function updateStatus(req, res) {
  const { error, value } = updateStatusSchema.validate(req.body, { abortEarly: false });
  if (error) throw error;

  const apt = await service.updateStatus(
    Number(req.params.id),
    req.user.id,
    req.user.role,
    value.status
  );
  return res.json({ appointment: apt });
}

module.exports = {
  getAvailableSlots,
  create,
  getById,
  listMine,
  listByProfessional,
  updateStatus,
};