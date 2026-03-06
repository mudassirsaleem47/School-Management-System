const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        required: true,
    },
    monthYear: {
        type: String, // format: "YYYY-MM"
        required: true,
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', ''],
        default: ''
    },
    paidDate: {
        type: Date
    }
}, { timestamps: true });

// Prevent duplicate payrolls for a single staff in a specific month
payrollSchema.index({ staffId: 1, monthYear: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
