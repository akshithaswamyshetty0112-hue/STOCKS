const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");
const tradingEngine = require("../services/tradingEngine");
const User = require("../models/User");

const getPortfolio = async (req, res) => {
  try {
    const targetUserId = req.user.role === "admin" && req.query.userId ? req.query.userId : req.user._id;

    const portfolio = await Portfolio.findOne({ userId: targetUserId });
    const stocks = await Stock.find();
    const stockPriceMap = new Map(stocks.map((stock) => [stock.symbol, stock.currentPrice]));

    const holdings = (portfolio?.stocks || []).map((holding) => {
      const currentPrice = stockPriceMap.get(holding.symbol) || 0;
      const investment = holding.quantity * holding.avgBuyPrice;
      const currentValue = holding.quantity * currentPrice;

      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        investment,
        currentValue,
        profitLoss: currentValue - investment
      };
    });

    // If admin requested another user's portfolio, load that user's balance
    let balance = req.user.balance;

    if (req.user.role === "admin" && req.query.userId) {
      const targetUser = await User.findById(targetUserId).select("balance");
      balance = targetUser ? targetUser.balance : 0;
    }

    res.json({
      balance,
      stocks: holdings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buyStock = async (req, res) => {
  try {
    const targetUserId = req.user.role === "admin" && req.body.userId ? req.body.userId : req.user._id;

    const result = await tradingEngine.buyStock({
      userId: targetUserId,
      symbol: req.body.symbol,
      quantity: req.body.quantity
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sellStock = async (req, res) => {
  try {
    const targetUserId = req.user.role === "admin" && req.body.userId ? req.body.userId : req.user._id;

    const result = await tradingEngine.sellStock({
      userId: targetUserId,
      symbol: req.body.symbol,
      quantity: req.body.quantity
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPortfolio,
  buyStock,
  sellStock
};
