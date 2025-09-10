// backend/routes/foodRouter.js
import express from 'express';
import Food from '../models/Food.js';
import upload from '../middleware/uploadMiddleware.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Ensure uploads folder exists
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log('📁 Created uploads folder');
}

// Serve uploaded images
router.use('/uploads', express.static(uploadsPath));

// Get backend URL from env
const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';

// Add a new food item
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'Price must be a valid number' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // Use full URL for the image
    const imagePath = `${backendURL}/uploads/${req.file.filename}`;

    const food = new Food({
      name,
      description,
      price: Number(price),
      category,
      image: imagePath,
    });

    await food.save();

    res.status(201).json({ success: true, message: 'Food added successfully', food });
  } catch (error) {
    console.error('🔥 Error adding food:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all food items
router.get('/list', async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json({ success: true, foods });
  } catch (error) {
    console.error('🔥 Error fetching foods:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a food item
router.post('/remove', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    const food = await Food.findById(id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    // Remove image file
    const filePath = path.join(process.cwd(), 'uploads', path.basename(food.image));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Food.findByIdAndDelete(id);

    res.json({ success: true, message: 'Food removed successfully' });
  } catch (error) {
    console.error('🔥 Error removing food:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
