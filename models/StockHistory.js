const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    fabric: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fabric",
      required: true,
    },

    fabricCode: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["ADD", "UPDATE", "ISSUE", "RETURN"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    oldStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    merchant: {
      type: String,
      default: "",
    },
    challanNo: {
  type: String,
  default: "",
},

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);