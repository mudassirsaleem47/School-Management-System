const mongoose = require("mongoose");

const sclassSchema = new mongoose.Schema({
    sclassName: {
        type: String,
        required: true,
    },
    sections: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'section' 
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'campus',
        required: false // Optional for backward compatibility
    },
    classIncharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: false // Optional - class incharge assign karna zaroori nahi
    }
}, { timestamps: true });

module.exports = mongoose.model("sclass", sclassSchema);