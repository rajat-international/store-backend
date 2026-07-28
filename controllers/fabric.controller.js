const Fabric = require("../models/Fabric");
const StockHistory = require("../models/StockHistory");
const { deleteImage } = require("../utils/cloudinary");
const ExcelJS = require("exceljs");

// ==========================
// Add Fabric
// ==========================
const addFabric = async (req, res) => {
  try {
    const {
      fabricCode,
      category,
      width,
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
      category,
      gsm,
      width,
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
    const category = req.query.category || "";

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
    if (category) {
  query.category = category;
}

    if (color) {
      query.color = color;
    }
    if (category) {
  query.category = category;
}

    if (supplier) {
      query.supplier = supplier;
    }

    const total = await Fabric.countDocuments(query);

    const fabrics = await Fabric.find(query)
      .select(
        "fabricCode category width construction composition gsm color supplier quantity price unit rackNumber lowStockLimit createdAt updatedAt"
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

    // Delete old image
    if (req.file && fabric.image) {
      await deleteImage(fabric.image);
    }

    Object.assign(fabric, req.body);

    if (req.file) {
      fabric.image = req.file.path;
    }

    await fabric.save();

    res.json({
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

    if (fabric.image) {
      await deleteImage(fabric.image);
    }

    await fabric.deleteOne();

    res.json({
      success: true,
      message: "Fabric Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================
// Export Fabrics Excel
// ==========================

const exportFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.find()
      .sort({ createdAt: -1 })
      .lean();

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Fabric Inventory");

    // Company Name

    worksheet.mergeCells("A1:K1");

    worksheet.getCell("A1").value =
      "RAJAT INTERNATIONAL";

    worksheet.getCell("A1").font = {
      bold: true,
      size: 18,
    };

    worksheet.getCell("A1").alignment = {
      horizontal: "center",
    };

    // Report Title

    worksheet.mergeCells("A2:K2");

    worksheet.getCell("A2").value =
      "FABRIC INVENTORY REPORT";

    worksheet.getCell("A2").font = {
      bold: true,
      size: 14,
    };

    worksheet.getCell("A2").alignment = {
      horizontal: "center",
    };

    worksheet.getCell("A3").value =
      "Generated : " +
      new Date().toLocaleString("en-IN");

    worksheet.addRow([]);

    // Header

    const header = worksheet.addRow([
      "Fabric Code",
      "Construction",
      "Composition",
      "category",
      "GSM",
      "Color",
      "Supplier",
      "Stock",
      "width",
      "Rack No",
      "Unit",
      "Price",
      "Low Stock",
    ]);

    header.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "1F4E78",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.border = {
        top: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    });

    // Data

    fabrics.forEach((fabric) => {
      worksheet.addRow([
        fabric.fabricCode,

        fabric.construction,

        fabric.composition
          ?.map(
            (item) =>
              `${item.percentage}% ${item.material}`
          )
          .join(", "),

        fabric.gsm,
        fabric.color,
        fabric.supplier,
        fabric.quantity,
        fabric.unit,
        fabric.width,
        fabric.rackNumber,
        fabric.price,
        fabric.category,
        fabric.lowStockLimit,
      ]);
    });

    // Border

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 4) return;

      row.eachCell((cell) => {
        cell.border = {
          top: {
            style: "thin",
          },
          left: {
            style: "thin",
          },
          bottom: {
            style: "thin",
          },
          right: {
            style: "thin",
          },
        };
      });
    });

    // Auto Width

    worksheet.columns.forEach((column) => {
      let maxLength = 15;

      column.eachCell((cell) => {
        const len = cell.value
          ? cell.value.toString().length
          : 10;

        if (len > maxLength) {
          maxLength = len;
        }
      });

      column.width = maxLength + 3;
    });

    // Freeze Header

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 5,
      },
    ];

    // Auto Filter

    worksheet.autoFilter = {
      from: "A5",
      to: "K5",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="FabricInventory.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();
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
    exportFabrics,
};