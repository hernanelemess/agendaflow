const { Router } = require('express');
const controller  = require('./users.controller');
const { authenticate } = require('../../middlewares/auth');

const router = Router();

// Todas as rotas de /users exigem autenticação
router.use(authenticate);

router.get('/profile',         controller.getProfile);
router.put('/profile',         controller.updateProfile);
router.patch('/password',      controller.changePassword);

module.exports = router;