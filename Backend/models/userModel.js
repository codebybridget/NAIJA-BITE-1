import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    cartData: {
      type: Map,
      of: Number,   // key = itemId, value = quantity
      default: {},
    },
  },
  { 
    minimize: false,
    timestamps: true 
  }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
