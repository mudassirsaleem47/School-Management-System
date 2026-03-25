const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number, // Years of experience
        default: 0
    },
    salary: {
        type: Number,
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin', // Link to Admin/School
        required: true
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'campus', // Link to Campus
        required: false // Optional for backward compatibility
    },
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass' // Link to Class Model
    }],
    role: {
        type: String,
        default: "Teacher"
    },
    passwordChangedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("teacher", teacherSchema, "staffs");
