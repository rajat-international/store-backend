const express = require("express");
const cors = require("cors");
const historyRoutes = require("./routes/history.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const authRoutes = require("./routes/auth.routes");
const fabricRoutes = require("./routes/fabric.routes");
const issueRoutes = require("./routes/issue.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fabric Inventory API Running",
  });
});
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/issues", issueRoutes);

module.exports = app;