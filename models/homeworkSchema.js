const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        index: true,
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'campus',
        required: false,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
        index: true,
    },
    section: {
        type: String,
        trim: true,
        default: '',
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    dueDate: {
        type: Date,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['Assigned', 'Archived'],
        default: 'Assigned',
        index: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel',
        required: false,
    },
    createdByModel: {
        type: String,
        enum: ['admin', 'staff', 'teacher'],
        default: 'admin',
    },
    completions: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'student',
                required: true,
            },
            completedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});

homeworkSchema.index({ schoolId: 1, classId: 1, section: 1, dueDate: 1 });

module.exports = mongoose.model('homework', homeworkSchema);