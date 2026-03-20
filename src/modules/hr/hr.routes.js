const { Router } = require('express');
const ctrl = require('./hr.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const audit = require('../../middleware/audit');

const router = Router();
router.use(authenticate);

// Employee profiles
router.get('/employees', authorize('hr.read', 'scoped'), ctrl.getEmployees);
router.get('/employees/:id', authorize('hr.read', 'scoped'), ctrl.getEmployee);
router.put('/employees/:id', authorize('hr.edit_full_profile'), audit('employee', 'update'), ctrl.updateEmployee);
router.patch('/me', ctrl.updatePersonalInfo); // each user can update own info

// Employment history
router.get('/employees/:id/history', authorize('hr.read'), ctrl.getEmploymentHistory);
router.get('/employees/:id/salary-history', authorize('hr.read_salary'), ctrl.getSalaryHistory);

// Documents
router.get('/employees/:id/documents', authorize('hr.read'), ctrl.getDocuments);
router.post('/employees/:id/documents', authorize('hr.manage_documents'), ctrl.uploadMiddleware, audit('document', 'upload'), ctrl.uploadDocument);
router.delete('/employees/:id/documents/:docId', authorize('hr.manage_documents'), audit('document', 'delete'), ctrl.deleteDocument);

// Photo
router.post('/employees/:id/photo', authorize('hr.edit_full_profile'), ctrl.uploadMiddleware, ctrl.uploadPhoto);

module.exports = router;
