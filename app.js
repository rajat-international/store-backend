const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");   // 👈 ye add karo
const historyRoutes = require("./routes/history.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const authRoutes = require("./routes/auth.routes");
const fabricRoutes = require("./routes/fabric.routes");
const issueRoutes = require("./routes/issue.routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fabric Inventory API Running",
  });
});

app.get("/api/db-test", (req, res) => {
  res.json({
    state: mongoose.connection.readyState,
  });
});
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/issues", issueRoutes);

module.exports = app;