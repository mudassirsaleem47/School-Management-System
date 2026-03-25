const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true,
        trim: true
    },
    eventDescription: {
        type: String,
        trim: true,
        default: ''
    },
    eventFrom: {
        type: Date,
        required: true
    },
    eventTo: {
        type: Date,
        required: true
    },
    eventColor: {
        type: String,
        default: '#3b82f6' // Default blue color
    },
    eventType: {
        type: String,
        enum: ['Academic', 'Holiday', 'Meeting', 'Exam', 'Other'],
        default: 'Other'
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private', 'All', 'Super Admin Protected'],
        default: 'Public'
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel'
    },
    createdByModel: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'admin'
    }
}, {
    timestamps: true
});

// Index for faster queries
eventSchema.index({ schoolId: 1, eventFrom: 1 });
eventSchema.index({ schoolId: 1, eventTo: 1 });

module.exports = mongoose.model('event', eventSchema);
