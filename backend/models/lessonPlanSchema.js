const mongoose = require("mongoose");

const lessonPlanSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass.sections', // Not directly linkable often, usually just referencing ID
        // Or store section name/ID if referenced differently in existing code
    },
    subjectGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subjectGroup',
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    timeFrom: String,
    timeTo: String,
    
    // Syllabus Status Tracking fields
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'In Progress'],
        default: 'Pending'
    },
    completionDate: {
        type: Date
    },
    presentation: String, // Links to file/resource
    notes: String,
    
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("LessonPlan", lessonPlanSchema);
