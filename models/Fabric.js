const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema({
  fabricCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  construction: {
    type: String,
    required: true,
    trim: true,
  },

  composition: [{
    material: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
  }, ],

  gsm: {
    type: Number,
    required: true,
    min: 1,
  },

  color: {
    type: String,
    required: true,
    trim: true,
  },

  supplier: {
    type: String,
    required: true,
    trim: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 0,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  unit: {
    type: String,
    enum: ["Meter", "KG"],
    required: true,
  },

  rackNumber: {
    type: String,
    required: true,
    trim: true,
  },

  lowStockLimit: {
    type: Number,
    default: 100,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes
fabricSchema.index({
  fabricCode: 1
});
fabricSchema.index({
  color: 1
});
fabricSchema.index({
  supplier: 1
});
fabricSchema.index({
  rackNumber: 1
});

module.exports = mongoose.model("Fabric", fabricSchema);