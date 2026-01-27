const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'fee', 'attendance', 'exam', 'event', 'holiday', 'other'],
        default: 'general'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
