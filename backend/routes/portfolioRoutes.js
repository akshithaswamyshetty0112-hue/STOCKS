const express = require("express");
const { getPortfolio, buyStock, sellStock } = require("../controllers/portfolioController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPortfolio);
router.post("/buy", protect, buyStock);
router.post("/sell", protect, sellStock);

module.exports = router;
