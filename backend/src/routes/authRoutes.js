const express = require("express");
const rateLimit = require("express-rate-limit");
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

const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Aguarde alguns minutos." },
});

const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Aguarde alguns minutos." },
});

router.post("/register", authenticationLimiter, register);
router.post("/login", authenticationLimiter, login);
router.post("/verify", codeLimiter, verify);

router.post("/forgot-password", codeLimiter, forgotPassword);
router.post("/reset-password", codeLimiter, resetPassword);

router.get("/me", authRequired, me);

module.exports = router;
