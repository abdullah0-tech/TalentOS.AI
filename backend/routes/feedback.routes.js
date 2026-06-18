const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, feedbackController.submitFeedback);
router.get('/', authMiddleware, feedbackController.getFeedback);
router.patch('/:id/status', authMiddleware, feedbackController.updateFeedbackStatus);

module.exports = router;
