const mongoose = require('mongoose');

const liftSeekerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    destination: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isMatched: {
        type: Boolean,
        default: false
    },
    matchedProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiftProvider',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index on the currentLocation field
liftSeekerSchema.index({ currentLocation: '2dsphere' });

liftSeekerSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const LiftSeeker = mongoose.model('LiftSeeker', liftSeekerSchema);

module.exports = LiftSeeker;
