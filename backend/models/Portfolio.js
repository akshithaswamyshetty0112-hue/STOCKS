const mongoose = require("mongoose");

const portfolioStockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    stocks: [portfolioStockSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
