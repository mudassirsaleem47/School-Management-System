const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    purpose: {
        type: String,
        required: true
    },
    meetingWith: {
        type: String,
        required: true,
        enum: ['Staff', 'Student']
    },
    // For Staff meeting
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        set: v => v === '' ? null : v
    },
    // For Student meeting
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        set: v => v === '' ? null : v
    },
    section: {
        type: String
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        set: v => v === '' ? null : v
    },
    visitorName: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    idCard: {
        type: String
    },
    numberOfPerson: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    inTime: {
        type: String,
        required: true
    },
    outTime: {
        type: String
    },
    note: {
        type: String
    },
    document: {
        type: String // File path or URL
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('visitor', visitorSchema);
