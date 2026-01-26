const mongoose = require('mongoose');

const idCardTemplateSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    templateName: {
        type: String,
        required: true,
        trim: true
    },
    templateType: {
        type: String,
        enum: ['student', 'employee'],
        required: true
    },
    templateFile: {
        type: String, // File path for uploaded template image
        default: ''
    },
    dimensions: {
        width: {
            type: Number,
            default: 85.6 // Standard ID card width in mm
        },
        height: {
            type: Number,
            default: 53.98 // Standard ID card height in mm
        }
    },
    backgroundColor: {
        type: String,
        default: '#ffffff'
    },
    // User-adjustable fields with positions
    fields: [{
        fieldName: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        position: {
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            }
        },
        fontSize: {
            type: Number,
            default: 14
        },
        fontColor: {
            type: String,
            default: '#000000'
        },
        fontWeight: {
            type: String,
            enum: ['normal', 'bold'],
            default: 'normal'
        },
        alignment: {
            type: String,
            enum: ['left', 'center', 'right'],
            default: 'left'
        }
    }],
    // Logo/Photo configurations
    logoPosition: {
        x: { type: Number, default: 10 },
        y: { type: Number, default: 10 },
        width: { type: Number, default: 30 },
        height: { type: Number, default: 30 }
    },
    photoPosition: {
        x: { type: Number, default: 10 },
        y: { type: Number, default: 50 },
        width: { type: Number, default: 25 },
        height: { type: Number, default: 30 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IdCardTemplate', idCardTemplateSchema);
