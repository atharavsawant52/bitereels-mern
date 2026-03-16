const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build standard user response
// ─────────────────────────────────────────────────────────────────────────────
const buildUserResponse = (user, token) => ({
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses,
    defaultAddress: user.defaultAddress,
    restaurantDetails: user.restaurantDetails,
    profilePicture: user.profilePicture,
    followers: user.followers,
    following: user.following,
    savedReels: user.savedReels,
    token
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, name, email, password, role, restaurantDetails } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email or username already exists');
    }

    // Restaurant validation — require structured businessAddress
    if (role === 'restaurant') {
        if (!restaurantDetails?.restaurantName || !restaurantDetails?.phone) {
            res.status(400);
            throw new Error('Restaurant name and phone are required for restaurant accounts');
        }
        // businessAddress validation
        const ba = restaurantDetails?.businessAddress;
        if (!ba || !ba.street || !ba.city || !ba.state || !ba.postalCode) {
            res.status(400);
            throw new Error('Restaurant business address (street, city, state, postalCode) is required');
        }
    }

    const userData = {
        username,
        name: name || username,
        email,
        password,
        role: role || 'user',
        // Regular users add delivery addresses from their profile after signup
        addresses: [],
        defaultAddress: null
    };

    if (role === 'restaurant') {
        userData.restaurantDetails = {
            restaurantName: restaurantDetails.restaurantName,
            phone: restaurantDetails.phone,
            businessAddress: restaurantDetails.businessAddress,
            restaurantStatus: 'open',
            deliverySettings: {
                isDeliveryPaused: false,
                updatedAt: null,
                note: 'Online delivery is active. Customers can add your reels to cart.'
            }
        };
    }

    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            success: true,
            data: buildUserResponse(user, generateToken(user._id))
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
            success: true,
            data: buildUserResponse(user, generateToken(user._id)),
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ 
        success: true,
        message: 'Logged out successfully' 
    });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            success: true,
            data: buildUserResponse(user, req.headers.authorization?.split(' ')[1])
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
