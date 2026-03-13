const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const channelRoutes = require("./routes/channelRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { protect, authorize } = require("./middleware/authMiddleware");
const seedBranchYearChannels = require("./utils/seedChannels");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 Make io accessible in controllers
app.set("io", io);

// ================= SOCKET LOGIC =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join channel room
  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`Socket joined channel ${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// ===============================================

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();
seedBranchYearChannels();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/ai", aiRoutes);

// Test Protected Route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

app.get(
  "/api/faculty-only",
  protect,
  authorize("faculty", "superadmin"),
  (req, res) => {
    res.json({
      message: "Faculty or SuperAdmin access granted",
    });
  }
);

app.get("/", (req, res) => {
  res.send("CampusSync Backend Running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
