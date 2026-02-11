const mongoose = require('mongoose');

const subjectGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

subjectGroupSchema.index({ school: 1 });

module.exports = mongoose.model('SubjectGroup', subjectGroupSchema);
