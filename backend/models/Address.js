const mongoose = require('mongoose');

/**
 * Reusable Address sub-schema
 * Used as embedded subdoc in User (addresses[]) and restaurantDetails.businessAddress
 * 2dsphere index is defined at the parent schema level where needed.
 */
const addressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
            default: 'Home' // "Home", "Work", "Other"
        },
        fullName: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        street: {
            type: String,
            required: [true, 'Street is required'],
            trim: true
        },
        landmark: {
            type: String,
            trim: true,
            default: ''
        },
        area: {
            type: String,
            trim: true,
            default: ''
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: 'India'
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required'],
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined // optional — only set when geo is available
            }
        }
    },
    { _id: true } // each address gets its own _id for reference
);

module.exports = addressSchema;
