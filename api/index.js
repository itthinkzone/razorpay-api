const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Endpoint to create an order with auto-capture
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate request
    if (!amount || !receipt) {
      return res.status(400).json({ error: 'Amount and receipt are required' });
    }

    // Create order with auto-capture settings
    const options = {
      amount: amount * 100, // Convert to smallest currency unit (e.g., paise for INR)
      currency,
      receipt,
      payment_capture: 'automatic', // Enable auto-capture
      capture_options: {
        automatic_expiry_period: 12, // Time in minutes for auto-capture (min 12)
        manual_expiry_period: 7200, // Time in minutes for auto-refunded (max 7200)
        refund_speed: 'optimum' // Refund speed for non-captured payments
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Webhook endpoint for payment verification
app.post('/webhook', (req, res) => {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const receivedSignature = req.headers['x-razorpay-signature'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  if (expectedSignature === receivedSignature) {
    const event = req.body.event;
    if (event === 'payment.authorized') {
      const payment = req.body.payload.payment.entity;
      console.log('Payment authorized:', payment.id);
      // Payment is auto-captured due to payment_capture: 'automatic'
    } else if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      console.log('Payment captured:', payment.id);
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

module.exports = app;