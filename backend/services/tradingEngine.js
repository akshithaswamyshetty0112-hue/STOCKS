const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { createAuditLog } = require("./auditService");
const { createNotification } = require("./notificationService");

const validateQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Quantity must be a positive whole number");
  }

  return parsedQuantity;
};

const buyStock = async ({ userId, symbol, quantity }) => {
  const buyQuantity = validateQuantity(quantity);

  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

  if (!stock) {
    throw new Error("Stock not found");
  }

  const user = await User.findById(userId);
  const totalCost = stock.currentPrice * buyQuantity;

  if (user.balance < totalCost) {
    throw new Error("Insufficient balance");
  }

  let portfolio = await Portfolio.findOne({ userId });

  if (!portfolio) {
    portfolio = await Portfolio.create({ userId, stocks: [] });
  }

  const holding = portfolio.stocks.find((item) => item.symbol === stock.symbol);

  if (holding) {
    const oldInvestment = holding.quantity * holding.avgBuyPrice;
    const newInvestment = buyQuantity * stock.currentPrice;
    const newQuantity = holding.quantity + buyQuantity;

    holding.quantity = newQuantity;
    holding.avgBuyPrice = (oldInvestment + newInvestment) / newQuantity;
  } else {
    portfolio.stocks.push({
      symbol: stock.symbol,
      quantity: buyQuantity,
      avgBuyPrice: stock.currentPrice
    });
  }

  user.balance = Number((user.balance - totalCost).toFixed(2));

  await user.save();
  await portfolio.save();

  const transaction = await Transaction.create({
    userId,
    symbol: stock.symbol,
    quantity: buyQuantity,
    price: stock.currentPrice,
    type: "BUY"
  });

  await createAuditLog({
    actor: user,
    action: "BUY_STOCK",
    entity: "TRANSACTION",
    details: {
      symbol: stock.symbol,
      quantity: buyQuantity,
      price: stock.currentPrice,
      totalCost,
      balanceAfterTrade: user.balance
    }
  });

  // Notify user about successful purchase
  try {
    await createNotification({
      userId,
      title: "Purchase completed",
      message: `You bought ${buyQuantity} share(s) of ${stock.symbol} for ₹${(totalCost).toFixed(2)}.`
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }

  return {
    message: "Stock bought successfully",
    balance: user.balance,
    transaction
  };
};

const sellStock = async ({ userId, symbol, quantity }) => {
  const sellQuantity = validateQuantity(quantity);

  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

  if (!stock) {
    throw new Error("Stock not found");
  }

  const portfolio = await Portfolio.findOne({ userId });

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  const holding = portfolio.stocks.find((item) => item.symbol === stock.symbol);

  if (!holding || holding.quantity < sellQuantity) {
    throw new Error("Not enough shares to sell");
  }

  const user = await User.findById(userId);
  const totalValue = stock.currentPrice * sellQuantity;

  holding.quantity -= sellQuantity;

  if (holding.quantity === 0) {
    portfolio.stocks = portfolio.stocks.filter((item) => item.symbol !== stock.symbol);
  }

  user.balance = Number((user.balance + totalValue).toFixed(2));

  await user.save();
  await portfolio.save();

  const transaction = await Transaction.create({
    userId,
    symbol: stock.symbol,
    quantity: sellQuantity,
    price: stock.currentPrice,
    type: "SELL"
  });

  await createAuditLog({
    actor: user,
    action: "SELL_STOCK",
    entity: "TRANSACTION",
    details: {
      symbol: stock.symbol,
      quantity: sellQuantity,
      price: stock.currentPrice,
      totalValue,
      balanceAfterTrade: user.balance
    }
  });

  // Notify user about successful sale
  try {
    await createNotification({
      userId,
      title: "Sale completed",
      message: `You sold ${sellQuantity} share(s) of ${stock.symbol} for ₹${(totalValue).toFixed(2)}.`
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }

  return {
    message: "Stock sold successfully",
    balance: user.balance,
    transaction
  };
};

module.exports = {
  buyStock,
  sellStock
};
