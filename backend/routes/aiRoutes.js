const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { chatWithCampusAI } = require("../controllers/aiController");
const upload = require("../middleware/cloudUpload");

const router = express.Router();

router.post("/chat", protect, upload.single("file"), chatWithCampusAI);

module.exports = router;
