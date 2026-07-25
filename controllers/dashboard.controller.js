const Fabric = require("../models/Fabric");
const Issue = require("../models/Issue");

const getDashboard = async (req, res) => {
  try {
    // Total Fabrics
    const totalFabrics = await Fabric.countDocuments();

    // Current Stock
    const stock = await Fabric.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$quantity" },
        },
      },
    ]);

    // Total Issued
    const issued = await Issue.aggregate([
      {
        $group: {
          _id: null,
          totalIssued: { $sum: "$issuedQuantity" },
        },
      },
    ]);

    // Low Stock
    const lowStock = await Fabric.find({
      $expr: {
        $lte: ["$quantity", "$lowStockLimit"],
      },
    }).select(
      "fabricCode construction color quantity rackNumber lowStockLimit"
    );

    // Recent Issues
    const recentIssues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "fabricCode construction color issuedTo issuedQuantity createdAt"
      );

    res.status(200).json({
      success: true,
      data: {
        totalFabrics,
        currentStock: stock[0]?.totalStock || 0,
        totalIssued: issued[0]?.totalIssued || 0,
        lowStockCount: lowStock.length,
        lowStock,
        recentIssues,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};