const asyncHandler = require('express-async-handler');
const Reel = require('../models/Reel');
const path = require('path');

// @desc    Create a new reel
// @route   POST /api/reels
// @access  Private/Restaurant
const createReel = asyncHandler(async (req, res) => {
    try {
        const { title, description, price, foodItemId } = req.body;
        
        // Ensure user is a restaurant
        if (req.user.role !== 'restaurant') {
             res.status(403);
             throw new Error('Only restaurants can upload reels');
        }

        let videoUrl = '';
        if (req.file) {
            videoUrl = `/uploads/${req.file.filename}`;
        }

        const reel = new Reel({
            videoUrl,
            title,
            description, // Using description instead of caption as per requirement, or mapping caption to description
            price,
            restaurant: req.user._id,
            foodItem: foodItemId,
            createdBy: req.user._id
        });

        const createdReel = await reel.save();
        res.status(201).json(createdReel);
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
        .populate('foodItem', 'name price category')
        .sort({ createdAt: -1 }); // Newest first
    res.json(reels);
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
        res.json(reel.likes);
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

        res.status(201).json(newComment);
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
        res.json(reel.comments);
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
    res.json(reels);
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
        res.json({ message: 'Reel removed' });
    } else {
        res.status(404);
        throw new Error('Reel not found');
    }
});

module.exports = {
    createReel,
    getReels,
    likeReel,
    addComment,
    getComments,
    getRestaurantReels,
    deleteReel
};
