const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const upload = require("../middleware/cloudUpload");

// 🔹 GET Messages of Channel
router.get("/:channelId", protect, getMessages);

// 🔹 SEND Message
router.post("/", protect, upload.single("file"), sendMessage);

module.exports = router;