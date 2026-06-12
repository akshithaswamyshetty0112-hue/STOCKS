const Stock = require("../models/Stock");

const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockBySymbol = async (req, res) => {
  try {
    const stock = await Stock.findOne({
      symbol: req.params.symbol.toUpperCase(),
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockHistory = async (req, res) => {
  try {
    const stock = await Stock.findOne({
      symbol: req.params.symbol.toUpperCase(),
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const history = (stock.priceHistory || [])
      .slice(-96)
      .map((h, idx) => ({
        time: idx,
        price: h.price,
        timestamp: h.timestamp,
      }));

    res.json({
      symbol: stock.symbol,
      company: stock.company,
      history,
      trend: stock.trend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  getStockHistory,
};