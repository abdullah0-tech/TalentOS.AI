const express = require('express');
const router = express.Router();
const emailsController = require('../controllers/emails.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authMiddleware to all email paths
router.use(authMiddleware);

// Settings management
router.get('/settings', emailsController.getEmailSettings);
router.post('/settings', emailsController.updateEmailSettings);

// SMTP connection testing (live server verification — no email sent)
router.post('/test-connection', emailsController.testSmtpConnection);

// Email status dashboard stats (Connected, Last Sent, Errors, Daily Count)
router.get('/smtp-status', emailsController.getEmailStatus);

// Testing and verification (sends a real test email)
router.post('/test', emailsController.sendTestEmail);
router.post('/trigger-workflow', emailsController.triggerTestWorkflow);

// Logs audit
router.get('/logs', emailsController.getEmailLogs);
router.post('/logs/:logId/retry', emailsController.retryEmail);

// Previews
router.get('/preview/:templateName', emailsController.getTemplatePreview);

// Manual send
router.post('/send', emailsController.sendCustomEmail);

module.exports = router;
