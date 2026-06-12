Razorpay integration

Environment variables (add to your .env):

- RAZORPAY_KEY_ID: your Razorpay Key ID
- RAZORPAY_KEY_SECRET: your Razorpay Key Secret

Setup

1. Install new dependency in backend:

```bash
cd backend
npm install
```

2. Restart the backend server (nodemon or node):

```bash
npm run dev
# or
npm start
```

Endpoints

- POST /api/payment/create-order
  - Body: { amount: <number in INR> }
  - Auth: required
  - Response: { order: { id, amount, currency, ... } }

- POST /api/payment/verify
  - Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  - Auth: required
  - Response: { message: "Payment verified" }

Frontend

- Use `frontend/src/services/payment.js` helpers:
  - `createOrder(amount)` to request a server-side order
  - `loadRazorpayScript()` to load the Razorpay checkout script
  - `verifyPayment(payload)` to verify signature on server after checkout

Example flow

1. Client calls `POST /api/payment/create-order` to get an order.
2. Client opens Razorpay Checkout with the returned `order.id`.
3. On success, Checkout provides `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
4. Client POSTs those to `/api/payment/verify` to validate.

Notes

- The server uses `razorpay` npm SDK and verifies signatures using HMAC-SHA256.
- Ensure your server time is correct and keys are set.
