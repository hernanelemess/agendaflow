const { Router } = require('express');
const controller  = require('./services.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = Router();

router.get('/establishment/:establishmentId', controller.listByEstablishment);
router.get('/:id', controller.getById);

router.use(authenticate);
router.post('/',      authorize('owner', 'admin'), controller.create);
router.put('/:id',    authorize('owner', 'admin'), controller.update);
router.delete('/:id', authorize('owner', 'admin'), controller.remove);

module.exports = router;