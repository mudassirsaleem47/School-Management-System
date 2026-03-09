const mongoose = require('mongoose');

const itemStoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    storeCode: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ItemStore', itemStoreSchema);
