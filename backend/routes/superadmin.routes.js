const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superadmin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// In a real app, you would add an extra middleware to verify role === 'owner'
router.get('/metrics', authMiddleware, superAdminController.getMetrics);

module.exports = router;
