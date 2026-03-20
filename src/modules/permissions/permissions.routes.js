const { Router } = require('express');
const permissionsController = require('./permissions.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const audit = require('../../middleware/audit');
const { createPermissionSchema, updatePermissionSchema } = require('./permissions.validation');

const router = Router();
router.use(authenticate);

router.get('/', authorize('permissions.read'), permissionsController.getAll);
router.get('/grouped', authorize('permissions.read'), permissionsController.getGrouped);
router.get('/:id', authorize('permissions.read'), permissionsController.getById);
router.post('/', authorize('permissions.create'), validate(createPermissionSchema), audit('permission', 'create'), permissionsController.create);
router.put('/:id', authorize('permissions.update'), validate(updatePermissionSchema), audit('permission', 'update'), permissionsController.update);
router.delete('/:id', authorize('permissions.delete'), audit('permission', 'delete'), permissionsController.remove);

module.exports = router;
