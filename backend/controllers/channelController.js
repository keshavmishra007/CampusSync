const Channel = require("../models/Channel");
const User = require("../models/User");

// 🔹 Get My Channels
exports.getMyChannels = async (req, res) => {
  try {
    const user = req.user;

    console.log("ROLE:", user.role);
    console.log("BRANCH:", user.branch);
    console.log("YEAR:", user.year);

    let channels;

    if (user.role === "student") {
      channels = await Channel.find({
        $or: [
          { branch: user.branch, year: user.year, type: "branch-year" },
          { branch: user.branch, type: "subject" },
          { members: user._id }
        ]
      }).sort({ year: 1 });
    }

    if (user.role === "faculty") {
      channels = await Channel.find({
        $or: [
          { branch: user.branch, type: "branch-year" },
          { branch: user.branch, type: "subject" },
          { members: user._id }
        ]
      }).sort({ year: 1 });
    }

    res.json(channels);

  } catch (error) {
    console.error("Get channels error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ======================
// GET CHANNEL MEMBERS
// ======================
exports.getChannelMembers = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId)
      .populate("members", "name email role branch year isMuted");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel.members);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// REMOVE MEMBER (Faculty Only)
// ======================
exports.removeMember = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Only faculty or superadmin allowed
    if (!["faculty", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only faculty can remove members",
      });
    }

    const userToRemove = await User.findById(userId);
    if (!userToRemove) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent removing faculty
    if (userToRemove.role === "faculty") {
      return res.status(403).json({
        message: "Cannot remove another faculty",
      });
    }

    await Channel.updateOne(
      { _id: channelId },
      { $pull: { members: userId } }
    );

    res.status(200).json({
      message: "Member removed successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🔹 Create Channel (Faculty Only)
exports.createChannel = async (req, res) => {
  try {
    const { name, type, branch, year } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Channel name and type are required",
      });
    }

    if (!["subject", "custom"].includes(type)) {
      return res.status(400).json({
        message: "Invalid channel type",
      });
    }

    // Prevent duplicate channel
    const existing = await Channel.findOne({ name, type });
    if (existing) {
      return res.status(400).json({
        message: "Channel already exists",
      });
    }

    const channel = await Channel.create({
      name,
      type,
      branch,
      year: type === "custom" ? year : null,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    // Auto add students for subject and custom channels so they are visible immediately.
    if ((type === "subject" || type === "custom") && branch) {
      const studentQuery = {
        role: "student",
        branch,
      };

      if (type === "custom" && year) {
        studentQuery.year = year;
      }

      const students = await User.find(studentQuery);

      const studentIds = students.map((student) => student._id);

      await Channel.updateOne(
        { _id: channel._id },
        { $addToSet: { members: { $each: studentIds } } }
      );
    }

    res.status(201).json(channel);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================
// MUTE MEMBER (Faculty Only)
// ======================
exports.muteMember = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!["faculty", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only faculty can mute students",
      });
    }

    const userToMute = await User.findById(userId);
    if (!userToMute) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToMute.role !== "student") {
      return res.status(403).json({
        message: "Only students can be muted",
      });
    }

    await User.updateOne({ _id: userId }, { $set: { isMuted: true } });

    res.status(200).json({
      message: "Student muted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// UNMUTE MEMBER (Faculty Only)
// ======================
exports.unmuteMember = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!["faculty", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only faculty can unmute students",
      });
    }

    const userToUnmute = await User.findById(userId);
    if (!userToUnmute) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToUnmute.role !== "student") {
      return res.status(403).json({
        message: "Only students can be unmuted",
      });
    }

    await User.updateOne({ _id: userId }, { $set: { isMuted: false } });

    res.status(200).json({
      message: "Student unmuted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
