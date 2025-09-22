const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-payment-intent', protect, createPaymentIntent);

// Stripe webhook - needs raw body, so no express.json() middleware
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
