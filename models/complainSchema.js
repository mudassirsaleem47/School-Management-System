const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    complainBy: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    actionTaken: {
        type: String
    },
    assigned: {
        type: String
    },
    note: {
        type: String
    },
    document: {
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

module.exports = mongoose.model('Complain', complainSchema);
