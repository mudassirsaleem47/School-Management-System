const mongoose = require('mongoose');

const marksGradeSchema = new mongoose.Schema({
    gradeName: {
        type: String,
        required: true,
        trim: true
    },
    percentageFrom: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    percentageTo: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    gradePoint: {
        type: Number,
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

marksGradeSchema.index({ school: 1, percentageFrom: 1 });

module.exports = mongoose.model('MarksGrade', marksGradeSchema);
