const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['success', 'error', 'info', 'warning'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['student', 'teacher', 'class', 'fee', 'visitor', 'admission', 'complain', 'other'],
            default: 'other'
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, timestamp: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('notification', notificationSchema);
