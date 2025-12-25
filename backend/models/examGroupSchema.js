const mongoose = require('mongoose');

const examGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Completed'],
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

examGroupSchema.index({ school: 1, academicYear: 1 });

module.exports = mongoose.model('ExamGroup', examGroupSchema);
