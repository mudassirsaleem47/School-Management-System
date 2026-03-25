const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // Optional rakh rahe hain
    },
    address: {
        type: String,
    },
    description: {
        type: String,
    },
    note: {
        type: String, // Internal note for admin
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Assigned Teacher (User/Admin table se link hoga jinka role Teacher hai)
    assigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher', // Changed from 'admin' to 'teacher'
        required: false
    },
    reference: {
        type: String, // Kisne refer kiya
    },
    // Class ke liye dropdown (Sclass model se link)
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    noOfChild: {
        type: Number,
        default: 1, // Default value user ki requirement ke mutabiq
    },
    status: {
        type: String,
        default: "Pending", // Status track karne ke liye (extra feature)
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("enquiry", enquirySchema);