const Task = require('../models/taskSchema.js');

// Create new task
const createTask = async (req, res) => {
    try {
        const { taskTitle, taskDescription, status, dueDate, assignedTo, assignedToModel, schoolId, createdBy, createdByModel } = req.body;

        const task = new Task({
            taskTitle,
            taskDescription,
            status: status || 'Todo',
            dueDate,
            assignedTo,
            assignedToModel: assignedToModel || 'admin',
            schoolId,
            createdBy,
            createdByModel: createdByModel || 'admin'
        });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tasks by school
const getTasksBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const tasks = await Task.find({ schoolId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasksBySchool,
    getTaskById,
    updateTask,
    deleteTask
};
