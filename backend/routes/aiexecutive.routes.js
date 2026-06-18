const express = require('express');
const router = express.Router();
const aiExecController = require('../controllers/aiexecutive.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/report', authMiddleware, aiExecController.getExecutiveReport);
router.post('/ask', authMiddleware, aiExecController.askExecutiveCopilot);

module.exports = router;
