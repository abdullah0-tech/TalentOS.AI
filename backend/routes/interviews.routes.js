const express = require('express');
const router = express.Router();
const interviewsController = require('../controllers/interviews.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, interviewsController.createInterview);
router.get('/', authMiddleware, interviewsController.getInterviews);

module.exports = router;
