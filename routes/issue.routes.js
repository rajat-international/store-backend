const express = require("express");

const router = express.Router();

const {
  issueFabric,
  returnFabric,
  getAllIssues,
  getIssueById,
} = require("../controllers/issue.controller");

router.post("/", issueFabric);

router.post("/return", returnFabric);

router.get("/", getAllIssues);

router.get("/:id", getIssueById);

module.exports = router;