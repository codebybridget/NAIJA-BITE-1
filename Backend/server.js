// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- Ensure uploads folder exists -------------------
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// ------------------- Connect to MongoDB -------------------
connectDB();

// ------------------- CORS setup -------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: ${origin} not allowed`));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

// Handle preflight requests
app.options("*", cors());

// ------------------- Middleware -------------------
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

// ------------------- Routes -------------------
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// ------------------- Error handling -------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ------------------- HTTP + Socket.IO setup -------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }
      return callback(new Error("Socket.IO CORS not allowed: " + origin));
    },
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    credentials: true,
  },
});

// Export io instance for orderControllers
export { io };

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

// ------------------- Start server -------------------
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
