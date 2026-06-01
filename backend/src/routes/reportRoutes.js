const express = require("express");
const {
  listReports,
  createReport,
  sendReportByEmail,
} = require("../controllers/reportController");
const { authRequired } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authRequired, listReports);
router.post("/", authRequired, createReport);
router.post("/:id/send-email", authRequired, sendReportByEmail);

module.exports = router;
