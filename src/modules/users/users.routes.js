const { Router } = require('express');
const usersController = require('./users.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const audit = require('../../middleware/audit');
const { createUserSchema, updateUserSchema } = require('./users.validation');

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('users.read', 'scoped'), usersController.getAll);
router.get('/:id', authorize('users.read', 'scoped'), usersController.getById);
router.post('/', authorize('users.create'), validate(createUserSchema), audit('user', 'create'), usersController.create);
router.put('/:id', authorize('users.update', 'scoped'), validate(updateUserSchema), audit('user', 'update'), usersController.update);
router.delete('/:id', authorize('users.delete'), audit('user', 'delete'), usersController.remove);
router.patch('/:id/status', authorize('users.update'), audit('user', 'status_change'), usersController.toggleStatus);

module.exports = router;
