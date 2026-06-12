const express = require("express");
const { getStatus } = require("../controllers/marketController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/status", protect, getStatus);

module.exports = router;
