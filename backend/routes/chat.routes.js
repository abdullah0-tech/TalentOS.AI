const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, chatController.handleChat);
router.get('/history', authMiddleware, chatController.getChatHistory);

module.exports = router;
