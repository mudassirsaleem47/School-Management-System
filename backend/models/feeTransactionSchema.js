const mongoose = require("mongoose");

const feeTransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fee',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online', 'Cheque', 'Card', 'Bank Transfer'],
        required: true
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    chequeNumber: {
        type: String,
        default: ""
    },
    bankName: {
        type: String,
        default: ""
    },
    transactionReference: {
        type: String,
        default: ""
    },
    remarks: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Generate unique transaction ID
feeTransactionSchema.pre('save', async function () {
    if (!this.transactionId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.transactionId = `TXN${timestamp}${random}`;
    }
    if (!this.receiptNumber) {
        const count = await mongoose.model('feeTransaction').countDocuments();
        const year = new Date().getFullYear();
        this.receiptNumber = `REC${year}${String(count + 1).padStart(6, '0')}`;
    }
});


module.exports = mongoose.model("feeTransaction", feeTransactionSchema);
