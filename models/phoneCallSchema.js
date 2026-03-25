const mongoose = require('mongoose');

const phoneCallSchema = new mongoose.Schema({
    callerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    callType: {
        type: String,
        enum: ['Incoming', 'Outgoing'],
        required: true
    },
    callDate: {
        type: Date,
        required: true
    },
    callTime: {
        type: String,
        required: true
    },
    purpose: {
        type: String
    },
    callDuration: {
        type: String
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    notes: {
        type: String
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PhoneCall', phoneCallSchema);
