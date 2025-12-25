const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeStructure',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    pendingAmount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    academicYear: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Update status based on payment
feeSchema.pre('save', async function () {
    if (this.paidAmount === 0) {
        this.status = this.dueDate < new Date() ? 'Overdue' : 'Pending';
    } else if (this.paidAmount >= this.totalAmount) {
        this.status = 'Paid';
        this.pendingAmount = 0;
    } else {
        this.status = 'Partial';
    }
    this.pendingAmount = this.totalAmount - this.paidAmount;
});


module.exports = mongoose.model("fee", feeSchema);
