import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const EnquiryModal = ({ isOpen, onClose, onSubmit, initialData, classesList, teachersList, viewMode = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        assigned: '',
        reference: '',
        class: '',
        noOfChild: 1
    });

    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                date: initialData.date ? initialData.date.split('T')[0] : '',
                class: initialData.class?._id || '',
                assigned: initialData.assigned?._id || ''
            };
            setFormData(formattedData);
        }
    }, [initialData]);
    
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
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {viewMode ? 'View Enquiry Details' : (initialData ? 'Edit Enquiry' : 'Add New Enquiry')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                            {viewMode ? 'Read-only view of enquiry information' : (initialData ? 'Update the enquiry details below' : 'Fill in the details to create a new enquiry')}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150 shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                {viewMode ? (
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Student Information Card */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Student Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Full Name</p>
                                        <p className="text-base font-600 text-gray-900">{formData.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Phone</p>
                                        <p className="text-base font-600 text-gray-900">{formData.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Email</p>
                                        <p className="text-base font-600 text-gray-900">{formData.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Address</p>
                                        <p className="text-base font-600 text-gray-900">{formData.address || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Number of Children</p>
                                        <p className="text-base font-600 text-gray-900">{formData.noOfChild || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Admission Details Card */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Admission Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Class</p>
                                        <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-600">
                                            {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Assigned Teacher</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {teachersList.find(t => t._id === formData.assigned)?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Enquiry Date</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {formData.date ? new Date(formData.date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description Card */}
                            {formData.description && (
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-100 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Description
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.description}</p>
                                </div>
                            )}

                            {/* Admin Note Card */}
                            {formData.note && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Admin Note
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.note}</p>
                                </div>
                            )}

                            {/* Reference Card */}
                            {formData.reference && (
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
                                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Reference
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.reference}</p>
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Full Name *</label>
                                    <input name="name" placeholder="Enter student name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Phone *</label>
                                    <input name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Email</label>
                                    <input name="email" type="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Address</label>
                                    <input name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Date *</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Select Class *</label>
                                    <select name="class" value={formData.class} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
                                        <option value="">Choose a class</option>
                                        {classesList.map((cls) => (<option key={cls._id} value={cls._id}>{cls.sclassName}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Assign Teacher</label>
                                    <select name="assigned" value={formData.assigned} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
                                        <option value="">Select teacher</option>
                                        {teachersList.map((teacher) => (<option key={teacher._id} value={teacher._id}>{teacher.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Number of Children</label>
                                    <input name="noOfChild" type="number" min="1" placeholder="Enter number" value={formData.noOfChild} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Description</label>
                                <textarea name="description" placeholder="Enter enquiry description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" rows="2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Admin Note (Private)</label>
                                <textarea name="note" placeholder="Add internal notes (only visible to admins)" value={formData.note} onChange={handleChange} className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-amber-50 transition resize-none" rows="2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Reference (Optional)</label>
                                <textarea name="reference" placeholder="How did they know about us?" value={formData.reference} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" rows="1"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button type="button" onClick={handleClose} className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150">Cancel</button>
                            <button type="submit" className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl">{initialData ? 'Update Enquiry' : 'Save Enquiry'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EnquiryModal;