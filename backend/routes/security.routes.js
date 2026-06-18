const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/mfa/enable', authMiddleware, securityController.enableMFA);
router.post('/mfa/verify', authMiddleware, securityController.verifyMFA);
router.get('/logs', authMiddleware, securityController.getSecurityLogs);
router.put('/ip-whitelist', authMiddleware, securityController.updateIPWhitelist);

module.exports = router;
