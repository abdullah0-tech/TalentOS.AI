const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organization.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/departments', authMiddleware, orgController.createDepartment);
router.get('/tree', authMiddleware, orgController.getTree);
router.put('/reporting', authMiddleware, orgController.updateReportingLine);
router.get('/chart', authMiddleware, orgController.getOrgChart);

module.exports = router;
