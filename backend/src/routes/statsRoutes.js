const express = require("express");
const { getStats } = require("../controllers/statsController");
const { authRequired } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authRequired, getStats);

module.exports = router;
