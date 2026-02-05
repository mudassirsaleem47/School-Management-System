import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL;

const StudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { currentUser } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        rollNum: '',
        password: '',
        sclassName: '',
        status: 'Active'
    });

    const [classesList, setClassesList] = useState([]);
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    
    // Fetch classes for dropdown
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchClasses();
        }
    }, [isOpen, currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClassesList(res.data);
        } catch (err) {
            // Silent fail - classes will be empty
        }
    };
    
    // When initialData changes (Edit button clicked), fill the form
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                name: initialData.name || '',
                rollNum: initialData.rollNum || '',
                password: '', // Don't include password in edit mode
                sclassName: initialData.sclassName?._id || '',
                status: initialData.status || 'Active'
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                rollNum: '',
                password: '',
                sclassName: ''
            });
        }
    }, [initialData]);
    
    // If modal is closed, don't render anything
    if (!isVisible) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-7 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-black-700">
                            {initialData ? 'Edit Student' : 'Add New Student'}
                        </h2>
                        <p className="text-black-100 text-sm mt-1">
                            {initialData ? 'Update the student details below' : 'Fill in the details to admit a new student'}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="space-y-5">
                        
                        {/* Row 1: Name and Roll Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Full Name *</label>
                                <input 
                                    name="name" 
                                    placeholder="Enter student's full name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Roll Number *</label>
                                <input 
                                    name="rollNum" 
                                    type="number"
                                    placeholder="Enter roll number" 
                                    value={formData.rollNum} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Row 2: Password and Class */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Password {!initialData && '*'}
                                </label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    placeholder={initialData ? "Leave blank to keep current" : "Temporary password"} 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required={!initialData}
                                    minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Select Class *</label>
                                <select 
                                    name="sclassName" 
                                    value={formData.sclassName} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                >
                                    <option value="">Choose a class</option>
                                    {classesList.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            {initialData && (
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Status</label>
                                    <select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Disabled">Disabled</option>
                                    </select>
                                </div>
                            )}
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
                            className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl"
                        >
                            {initialData ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
