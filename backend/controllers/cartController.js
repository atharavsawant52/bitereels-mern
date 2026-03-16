const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.restaurant', 'username restaurantDetails profilePicture')
        .populate({
            path: 'items.foodItem',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        })
        .populate({
            path: 'items.reel',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        const { foodItemId, reelId, quantity } = req.body;
        
        if (!foodItemId && !reelId) {
            res.status(400);
            return next(new Error('Food Item ID or Reel ID is required'));
        }

        let price = 0;
        let itemRef = {};
        let restaurantId = null;
 
        if (foodItemId) {
            const foodItem = await FoodItem.findById(foodItemId);
            if (!foodItem) {
                res.status(404);
                return next(new Error('Food Item not found'));
            }
            price = foodItem.price;
            restaurantId = foodItem.restaurant;
            itemRef = { foodItem: foodItemId };
        } else if (reelId) {
            const Reel = require('../models/Reel');
            const reel = await Reel.findById(reelId);
            if (!reel) {
                res.status(404);
                return next(new Error('Reel not found'));
            }
            price = reel.price;
            restaurantId = reel.restaurant;
            itemRef = { reel: reelId };
        }

        if (restaurantId) {
            const restaurant = await User.findById(restaurantId).select('restaurantDetails.deliverySettings restaurantDetails.restaurantStatus');
            if (restaurant?.restaurantDetails?.restaurantStatus === 'closed') {
                res.status(409);
                return next(new Error('Online delivery is currently paused for this restaurant.'));
            }
            if (restaurant?.restaurantDetails?.deliverySettings?.isDeliveryPaused) {
                res.status(409);
                return next(new Error('This restaurant has paused online delivery. Add to cart is temporarily unavailable.'));
            }
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Check if item already exists based on either foodItemId or reelId
        const itemIndex = cart.items.findIndex(p => {
            if (foodItemId && p.foodItem) return p.foodItem.toString() === foodItemId;
            if (reelId && p.reel) return p.reel.toString() === reelId;
            return false;
        });

        if (itemIndex > -1) {
            // Product exists in the cart, update the quantity
            cart.items[itemIndex].quantity += Number(quantity || 1);
        } else {
            // Product does not exist in cart, add new item
            cart.items.push({
                ...itemRef,
                restaurant: restaurantId,
                quantity: Number(quantity || 1),
                price: price
            });
        }

        await cart.save();
        
        // Repopulate to return full object
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.restaurant', 'username restaurantDetails profilePicture')
            .populate({
                path: 'items.foodItem',
                populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
            })
            .populate({
                path: 'items.reel',
                populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
            });
        
        // Final check before return: ensure all items have restaurant field if populated from Reel/FoodItem
        // This handles older items that were in the cart but lacked the field
        let needsSave = false;
        for (let item of updatedCart.items) {
            if (!item.restaurant) {
                const rId = item.foodItem?.restaurant?._id || item.foodItem?.restaurant || 
                            item.reel?.restaurant?._id || item.reel?.restaurant;
                if (rId) {
                    item.restaurant = rId;
                    needsSave = true;
                }
            }
        }
        if (needsSave) {
            // We use markModified because it's a subdocument change
            // But wait, updatedCart is a lean object or a full doc?
            // Actually Cart.findById returns a full doc.
            await updatedCart.save();
        }


        return res.status(200).json({ success: true, data: updatedCart });
    } catch (error) {
        console.error("Add to cart error:", error);
        return next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } else {
         res.status(404);
        throw new Error('Cart not found');
    }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Invalid quantity');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate('items.restaurant', 'username restaurantDetails profilePicture')
        .populate({
            path: 'items.foodItem',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        })
        .populate({
            path: 'items.reel',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        });
 
    res.json({
        success: true,
        data: updatedCart
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:itemId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
        .populate('items.restaurant', 'username restaurantDetails profilePicture')
        .populate({
            path: 'items.foodItem',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        })
        .populate({
            path: 'items.reel',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        });
 
    res.json({
        success: true,
        data: updatedCart
    });
});

module.exports = {
    getCart,
    addToCart,
    clearCart,
    updateCartItem,
    removeCartItem
};
