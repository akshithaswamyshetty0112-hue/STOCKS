const express = require("express");
const { getStocks, getStockHistory } = require("../controllers/stockController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getStocks);
router.get("/:symbol/history", protect, getStockHistory);

module.exports = router;
