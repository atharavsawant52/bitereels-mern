const express = require('express');
const router = express.Router();
const {
    addMenuItem,
    getRestaurantMenu,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('restaurant'), addMenuItem);

router.route('/restaurant/:restaurantId')
    .get(getRestaurantMenu);

router.route('/:id')
    .put(protect, authorize('restaurant'), updateMenuItem)
    .delete(protect, authorize('restaurant'), deleteMenuItem);

module.exports = router;
