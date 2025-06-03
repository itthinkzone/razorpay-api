# Razorpay API with Auto-Capture

A Node.js API for Razorpay Payment Gateway with auto-capture functionality. Deployed on Vercel and integrated with a Flutter app.

## Setup
- **Install Dependencies**: `npm install`
- **Environment Variables**:
  - `RAZORPAY_KEY_ID`: Razorpay Key ID
  - `RAZORPAY_KEY_SECRET`: Razorpay Key Secret
  - `WEBHOOK_SECRET`: Webhook Secret for verification
- **Deploy**: Deploy on Vercel using GitHub integration.

## Endpoints
- `POST /create-order`: Creates a Razorpay order with auto-capture.
- `POST /webhook`: Handles Razorpay webhook events.
