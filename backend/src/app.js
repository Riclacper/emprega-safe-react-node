const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statsRoutes = require("./routes/statsRoutes");
const { health } = require("./controllers/healthController");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS);

if (Number.isInteger(trustProxyHops) && trustProxyHops >= 1) {
  app.set("trust proxy", trustProxyHops);
}

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", health);
app.get("/api/health", health);
app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
