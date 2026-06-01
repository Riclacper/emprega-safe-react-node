const express = require("express");
const {
  login,
  register,
  verify,
  me,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authRequired } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verify);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authRequired, me);

module.exports = router;
