const mongoose = require('mongoose');

const liftProviderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleType: {
        type: String,
        default: "Car"

    },
    vehicleNumber: {
        type: String,
        default: "0000"
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Additional fields
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
liftProviderSchema.index({ currentLocation: '2dsphere' });

liftProviderSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const LiftProvider = mongoose.model('LiftProvider', liftProviderSchema);

module.exports = LiftProvider;
