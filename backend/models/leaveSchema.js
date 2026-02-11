const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
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
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    dateFrom: {
        type: Date,
        required: true,
    },
    dateTo: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    document: {
        type: String, // URL/Path to file
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin', // or teacher? Usually Admin approves or teacher approves
        default: null
    },
    approvalDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
