const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
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

    issuedTo: {
      type: String,
      required: true,
      trim: true,
    },

    issuedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
issueSchema.index({ fabricCode: 1 });
issueSchema.index({ issuedTo: 1 });
issueSchema.index({ status: 1 });

module.exports = mongoose.model("Issue", issueSchema);