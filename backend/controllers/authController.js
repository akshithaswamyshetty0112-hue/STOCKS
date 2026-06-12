const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const { createAuditLog } = require("../services/auditService");

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const getAllowedAdminEmail = () => {
  return (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
};

const getRoleForEmail = (email) => {
  return email.toLowerCase().trim() === getAllowedAdminEmail() ? "admin" : "user";
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: getRoleForEmail(email)
    });

    await Portfolio.create({
      userId: user._id,
      stocks: []
    });

    await createAuditLog({
      actor: user,
      action: "REGISTER",
      entity: "USER",
      details: {
        email: user.email,
        role: user.role
      }
    });

    res.status(201).json({
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "User account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const allowedAdminEmail = getAllowedAdminEmail();
    const normalizedEmail = user.email.toLowerCase().trim();

    if (user.role === "admin" && normalizedEmail !== allowedAdminEmail) {
      return res.status(403).json({ message: "Only the configured admin account can login as admin" });
    }

    const expectedRole = getRoleForEmail(user.email);

    if (user.role !== expectedRole) {
      user.role = expectedRole;
      await user.save();
    }

    await createAuditLog({
      actor: user,
      action: "LOGIN",
      entity: "USER",
      details: {
        email: user.email,
        role: user.role
      }
    });

    // Create a welcome-back notification
    try {
      const { createNotification } = require("../services/notificationService");
      await createNotification({
        userId: user._id,
        title: `Welcome back, ${user.name}`,
        message: `Hello ${user.name}, welcome back!`
      });
    } catch (err) {
      console.error("Notification creation failed:", err.message);
    }

    res.json({
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
