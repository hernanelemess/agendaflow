const service = require('./users.service');

async function getProfile(req, res) {
  const user = await service.getProfile(req.user.id);
  return res.json({ user });
}

async function updateProfile(req, res) {
  const user = await service.updateProfile(req.user.id, req.body);
  return res.json({ user });
}

async function changePassword(req, res) {
  await service.changePassword(req.user.id, req.body);
  return res.json({ message: 'Senha alterada com sucesso.' });
}

module.exports = { getProfile, updateProfile, changePassword };