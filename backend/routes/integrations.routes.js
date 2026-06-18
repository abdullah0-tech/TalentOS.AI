const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrations.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, integrationsController.getIntegrations);
router.post('/connect', authMiddleware, integrationsController.connectIntegration);
router.delete('/:id', authMiddleware, integrationsController.disconnectIntegration);

module.exports = router;
