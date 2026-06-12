const express = require("express");
const {
  getStocks,
  getStockHistory,
  getStockBySymbol,
} = require("../controllers/stockController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getStocks);
router.get("/:symbol", protect, getStockBySymbol);
router.get("/quote/:symbol/history", protect, getStockHistory);

module.exports = router;