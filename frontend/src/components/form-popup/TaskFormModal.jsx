import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';


const API_BASE = import.meta.env.VITE_API_URL;

const TaskFormModal = ({ isOpen, onClose, task }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        taskTitle: '',
        taskDescription: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: ''
    });

    useEffect(() => {
        if (task) {
            // Edit mode
            setFormData({
                taskTitle: task.taskTitle || '',
                taskDescription: task.taskDescription || '',
                status: task.status || 'Todo',
                priority: task.priority || 'Medium',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
            });
        } else {
            // Create mode
            setFormData({
                taskTitle: '',
                taskDescription: '',
                status: 'Todo',
                priority: 'Medium',
                dueDate: ''
            });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                schoolId: currentUser._id,
                createdBy: currentUser._id,
                createdByModel: 'admin'
            };

            if (task) {
                // Update existing task
                await axios.put(`${API_BASE}/Task/${task._id}`, payload);
                showToast('Task updated successfully!', 'success');
            } else {
                // Create new task
                await axios.post(`${API_BASE}/Task`, payload);
                showToast('Task created successfully!', 'success');
            }

            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            showToast(error.response?.data?.message || 'Failed to save task', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${API_BASE}/Task/${task._id}`);
            showToast('Task deleted successfully!', 'success');
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Failed to delete task', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-linear-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'Add New Task'}</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-4">
                        {/* Task Title */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="taskTitle"
                                value={formData.taskTitle}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter task title"
                            />
                        </div>

                        {/* Task Description */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Task Description
                            </label>
                            <textarea
                                name="taskDescription"
                                value={formData.taskDescription}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter task description"
                            />
                        </div>

                        {/* Status and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="Todo">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-4">
                        {task && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                                    showDeleteConfirm 
                                    ? "bg-red-700 font-bold animate-pulse" 
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {showDeleteConfirm ? 'Sure?' : 'Delete Task'}
                            </button>
                        )}
                        <div className={`flex gap-3 ${!task ? 'ml-auto' : ''}`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            

        </div>
    );
};

export default TaskFormModal;
