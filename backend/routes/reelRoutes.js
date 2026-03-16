const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createReel,
    getReels,
    likeReel,
    addComment,
    getComments,
    getRestaurantReels,
    deleteReel,
    searchReels,
    toggleSaveReel,
    getSavedReels
} = require('../controllers/reelController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Videos Only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.route('/')
    .get(getReels)
    .post(protect, upload.single('video'), createReel);

// Must be before /:id to avoid param collision
router.route('/search').get(searchReels);
router.route('/restaurant/my-reels').get(protect, getRestaurantReels);
router.route('/saved').get(protect, getSavedReels);

router.route('/:id')
    .delete(protect, deleteReel);

router.route('/:id/like').put(protect, likeReel);
router.route('/:id/save').put(protect, toggleSaveReel);
router.route('/:id/comments').get(getComments).post(protect, addComment);

module.exports = router;
