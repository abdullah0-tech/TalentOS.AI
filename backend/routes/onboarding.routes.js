const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboarding.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, onboardingController.createOnboardingChecklist);
router.get('/', authMiddleware, onboardingController.getOnboardingTasks);
router.put('/:taskId', authMiddleware, onboardingController.updateTaskStatus);

module.exports = router;
