const mongoose = require("mongoose");

const campusSchema = new mongoose.Schema({
    campusName: {
        type: String,
        required: true,
        trim: true
    },
    campusCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    isMain: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    principalName: {
        type: String,
        trim: true
    },
    totalCapacity: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for faster queries
campusSchema.index({ school: 1, status: 1 });

module.exports = mongoose.model("campus", campusSchema);
