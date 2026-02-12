const mongoose = require("mongoose");

const cardTemplateSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    backgroundImage: {
        type: String, // URL of the uploaded template image
        required: false
    },
    cardType: {
        type: String,
        enum: ['student', 'staff', 'admit', 'report'],
        default: 'student'
    },
    dimensions: {
        width: { type: Number, default: 350 }, // px
        height: { type: Number, default: 220 } // px
    },
    orientation: {
        type: String,
        enum: ['horizontal', 'vertical'],
        default: 'horizontal'
    },
    elements: [{
        field: { type: String, required: true }, // e.g., 'name', 'class', 'rollNum', 'photo'
        label: { type: String }, // Optional label to show before value
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        fontSize: { type: Number, default: 14 },
        fontWeight: { type: String, default: 'normal' },
        color: { type: String, default: '#000000' },
        width: { type: Number }, // For images/containers
        height: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model("CardTemplate", cardTemplateSchema);
