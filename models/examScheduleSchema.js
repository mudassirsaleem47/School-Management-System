const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
    examGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamGroup',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    examDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 0
    },
    passingMarks: {
        type: Number,
        required: true,
        min: 0
    },
    roomNumber: {
        type: String,
        trim: true
    },
    instructions: {
        type: String,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

examScheduleSchema.index({ examGroup: 1, class: 1 });
examScheduleSchema.index({ school: 1, examDate: 1 });

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
