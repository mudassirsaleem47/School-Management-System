const mongoose = require("mongoose");

const transportRouteSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    routeTitle: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("TransportRoute", transportRouteSchema);
