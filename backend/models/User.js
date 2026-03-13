const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "superadmin"],
      required: true,
    },

    branch: {
      type: String,
      required: function () {
        return this.role === "student" || this.role === "faculty";
      },
    },

    year: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
    },

    enrollmentNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    isMuted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
