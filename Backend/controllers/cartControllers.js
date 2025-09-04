import userModel from "../models/userModel.js";

// 🔹 Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    let user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    const currentQty = user.cartData.get(itemId) || 0;
    user.cartData.set(itemId, currentQty + 1);

    await user.save();

    res.json({
      success: true,
      message: "Added to cart",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// 🔹 Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    let user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    const currentQty = user.cartData.get(itemId) || 0;
    if (currentQty > 1) {
      user.cartData.set(itemId, currentQty - 1);
    } else {
      user.cartData.delete(itemId);
    }

    await user.save();

    res.json({
      success: true,
      message: "Removed from cart",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// 🔹 Get cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    res.json({
      success: true,
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
