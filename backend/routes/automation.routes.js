const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, automationController.createAutomation);
router.get('/', authMiddleware, automationController.getAutomations);
router.put('/:id', authMiddleware, automationController.toggleAutomation);
router.delete('/:id', authMiddleware, automationController.deleteAutomation);

module.exports = router;
