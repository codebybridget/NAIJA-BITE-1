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
import upload from "./middleware/uploadMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// Connect to database
connectDB();

// ✅ Flexible CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
 "https://naija-bite-1admin.onrender.com",
 "https://naija-bite-1frontend-a5mq.onrender.com",
  process.env.FRONTEND_URL, // live frontend URL from .env
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadsPath)); // Serve uploaded files

// API routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// Test file upload
app.post("/test-upload", upload.single("image"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ message: err.message });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO with flexible CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.IO CORS: " + origin));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// export io so controllers can use it
export { io };

// Start server
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
