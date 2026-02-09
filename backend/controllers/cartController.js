const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.foodItem',
        populate: { path: 'restaurant' }
    });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        const { foodItemId, quantity } = req.body;
        
        if (!foodItemId) {
            res.status(400);
            return next(new Error('Food Item ID is required'));
        }

        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            res.status(404);
            return next(new Error('Food Item not found'));
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.foodItem.toString() === foodItemId);

        if (itemIndex > -1) {
            // Product exists in the cart, update the quantity
            cart.items[itemIndex].quantity += Number(quantity || 1);
        } else {
            // Product does not exist in cart, add new item
            cart.items.push({
                foodItem: foodItemId,
                quantity: Number(quantity || 1),
                price: foodItem.price
            });
        }

        await cart.save();
        
        // Repopulate to return full object
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.foodItem',
            populate: { path: 'restaurant' }
        });
        
        return res.status(200).json({ success: true, cart: updatedCart });
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
        res.json({ message: 'Cart cleared' });
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

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.foodItem',
        populate: { path: 'restaurant' }
    });
    res.json(updatedCart);
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

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.foodItem',
        populate: { path: 'restaurant' }
    });
    res.json(updatedCart);
});

module.exports = {
    getCart,
    addToCart,
    clearCart,
    updateCartItem,
    removeCartItem
};
