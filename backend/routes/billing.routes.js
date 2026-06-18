const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, billingController.subscribe);
router.get('/', authMiddleware, billingController.getSubscription);
router.get('/invoices', authMiddleware, billingController.getInvoices);

module.exports = router;
