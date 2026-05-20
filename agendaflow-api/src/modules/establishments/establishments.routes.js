const { Router } = require('express');
const controller  = require('./establishments.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = Router();

// Pública — qualquer um pode ver estabelecimentos
router.get('/',    listAll);
router.get('/:id', controller.getById);

// Autenticadas
router.use(authenticate);

router.get('/me/list',  controller.listMine);                         // donos veem os próprios
router.post('/',        authorize('owner', 'admin'), controller.create);
router.put('/:id',      authorize('owner', 'admin'), controller.update);
router.delete('/:id',   authorize('owner', 'admin'), controller.remove);

function listAll(req, res, next) {
  return controller.listAll(req, res, next);
}

module.exports = router;