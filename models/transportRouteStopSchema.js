const mongoose = require("mongoose");

const transportRouteStopSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportRoute',
        required: true,
    },
    pickupPoint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportPickupPoint',
        required: true
    },
    distance: {
        type: Number,
        default: 0
    },
    pickTime: {
        type: String,
        default: "00:00"
    },
    dropTime: {
        type: String,
        default: "00:00"
    },
    monthlyFee: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("TransportRouteStop", transportRouteStopSchema);
