const Fabric = require("../models/Fabric");
const StockHistory = require("../models/StockHistory");

// ==========================
// Add Fabric
// ==========================
const addFabric = async (req, res) => {
  try {
    const {
      fabricCode,
      construction,
      composition,
      gsm,
      color,
      supplier,
      quantity,
      price,
      unit,
      rackNumber,
      lowStockLimit,
    } = req.body;

    const existingFabric = await Fabric.findOne({ fabricCode });

    if (existingFabric) {
      return res.status(400).json({
        success: false,
        message: "Fabric Code already exists",
      });
    }

    const fabric = await Fabric.create({
      fabricCode,
      construction,
      composition,
      gsm,
      color,
      supplier,
      quantity,
      price,
      unit,
      rackNumber,
      lowStockLimit,
    });

    await StockHistory.create({
      fabric: fabric._id,
      fabricCode: fabric.fabricCode,
      type: "ADD",
      quantity: fabric.quantity,
      oldStock: 0,
      newStock: fabric.quantity,
      merchant: "",
      description: "Initial Stock Added",
    });

    res.status(201).json({
      success: true,
      message: "Fabric Added Successfully",
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Fabrics
// ==========================
const getAllFabrics = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";
    const color = req.query.color || "";
    const supplier = req.query.supplier || "";

    const query = {};

    if (search) {
      query.$or = [
        {
          fabricCode: {
            $regex: search,
            $options: "i",
          },
        },
        {
          construction: {
            $regex: search,
            $options: "i",
          },
        },
        {
          color: {
            $regex: search,
            $options: "i",
          },
        },
        {
          supplier: {
            $regex: search,
            $options: "i",
          },
        },
        {
          rackNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "composition.material": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (color) {
      query.color = color;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    const total = await Fabric.countDocuments(query);

    const fabrics = await Fabric.find(query)
      .select(
        "fabricCode construction composition gsm color supplier quantity price unit rackNumber lowStockLimit createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: fabrics.length,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Single Fabric
// ==========================
const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({
        success: false,
        message: "Fabric Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Fabric
// ==========================
const updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({
        success: false,
        message: "Fabric Not Found",
      });
    }

    Object.assign(fabric, req.body);

    await fabric.save();

    res.status(200).json({
      success: true,
      message: "Fabric Updated Successfully",
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Fabric
// ==========================
const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({
        success: false,
        message: "Fabric Not Found",
      });
    }

    await fabric.deleteOne();

    res.status(200).json({
      success: false,
      message: "Fabric Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
};