const { Router } = require('express');
const controller  = require('./appointments.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = Router();

// Pública — verificar disponibilidade antes de criar conta
router.get('/availability', controller.getAvailableSlots);

// Todas as demais rotas exigem autenticação
router.use(authenticate);

router.post('/',                                    controller.create);
router.get('/me',                                   controller.listMine);
router.get('/:id',                                  controller.getById);
router.patch('/:id/status',                         controller.updateStatus);
router.get('/professional/:professionalId',
  authorize('owner', 'admin'),
  controller.listByProfessional
);

module.exports = router;