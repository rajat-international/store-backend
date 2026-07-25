const Issue = require("../models/Issue");
const Fabric = require("../models/Fabric");
const StockHistory = require("../models/StockHistory");

// ======================================
// Issue Fabric
// ======================================


const issueFabric = async (req, res) => {
    try {
        const {
            fabric,
            challanNo,
            issuedTo,
            quantity,
            description,
        } = req.body;

        // Validation
        if (!fabric) {
            return res.status(400).json({
                success: false,
                message: "Please select fabric",
            });
        }

        if (!challanNo) {
            return res.status(400).json({
                success: false,
                message: "Challan No is required",
            });
        }

        const fabricData = await Fabric.findById(fabric);

        if (!fabricData) {
            return res.status(404).json({
                success: false,
                message: "Fabric not found",
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        if (fabricData.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient Stock",
            });
        }

        const oldStock = fabricData.quantity;

        // ======================================
        // Create Issue First
        // ======================================
        const existingIssue = await Issue.findOne({
            challanNo: challanNo.trim(),
        });

        if (existingIssue) {
            return res.status(400).json({
                success: false,
                message: "Challan Number already exists",
            });
        }
        const issue = await Issue.create({
            fabric: fabricData._id,
            challanNo,
            fabricCode: fabricData.fabricCode,
            construction: fabricData.construction,
            color: fabricData.color,
            issuedTo,
            issuedQuantity: quantity,
            description,
        });

        // ======================================
        // Update Stock
        // ======================================

        fabricData.quantity -= quantity;

        await fabricData.save();

        // ======================================
        // Save History
        // ======================================

        await StockHistory.create({
            fabric: fabricData._id,
            fabricCode: fabricData.fabricCode,
            challanNo,
            type: "ISSUE",
            quantity,
            oldStock,
            newStock: fabricData.quantity,
            merchant: issuedTo,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Fabric Issued Successfully",
            data: issue,
        });
    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Challan Number already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ======================================
// Return Fabric
// ======================================

const returnFabric = async (req, res) => {
    try {

        const {
            fabric,
            quantity,
            description
        } = req.body;

        const fabricData = await Fabric.findById(fabric);

        if (!fabricData) {
            return res.status(404).json({
                success: false,
                message: "Fabric not found",
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        const oldStock = fabricData.quantity;

        fabricData.quantity += quantity;

        await fabricData.save();

        // Step 7:
        // StockHistory me RETURN save karenge

        await StockHistory.create({
            fabric: fabricData._id,
            fabricCode: fabricData.fabricCode,
            type: "RETURN",
            quantity,
            oldStock,
            newStock: fabricData.quantity,
            description,
        });

        res.status(200).json({
            success: true,
            message: "Fabric Returned Successfully",
            currentStock: fabricData.quantity,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ======================================
// Get All Issues
// ======================================

const getAllIssues = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const search = req.query.search || "";
        const fabricId = req.query.fabricId || "";

        const query = {};

        if (search) {
            query.$or = [{
                    issuedTo: {
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

        if (fabricId) {
            query.fabric = fabricId;
        }

        const total = await Issue.countDocuments(query);

        const issues = await Issue.find(query)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        res.status(200).json({

            success: true,

            page,

            limit,

            total,

            totalPages: Math.ceil(total / limit),

            count: issues.length,

            data: issues,

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ======================================
// Get Single Issue
// ======================================

const getIssueById = async (req, res) => {

    try {

        const issue = await Issue.findById(req.params.id);

        if (!issue) {

            return res.status(404).json({

                success: false,

                message: "Issue not found",

            });

        }

        res.status(200).json({

            success: true,

            data: issue,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

module.exports = {

    issueFabric,

    returnFabric,

    getAllIssues,

    getIssueById,

};