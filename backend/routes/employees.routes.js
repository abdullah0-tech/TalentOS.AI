const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.post('/', authMiddleware, checkPermission('employees', 'create'), employeesController.createEmployee);
router.get('/', authMiddleware, checkPermission('employees', 'view'), employeesController.getEmployees);
router.post('/create-account', authMiddleware, checkPermission('employees', 'edit'), employeesController.createAccount);
router.post('/resend-invite', authMiddleware, checkPermission('employees', 'edit'), employeesController.resendInvite);
router.post('/invite/cancel', authMiddleware, checkPermission('employees', 'edit'), employeesController.cancelInvite);
router.patch('/:id/status', authMiddleware, checkPermission('employees', 'edit'), employeesController.updateStatus);
router.get('/:id', authMiddleware, employeesController.getEmployeeById);

module.exports = router;
