const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const marketRoutes = require("./routes/marketRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { enforceSingleAdmin } = require("./services/adminGuard");
const {
  seedInitialStocks,
  startMarketSimulation,
} = require("./services/marketSimulation");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend URLs
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://stocks-xi-ten.vercel.app",
].filter(Boolean);

// Allow all Vercel deployments
const vercelOriginPattern = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      vercelOriginPattern.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS policy violation: origin ${origin} not allowed`)
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Stock Trading Simulator API is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    await enforceSingleAdmin();
    await seedInitialStocks();
    startMarketSimulation();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();