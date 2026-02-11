const mongoose = require("mongoose");

const transportVehicleSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    vehicleModel: {
        type: String,
    },
    driverName: {
        type: String,
        required: true,
    },
    driverLicense: {
        type: String,
    },
    driverContact: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    note: {
        type: String,
    },
    // We can link vehicle to a route here or elsewhere
    assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportRoute'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("TransportVehicle", transportVehicleSchema);
