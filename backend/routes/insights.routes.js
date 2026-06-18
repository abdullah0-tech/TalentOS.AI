const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insights.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, insightsController.getWorkforceInsights);

module.exports = router;
