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
        enum: ['student', 'staff', 'admit', 'admit_card', 'report', 'mark_sheet'],
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
    elements: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

module.exports = mongoose.model("CardTemplate", cardTemplateSchema);
