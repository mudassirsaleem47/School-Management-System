const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskTitle: {
        type: String,
        required: true,
        trim: true
    },
    taskDescription: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['Todo', 'Completed'],
        default: 'Todo'
    },
    dueDate: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignedToModel'
    },
    assignedToModel: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'admin'
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel'
    },
    createdByModel: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'admin'
    }
}, {
    timestamps: true
});

// Index for faster queries
taskSchema.index({ schoolId: 1, status: 1 });
taskSchema.index({ schoolId: 1, dueDate: 1 });

module.exports = mongoose.model('task', taskSchema);
