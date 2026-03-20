const { Router } = require('express');
const ctrl = require('./organization.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const audit = require('../../middleware/audit');
const { subdirectionSchema, unitSchema, positionSchema } = require('./organization.validation');

const router = Router();
router.use(authenticate);

// Subdirections
router.get('/subdirections', authorize('organization.read'), ctrl.getSubdirections);
router.get('/subdirections/:id', authorize('organization.read'), ctrl.getSubdirection);
router.post('/subdirections', authorize('organization.create'), validate(subdirectionSchema), audit('subdirection', 'create'), ctrl.createSubdirection);
router.put('/subdirections/:id', authorize('organization.update'), validate(subdirectionSchema), audit('subdirection', 'update'), ctrl.updateSubdirection);
router.delete('/subdirections/:id', authorize('organization.delete'), audit('subdirection', 'delete'), ctrl.deleteSubdirection);

// Units
router.get('/units', authorize('organization.read'), ctrl.getUnits);
router.get('/units/:id', authorize('organization.read'), ctrl.getUnit);
router.post('/units', authorize('organization.create'), validate(unitSchema), audit('unit', 'create'), ctrl.createUnit);
router.put('/units/:id', authorize('organization.update'), validate(unitSchema), audit('unit', 'update'), ctrl.updateUnit);
router.delete('/units/:id', authorize('organization.delete'), audit('unit', 'delete'), ctrl.deleteUnit);

// Positions
router.get('/positions', authorize('organization.read'), ctrl.getPositions);
router.post('/positions', authorize('organization.create'), validate(positionSchema), audit('position', 'create'), ctrl.createPosition);
router.put('/positions/:id', authorize('organization.update'), validate(positionSchema), audit('position', 'update'), ctrl.updatePosition);
router.delete('/positions/:id', authorize('organization.delete'), audit('position', 'delete'), ctrl.deletePosition);

// Org Chart
router.get('/chart', authorize('organization.read'), ctrl.getOrgChart);
router.get('/tree', authorize('organization.read'), ctrl.getOrgTree);

module.exports = router;
