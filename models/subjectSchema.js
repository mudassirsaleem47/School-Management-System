const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subName: {
        type: String,
        required: true,
    },
    subCode: {
        type: String,
        required: true,
    },
    sessions: {
        type: String,
        required: false,
    },
    subType: {
        type: String,
        enum: ['Theory', 'Practical'],
        default: 'Theory',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Disabled'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model("subject", subjectSchema);
