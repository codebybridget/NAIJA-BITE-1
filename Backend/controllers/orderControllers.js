import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { io } from '../server.js'; // ✅ import socket instance

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

// ------------------- PLACE ORDER -------------------
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;
    if (!items || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing order data" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newOrder = new orderModel({ userId, items, amount, address, payment: false });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    // Notify all connected clients
    io.emit('refreshOrders');

    const line_items = items.map((item) => ({
      price_data: {
        currency: "ngn",
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "ngn",
        product_data: { name: "Delivery Fee" },
        unit_amount: 1500 * 100,
      },
      quantity: 1,
    });

   const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items,
  mode: "payment",
  success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
  cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
});


    res.json({ success: true, session_url: session.url, orderId: newOrder._id });
  } catch (error) {
    console.error("🔥 Place Order Error:", error);
    res.status(500).json({ success: false, message: "Payment error" });
  }
};

// ------------------- VERIFY ORDER -------------------
const verifyOrder = async (req, res) => {
  try {
    const { orderId, success } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Missing orderId" });

    if (success === true || success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // Notify clients
      io.emit('refreshOrders');

      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);

      // Notify clients
      io.emit('refreshOrders');

      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("🔥 Verify Order Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ------------------- USER ORDERS -------------------
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("🔥 UserOrders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ------------------- LIST ALL ORDERS (ADMIN) -------------------
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("🔥 ListOrders Error:", error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ------------------- UPDATE ORDER STATUS -------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ success: false, message: "Missing data" });

    await orderModel.findByIdAndUpdate(orderId, { status });

    // Notify all connected clients
    io.emit('refreshOrders');

    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("🔥 UpdateStatus Error:", error);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
