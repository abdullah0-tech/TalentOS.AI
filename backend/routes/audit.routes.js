const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.get('/', authMiddleware, checkPermission('audit_logs', 'view'), auditController.getAuditLogs);

module.exports = router;
