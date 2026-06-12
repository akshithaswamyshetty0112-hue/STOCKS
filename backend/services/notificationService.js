const Notification = require("../models/Notification");

const createNotification = async ({ userId, title, message, meta = {} }) => {
  return Notification.create({ userId, title, message, meta });
};

const getUserNotifications = async (userId, { limit = 50 } = {}) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

const markAsRead = async (notificationId, userId) => {
  const n = await Notification.findOne({ _id: notificationId, userId });
  if (!n) throw new Error("Notification not found");
  n.read = true;
  await n.save();
  return n;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead
};
