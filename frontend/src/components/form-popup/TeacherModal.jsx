import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const TeacherModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    // Form state - if initialData exists (Edit mode), use it, otherwise keep empty
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        subject: '',
        qualification: '',
        experience: 0,
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });

    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    
    // When initialData changes (Edit button clicked), fill the form
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : '',
                // Don't include password in edit mode
                password: ''
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                subject: '',
                qualification: '',
                experience: 0,
                salary: '',
                joiningDate: new Date().toISOString().split('T')[0]
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
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-7 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-black-700">
                            {initialData ? 'Edit Teacher' : 'Add New Teacher'}
                        </h2>
                        <p className="text-black-100 text-sm mt-1">
                            {initialData ? 'Update the teacher details below' : 'Fill in the details to add a new teacher'}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-white hover:bg-indigo-500 p-2 rounded-lg transition duration-150"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="space-y-5">
                        
                        {/* Row 1: Name, Email, Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Full Name *</label>
                                <input 
                                    name="name" 
                                    placeholder="Enter teacher's full name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Email *</label>
                                <input 
                                    name="email" 
                                    type="email" 
                                    placeholder="teacher@example.com" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Password {!initialData && '*'}
                                </label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    placeholder={initialData ? "Leave blank to keep current" : "Minimum 6 characters"} 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required={!initialData}
                                    minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Row 2: Phone, Subject, Qualification */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Phone Number *</label>
                                <input 
                                    name="phone" 
                                    type="tel" 
                                    placeholder="Enter phone number" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Subject *</label>
                                <input 
                                    name="subject" 
                                    placeholder="e.g., Mathematics, Science" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Qualification *</label>
                                <input 
                                    name="qualification" 
                                    placeholder="e.g., B.Ed, M.Sc" 
                                    value={formData.qualification} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Row 3: Experience, Salary, Joining Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Experience (Years)</label>
                                <input 
                                    name="experience" 
                                    type="number" 
                                    min="0" 
                                    placeholder="Years of experience" 
                                    value={formData.experience} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Salary *</label>
                                <input 
                                    name="salary" 
                                    type="number" 
                                    min="0" 
                                    placeholder="Monthly salary" 
                                    value={formData.salary} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Joining Date</label>
                                <input 
                                    name="joiningDate" 
                                    type="date" 
                                    value={formData.joiningDate} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl"
                        >
                            {initialData ? 'Update Teacher' : 'Save Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherModal;
