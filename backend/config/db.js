const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

    console.log("Using Mongo URI:");
    console.log(mongoUrl);

    if (!mongoUrl) {
      throw new Error("MongoDB connection string is missing in .env");
    }

    const connection = await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully");
    return connection;
  }catch (error) {
  console.error("MongoDB connection failed:");
  console.error(error);
  process.exit(1);
}
  // } catch (error) {
  //   console.error("MongoDB connection failed:", error.message);
  //   process.exit(1);
  // }
};

module.exports = connectDB;