import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { io } from "../server.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

// ------------------- PLACE ORDER -------------------
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;

    if (!items || !amount || !address || !address.email) {
      return res.status(400).json({
        success: false,
        message: "Missing order data",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false,
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    io.emit("refreshOrders");

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

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: address.email,
      success_url: `${FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error?.raw || error.message || error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment error",
    });
  }
};

// ------------------- VERIFY ORDER -------------------
const verifyOrder = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId",
      });
    }

    if (success === true || success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      io.emit("refreshOrders");

      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      io.emit("refreshOrders");

      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("🔥 Verify Error:", error);
    res.status(500).json({ success: false, message: "Error verifying order" });
  }
};

// ------------------- USER ORDERS -------------------
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("🔥 UserOrders Error:", error);
    res.status(500).json({ success: false });
  }
};

// ------------------- LIST ALL ORDERS -------------------
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("🔥 ListOrders Error:", error);
    res.status(500).json({ success: false });
  }
};

// ------------------- UPDATE STATUS -------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });

    io.emit("refreshOrders");

    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("🔥 UpdateStatus Error:", error);
    res.status(500).json({ success: false });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
};