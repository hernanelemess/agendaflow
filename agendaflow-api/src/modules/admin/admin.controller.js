const service = require('./admin.service');

async function getStats(req, res) {
  const stats = await service.getStats();
  return res.json({ stats });
}

async function listUsers(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const role  = req.query.role || null;
  const data  = await service.listUsers({ page, limit, role });
  return res.json(data);
}

async function activateUser(req, res) {
  const user = await service.toggleUser(Number(req.params.id), true);
  return res.json({ user });
}

async function deactivateUser(req, res) {
  const user = await service.toggleUser(Number(req.params.id), false);
  return res.json({ user });
}

async function listEstablishments(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const data  = await service.listEstablishments({ page, limit });
  return res.json(data);
}

async function activateEstablishment(req, res) {
  const est = await service.toggleEstablishment(Number(req.params.id), true);
  return res.json({ establishment: est });
}

async function deactivateEstablishment(req, res) {
  const est = await service.toggleEstablishment(Number(req.params.id), false);
  return res.json({ establishment: est });
}

module.exports = {
  getStats,
  listUsers,
  activateUser,
  deactivateUser,
  listEstablishments,
  activateEstablishment,
  deactivateEstablishment,
};