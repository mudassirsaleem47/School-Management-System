const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    recipient: {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'student'
        },
        name: String,
        phone: String,
        email: String
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['sms', 'whatsapp', 'email'],
        default: 'whatsapp'
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageTemplate'
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
    },
    error: {
        type: String
    },
    deliveredAt: {
        type: Date
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MessageLog', messageLogSchema);
