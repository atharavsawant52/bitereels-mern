const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getMyOrders,
    getOrders,
    getRestaurantOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, authorize('admin'), getOrders);

router.route('/restaurant').get(protect, authorize('restaurant'), getRestaurantOrders);
router.route('/:id/status').put(protect, updateOrderStatus);

router.route('/myorders').get(protect, getMyOrders);

module.exports = router;
