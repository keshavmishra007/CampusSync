const User = require("../models/User");
const Channel = require("../models/Channel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, branch, year, enrollmentNumber } =
      req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      branch,
      year,
      enrollmentNumber,
    });

    // =========================
    // STUDENT AUTO-JOIN
    // =========================
    if (user.role === "student") {
      const channel = await Channel.findOne({
        type: "branch-year",
        branch: user.branch,
        year: user.year,
      });

      if (channel) {
        await Channel.updateOne(
          { _id: channel._id },
          { $addToSet: { members: user._id } }
        );
      }
    }

    // =========================
    // FACULTY AUTO-JOIN ALL YEARS
    // =========================
    if (user.role === "faculty") {
      const branchChannels = await Channel.find({
        type: "branch-year",
        branch: user.branch,
      });

      for (let channel of branchChannels) {
        await Channel.updateOne(
          { _id: channel._id },
          { $addToSet: { members: user._id } }
        );
      }
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      enrollmentNumber: user.enrollmentNumber,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// GET CURRENT USER
// ======================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
