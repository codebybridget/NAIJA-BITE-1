import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, verifyOrder, userOrders,listOrders,updateStatus } from "../controllers/orderControllers.js";
import Stripe from "stripe";

const orderRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

// Routes
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list",listOrders)
orderRouter.post("/status",updateStatus)


// Create payment intent
orderRouter.post("/create-payment-intent", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "ngn",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("🔥 Payment Intent Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default orderRouter;
