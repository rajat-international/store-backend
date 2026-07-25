const express = require("express");

const router = express.Router();

const {
  getAllHistory,
  getHistoryById,
} = require("../controllers/history.controller");

router.get("/", getAllHistory);

router.get("/:id", getHistoryById);

module.exports = router;