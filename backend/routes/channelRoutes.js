const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createChannel,
  getMyChannels,
  getChannelMembers,
  removeMember,
  muteMember,
  unmuteMember,
} = require("../controllers/channelController");

// 🔹 Get My Channels (All Logged-in Users)
router.get("/my", protect, getMyChannels);
router.get("/:channelId/members", protect, getChannelMembers);
router.delete(
  "/:channelId/remove/:userId",
  protect,
  removeMember
);
router.patch(
  "/:channelId/mute/:userId",
  protect,
  muteMember
);
router.patch(
  "/:channelId/unmute/:userId",
  protect,
  unmuteMember
);

// 🔹 Create Channel (Faculty Only)
router.post("/", protect, authorize("faculty", "superadmin"), createChannel);

module.exports = router;
