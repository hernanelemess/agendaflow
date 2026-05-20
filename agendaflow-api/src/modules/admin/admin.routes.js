const { Router } = require('express');
const controller  = require('./admin.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = Router();

// Todas as rotas /admin exigem autenticação E role admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats',                           controller.getStats);

router.get('/users',                           controller.listUsers);
router.patch('/users/:id/activate',            controller.activateUser);
router.patch('/users/:id/deactivate',          controller.deactivateUser);

router.get('/establishments',                  controller.listEstablishments);
router.patch('/establishments/:id/activate',   controller.activateEstablishment);
router.patch('/establishments/:id/deactivate', controller.deactivateEstablishment);

module.exports = router;