const mongoose = require("mongoose");

const issueItemSchema = new mongoose.Schema(
    {
        fabric: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fabric",
            required: true,
        },
        fabricCode: {
            type: String,
            required: true,
            trim: true,
        },
        construction: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            required: true,
            trim: true,
        },
        issuedQuantity: {
            type: Number,
            required: true,
            min: 0.01, // allows fractional meters like 2.5
        },
    },
    { _id: false }
);

const issueSchema = new mongoose.Schema(
    {
        challanNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        issuedTo: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        items: {
            type: [issueItemSchema],
            required: true,
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "At least one fabric item is required",
            },
        },
    },
    { timestamps: true }
);

// Indexes
issueSchema.index({ issuedTo: 1 });
issueSchema.index({ "items.fabric": 1 });
issueSchema.index({ "items.fabricCode": 1 });

module.exports = mongoose.model("Issue", issueSchema);