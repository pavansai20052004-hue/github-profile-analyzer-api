const Joi = require("joi");
const asyncHandler = require("../utils/asyncHandler");
const profileService = require("../services/profile.service");

const usernameSchema = Joi.string()
  .trim()
  .min(1)
  .max(39)
  .pattern(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/)
  .required()
  .messages({
    "string.pattern.base": "username must be a valid GitHub username"
  });

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid("analyzedAt", "followers", "publicRepos", "totalStars", "username").default("analyzedAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().allow("").default("")
});

function validateUsername(value) {
  const { value: username, error } = usernameSchema.validate(value);

  if (error) {
    throw error;
  }

  return username;
}

const analyzeProfile = asyncHandler(async (req, res) => {
  const username = validateUsername(req.params.username || req.body.username);
  const profile = await profileService.analyzeAndStoreProfile(username);

  res.status(200).json({
    success: true,
    message: "GitHub profile analyzed and stored successfully",
    data: profile
  });
});

const listProfiles = asyncHandler(async (req, res) => {
  const { value, error } = listQuerySchema.validate(req.query);

  if (error) {
    throw error;
  }

  const result = await profileService.listProfiles(value);

  res.status(200).json({
    success: true,
    ...result
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const username = validateUsername(req.params.username);
  const profile = await profileService.getStoredProfile(username);

  res.status(200).json({
    success: true,
    data: profile
  });
});

module.exports = {
  analyzeProfile,
  listProfiles,
  getProfile
};
