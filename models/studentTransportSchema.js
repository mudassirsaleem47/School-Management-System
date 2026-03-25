const mongoose = require("mongoose");

const studentTransportSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    routeStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportRouteStop',
        required: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId, // Optional if multiple vehicles per route
        ref: 'TransportVehicle'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    routeTitle: {
        type: String // Denormalized for quick access
    },
    pickupPointName: {
        type: String // Denormalized which stop
    },
    vehicleNumber: {
        type: String
    },
    driverName: {
        type: String
    },
    driverContact: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("StudentTransport", studentTransportSchema);
