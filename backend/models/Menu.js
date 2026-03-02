const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Indexes for performance and search
menuSchema.index({ restaurant: 1 });
menuSchema.index({ name: 'text' });

module.exports = mongoose.model('Menu', menuSchema);
