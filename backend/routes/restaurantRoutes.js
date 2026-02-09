const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurantById,
    updateRestaurantProfile,
    getDashboardStats
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getRestaurants);
router.route('/profile').put(protect, updateRestaurantProfile);
router.route('/stats').get(protect, getDashboardStats);
router.route('/:id').get(getRestaurantById);

module.exports = router;
