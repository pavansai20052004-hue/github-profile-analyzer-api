require("dotenv").config();

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv("PORT", 3000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  githubToken: process.env.GITHUB_TOKEN || "",
  analysisMaxRepos: numberFromEnv("ANALYSIS_MAX_REPOS", 300),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: numberFromEnv("DB_PORT", 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "github_profile_analyzer"
  }
};

module.exports = config;
