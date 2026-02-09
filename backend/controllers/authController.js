const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role, restaurantDetails } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email or username already exists');
    }

    // specific validation for restaurant
    if (role === 'restaurant') {
        if (!restaurantDetails || !restaurantDetails.restaurantName || !restaurantDetails.address || !restaurantDetails.phone) {
            res.status(400);
            throw new Error('Restaurant name, address and phone are required for restaurant accounts');
        }
    }

    const user = await User.create({
        username,
        email,
        password,
        role: role || 'user',
        restaurantDetails: role === 'restaurant' ? restaurantDetails : undefined
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            restaurantDetails: user.restaurantDetails,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            restaurantDetails: user.restaurantDetails,
            token: generateToken(user._id),
            message: "Login successful"
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile
};
