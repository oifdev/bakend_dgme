const { Router } = require('express');
const auditController = require('./audit.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/', authorize('audit.read'), auditController.getLogs);
router.get('/:id', authorize('audit.read'), auditController.getLog);

module.exports = router;
