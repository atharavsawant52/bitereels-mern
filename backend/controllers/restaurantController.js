const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Reel = require('../models/Reel');
const Order = require('../models/Order');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await User.find({ role: 'restaurant' }).select('-password');
    res.json(restaurants);
});

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await User.findById(req.params.id).select('-password');

    if (restaurant && restaurant.role === 'restaurant') {
        res.json(restaurant);
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private (Restaurant)
const updateRestaurantProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { restaurantName, address, phone } = req.body;
        
        user.restaurantDetails.restaurantName = restaurantName || user.restaurantDetails.restaurantName;
        user.restaurantDetails.address = address || user.restaurantDetails.address;
        user.restaurantDetails.phone = phone || user.restaurantDetails.phone;

        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            restaurantDetails: updatedUser.restaurantDetails,
            token: req.headers.authorization.split(' ')[1] // Return generic or regenerate if needed, usually just user info is enough
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get dashboard stats
// @route   GET /api/restaurants/stats
// @access  Private (Restaurant)
const getDashboardStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'restaurant') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const restaurantId = req.user._id;

    // Total Reels
    const totalReels = await Reel.countDocuments({ restaurant: restaurantId });

    // Orders Stats
    const totalOrders = await Order.countDocuments({ restaurant: restaurantId });
    const completedOrders = await Order.countDocuments({ restaurant: restaurantId, status: 'completed' });
    
    // Earnings calculation
    const orders = await Order.find({ restaurant: restaurantId, status: 'completed' });
    const totalEarnings = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.json({
        totalReels,
        totalOrders,
        completedOrders,
        totalEarnings
    });
});

module.exports = {
    getRestaurants,
    getRestaurantById,
    updateRestaurantProfile,
    getDashboardStats
};
