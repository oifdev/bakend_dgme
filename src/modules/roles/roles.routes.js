const { Router } = require('express');
const rolesController = require('./roles.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const audit = require('../../middleware/audit');
const { createRoleSchema, updateRoleSchema } = require('./roles.validation');

const router = Router();
router.use(authenticate);

router.get('/', authorize('roles.read'), rolesController.getAll);
router.get('/:id', authorize('roles.read'), rolesController.getById);
router.post('/', authorize('roles.create'), validate(createRoleSchema), audit('role', 'create'), rolesController.create);
router.put('/:id', authorize('roles.update'), validate(updateRoleSchema), audit('role', 'update'), rolesController.update);
router.delete('/:id', authorize('roles.delete'), audit('role', 'delete'), rolesController.remove);

module.exports = router;
