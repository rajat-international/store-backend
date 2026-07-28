const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ Database Connection Failed");
    console.log(error.message);
    isConnected = false;
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
  isConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB connection error:", err.message);
});

module.exports = connectDB;