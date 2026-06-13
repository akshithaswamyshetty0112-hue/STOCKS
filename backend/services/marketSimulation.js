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
      {
        upsert: true,
        returnDocument: "after"
      }
    );
  }

  console.log("Initial stocks are ready");
};

const getMarketType = (averageChange) => {
  if (averageChange > 5) return "BULL";
  if (averageChange < -5) return "BEAR";
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

  return MarketState.create({
    marketType,
    updatedAt: new Date()
  });
};

const getRealisticPriceChange = (stock, marketTrend) => {
  const baseVolatility = stock.volatility || 0.02;

  const trendMultiplier =
    marketTrend === "BULL"
      ? 1.3
      : marketTrend === "BEAR"
      ? 0.7
      : 1;

  const volatility = baseVolatility * trendMultiplier;
  const randomShock = (Math.random() - 0.5) * 2;

  return (
    randomShock *
    volatility *
    stock.currentPrice *
    100
  );
};

const updateStockPrices = async () => {
  try {
    const stocks = await Stock.find();
    const movements = [];

    const baseMarketTrend =
      Math.random() > 0.6
        ? Math.random() > 0.5
          ? "BULL"
          : "BEAR"
        : "STABLE";

    for (const stock of stocks) {
      const change = getRealisticPriceChange(
        stock,
        baseMarketTrend
      );

      const newPrice = Number(
        Math.max(
          10,
          stock.currentPrice + change
        ).toFixed(2)
      );

      const priceHistory = [...(stock.priceHistory || [])];

      priceHistory.push({
        price: newPrice,
        timestamp: new Date()
      });

      if (priceHistory.length > 288) {
        priceHistory.shift();
      }

      const oldPrice =
        priceHistory[
          Math.max(0, priceHistory.length - 12)
        ]?.price || newPrice;

      let trend = "STABLE";

      if (newPrice > oldPrice * 1.01) {
        trend = "UP";
      } else if (newPrice < oldPrice * 0.99) {
        trend = "DOWN";
      }

      await Stock.findByIdAndUpdate(
        stock._id,
        {
          $set: {
            currentPrice: newPrice,
            priceHistory,
            trend
          }
        },
        {
          runValidators: false
        }
      );

      movements.push({
        symbol: stock.symbol,
        company: stock.company,
        change: Number(change.toFixed(2)),
        currentPrice: newPrice,
        trend
      });
    }

    lastMovements = movements;

    const averageChange =
      movements.reduce(
        (sum, movement) => sum + movement.change,
        0
      ) / (movements.length || 1);

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

    console.log(
      `Market prices updated. State: ${marketType}`
    );
  } catch (error) {
    console.error(
      "Market simulation error:",
      error.message
    );
  }
};

const startMarketSimulation = () => {
  if (simulationTimer) return;

  simulationTimer = setInterval(
    updateStockPrices,
    5000
  );

  console.log("Market simulation started");
};

const resetMarket = async () => {
  for (const stock of initialStocks) {
    await Stock.findOneAndUpdate(
      { symbol: stock.symbol },
      {
        symbol: stock.symbol,
        company: stock.company,
        currentPrice: stock.currentPrice,
        trend: "STABLE",
        priceHistory: []
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );
  }

  lastMovements = initialStocks.map((stock) => ({
    symbol: stock.symbol,
    company: stock.company,
    change: 0,
    currentPrice: stock.currentPrice,
    trend: "STABLE"
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
  const state = await MarketState.findOne().sort({
    updatedAt: -1
  });

  const stocks = await Stock.find().sort({
    symbol: 1
  });

  const movements =
    lastMovements.length > 0
      ? lastMovements
      : stocks.map((stock) => ({
          symbol: stock.symbol,
          company: stock.company,
          change: 0,
          currentPrice: stock.currentPrice,
          trend: stock.trend || "STABLE"
        }));

  const topGainer = [...movements].sort(
    (a, b) => b.change - a.change
  )[0];

  const topLoser = [...movements].sort(
    (a, b) => a.change - b.change
  )[0];

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
