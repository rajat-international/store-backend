const express = require("express");
const router = express.Router();

const {
  addFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
  exportFabrics,
} = require("../controllers/fabric.controller");

router.post("/", addFabric);

router.get("/", getAllFabrics);

router.get("/export", exportFabrics);

router.get("/:id", getFabricById);

router.put("/:id", updateFabric);

router.delete("/:id", deleteFabric);

module.exports = router;