const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema({
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    days: [{
        day: { type: String, required: true }, // Monday, Tuesday...
        periods: [{
            subject: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
            teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher' },
            startTime: { type: String },
            endTime: { type: String },
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model("classSchedule", classScheduleSchema);
