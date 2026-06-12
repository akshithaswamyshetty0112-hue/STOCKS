const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getUserNotifications, markAsRead } = require("../services/notificationService");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const notifs = await getUserNotifications(req.user._id);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/mark-read", async (req, res) => {
  try {
    const { id } = req.body;
    const n = await markAsRead(id, req.user._id);
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
