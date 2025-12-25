const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Fee Collection', 'Donations', 'Grants', 'Events', 'Other Income']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online', 'Other'],
        default: 'Cash'
    },
    reference: {
        type: String,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    }
}, {
    timestamps: true
});

// Index for faster queries
incomeSchema.index({ school: 1, date: -1 });
incomeSchema.index({ school: 1, category: 1 });

module.exports = mongoose.model('Income', incomeSchema);
