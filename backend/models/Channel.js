const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["branch-year", "subject", "custom"],
      required: true,
    },

    branch: {
      type: String,
    },

    year: {
      type: Number,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isAnnouncementOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);