import Food from '../models/Food.js';

// Add Food
export const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ success: false, message: 'Name, description, and price are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newFood = new Food({
      name,
      description,
      price: Number(price),
      category,
      image: imageUrl,
    });

    await newFood.save();
    res.status(201).json({ success: true, data: newFood });
  } catch (error) {
    console.error('🔥 Error adding food:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List Foods
export const listFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error('🔥 Error listing foods:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single Food by ID
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    console.error('🔥 Error fetching food:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Food
export const removeFood = async (req, res) => {
  try {
    const { id } = req.body;
    const deleted = await Food.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, message: 'Food removed successfully' });
  } catch (error) {
    console.error('🔥 Error removing food:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
