const express = require('express');
const router = express.Router();
const {
    followUser,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    toggleSavedReel,
    getSavedReels
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// ─── Profile update (name / profilePicture) ──────────────────────────────────
router.put('/update', protect, updateUserProfile);
router.get('/saved-reels', protect, getSavedReels);
router.put('/saved-reels/:reelId', protect, toggleSavedReel);

// ─── Address management ───────────────────────────────────────────────────────
// IMPORTANT: /address/default/:id must be BEFORE /address/:id  to avoid :id capturing "default"
router.post('/address', protect, addAddress);
router.patch('/address/default/:id', protect, setDefaultAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

// ─── Follow / Unfollow ───────────────────────────────────────────────────────
router.put('/:id/follow', protect, followUser);

module.exports = router;
