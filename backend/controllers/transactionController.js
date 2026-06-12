const Transaction = require("../models/Transaction");

const getTransactions = async (req, res) => {
  try {
    const targetUserId = req.user.role === "admin" && req.query.userId ? req.query.userId : req.user._id;

    const transactions = await Transaction.find({ userId: targetUserId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions
};
