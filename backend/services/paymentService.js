const axios = require("axios");
const crypto = require("crypto");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return { keyId, keySecret };
};

const authHeader = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
};

const createOrder = async ({ amount, currency = "INR", receipt = undefined }) => {
  if (!amount || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const amountPaise = Math.round(Number(amount) * 100);

  const payload = {
    amount: amountPaise,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1
  };

  try {
    const resp = await axios.post("https://api.razorpay.com/v1/orders", payload, {
      headers: {
        Authorization: authHeader()
      }
    });

    return resp.data;
  } catch (error) {
    const razorpayMessage = error.response?.data?.error?.description || error.response?.data?.error?.reason;
    throw new Error(razorpayMessage || error.message || "Failed to create Razorpay order");
  }
};

const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const { keySecret } = getRazorpayConfig();
  const hmac = crypto.createHmac("sha256", keySecret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const digest = hmac.digest("hex");
  return digest === razorpay_signature;
};

module.exports = {
  createOrder,
  verifyPaymentSignature
};
