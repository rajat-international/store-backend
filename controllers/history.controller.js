const StockHistory = require("../models/StockHistory");


// ======================================
// Get All History
// ======================================

const getAllHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const fabricId = req.query.fabricId || "";
    const type = req.query.type || "";

    const query = {};

    // Search by Fabric Code
 if (search) {
  query.$or = [
    {
      fabricCode: {
        $regex: search,
        $options: "i",
      },
    },
    {
      merchant: {
        $regex: search,
        $options: "i",
      },
    },
    {
      challanNo: {
        $regex: search,
        $options: "i",
      },
    },
  ];
}

    // Filter by Fabric
    if (fabricId) {
      query.fabric = fabricId;
    }

    // Filter by Type
    if (type) {
      query.type = type;
    }

    const total = await StockHistory.countDocuments(query);

    const history = await StockHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// Get Single History
// ======================================

const getHistoryById = async (req, res) => {
  try {
    const history = await StockHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "History Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllHistory,
  getHistoryById,
};