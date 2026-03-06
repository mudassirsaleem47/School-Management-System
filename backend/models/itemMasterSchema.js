const mongoose = require('mongoose');

const itemMasterSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    itemCategory: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ItemMaster', itemMasterSchema);
