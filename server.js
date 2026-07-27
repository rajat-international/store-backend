require("dotenv").config();

// Fix DNS issue - use Google DNS for MongoDB SRV queries
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.log("❌ Failed to start server");
    console.log(error.message);
    process.exit(1);
  }
};

startServer();