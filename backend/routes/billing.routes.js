const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/checkout', authMiddleware, billingController.subscribe);
router.post('/portal', authMiddleware, billingController.manageSubscription);
router.get('/', authMiddleware, billingController.getSubscription);
router.get('/invoices', authMiddleware, billingController.getInvoices);
router.get('/usage', authMiddleware, billingController.getUsage);

module.exports = router;
