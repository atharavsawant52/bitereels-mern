const FoodItem = require('../models/FoodItem');
const User = require('../models/User');

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private (Restaurant)
const createFoodItem = async (req, res) => {
    try {
        const { name, price, description, category, images } = req.body;

        const foodItem = await FoodItem.create({
            name,
            price,
            description,
            category,
            images,
            restaurant: req.user._id
        });

        // Add to restaurant's menu
        await User.findByIdAndUpdate(req.user._id, {
            $push: { 'restaurantDetails.menu': foodItem._id }
        });

        res.status(201).json(foodItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all food items for the logged-in restaurant
// @route   GET /api/foods/my
// @access  Private (Restaurant)
const getMyFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem.find({ restaurant: req.user._id });
        res.json(foodItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private (Restaurant)
const updateFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        // Check ownership
        if (foodItem.restaurant.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedFoodItem = await FoodItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedFoodItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private (Restaurant)
const deleteFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        // Check ownership
        if (foodItem.restaurant.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await foodItem.deleteOne();

        // Remove from restaurant's menu
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { 'restaurantDetails.menu': foodItem._id }
        });

        res.json({ message: 'Food item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFoodItem,
    getMyFoodItems,
    updateFoodItem,
    deleteFoodItem
};
