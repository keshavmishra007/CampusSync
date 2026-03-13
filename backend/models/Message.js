const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // text message (optional for file messages)
    content: {
      type: String,
      default: "",
    },

    // 🔥 file support
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },

    // message category
    messageType: {
      type: String,
      enum: ["normal", "announcement", "assignment", "alert"],
      default: "normal",
    },

    // assignment deadline
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);