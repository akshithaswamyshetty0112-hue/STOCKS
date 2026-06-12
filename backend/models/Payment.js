const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL"],
      default: "DEPOSIT"
    },
    orderId: {
      type: String,
      sparse: true
    },
    paymentId: {
      type: String
    },
    transferId: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["CREATED", "PENDING", "PAID", "PROCESSED", "FAILED"],
      default: "CREATED"
    },
    signature: {
      type: String
    },
    bankDetails: {
      type: {
        accountNumber: String,
        ifscCode: String,
        accountHolder: String
      },
      default: null
    },
    failureReason: {
      type: String
    }
  },
  { timestamps: true }
);

// Create unique index for orderId where it exists
paymentSchema.index({ orderId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Payment", paymentSchema);
