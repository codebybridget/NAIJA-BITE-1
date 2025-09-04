import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // match what router saves
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Food = mongoose.model('Food', foodSchema);

export default Food;
