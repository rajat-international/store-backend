const mongoose = require("mongoose");
const Issue = require("../models/Issue");
const Fabric = require("../models/Fabric");
const StockHistory = require("../models/StockHistory");

// ======================================
// Issue Fabric (multiple items per challan)
// ======================================

const issueFabric = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { challanNo, issuedTo, description, items } = req.body;

        if (!challanNo || !challanNo.trim()) {
            return res.status(400).json({
                success: false,
                message: "Challan No is required",
            });
        }

        if (!issuedTo) {
            return res.status(400).json({
                success: false,
                message: "Merchant name is required",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one fabric is required",
            });
        }

        const trimmedChallanNo = challanNo.trim();

        const existingIssue = await Issue.findOne({ challanNo: trimmedChallanNo });
        if (existingIssue) {
            return res.status(400).json({
                success: false,
                message: "Challan Number already exists",
            });
        }

        // Merge rows in case the same fabric was picked more than once
        const merged = new Map();
        for (const it of items) {
            if (!it.fabric) {
                return res.status(400).json({
                    success: false,
                    message: "Please select fabric for each item",
                });
            }
            const qty = Number(it.quantity);
            if (!qty || qty <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than 0",
                });
            }
            merged.set(it.fabric, (merged.get(it.fabric) || 0) + qty);
        }

        let createdIssue;

        await session.withTransaction(async () => {
            const issueItems = [];

            for (const [fabricId, quantity] of merged.entries()) {
                const fabricData = await Fabric.findById(fabricId).session(session);

                if (!fabricData) {
                    throw Object.assign(new Error("Fabric not found"), { status: 404 });
                }

                if (fabricData.quantity < quantity) {
                    throw Object.assign(
                        new Error(`Insufficient stock for ${fabricData.fabricCode}`),
                        { status: 400 }
                    );
                }

                const oldStock = fabricData.quantity;
                fabricData.quantity -= quantity;
                await fabricData.save({ session });

                await StockHistory.create(
                    [{
                        fabric: fabricData._id,
                        fabricCode: fabricData.fabricCode,
                        challanNo: trimmedChallanNo,
                        type: "ISSUE",
                        quantity,
                        oldStock,
                        newStock: fabricData.quantity,
                        merchant: issuedTo,
                        description,
                    }],
                    { session }
                );

                issueItems.push({
                    fabric: fabricData._id,
                    fabricCode: fabricData.fabricCode,
                    construction: fabricData.construction,
                    color: fabricData.color,
                    issuedQuantity: quantity,
                });
            }

            const [issue] = await Issue.create(
                [{
                    challanNo: trimmedChallanNo,
                    issuedTo,
                    description,
                    items: issueItems,
                }],
                { session }
            );

            createdIssue = issue;
        });

        res.status(201).json({
            success: true,
            message: "Fabric Issued Successfully",
            data: createdIssue,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Challan Number already exists",
            });
        }
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    } finally {
        session.endSession();
    }
};

// ======================================
// Return Fabric — unchanged, still per-fabric
// ======================================

const returnFabric = async (req, res) => {
    try {
        const { fabric, quantity, description } = req.body;

        const fabricData = await Fabric.findById(fabric);

        if (!fabricData) {
            return res.status(404).json({ success: false, message: "Fabric not found" });
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// ======================================
// Get All Issues — search now looks inside items[]
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
            query.$or = [
                { issuedTo: { $regex: search, $options: "i" } },
                { challanNo: { $regex: search, $options: "i" } },
                { "items.fabricCode": { $regex: search, $options: "i" } },
            ];
        }

        if (fabricId) {
            query["items.fabric"] = fabricId;
        }

        const total = await Issue.countDocuments(query);

        const issues = await Issue.find(query)
            .sort({ createdAt: -1 })
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// ======================================
// Get Single Issue — unchanged
// ======================================

const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ success: false, message: "Issue not found" });
        }

        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    issueFabric,
    returnFabric,
    getAllIssues,
    getIssueById,
};