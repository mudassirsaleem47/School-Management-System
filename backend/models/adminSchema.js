const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

    // Subscription Management
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'trial'],
        default: 'trial',
    },
    subscriptionExpiry: {
        type: Date,
    },

    role: {
        type: String,
        default: "Admin",
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    },
    schoolLogo: {
        type: String,
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    website: {
        type: String,
    },
    settings: {
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model("admin", adminSchema);