const mongoose = require('mongoose');

const messagingSettingsSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        unique: true
    },
    whatsapp: {
        connected: {
            type: Boolean,
            default: false
        },
        phoneNumber: String,
        sessionData: String, // Encrypted session for Baileys
        lastConnected: Date
    },
    email: {
        smtpHost: String,
        smtpPort: {
            type: String,
            default: '587'
        },
        smtpUser: String,
        smtpPassword: String, // Should be encrypted
        senderName: String,
        senderEmail: String,
        verified: {
            type: Boolean,
            default: false
        },
        lastVerified: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MessagingSettings', messagingSettingsSchema);
