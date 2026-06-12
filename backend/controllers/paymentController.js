const { createOrder, verifyPaymentSignature } = require("../services/paymentService");
const { createPayout } = require("../services/withdrawalService");
const { createAuditLog } = require("../services/auditService");
const User = require("../models/User");
const Payment = require("../models/Payment");

const createOrderHandler = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Amount must be at least ₹100" });
    }

    const order = await createOrder({ amount, currency });

    // Store payment record for deposit
    await Payment.create({
      userId: req.user._id,
      type: "DEPOSIT",
      orderId: order.id,
      amount: Number(amount),
      currency,
      status: "CREATED"
    });

    await createAuditLog({
      actor: req.user,
      action: "CREATE_DEPOSIT_ORDER",
      entity: "PAYMENT",
      details: { orderId: order.id, amount, userId: req.user._id }
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPaymentHandler = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const valid = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

    // Find payment record
    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    if (!valid) {
      // Mark as failed
      payment.status = "FAILED";
      payment.paymentId = razorpay_payment_id;
      await payment.save();

      await createAuditLog({
        actor: { _id: payment.userId },
        action: "DEPOSIT_VERIFICATION_FAILED",
        entity: "PAYMENT",
        details: { razorpay_order_id, razorpay_payment_id }
      });

      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Mark as paid and update user balance
    payment.status = "PAID";
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    await payment.save();

    // Add funds to user
    const user = await User.findById(payment.userId);
    if (user) {
      user.balance = Number((user.balance + payment.amount).toFixed(2));
      await user.save();
    }

    await createAuditLog({
      actor: { _id: payment.userId, email: user?.email },
      action: "DEPOSIT_VERIFIED",
      entity: "PAYMENT",
      details: {
        razorpay_order_id,
        razorpay_payment_id,
        amount: payment.amount,
        newBalance: user?.balance
      }
    });

    res.json({ message: "Deposit verified and funds added", amount: payment.amount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestWithdrawalHandler = async (req, res) => {
  try {
    const { amount, accountNumber, ifscCode, accountHolder } = req.body;

    if (!amount || amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹500" });
    }

    if (!accountNumber || !ifscCode || !accountHolder) {
      return res.status(400).json({ message: "Bank details are required" });
    }

    // Validate account number format
    if (typeof accountNumber !== "string" || accountNumber.length < 9 || accountNumber.length > 18) {
      return res.status(400).json({ message: "Invalid account number (9-18 digits)" });
    }

    // Validate IFSC code format
    if (typeof ifscCode !== "string" || ifscCode.length !== 11) {
      return res.status(400).json({ message: "Invalid IFSC code (must be 11 characters)" });
    }

    // Check user balance
    const user = await User.findById(req.user._id);
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance for withdrawal" });
    }

    // Create withdrawal record
    const withdrawal = await Payment.create({
      userId: req.user._id,
      type: "WITHDRAWAL",
      amount: Number(amount),
      currency: "INR",
      status: "PENDING",
      bankDetails: {
        accountNumber: accountNumber.toString(),
        ifscCode: ifscCode.toString(),
        accountHolder: accountHolder.toString()
      }
    });

    // Deduct amount from balance
    user.balance = Number((user.balance - amount).toFixed(2));
    await user.save();

    // Mask account number for audit log
    const maskedAccount = accountNumber.slice(-4).padStart(accountNumber.length, "*");

    await createAuditLog({
      actor: req.user,
      action: "WITHDRAWAL_REQUESTED",
      entity: "PAYMENT",
      details: {
        withdrawalId: withdrawal._id,
        amount,
        accountNumber: maskedAccount,
        newBalance: user.balance
      }
    });

    res.json({
      message: "Withdrawal request created",
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        status: withdrawal.status
      }
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ message: error.message || "Withdrawal request failed" });
  }
};

const processWithdrawalHandler = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    const withdrawal = await Payment.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    try {
      // Create payout via Razorpay
      const payout = await createPayout({
        amount: withdrawal.amount,
        accountNumber: withdrawal.bankDetails.accountNumber,
        ifscCode: withdrawal.bankDetails.ifscCode,
        accountHolder: withdrawal.bankDetails.accountHolder
      });

      // Update withdrawal record
      withdrawal.status = "PROCESSED";
      withdrawal.transferId = payout.id;
      await withdrawal.save();

      await createAuditLog({
        actor: { _id: withdrawal.userId },
        action: "WITHDRAWAL_PROCESSED",
        entity: "PAYMENT",
        details: {
          withdrawalId: withdrawal._id,
          transferId: payout.id,
          amount: withdrawal.amount
        }
      });

      res.json({
        message: "Withdrawal processed successfully",
        transferId: payout.id,
        amount: withdrawal.amount
      });
    } catch (payoutError) {
      // Mark withdrawal as failed and restore balance
      withdrawal.status = "FAILED";
      withdrawal.failureReason = payoutError.message;
      await withdrawal.save();

      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.balance = Number((user.balance + withdrawal.amount).toFixed(2));
        await user.save();
      }

      await createAuditLog({
        actor: { _id: withdrawal.userId },
        action: "WITHDRAWAL_FAILED",
        entity: "PAYMENT",
        details: {
          withdrawalId: withdrawal._id,
          reason: payoutError.message,
          balanceRestored: user?.balance
        }
      });

      res.status(400).json({ message: `Withdrawal failed: ${payoutError.message}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistoryHandler = async (req, res) => {
  try {
    console.log("Fetching transaction history for user:", req.user._id);
    const transactions = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log("Found transactions:", transactions.length);
    res.json({ transactions });
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrderHandler,
  verifyPaymentHandler,
  requestWithdrawalHandler,
  processWithdrawalHandler,
  getTransactionHistoryHandler
};
