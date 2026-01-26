import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, CheckSquare, Calendar as CalendarIcon, ArrowLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const API_BASE = "http://localhost:5000";

const TaskModal = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // Dropdown State
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const dropdownRef = useRef(null);

    // View State: 'list' or 'form'
    const [view, setView] = useState('list');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form/Selection State
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        taskTitle: '',
        taskDescription: '',
        status: 'Todo',
        dueDate: ''
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // If confirmation modal is open, don't close the dropdown
                if (document.querySelector('.confirmation-modal-overlay')) return;
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            fetchTasks(); // Fetch tasks when opened
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            setView('list'); // Reset view on close
        }, 150);
    };

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
            setView('list');
        }
    };

    // Populate form when editing
    useEffect(() => {
        if (selectedTask && view === 'form') {
            setFormData({
                taskTitle: selectedTask.taskTitle || '',
                taskDescription: selectedTask.taskDescription || '',
                status: selectedTask.status || 'Todo',
                dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0, 10) : ''
            });
        } else if (view === 'form') {
            // Reset for new task
            setFormData({
                taskTitle: '',
                taskDescription: '',
                status: 'Todo',
                dueDate: ''
            });
        }
    }, [selectedTask, view]);

    const fetchTasks = async () => {
        if (!currentUser?._id) return;
        try {
            const response = await axios.get(`${API_BASE}/Tasks/${currentUser._id}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setView('form');
    };

    const handleAddTask = () => {
        setSelectedTask(null);
        setView('form');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedTask(null);
        fetchTasks();
    };

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

            if (selectedTask) {
                await axios.put(`${API_BASE}/Task/${selectedTask._id}`, payload);
                showToast('Task updated successfully!', 'success');
            } else {
                await axios.post(`${API_BASE}/Task`, payload);
                showToast('Task created successfully!', 'success');
            }
            
            handleBackToList();
        } catch (error) {
            console.error('Error saving task:', error);
            showToast(error.response?.data?.message || 'Failed to save task', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`${API_BASE}/Task/${selectedTask._id}`);
            showToast('Task deleted successfully!', 'success');
            setShowDeleteConfirm(false);
            handleBackToList();
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Failed to delete task', 'error');
        } finally {
            setLoading(false);
        }
    };



    const handleStatusToggle = async (e, task) => {
        e.stopPropagation(); // Prevent opening the task details
        
        const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
        
        // Optimistic update
        setTasks(prev => prev.map(t => 
            t._id === task._id ? { ...t, status: newStatus } : t
        ));

        try {
            await axios.put(`${API_BASE}/Task/${task._id}`, {
                ...task,
                status: newStatus,
                schoolId: currentUser._id
            });
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert on error
            setTasks(prev => prev.map(t => 
                t._id === task._id ? { ...t, status: task.status } : t
            ));
            showToast('Failed to update status', 'error');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Task Icon Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Tasks"
            >
                <CheckSquare size={20} className="text-gray-700" />
                {tasks.filter(t => t.status !== 'Completed').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {tasks.filter(t => t.status !== 'Completed').length}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className={`task-panel ${isClosing ? 'task-panel-closing' : 'task-panel-opening'}`}>
                    
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                        <div className="flex items-center gap-2">
                             {view === 'form' ? (
                                <button 
                                    onClick={handleBackToList}
                                    className="p-1 -ml-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            ) : null}
                            <h3 className="font-bold text-gray-800">
                                {view === 'list' ? 'Tasks' : (selectedTask ? 'Edit Task' : 'New Task')}
                            </h3>
                        </div>
                        
                        <div className="flex items-center gap-1">
                             {view === 'list' && (
                                <button
                                    onClick={handleAddTask}
                                    className="flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition text-xs font-medium"
                                    title="Add Task"
                                >
                                    <Plus size={14} />
                                    Add Task
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        
                        {/* LIST VIEW */}
                        {view === 'list' && (
                            <div className="divide-y divide-gray-100">
                                {tasks.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No tasks yet</p>
                                    </div>
                                ) : (
                                    tasks.map((task) => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleTaskClick(task)}
                                            className="p-4 cursor-pointer transition bg-white hover:bg-gray-50 group relative"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox-like status indicator - Clickable */}
                                                <div 
                                                    onClick={(e) => handleStatusToggle(e, task)}
                                                    className={`flex-shrink-0 mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                                    task.status === 'Completed' ? 'bg-green-500 border-green-500 hover:bg-green-600' : 
                                                    'border-gray-300 bg-white hover:border-indigo-500'
                                                }`}>
                                                    {task.status === 'Completed' && <Check size={14} strokeWidth={3} className="text-white" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className={`text-sm font-medium text-gray-800 transition-all ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>
                                                            {task.taskTitle}
                                                        </h4>
                                                    </div>
                                                    
                                                    {task.taskDescription && (
                                                        <p className={`text-xs text-gray-500 line-clamp-1 mb-1.5 ${task.status === 'Completed' ? 'text-gray-300' : ''}`}>
                                                            {task.taskDescription}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                        {task.dueDate && (
                                                            <div className="flex items-center gap-1">
                                                                <CalendarIcon size={10} />
                                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* FORM VIEW */}
                        {view === 'form' && (
                            <form onSubmit={handleSubmit} className="p-4 space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        name="taskTitle"
                                        value={formData.taskTitle}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm outline-none"
                                        placeholder="what needs to be done?"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="taskDescription"
                                        value={formData.taskDescription}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm outline-none resize-none"
                                        placeholder="Add details..."
                                    />
                                </div>

                                {/* Status dropdown removed as per request */}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm outline-none"
                                    />
                                </div>

                                <div className="pt-2 flex gap-2">
                                    {selectedTask && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (showDeleteConfirm) {
                                                    handleDelete();
                                                } else {
                                                    setShowDeleteConfirm(true);
                                                    // Auto-reset after 3 seconds if not clicked
                                                    setTimeout(() => setShowDeleteConfirm(false), 3000);
                                                }
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                                showDeleteConfirm 
                                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                        >
                                            {showDeleteConfirm ? 'Sure?' : 'Delete'}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-md transition disabled:opacity-70"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <style jsx>{`
                        .task-panel {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            margin-top: 0.5rem;
                            width: 20rem;
                            background-color: white;
                            border-radius: 0.5rem;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                            border: 1px solid #e5e7eb;
                            z-index: 50;
                            height: auto;
                            max-height: 24rem;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                            transform-origin: top right;
                        }
                        
                        /* Ensure it doesn't go off-screen on mobile */
                        @media (max-width: 640px) {
                            .task-panel {
                                position: fixed;
                                top: 4rem;
                                left: 1rem;
                                right: 1rem;
                                width: auto;
                                max-height: calc(100vh - 6rem);
                            }
                        }

                        .task-panel-opening {
                            animation: slideDownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }

                        .task-panel-closing {
                            animation: scaleFadeOut 0.15s ease-in forwards;
                        }

                        @keyframes slideDownFadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-8px) scale(0.96);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }

                        @keyframes scaleFadeOut {
                            from {
                                opacity: 1;
                                transform: scale(1);
                            }
                            to {
                                opacity: 0;
                                transform: scale(0.96);
                            }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default TaskModal;
