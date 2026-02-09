const express = require('express');
const router = express.Router();
const { followUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id/follow').put(protect, followUser);

module.exports = router;
