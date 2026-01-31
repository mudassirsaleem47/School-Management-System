const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    
    // Designation reference (new dynamic system)
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'designation',
        required: true
    },

    // Legacy role field (kept for backward compatibility)
    role: {
        type: String,
        trim: true
    },
    
    // School and Campus Association
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'campus'
    },
    
    // Teacher-specific fields
    subject: {
        type: String,
        trim: true
    },
    qualification: {
        type: String,
        trim: true
    },
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    
    // Accountant-specific fields
    employeeId: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    
    // Common fields
    joiningDate: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    profilePicture: {
        type: String
    },
    address: {
        type: String,
        trim: true
    },
    cnic: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Indexes for faster queries
staffSchema.index({ school: 1, role: 1 });
// email index removed - unique:true already creates index
staffSchema.index({ campus: 1 });

module.exports = mongoose.model("staff", staffSchema);
