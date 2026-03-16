const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            restaurant,
            items,
            totalAmount,
            paymentMethod
        } = req.body;

        console.log("Creating order for user ID:", req.user._id);

        // Fetch user with addresses
        const currentUser = await User.findById(req.user._id);

        // ── Address validation ────────────────────────────────────────────────
        if (!currentUser.defaultAddress) {
            return res.status(400).json({
                success: false,
                requiresAddress: true,
                message: 'Please add and select a default delivery address before ordering.'
            });
        }

        // Find the default address subdocument
        const shippingAddress = currentUser.addresses.id(currentUser.defaultAddress);
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                requiresAddress: true,
                message: 'Default address not found. Please set a valid delivery address.'
            });
        }

        if (!restaurant) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        const restaurantUser = await User.findById(restaurant).select('restaurantDetails.deliverySettings restaurantDetails.restaurantStatus');
        if (restaurantUser?.restaurantDetails?.restaurantStatus === 'closed') {
            return res.status(409).json({
                success: false,
                message: 'Online delivery is currently paused for this restaurant.'
            });
        }
        if (restaurantUser?.restaurantDetails?.deliverySettings?.isDeliveryPaused) {
            return res.status(409).json({
                success: false,
                message: 'This restaurant has temporarily paused online delivery. Please try again later.'
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // ── Restaurant Consistency Validation ─────────────────────────────────
        // Extract restaurant ID from items and verify they all match the intended restaurant
        const Reel = require('../models/Reel');
        const FoodItem = require('../models/FoodItem');

        for (const item of items) {
            let itemRestaurantId;
            if (item.reel) {
                const reel = await Reel.findById(item.reel);
                itemRestaurantId = reel?.restaurant?.toString();
            } else if (item.foodItem) {
                const foodItem = await FoodItem.findById(item.foodItem);
                itemRestaurantId = foodItem?.restaurant?.toString();
            }

            if (itemRestaurantId && itemRestaurantId !== restaurant.toString()) {
                return res.status(400).json({ 
                    success: false,
                    message: `Item does not belong to the specified restaurant. Security mismatch.`
                });
            }
        }

        // ── Snapshot Item Data ────────────────────────────────────────────────
        const orderItems = [];
        for (const item of items) {
            let snapshotItem = {
                quantity: item.quantity,
                price: item.price // Use price from item (already checked in cart)
            };

            if (item.reel) {
                const reel = await Reel.findById(item.reel);
                snapshotItem.reel = item.reel;
                snapshotItem.title = reel?.title || "Unknown Reel";
                snapshotItem.price = reel?.price || item.price;
            } else if (item.foodItem) {
                const foodItem = await FoodItem.findById(item.foodItem);
                snapshotItem.foodItem = item.foodItem;
                snapshotItem.name = foodItem?.name || "Unknown Item";
                snapshotItem.price = foodItem?.price || item.price;
            }
            orderItems.push(snapshotItem);
        }

        const order = new Order({
            user: req.user._id,
            restaurant,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress.toObject(),
            paymentMethod: paymentMethod || 'COD'
        });

        const createdOrder = await order.save();
        console.log("Order saved successfully:", createdOrder);

        // Notify restaurant about new order
        try {
            await createNotification(
                restaurant,
                'order_placed',
                `New order received! Order #${String(createdOrder._id).slice(-6).toUpperCase()} worth ₹${totalAmount}`
            );
        } catch (e) { /* non-blocking */ }

        res.status(201).json({
            success: true,
            data: createdOrder
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        console.log("Fetching orders for user ID:", req.user._id);
        const orders = await Order.find({ user: req.user._id })
            .populate('restaurant', 'username restaurantDetails profilePicture')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for user`);
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Fetch my orders error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id username');
    res.json({
        success: true,
        data: orders
    });
};

// @desc    Get orders for the logged-in restaurant
// @route   GET /api/orders/restaurant
// @access  Private (Restaurant)
const getRestaurantOrders = async (req, res) => {
    try {
        if (req.user.role !== 'restaurant') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const orders = await Order.find({ restaurant: req.user._id })
            .populate('user', 'username name email')
            .populate('items.foodItem', 'name')
            .populate('items.reel', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant)
const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'restaurant') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id).populate('user', '_id username email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.restaurant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        // Real-time socket emit
        if (global.io) {
            global.io.emit('orderStatusUpdated', {
                orderId: updatedOrder._id,
                newStatus: updatedOrder.status,
                userId: order.user._id
            });
        }

        // Notify user about status change
        try {
            const messages = {
                preparing: `Your order #${String(order._id).slice(-6).toUpperCase()} is being prepared! 👨‍🍳`,
                completed: `Your order #${String(order._id).slice(-6).toUpperCase()} has been completed! ✅`,
                cancelled: `Your order #${String(order._id).slice(-6).toUpperCase()} was cancelled. ❌`
            };
            if (messages[status]) {
                await createNotification(order.user._id, `order_${status}`, messages[status]);
            }
        } catch (e) { /* non-blocking */ }

        res.json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    getRestaurantOrders,
    updateOrderStatus
};
