const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Get Stripe publishable key
router.get('/config', paymentController.getPublishableKey);

// Create payment intent
router.post('/create-intent', authMiddleware, paymentController.createPaymentIntent);

// Webhook (raw body needed for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
