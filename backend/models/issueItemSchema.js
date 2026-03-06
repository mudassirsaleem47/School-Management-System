const mongoose = require('mongoose');

const issueItemSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    issuedToRole: {
        type: String,
        required: true,
        enum: ['Student', 'Staff']
    },
    issuedToId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Ref will be dynamically populated in routes based on issuedToRole
    },
    issueDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Issued', 'Returned'],
        default: 'Issued'
    },
    note: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('IssueItem', issueItemSchema);
