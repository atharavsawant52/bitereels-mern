const asyncHandler = require('express-async-handler');
const Reel = require('../models/Reel');
const path = require('path');

// @desc    Create a new reel
// @route   POST /api/reels
// @access  Private/Restaurant
const createReel = asyncHandler(async (req, res) => {
    try {
        const { title, description, price } = req.body;
        
        // Ensure user is a restaurant
        if (req.user.role !== 'restaurant') {
             res.status(403);
             throw new Error('Only restaurants can upload reels');
        }

        if (!price) {
            res.status(400);
            throw new Error('Price is required for the reel');
        }

        let videoUrl = '';
        if (req.file) {
            videoUrl = `/uploads/${req.file.filename}`;
        }

        const reel = new Reel({
            videoUrl,
            title,
            description,
            price,
            restaurant: req.user._id,
            createdBy: req.user._id
        });

        const createdReel = await reel.save();
        res.status(201).json({
            success: true,
            data: createdReel
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Get all reels (Feed) - pagination could be added here
// @route   GET /api/reels
// @access  Public
const getReels = asyncHandler(async (req, res) => {
    const reels = await Reel.find({})
        .populate('restaurant', 'username restaurantDetails profilePicture')
        .sort({ createdAt: -1 }); // Newest first
    res.json({
        success: true,
        data: reels
    });
});

// @desc    Like/Unlike a reel
// @route   PUT /api/reels/:id/like
// @access  Private
const likeReel = asyncHandler(async (req, res) => {
    const reel = await Reel.findById(req.params.id);

    if (reel) {
        if (reel.likes.includes(req.user._id)) {
            // Unlike
            reel.likes = reel.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            reel.likes.push(req.user._id);
        }
        await reel.save();
        res.json({
            success: true,
            data: reel.likes
        });
    } else {
        res.status(404);
        throw new Error('Reel not found');
    }
});

// @desc    Add a comment to a reel
// @route   POST /api/reels/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const reel = await Reel.findById(req.params.id);

    if (reel) {
        const comment = {
            user: req.user._id,
            text,
            createdAt: Date.now()
        };

        reel.comments.push(comment);
        await reel.save();

        // Populate user info for the new comment to return it
        const updatedReel = await Reel.findById(req.params.id).populate('comments.user', 'username profilePicture');
        const newComment = updatedReel.comments[updatedReel.comments.length - 1];

        res.status(201).json({
            success: true,
            data: newComment
        });
    } else {
        res.status(404);
        throw new Error('Reel not found');
    }
});

// @desc    Get comments for a reel
// @route   GET /api/reels/:id/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
    const reel = await Reel.findById(req.params.id).populate('comments.user', 'username profilePicture');

    if (reel) {
        res.json({
            success: true,
            data: reel.comments
        });
    } else {
        res.status(404);
        throw new Error('Reel not found');
    }
});

// @desc    Get reels for the logged-in restaurant
// @route   GET /api/reels/restaurant/my-reels
// @access  Private (Restaurant)
const getRestaurantReels = asyncHandler(async (req, res) => {
    if (req.user.role !== 'restaurant') {
        res.status(403);
        throw new Error('Not authorized');
    }
    const reels = await Reel.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: reels
    });
});

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private (Restaurant)
const deleteReel = asyncHandler(async (req, res) => {
    const reel = await Reel.findById(req.params.id);

    if (reel) {
        if (reel.restaurant.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this reel');
        }

        // Ideally delete video file from filesystem here
        // const fs = require('fs');
        // if (reel.videoUrl) fs.unlink(...)

        await reel.deleteOne();
        res.json({
            success: true,
            message: 'Reel removed'
        });
    } else {
        res.status(404);
        throw new Error('Reel not found');
    }
});

// @desc    Search reels by food name and/or geo location
// @route   GET /api/reels/search?food=biryani&lat=18.52&lng=73.86&radius=10
//          Falls back to city/area text match when lat/lng not provided.
// @access  Public
const searchReels = asyncHandler(async (req, res) => {
    const { food, lat, lng, radius, location } = req.query;

    if (!food && !lat && !lng && !location) {
        return res.json({
            success: true,
            data: []
        });
    }

    const User = require('../models/User');
    let restaurantIds = null; // null = no geo filter, [] = no results

    // ── Geo filter (when lat/lng provided) ──────────────────────────────────
    if (lat && lng) {
        const radiusKm = parseFloat(radius) || 10; // default 10 km
        const radiusInRadians = radiusKm / 6371;   // Earth radius = 6371 km

        const nearbyRestaurants = await User.find({
            role: 'restaurant',
            'restaurantDetails.businessAddress.location': {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(lng), parseFloat(lat)],
                        radiusInRadians
                    ]
                }
            }
        }).select('_id');

        restaurantIds = nearbyRestaurants.map(r => r._id);

        // No restaurants in radius → no results
        if (restaurantIds.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
    }

    // ── Build reel query ────────────────────────────────────────────────────
    let reelQuery = {};

    if (food && food.trim()) {
        reelQuery.title = { $regex: food.trim(), $options: 'i' };
    }

    if (restaurantIds !== null) {
        reelQuery.restaurant = { $in: restaurantIds };
    }

    let reels = await Reel.find(reelQuery)
        .populate('restaurant', 'username restaurantDetails profilePicture')
        .sort({ createdAt: -1 });

    // ── Text fallback: filter by city/area string when no lat/lng ───────────
    if (!lat && !lng && location && location.trim()) {
        const locationLower = location.trim().toLowerCase();
        reels = reels.filter(reel => {
            const ba = reel.restaurant?.restaurantDetails?.businessAddress;
            const searchStr = [
                ba?.city || '',
                ba?.area || '',
                ba?.state || ''
            ].join(' ').toLowerCase();
            return searchStr.includes(locationLower);
        });
    }

    res.json({
        success: true,
        data: reels
    });
});

module.exports = {
    createReel,
    getReels,
    likeReel,
    addComment,
    getComments,
    getRestaurantReels,
    deleteReel,
    searchReels
};
