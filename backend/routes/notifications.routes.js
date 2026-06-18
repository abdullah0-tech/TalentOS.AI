const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, notificationsController.getNotifications);
router.patch('/:id/read', authMiddleware, notificationsController.markAsRead);

module.exports = router;
