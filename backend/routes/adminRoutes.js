const express = require("express");
const {
  addStock,
  deleteStock,
  getAllTransactions,
  getAllUsers,
  getAnalytics,
  getAuditLogs,
  blockUser,
  resetMarketPrices,
  triggerMarketSimulation,
  updateStock
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.post("/addStock", addStock);
router.put("/updateStock", updateStock);
router.delete("/deleteStock", deleteStock);
router.get("/allUsers", getAllUsers);
router.get("/allTransactions", getAllTransactions);
router.post("/resetMarket", resetMarketPrices);
router.post("/triggerMarketSimulation", triggerMarketSimulation);
router.get("/analytics", getAnalytics);
router.get("/auditLogs", getAuditLogs);
router.post("/blockUser", blockUser);

module.exports = router;
