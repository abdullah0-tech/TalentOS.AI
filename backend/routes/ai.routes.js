const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/generate-job-description', authMiddleware, aiController.generateJobDescription);
router.post('/interview-questions', authMiddleware, aiController.generateInterviewQuestions);
router.post('/generate-email', authMiddleware, aiController.generateEmailDraft);
router.post('/rank-candidates', authMiddleware, aiController.rankCandidates);
router.get('/employee-insights', authMiddleware, aiController.generateEmployeeInsights);

// Email Template management
router.get('/email-templates', authMiddleware, aiController.getEmailTemplates);
router.post('/email-templates', authMiddleware, aiController.saveEmailTemplate);
router.delete('/email-templates/:id', authMiddleware, aiController.deleteEmailTemplate);

module.exports = router;
