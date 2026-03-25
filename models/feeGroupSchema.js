const mongoose = require("mongoose");

// Individual fee component inside a group
const feeComponentSchema = new mongoose.Schema({
    feeName: {
        type: String,
        required: true,
        trim: true
    },
    feeType: {
        type: String,
        enum: ['Tuition', 'Transport', 'Library', 'Sports', 'Lab', 'Exam', 'Uniform', 'Other'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ""
    }
}, { _id: true });

const feeGroupSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    academicYear: {
        type: String,
        required: true
    },
    // Optional – if set, this group applies to a specific class
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        default: null
    },
    section: {
        type: String,
        default: 'All'
    },
    feeComponents: {
        type: [feeComponentSchema],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'A fee group must have at least one fee component.'
        }
    },
    // Auto-calculated total of all components
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

// Recalculate totalAmount before every save
feeGroupSchema.pre('save', function () {
    this.totalAmount = this.feeComponents.reduce((sum, c) => sum + (c.amount || 0), 0);
});

module.exports = mongoose.model("feeGroup", feeGroupSchema);
