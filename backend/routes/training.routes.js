const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/courses', authMiddleware, trainingController.createCourse);
router.get('/courses', authMiddleware, trainingController.getCourses);
router.post('/enroll', authMiddleware, trainingController.enrollEmployee);
router.get('/enrollments', authMiddleware, trainingController.getEnrollments);
router.put('/enrollments/:enrollmentId', authMiddleware, trainingController.updateProgress);
router.get('/recommendations', authMiddleware, trainingController.getAIRecommendations);

module.exports = router;
