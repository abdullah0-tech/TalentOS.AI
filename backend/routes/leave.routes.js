const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, leaveController.applyLeave);
router.get('/', authMiddleware, leaveController.getLeaves);
router.patch('/:requestId', authMiddleware, leaveController.updateLeaveStatus);

module.exports = router;
