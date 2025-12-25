const mongoose = require('mongoose');

const marksDivisionSchema = new mongoose.Schema({
    divisionName: {
        type: String,
        required: true,
        trim: true
    },
    percentageFrom: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    percentageTo: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

marksDivisionSchema.index({ school: 1, percentageFrom: 1 });

module.exports = mongoose.model('MarksDivision', marksDivisionSchema);
