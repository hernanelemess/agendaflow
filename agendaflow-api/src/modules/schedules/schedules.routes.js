const { Router } = require('express');
const controller  = require('./schedules.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = Router();

router.get('/professional/:professionalId', controller.listByProfessional);

router.use(authenticate);
router.post('/', authorize('owner', 'admin'), controller.create);

// Rota específica ANTES da rota genérica — evita conflito de parâmetros
router.delete(
  '/professional/:professionalId/weekday/:weekday',
  authorize('owner', 'admin'),
  controller.removeByWeekday
);
router.delete('/:id', authorize('owner', 'admin'), controller.removeById);

module.exports = router;