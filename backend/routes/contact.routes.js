const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public Routes (Website visitors & About Us counters)
router.post('/', contactController.submitContactMessage);
router.get('/stats', contactController.getPlatformStats);

// Protected Admin Routes (Customer Messages Dashboard & Stats config)
router.get('/messages', authMiddleware, contactController.getContactMessages);
router.get('/messages/unread-count', authMiddleware, contactController.getUnreadCount);
router.patch('/messages/:id/status', authMiddleware, contactController.updateMessageStatus);
router.post('/messages/:id/reply', authMiddleware, contactController.replyToMessage);
router.delete('/messages/:id', authMiddleware, contactController.deleteMessage);
router.put('/stats', authMiddleware, contactController.updatePlatformStats);

module.exports = router;
