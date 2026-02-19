const mongoose = require('mongoose');

const whatsappSessionSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        description: 'The session ID, usually the school ID'
    },
    creds: {
        type: Object,
        default: {}
    },
    keys: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppSession', whatsappSessionSchema);
