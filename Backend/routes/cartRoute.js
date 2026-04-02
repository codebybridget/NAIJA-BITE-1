import express from "express";
import authMiddleware from "../middleware/auth.js";

import {
  placeOrder,
  verifyOrder,
  userOrders,
  updateStatus,
  listOrders
} from "../controllers/orderControllers.js";

const orderRouter = express.Router();

// ------------------- USER -------------------
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// ------------------- ADMIN -------------------
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

export default orderRouter;