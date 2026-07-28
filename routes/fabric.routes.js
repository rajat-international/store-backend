const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
  exportFabrics,
} = require("../controllers/fabric.controller");

router.post("/",upload.single("image"), addFabric);

router.get("/", getAllFabrics);

router.get("/export", exportFabrics);

router.get("/:id", getFabricById);

router.put("/:id", upload.single("image"), updateFabric);

router.delete("/:id", deleteFabric);

module.exports = router;