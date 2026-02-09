const User = require('../models/User');

// @desc    Follow a user (restaurant or other user)
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    // The user to be followed
    const userToFollow = await User.findById(req.params.id);
    // The current user
    const currentUser = await User.findById(req.user._id);

    if (userToFollow && currentUser) {
        // Check if already following
        // We need a way to store 'following' list. 
        // Logic: Add 'following' to User model or just 'followers'.
        // Let's assume we add 'following' to User model.
        // Wait, User model doesn't have 'following' or 'followers' in the snippet I saw.
        // I need to add them to User model first.
        
        // Let's check if we can update User model next.
        // For now, let's assume we will update User model to have 'followers' and 'following'.
        
        // This controller logic depends on those fields.
        // Let's write the logic assuming those fields exist.

        // Check if current user is already following userToFollow
        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
            await currentUser.save();
            await userToFollow.save();
            res.json({ message: 'Unfollowed user', isFollowing: false });
        } else {
            // Follow
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
            await currentUser.save();
            await userToFollow.save();
            res.json({ message: 'Followed user', isFollowing: true });
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    followUser
};
