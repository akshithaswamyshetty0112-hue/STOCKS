const axios = require("axios");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const createPayout = async ({ amount, accountNumber, ifscCode, accountHolder }) => {
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_number: accountNumber,
        fund_account: {
          account_type: "bank_account",
          bank_account: {
            name: accountHolder,
            notes: {
              note_key: "Withdrawal from Stock Trading App"
            },
            ifsc: ifscCode,
            account_number: accountNumber
          },
          contact_id: null
        },
        amount: Math.round(amount * 100),
        currency: "INR",
        mode: "NEFT",
        purpose: "payout",
        description: "Withdrawal from Trading Account",
        receipt: `withdrawal_${Date.now()}`
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Payout creation error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.description || error.message);
  }
};

const verifyWithdrawalSignature = ({ razorpay_payout_id, razorpay_signature }) => {
  const crypto = require("crypto");
  const message = razorpay_payout_id;
  const signature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(message)
    .digest("hex");
  return signature === razorpay_signature;
};

module.exports = {
  createPayout,
  verifyWithdrawalSignature
};
