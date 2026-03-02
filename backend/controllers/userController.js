const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOW / UNFOLLOW
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Follow/Unfollow a user or restaurant
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.some(
            id => id.toString() === req.params.id
        );

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== req.params.id
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== req.user._id.toString()
            );
        } else {
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({ 
            success: true,
            message: isFollowing ? 'Unfollowed' : 'Followed', 
            data: { isFollowing: !isFollowing } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE (name / profilePicture only — no address here)
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, profilePicture } = req.body;
        if (name !== undefined) user.name = name.trim();
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        const updated = await user.save();

        res.json({
            success: true,
            data: buildUserResponse(updated, req)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Add a new delivery address
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { label, fullName, phone, street, landmark, area, city, state, country, postalCode, location } = req.body;

        if (!street || !city || !state || !postalCode) {
            return res.status(400).json({ message: 'Street, city, state, and postal code are required.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAddress = {
            label: label || 'Home',
            fullName: fullName || user.name || user.username,
            phone: phone || '',
            street,
            landmark: landmark || '',
            area: area || '',
            city,
            state,
            country: country || 'India',
            postalCode
        };

        // Attach geo coordinates if provided
        if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            newAddress.location = {
                type: 'Point',
                coordinates: location.coordinates // [lng, lat]
            };
        }

        user.addresses.push(newAddress);

        // Auto-set as default if it's the first address
        if (!user.defaultAddress || user.addresses.length === 1) {
            user.defaultAddress = user.addresses[user.addresses.length - 1]._id;
        }

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added',
            data: {
                addresses: user.addresses,
                defaultAddress: user.defaultAddress
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing address
// @route   PUT /api/users/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const address = user.addresses.id(req.params.id);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        const { label, fullName, phone, street, landmark, area, city, state, country, postalCode, location } = req.body;

        if (label !== undefined) address.label = label;
        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (street !== undefined) address.street = street;
        if (landmark !== undefined) address.landmark = landmark;
        if (area !== undefined) address.area = area;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (country !== undefined) address.country = country;
        if (postalCode !== undefined) address.postalCode = postalCode;

        if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            address.location = { type: 'Point', coordinates: location.coordinates };
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address updated',
            data: {
                addresses: user.addresses,
                defaultAddress: user.defaultAddress
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const addressExists = user.addresses.id(req.params.id);
        if (!addressExists) return res.status(404).json({ message: 'Address not found' });

        user.addresses.pull({ _id: req.params.id });

        // If deleted address was default, auto-assign next one or null
        if (user.defaultAddress && user.defaultAddress.toString() === req.params.id) {
            user.defaultAddress = user.addresses.length > 0 ? user.addresses[0]._id : null;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted',
            data: {
                addresses: user.addresses,
                defaultAddress: user.defaultAddress
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set an address as default
// @route   PATCH /api/users/address/default/:id
// @access  Private
const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const address = user.addresses.id(req.params.id);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        user.defaultAddress = address._id;
        await user.save();

        res.json({
            success: true,
            message: 'Default address updated',
            data: { defaultAddress: user.defaultAddress }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to build consistent user response
// ─────────────────────────────────────────────────────────────────────────────
const buildUserResponse = (user, req) => ({
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses,
    defaultAddress: user.defaultAddress,
    profilePicture: user.profilePicture,
    restaurantDetails: user.restaurantDetails,
    token: req.headers.authorization?.split(' ')[1]
});

module.exports = {
    followUser,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
