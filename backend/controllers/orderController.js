const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            restaurant,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        } = req.body;

        if (!restaurant) {
            res.status(400);
            throw new Error('Restaurant ID is required');
        }

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        if (!shippingAddress) {
            res.status(400);
            throw new Error('Shipping address is required');
        }

        const order = new Order({
            user: req.user._id,
            restaurant: restaurant,
            items: items,
            totalAmount: totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id username');
    res.json(orders);
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
            .populate('user', 'username email')
            .populate('items.foodItem', 'name price')
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user', '_id username email');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.restaurant.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this order');
        }

        order.status = status;
        const updatedOrder = await order.save();

        // Emit Socket.io event for real-time update
        if (global.io) {
            global.io.emit('orderStatusUpdated', {
                orderId: updatedOrder._id,
                newStatus: updatedOrder.status,
                userId: order.user._id
            });
            console.log(`Socket event emitted: order ${updatedOrder._id} status updated to ${updatedOrder.status}`);
        }

        res.json(updatedOrder);
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
