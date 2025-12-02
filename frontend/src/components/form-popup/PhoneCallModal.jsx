import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const PhoneCallModal = ({ isOpen, onClose, onSubmit, initialData = null, viewMode = false }) => {
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);

    const [formData, setFormData] = useState({
        callerName: '',
        phone: '',
        callType: 'Incoming',
        callDate: '',
        callTime: '',
        purpose: '',
        callDuration: '',
        followUpRequired: false,
        followUpDate: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                callerName: initialData.callerName || '',
                phone: initialData.phone || '',
                callType: initialData.callType || 'Incoming',
                callDate: initialData.callDate ? new Date(initialData.callDate).toISOString().split('T')[0] : '',
                callTime: initialData.callTime || '',
                purpose: initialData.purpose || '',
                callDuration: initialData.callDuration || '',
                followUpRequired: initialData.followUpRequired || false,
                followUpDate: initialData.followUpDate ? new Date(initialData.followUpDate).toISOString().split('T')[0] : '',
                notes: initialData.notes || ''
            });
        } else {
            // Reset form for new entry
            setFormData({
                callerName: '',
                phone: '',
                callType: 'Incoming',
                callDate: '',
                callTime: '',
                purpose: '',
                callDuration: '',
                followUpRequired: false,
                followUpDate: '',
                notes: ''
            });
        }
    }, [initialData]);

    if (!isVisible) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return createPortal(
        <div className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {viewMode ? 'View Phone Call Details' : (initialData ? 'Edit Phone Call' : 'Add Phone Call')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                            {viewMode ? 'Read-only view of phone call information' : (initialData ? 'Update the phone call details below' : 'Fill in the details to record a new phone call')}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150 flex-shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Conditional Rendering */}
                {viewMode ? (
                    /* VIEW MODE - Card-based Display */
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Call Information Card */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Caller Name</p>
                                        <p className="text-base font-600 text-gray-900">{formData.callerName || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Phone Number</p>
                                        <p className="text-base font-600 text-gray-900">{formData.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Call Type</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-600 ${
                                            formData.callType === 'Incoming' 
                                                ? 'bg-green-200 text-green-800' 
                                                : 'bg-blue-200 text-blue-800'
                                        }`}>
                                            {formData.callType === 'Incoming' ? '📞 Incoming' : '📱 Outgoing'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Duration</p>
                                        <p className="text-base font-600 text-gray-900">{formData.callDuration || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Call Schedule Card */}
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Call Schedule
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Date</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {formData.callDate ? new Date(formData.callDate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Time</p>
                                        <p className="text-base font-600 text-gray-900">{formData.callTime || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Purpose Card */}
                            {formData.purpose && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                    <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Purpose
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.purpose}</p>
                                </div>
                            )}

                            {/* Follow-up Card */}
                            {formData.followUpRequired && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Follow-up Required
                                    </h3>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Follow-up Date</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {formData.followUpDate ? new Date(formData.followUpDate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes Card */}
                            {formData.notes && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-100 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Notes
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
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
                    /* EDIT/ADD MODE - Form */
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-5">
                            
                            {/* Row 1: Caller Name & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Caller Name *</label>
                                    <input
                                        type="text"
                                        name="callerName"
                                        value={formData.callerName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter caller name"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Call Type - Radio Buttons */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-3">Call Type *</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="callType"
                                            value="Incoming"
                                            checked={formData.callType === 'Incoming'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-700">📞 Incoming</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="callType"
                                            value="Outgoing"
                                            checked={formData.callType === 'Outgoing'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-700">📱 Outgoing</span>
                                    </label>
                                </div>
                            </div>

                            {/* Row 3: Date, Time & Duration */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Call Date *</label>
                                    <input
                                        type="date"
                                        name="callDate"
                                        value={formData.callDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Call Time *</label>
                                    <input
                                        type="time"
                                        name="callTime"
                                        value={formData.callTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        name="callDuration"
                                        value={formData.callDuration}
                                        onChange={handleChange}
                                        placeholder="e.g., 5 mins"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Purpose */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Purpose</label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Enter purpose of call"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                />
                            </div>

                            {/* Row 5: Follow-up Required */}
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="followUpRequired"
                                    checked={formData.followUpRequired}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                                />
                                <label className="text-sm font-600 text-gray-700 cursor-pointer">
                                    Follow-up Required
                                </label>
                            </div>

                            {/* Row 6: Follow-up Date (Conditional) */}
                            {formData.followUpRequired && (
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Follow-up Date</label>
                                    <input
                                        type="date"
                                        name="followUpDate"
                                        value={formData.followUpDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            )}

                            {/* Row 7: Notes */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Additional Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Any additional notes..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                />
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
                                {initialData ? 'Update Call' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            </div>
        </div>,
        document.body
    );
};

export default PhoneCallModal;
