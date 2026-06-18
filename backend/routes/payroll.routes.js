const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/calculate', authMiddleware, payrollController.calculatePayroll);
router.get('/history', authMiddleware, payrollController.getPayrollHistory);
router.put('/:id', authMiddleware, payrollController.updatePayrollStatus);

module.exports = router;
