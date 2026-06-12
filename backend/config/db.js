const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MongoDB connection string is missing in .env");
    }

    const connection = await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
