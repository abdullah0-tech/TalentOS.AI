const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Stripe requires the raw body to construct the event
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

module.exports = router;
