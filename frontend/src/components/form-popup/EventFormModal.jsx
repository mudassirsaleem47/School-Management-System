import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';


const API_BASE = "http://localhost:5000";

const EventFormModal = ({ isOpen, onClose, selectedDate, event }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        eventTitle: '',
        eventDescription: '',
        eventFrom: '',
        eventTo: '',
        eventColor: '#3b82f6',
        eventType: 'Other',
        visibility: 'Public'
    });

    const eventColors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Indigo', value: '#6366f1' }
    ];

    useEffect(() => {
        if (event) {
            // Edit mode
            setFormData({
                eventTitle: event.eventTitle || '',
                eventDescription: event.eventDescription || '',
                eventFrom: event.eventFrom ? new Date(event.eventFrom).toISOString().slice(0, 16) : '',
                eventTo: event.eventTo ? new Date(event.eventTo).toISOString().slice(0, 16) : '',
                eventColor: event.eventColor || '#3b82f6',
                eventType: event.eventType || 'Other',
                visibility: event.visibility || 'Public'
            });
        } else if (selectedDate) {
            // Create mode with selected date
            const dateStr = selectedDate.toISOString().slice(0, 10);
            setFormData({
                eventTitle: '',
                eventDescription: '',
                eventFrom: `${dateStr}T09:00`,
                eventTo: `${dateStr}T17:00`,
                eventColor: '#3b82f6',
                eventType: 'Other',
                visibility: 'Public'
            });
        }
    }, [event, selectedDate]);

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

            if (event) {
                // Update existing event
                await axios.put(`${API_BASE}/Event/${event._id}`, payload);
                showToast('Event updated successfully!', 'success');
            } else {
                // Create new event
                await axios.post(`${API_BASE}/Event`, payload);
                showToast('Event created successfully!', 'success');
            }

            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            showToast(error.response?.data?.message || 'Failed to save event', 'error');
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
            await axios.delete(`${API_BASE}/Event/${event._id}`);
            showToast('Event deleted successfully!', 'success');
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('Failed to delete event', 'error');
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
                    <h2 className="text-xl font-bold">{event ? 'Edit Event' : 'Add New Event'}</h2>
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
                        {/* Event Title */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="eventTitle"
                                value={formData.eventTitle}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter event title"
                            />
                        </div>

                        {/* Event Description */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event Description
                            </label>
                            <textarea
                                name="eventDescription"
                                value={formData.eventDescription}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter event description"
                            />
                        </div>

                        {/* Event From */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event From <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="eventFrom"
                                value={formData.eventFrom}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Event To */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event To <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="eventTo"
                                value={formData.eventTo}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Event Color */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {eventColors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, eventColor: color.value }))}
                                        className={`w-6 h-6 rounded-full border-2 transition hover:scale-130 ${
                                            formData.eventColor === color.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Event Type
                            </label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="Academic">Academic</option>
                                <option value="Holiday">Holiday</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Exam">Exam</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Visibility
                            </label>
                            <div className="space-y-2 flex gap-6 items-center">
                                {['Public', 'Private','Super Admin'].map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value={option}
                                            checked={formData.visibility === option}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-4">
                        {event && (
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
                                {showDeleteConfirm ? 'Sure?' : 'Delete Event'}
                            </button>
                        )}
                        <div className={`flex gap-3 ${!event ? 'ml-auto' : ''}`}>
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
                                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            

        </div>
    );
};

export default EventFormModal;
