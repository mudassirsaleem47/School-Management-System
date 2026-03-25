const mongoose = require("mongoose");

const transportPickupPointSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    pickupPointName: {
        type: String,
        required: true,
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("TransportPickupPoint", transportPickupPointSchema);
