const express = require("express");
const { listAnalyses, createAnalysis, getAnalysis } = require("../controllers/analysisController");
const { authRequired } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authRequired, listAnalyses);
router.post("/", authRequired, createAnalysis);
router.get("/:externalId", authRequired, getAnalysis);

module.exports = router;
