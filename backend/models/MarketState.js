const mongoose = require("mongoose");

const marketStateSchema = new mongoose.Schema({
  marketType: {
    type: String,
    enum: ["BULL", "BEAR", "STABLE"],
    default: "STABLE"
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MarketState", marketStateSchema);
