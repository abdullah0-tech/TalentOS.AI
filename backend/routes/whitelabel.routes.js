const express = require('express');
const router = express.Router();
const whitelabelController = require('../controllers/whitelabel.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, whitelabelController.getBranding);
router.put('/', authMiddleware, whitelabelController.updateBranding);

module.exports = router;
