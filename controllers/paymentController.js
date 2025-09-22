const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payment/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Update order payment status
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'completed',
          paymentId: paymentIntent.id
        });

        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;

        // Update order payment status
        await Order.findByIdAndUpdate(failedOrderId, {
          paymentStatus: 'failed',
          paymentId: failedPayment.id
        });

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
