const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    staffModel: {
        type: String,
        enum: ['teacher', 'accountant', 'receptionist'],
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
        default: 'Present'
    },
    remark: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Unique attendance per staff per day
staffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StaffAttendance", staffAttendanceSchema);
