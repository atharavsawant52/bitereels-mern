const express = require('express');
const router = express.Router();
const {
    createFoodItem,
    getMyFoodItems,
    updateFoodItem,
    deleteFoodItem
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('restaurant'), createFoodItem);

router.route('/my')
    .get(protect, authorize('restaurant'), getMyFoodItems);

router.route('/:id')
    .put(protect, authorize('restaurant'), updateFoodItem)
    .delete(protect, authorize('restaurant'), deleteFoodItem);

module.exports = router;
