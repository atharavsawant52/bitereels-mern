const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const addressSchema = require('./Address');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'restaurant'],
        default: 'user'
    },

    // ── User delivery addresses (multi-address) ──────────────────────────
    addresses: [addressSchema],

    // Points to one of the IDs inside addresses[] as the default
    defaultAddress: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    // ── Restaurant-specific details ───────────────────────────────────────
    restaurantDetails: {
        restaurantName: { type: String },
        businessAddress: { type: addressSchema },
        phone: { type: String },
        restaurantStatus: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open'
        },
        deliverySettings: {
            isDeliveryPaused: {
                type: Boolean,
                default: false
            },
            updatedAt: {
                type: Date,
                default: null
            },
            note: {
                type: String,
                trim: true,
                default: ''
            }
        },
        menu: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu'
        }]
    },

    profilePicture: {
        type: String,
        default: ''
    },
    savedReels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel'
    }],
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// ── Geospatial indexes ────────────────────────────────────────────────────
// For geo queries on restaurant business address
userSchema.index({ 'restaurantDetails.businessAddress.location': '2dsphere' });
// For geo queries on user delivery addresses
userSchema.index({ 'addresses.location': '2dsphere' });

// ── Password hashing ─────────────────────────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
