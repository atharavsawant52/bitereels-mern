const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/profile', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
