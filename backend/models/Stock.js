const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    company: {
      type: String,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 10
    },
    priceHistory: [
      {
        price: Number,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    trend: {
      type: String,
      enum: ["UP", "DOWN", "STABLE"],
      default: "STABLE"
    },
    volatility: {
      type: Number,
      default: 0.02
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
