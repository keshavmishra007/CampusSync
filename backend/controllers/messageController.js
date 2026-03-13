const Message = require("../models/Message");
const Channel = require("../models/Channel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// =========================
// 🔹 Get Messages
// =========================
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    const messages = await Message.find({ channel: channelId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { channelId, content, messageType, deadline } = req.body;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    if (req.user.role === "student" && req.user.isMuted) {
      return res.status(403).json({
        message: "You are muted by faculty and cannot send messages right now.",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // ✅ Membership validation
    const isMember = channel.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role === "student") {
      return res.status(403).json({
        message: "You are not a member of this channel",
      });
    }

    // ✅ Message type validation
    const allowedTypes = ["normal", "announcement", "assignment", "alert"];
    const finalType = messageType || "normal";

    if (!allowedTypes.includes(finalType)) {
      return res.status(400).json({ message: "Invalid message type" });
    }

    if (
      ["announcement", "assignment", "alert"].includes(finalType) &&
      !["faculty", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        message: "Only faculty can send this type of message",
      });
    }

    if (finalType === "assignment" && !deadline) {
      return res.status(400).json({
        message: "Assignment must have a deadline",
      });
    }

    // =========================
    // 🔥 CLOUDINARY UPLOAD
    // =========================
    let uploadedFileUrl = null;
    let fileName = null;
    let fileType = null;

    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "campusSync_uploads",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                return reject(error);
              }
              resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        uploadedFileUrl = uploadResult.secure_url;
        fileName = req.file.originalname;
        fileType = req.file.mimetype;

      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        return res.status(500).json({
          message: "File upload failed",
        });
      }
    }

    // =========================
    // CREATE MESSAGE
    // =========================
    const message = await Message.create({
      sender: req.user._id,
      channel: channelId,
      content: content || "",
      messageType: finalType,
      deadline: finalType === "assignment" ? deadline : null,
      fileUrl: uploadedFileUrl,
      fileName,
      fileType,
    });

    const populatedMessage = await message.populate(
      "sender",
      "name role"
    );

    // =========================
    // SOCKET EMIT
    // =========================
    const io = req.app.get("io");
    io.to(channelId).emit("receiveMessage", populatedMessage);

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
