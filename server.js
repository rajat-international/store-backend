require("dotenv").config();

// Fix DNS issue - use Google DNS for MongoDB SRV queries
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.log("❌ Failed to start server");
    console.log(error.message);
    process.exit(1);
  }
};

// Catch unhandled promise rejections (e.g. DB errors after startup)
process.on("unhandledRejection", (error) => {
  console.log("❌ Unhandled Rejection:", error.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

// Graceful shutdown on Ctrl+C / process kill
process.on("SIGINT", () => {
  console.log("🛑 Server shutting down...");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

startServer();