const Stock = require("../models/Stock");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Portfolio = require("../models/Portfolio");
const { createAuditLog } = require("../services/auditService");
const { getMarketStatus, resetMarket, updateStockPrices } = require("../services/marketSimulation");

const addStock = async (req, res) => {
  try {
    const { symbol, company, currentPrice } = req.body;

    if (!symbol || !company || !currentPrice) {
      return res.status(400).json({ message: "Symbol, company, and current price are required" });
    }

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      company,
      currentPrice: Number(currentPrice)
    });

    await createAuditLog({
      actor: req.user,
      action: "ADMIN_ADD_STOCK",
      entity: "STOCK",
      details: {
        symbol: stock.symbol,
        company: stock.company,
        currentPrice: stock.currentPrice
      }
    });

    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { symbol, company, currentPrice } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: "Symbol is required" });
    }

    const updates = {};

    if (company) {
      updates.company = company;
    }

    if (currentPrice) {
      updates.currentPrice = Number(currentPrice);
    }

    const stock = await Stock.findOneAndUpdate({ symbol: symbol.toUpperCase() }, updates, {
      new: true,
      runValidators: true
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await createAuditLog({
      actor: req.user,
      action: "ADMIN_UPDATE_STOCK",
      entity: "STOCK",
      details: {
        symbol: stock.symbol,
        company: stock.company,
        currentPrice: stock.currentPrice
      }
    });

    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    const symbol = req.body.symbol || req.query.symbol;

    if (!symbol) {
      return res.status(400).json({ message: "Symbol is required" });
    }

    const stock = await Stock.findOneAndDelete({ symbol: symbol.toUpperCase() });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await createAuditLog({
      actor: req.user,
      action: "ADMIN_DELETE_STOCK",
      entity: "STOCK",
      details: {
        symbol: stock.symbol,
        company: stock.company
      }
    });

    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetMarketPrices = async (req, res) => {
  try {
    await resetMarket();
    const stocks = await Stock.find().sort({ symbol: 1 });
    await createAuditLog({
      actor: req.user,
      action: "ADMIN_RESET_MARKET",
      entity: "MARKET",
      details: {
        stockCount: stocks.length
      }
    });
    res.json({ message: "Market reset successfully", stocks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const triggerMarketSimulation = async (req, res) => {
  try {
    await updateStockPrices();
    const status = await getMarketStatus();
    await createAuditLog({
      actor: req.user,
      action: "ADMIN_TRIGGER_SIMULATION",
      entity: "MARKET",
      details: status
    });
    res.json({ message: "Market simulation triggered", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [usersCount, stocksCount, transactionsCount, buyTransactions, sellTransactions, status] =
      await Promise.all([
        User.countDocuments(),
        Stock.countDocuments(),
        Transaction.countDocuments(),
        Transaction.countDocuments({ type: "BUY" }),
        Transaction.countDocuments({ type: "SELL" }),
        getMarketStatus()
      ]);

    const transactions = await Transaction.find().sort({ date: -1 }).limit(20);
    const stocks = await Stock.find().sort({ symbol: 1 });

    const totalTradeValue = transactions.reduce(
      (sum, transaction) => sum + transaction.quantity * transaction.price,
      0
    );

    res.json({
      usersCount,
      stocksCount,
      transactionsCount,
      buyTransactions,
      sellTransactions,
      totalTradeValue,
      market: status.market,
      topGainer: status.topGainer,
      topLoser: status.topLoser,
      marketMovements: status.movements,
      stockPrices: stocks.map((stock) => ({
        symbol: stock.symbol,
        currentPrice: stock.currentPrice
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId, blocked } = req.body;

    if (!userId || typeof blocked !== "boolean") {
      return res.status(400).json({ message: "userId and blocked(boolean) are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Protect the single admin account from being blocked
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot block the admin account" });
    }

    user.blocked = blocked;
    await user.save();

    await createAuditLog({
      actor: req.user,
      action: blocked ? "BLOCK_USER" : "UNBLOCK_USER",
      entity: "USER",
      details: { targetUserId: user._id, targetEmail: user.email }
    });

    res.json({ message: `User ${blocked ? "blocked" : "unblocked"} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adjustUserBalance = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ message: "userId and numeric amount are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot adjust admin balance" });
    }

    const adjustment = Number(amount);
    const previousBalance = user.balance;
    user.balance = Math.max(0, user.balance + adjustment);
    await user.save();

    // Also update portfolio balance
    await Portfolio.findOneAndUpdate(
      { userId: user._id },
      { balance: user.balance }
    );

    await createAuditLog({
      actor: req.user,
      action: "ADMIN_ADJUST_BALANCE",
      entity: "USER",
      details: {
        targetUserId: user._id,
        targetEmail: user.email,
        previousBalance,
        adjustment,
        newBalance: user.balance,
        reason: reason || "Admin adjustment"
      }
    });

    res.json({
      message: `Balance ${adjustment >= 0 ? "credited" : "debited"} successfully`,
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addStock,
  updateStock,
  deleteStock,
  getAllUsers,
  getAllTransactions,
  resetMarketPrices,
  triggerMarketSimulation,
  getAnalytics,
  getAuditLogs,
  blockUser,
  adjustUserBalance
};
