const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const config = require("./config/env");
const { pingDatabase } = require("./config/db");
const profileRoutes = require("./routes/profile.routes");
const asyncHandler = require("./utils/asyncHandler");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(",").map((origin) => origin.trim())
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitHub Profile Analyzer API",
    endpoints: {
      health: "GET /health",
      analyzeProfile: "POST /api/profiles/analyze",
      analyzeProfileByPath: "POST /api/profiles/:username/analyze",
      listProfiles: "GET /api/profiles",
      getProfile: "GET /api/profiles/:username"
    }
  });
});

app.get(
  "/health",
  asyncHandler(async (req, res) => {
    await pingDatabase();
    res.status(200).json({
      success: true,
      status: "ok",
      database: "connected"
    });
  })
);

app.use("/api/profiles", profileRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
