const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Reel = require('../models/Reel');
const Order = require('../models/Order');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await User.find({ role: 'restaurant' }).select('-password');
    res.json({
        success: true,
        data: restaurants
    });
});

// @desc    Get restaurant by ID (with reels)
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
    console.log(`Fetching restaurant with ID: ${req.params.id}`);
    const restaurant = await User.findById(req.params.id).select('-password');

    if (restaurant && restaurant.role === 'restaurant') {
        // Also fetch reels for this restaurant
        const reels = await Reel.find({ restaurant: req.params.id })
            .sort({ createdAt: -1 });

        console.log(`Found restaurant: ${restaurant.username}`);
        res.json({ 
            success: true, 
            data: { ...restaurant.toObject(), reels } 
        });
    } else {
        console.log(`Restaurant not found or not a restaurant role for ID: ${req.params.id}`);
        res.status(404);
        res.json({
            success: false,
            message: 'Restaurant not found'
        });
    }
});

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private (Restaurant)
const updateRestaurantProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { restaurantName, phone, businessAddress } = req.body;

    if (restaurantName) user.restaurantDetails.restaurantName = restaurantName;
    if (phone) user.restaurantDetails.phone = phone;

    // Merge structured business address fields
    if (businessAddress && typeof businessAddress === 'object') {
        const existing = user.restaurantDetails.businessAddress || {};
        user.restaurantDetails.businessAddress = {
            ...existing,
            ...businessAddress
        };
    }

    const updatedUser = await user.save();
    
    res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            restaurantDetails: updatedUser.restaurantDetails,
            profilePicture: updatedUser.profilePicture
        }
    });
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
        success: true,
        data: {
            totalReels,
            totalOrders,
            completedOrders,
            totalEarnings
        }
    });
});

module.exports = {
    getRestaurants,
    getRestaurantById,
    updateRestaurantProfile,
    getDashboardStats
};
