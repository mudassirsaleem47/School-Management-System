import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import API_URL from '../../config/api.js';
import { X, Briefcase, FileText } from 'lucide-react';

const DesignationModal = ({ designation, onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: designation?.name || '',
        description: designation?.description || '',
        isActive: designation?.isActive || 'active'
    });

    const isOpen = true;
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, () => onClose(false));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name) {
            showToast('Designation name is required', 'error');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                school: currentUser._id
            };

            if (designation) {
                // Update
                const response = await axios.put(`${API_URL}/Designation/${designation._id}`, payload);
                if (response.data.success) {
                    showToast('Designation updated successfully', 'success');
                    onClose(true);
                }
            } else {
                // Create
                const response = await axios.post(`${API_URL}/Designation`, payload);
                if (response.data.success) {
                    showToast('Designation created successfully', 'success');
                    onClose(true);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save designation';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/70  ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                    
                    {/* Header */}
                    <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-7 h-7 text-indigo-600" />
                                {designation ? 'Edit Designation' : 'Add Designation'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-2">
                                {designation ? 'Update designation details below' : 'Create a new designation for staff members'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150 shrink-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-5">
                            
                            {/* Designation Name */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Designation Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Principal, Lab Assistant, Vice Principal"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Description
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of this designation"
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="isActive"
                                    value={formData.isActive}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : (designation ? 'Update Designation' : 'Add Designation')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DesignationModal;
