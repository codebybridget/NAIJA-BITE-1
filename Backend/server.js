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

//  uploads folder exists
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

//  Connect to database
connectDB();

//  CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL, 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 
      if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        console.warn(" Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

// Route imports (with debug logs to find failing one)
console.log(" Loading routers...");

try {
  app.use("/api/food", foodRouter);
  console.log("Loaded foodRouter");
} catch (err) {
  console.error("Failed to load foodRouter:", err);
}

try {
  app.use("/api/user", userRouter);
  console.log(" Loaded userRouter");
} catch (err) {
  console.error("Failed to load userRouter:", err);
}

try {
  app.use("/api/cart", cartRouter);
  console.log(" Loaded cartRouter");
} catch (err) {
  console.error("Failed to load cartRouter:", err);
}

try {
  app.use("/api/orders", orderRouter);
  console.log(" Loaded orderRouter");
} catch (err) {
  console.error(" Failed to load orderRouter:", err);
}

//  File upload test route
app.post("/test-upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error(" Error:", err.message);
  res.status(500).json({ message: err.message });
});

// HTTP + Socket.IO setup
const server = http.createServer(app);
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
    console.log(" Client disconnected:", socket.id);
  });
});

// Export io for use in controllers
export { io };

// Start the server
server.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
