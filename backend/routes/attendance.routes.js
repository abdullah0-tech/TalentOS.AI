const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/checkin', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut);
router.get('/', authMiddleware, attendanceController.getAttendanceLogs);

module.exports = router;
