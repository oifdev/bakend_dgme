const { Router } = require('express');
const ctrl = require('./attendance.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const audit = require('../../middleware/audit');
const { leaveRequestSchema } = require('./attendance.validation');

const router = Router();
router.use(authenticate);

// Clock
router.post('/check-in', ctrl.checkIn);
router.post('/check-out', ctrl.checkOut);
router.get('/today', ctrl.getTodayStatus);
router.get('/logs', authorize('attendance.read'), ctrl.getLogs);

// Leave requests
router.post('/leaves', validate(leaveRequestSchema), audit('leave_request', 'create'), ctrl.createLeave);
router.get('/leaves', authorize('attendance.read'), ctrl.getLeaves);
router.patch('/leaves/:id/approve', authorize('attendance.manage'), audit('leave_request', 'approve'), ctrl.approveLeave);
router.patch('/leaves/:id/reject', authorize('attendance.manage'), audit('leave_request', 'reject'), ctrl.rejectLeave);

// Absences
router.get('/absences', authorize('attendance.read'), ctrl.getAbsences);

// Vacations
router.get('/vacation-balance', ctrl.getVacationBalance);
router.get('/vacation-balance/:id', authorize('attendance.read'), ctrl.getVacationBalance);

module.exports = router;
