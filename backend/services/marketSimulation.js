const Stock = require("../models/Stock");
const MarketState = require("../models/MarketState");
const { createAuditLog } = require("./auditService");

const initialStocks = [
  { symbol: "AAPL", company: "Apple Inc.", currentPrice: 185 },
  { symbol: "TSLA", company: "Tesla Inc.", currentPrice: 245 },
  { symbol: "META", company: "Meta Platforms Inc.", currentPrice: 330 },
  { symbol: "GOOG", company: "Alphabet Inc.", currentPrice: 140 }
];

let simulationTimer = null;
let lastMovements = [];

const seedInitialStocks = async () => {
  for (const stock of initialStocks) {
    await Stock.findOneAndUpdate(
      { symbol: stock.symbol },
      { $setOnInsert: stock },
      { upsert: true, new: true }
    );
  }

  console.log("Initial stocks are ready");
};

const getMarketType = (averageChange) => {
  if (averageChange > 5) {
    return "BULL";
  }

  if (averageChange < -5) {
    return "BEAR";
  }

  return "STABLE";
};

const saveMarketState = async (marketType) => {
  const state = await MarketState.findOne();

  if (state) {
    state.marketType = marketType;
    state.updatedAt = new Date();
    await state.save();
    return state;
  }

  return MarketState.create({ marketType, updatedAt: new Date() });
};

const getRealisticPriceChange = (stock, marketTrend) => {
  const baseVolatility = stock.volatility || 0.02;
  const trendMultiplier = marketTrend === "BULL" ? 1.3 : marketTrend === "BEAR" ? 0.7 : 1;
  const volatility = baseVolatility * trendMultiplier;
  const randomShock = (Math.random() - 0.5) * 2;
  const change = (randomShock * volatility * stock.currentPrice) * 100;
  return change;
};

const updateStockPrices = async () => {
  const stocks = await Stock.find();
  const movements = [];
  const baseMarketTrend = Math.random() > 0.6 ? (Math.random() > 0.5 ? "BULL" : "BEAR") : "STABLE";

  for (const stock of stocks) {
    const change = getRealisticPriceChange(stock, baseMarketTrend);
    const newPrice = stock.currentPrice + change;

    stock.currentPrice = Number(Math.max(10, newPrice).toFixed(2));
    
    // Track price history (keep last 288 entries = 24 hours at 5-second intervals)
    if (!stock.priceHistory) stock.priceHistory = [];
    stock.priceHistory.push({
      price: stock.currentPrice,
      timestamp: new Date()
    });
    if (stock.priceHistory.length > 288) {
      stock.priceHistory.shift();
    }

    // Update trend based on recent performance
    const recentPrices = stock.priceHistory.slice(-12).map(h => h.price);
    const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const oldPrice = stock.priceHistory[Math.max(0, stock.priceHistory.length - 12)]?.price || stock.currentPrice;
    if (stock.currentPrice > oldPrice * 1.01) stock.trend = "UP";
    else if (stock.currentPrice < oldPrice * 0.99) stock.trend = "DOWN";
    else stock.trend = "STABLE";

    await stock.save();

    movements.push({
      symbol: stock.symbol,
      company: stock.company,
      change: Number(change.toFixed(2)),
      currentPrice: stock.currentPrice,
      trend: stock.trend
    });
  }

  lastMovements = movements;

  const averageChange =
    movements.reduce((sum, movement) => sum + movement.change, 0) / (movements.length || 1);
  const marketType = getMarketType(averageChange);

  await saveMarketState(marketType);

  await createAuditLog({
    action: "MARKET_PRICE_UPDATE",
    entity: "MARKET",
    details: {
      marketType,
      movements
    }
  });

  console.log(`Market prices updated. State: ${marketType}`);
};

const startMarketSimulation = () => {
  if (simulationTimer) {
    return;
  }

  simulationTimer = setInterval(updateStockPrices, 5000);
  console.log("Market simulation started");
};

const resetMarket = async () => {
  for (const stock of initialStocks) {
    await Stock.findOneAndUpdate(
      { symbol: stock.symbol },
      {
        symbol: stock.symbol,
        company: stock.company,
        currentPrice: stock.currentPrice
      },
      { upsert: true, new: true }
    );
  }

  lastMovements = initialStocks.map((stock) => ({
    symbol: stock.symbol,
    company: stock.company,
    change: 0,
    currentPrice: stock.currentPrice
  }));

  await saveMarketState("STABLE");

  await createAuditLog({
    action: "MARKET_RESET",
    entity: "MARKET",
    details: {
      stocks: initialStocks
    }
  });
};

const getMarketStatus = async () => {
  const state = await MarketState.findOne().sort({ updatedAt: -1 });
  const stocks = await Stock.find().sort({ symbol: 1 });
  const movements =
    lastMovements.length > 0
      ? lastMovements
      : stocks.map((stock) => ({
          symbol: stock.symbol,
          company: stock.company,
          change: 0,
          currentPrice: stock.currentPrice
        }));

  const topGainer = [...movements].sort((a, b) => b.change - a.change)[0];
  const topLoser = [...movements].sort((a, b) => a.change - b.change)[0];

  return {
    market: state?.marketType || "STABLE",
    topGainer: topGainer?.symbol || "",
    topLoser: topLoser?.symbol || "",
    movements
  };
};

module.exports = {
  seedInitialStocks,
  startMarketSimulation,
  updateStockPrices,
  resetMarket,
  getMarketStatus
};
