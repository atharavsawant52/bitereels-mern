const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');

const DELIVERY_FEE = 20;

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are missing in environment variables');
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

const createOrder = asyncHandler(async (req, res) => {
    const razorpay = getRazorpayInstance();

    const cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.foodItem',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        })
        .populate({
            path: 'items.reel',
            populate: { path: 'restaurant', select: 'username restaurantDetails profilePicture' }
        });

    if (!cart || !cart.items || cart.items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
    }

    // Validate address
    const currentUser = await User.findById(req.user._id);
    if (!currentUser?.defaultAddress) {
        res.status(400);
        return res.json({
            success: false,
            requiresAddress: true,
            message: 'Please add and select a default delivery address before ordering.'
        });
    }

    const shippingAddress = currentUser.addresses.id(currentUser.defaultAddress);
    if (!shippingAddress) {
        res.status(400);
        return res.json({
            success: false,
            requiresAddress: true,
            message: 'Default address not found. Please set a valid delivery address.'
        });
    }

    // Ensure single-restaurant cart for online payment
    const getRestaurantIdFromItem = (item) =>
        item.restaurant?._id ||
        item.restaurant ||
        item.foodItem?.restaurant?._id ||
        item.foodItem?.restaurant ||
        item.reel?.restaurant?._id ||
        item.reel?.restaurant;

    const firstRestaurantId = getRestaurantIdFromItem(cart.items[0]);
    if (!firstRestaurantId) {
        res.status(400);
        throw new Error('Restaurant information missing for cart item. Please refresh and try again.');
    }

    for (const item of cart.items) {
        const rid = getRestaurantIdFromItem(item);
        if (!rid || rid.toString() !== firstRestaurantId.toString()) {
            res.status(400);
            throw new Error('Online payment supports only single-restaurant checkout. Please order restaurant-wise.');
        }
    }

    const amountRupees = (cart.totalPrice || 0) + DELIVERY_FEE;
    const amountPaise = Math.round(amountRupees * 100);

    const razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
            userId: String(req.user._id)
        }
    });

    // Snapshot items for DB order
    const orderItems = cart.items.map((item) => ({
        foodItem: item.foodItem?._id,
        reel: item.reel?._id,
        quantity: item.quantity,
        price: item.price,
        name: item.foodItem?.name,
        title: item.reel?.title
    }));

    await Order.create({
        user: req.user._id,
        restaurant: firstRestaurantId,
        items: orderItems,
        totalAmount: amountRupees,
        shippingAddress: shippingAddress.toObject(),
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'Pending',
        orderId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id
    });

    return res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
    });
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error('Missing Razorpay verification fields');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
    if (!order) {
        res.status(404);
        throw new Error('Order not found for verification');
    }

    const isValid = expectedSignature === razorpay_signature;

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentId = razorpay_payment_id;
    order.orderId = razorpay_order_id;

    if (isValid) {
        order.paymentStatus = 'Paid';
        order.isPaid = true;
        order.paidAt = new Date();

        await order.save();

        // Clear cart after successful payment
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return res.json({
            success: true,
            message: 'Payment verified and order marked as paid'
        });
    }

    order.paymentStatus = 'Failed';
    await order.save();

    res.status(400);
    return res.json({
        success: false,
        message: 'Payment verification failed'
    });
});

module.exports = {
    createOrder,
    verifyPayment
};
