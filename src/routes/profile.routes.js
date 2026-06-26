const express = require("express");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", profileController.listProfiles);
router.post("/analyze", profileController.analyzeProfile);
router.post("/:username/analyze", profileController.analyzeProfile);
router.get("/:username", profileController.getProfile);

module.exports = router;
