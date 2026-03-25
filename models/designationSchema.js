const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    isActive: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

// Indexes for faster queries
designationSchema.index({ school: 1 });
designationSchema.index({ school: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("designation", designationSchema);
