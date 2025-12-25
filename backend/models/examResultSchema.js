const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    examSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamSchedule',
        required: true
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number
    },
    grade: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Absent'],
        required: true
    },
    remarks: {
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

// Calculate percentage and determine pass/fail before saving
examResultSchema.pre('save', async function() {
    this.percentage = ((this.marksObtained / this.totalMarks) * 100).toFixed(2);
    
    // Get passing marks from exam schedule
    const ExamSchedule = mongoose.model('ExamSchedule');
    const schedule = await ExamSchedule.findById(this.examSchedule);
    
    if (schedule && this.status !== 'Absent') {
        this.status = this.marksObtained >= schedule.passingMarks ? 'Pass' : 'Fail';
    }
});

examResultSchema.index({ student: 1, examSchedule: 1 });
examResultSchema.index({ school: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema);
