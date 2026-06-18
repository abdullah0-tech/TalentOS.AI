const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, performanceController.submitReview);
router.get('/', authMiddleware, performanceController.getReviews);

module.exports = router;
