const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, goalController.createGoal);
router.put('/:goalId', authMiddleware, goalController.updateGoalProgress);
router.get('/', authMiddleware, goalController.getGoals);

module.exports = router;
