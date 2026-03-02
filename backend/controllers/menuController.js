const asyncHandler = require('express-async-handler');
const Menu = require('../models/Menu');
const User = require('../models/User');

// @desc    Add a new menu item
// @route   POST /api/menu
// @access  Private (Restaurant)
const addMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
        res.status(400);
        throw new Error('Please provide name and price');
    }

    const menuItem = await Menu.create({
        restaurant: req.user._id,
        name,
        description,
        price,
        category
    });

    // Update user's menu array
    await User.findByIdAndUpdate(req.user._id, {
        $push: { 'restaurantDetails.menu': menuItem._id }
    });

    res.status(201).json({
        success: true,
        data: menuItem
    });
});

// @desc    Get all menu items for a specific restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
const getRestaurantMenu = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    const menuItems = await Menu.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: menuItems
    });
});

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Restaurant)
const updateMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    // Check ownership
    if (menuItem.restaurant.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this item');
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: updatedMenuItem
    });
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant)
const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    // Check ownership
    if (menuItem.restaurant.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this item');
    }

    await menuItem.deleteOne();

    // Remove from user's menu array
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { 'restaurantDetails.menu': req.params.id }
    });

    res.json({
        success: true,
        message: 'Menu item removed'
    });
});

module.exports = {
    addMenuItem,
    getRestaurantMenu,
    updateMenuItem,
    deleteMenuItem
};
