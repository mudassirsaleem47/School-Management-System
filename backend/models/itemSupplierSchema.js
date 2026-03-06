const mongoose = require('mongoose');

const itemSupplierSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactPersonName: {
        type: String,
        trim: true
    },
    contactPersonPhone: {
        type: String,
        trim: true
    },
    contactPersonEmail: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ItemSupplier', itemSupplierSchema);
