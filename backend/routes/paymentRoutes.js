const express = require("express");
const {
  createOrderHandler,
  verifyPaymentHandler,
  requestWithdrawalHandler,
  processWithdrawalHandler,
  getTransactionHistoryHandler
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Deposit routes
router.post("/create-order", protect, createOrderHandler);
router.post("/verify", protect, verifyPaymentHandler);

// Withdrawal routes
router.post("/request-withdrawal", protect, requestWithdrawalHandler);
router.post("/process-withdrawal", protect, processWithdrawalHandler);

// Transaction history
router.get("/history", protect, getTransactionHistoryHandler);

module.exports = router;
