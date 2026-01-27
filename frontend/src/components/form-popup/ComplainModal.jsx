import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const ComplainModal = ({ isOpen, onClose, onSubmit, initialData = null, viewMode = false }) => {
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    const [showFullImage, setShowFullImage] = useState(false);

    const [formData, setFormData] = useState({
        complainBy: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        actionTaken: '',
        assigned: '',
        note: '',
        document: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                complainBy: initialData.complainBy || '',
                phone: initialData.phone || '',
                date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                description: initialData.description || '',
                actionTaken: initialData.actionTaken || '',
                assigned: initialData.assigned || '',
                note: initialData.note || '',
                document: initialData.document || ''
            });
        } else {
            setFormData({
                complainBy: '',
                phone: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                actionTaken: '',
                assigned: '',
                note: '',
                document: ''
            });
        }
    }, [initialData]);

    const fileInputRef = useRef(null);

    if (!isVisible) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, document: file }));
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, document: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return createPortal(
        <div className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-6 rounded-t-2xl flex justify-between items-start gap-4 border-b border-gray-100">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {viewMode ? 'View Complain Details' : (initialData ? 'Edit Complain' : 'Add Complain')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {viewMode ? 'Read-only view of complain information' : (initialData ? 'Update the complain details below' : 'Fill in the details to record a new complain')}
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
                    /* VIEW MODE */
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Complain Information */}
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Complain Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Complain By</p>
                                        <p className="text-base font-600 text-gray-900">{formData.complainBy || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Phone</p>
                                        <p className="text-base font-600 text-gray-900">{formData.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Date</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {formData.date ? new Date(formData.date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Details */}
                            {(formData.actionTaken || formData.assigned) && (
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Action Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {formData.assigned && (
                                            <div>
                                                <p className="text-xs font-600 text-gray-500 uppercase mb-1">Assigned To</p>
                                                <p className="text-base font-600 text-gray-900">{formData.assigned}</p>
                                            </div>
                                        )}
                                        {formData.actionTaken && (
                                            <div>
                                                <p className="text-xs font-600 text-gray-500 uppercase mb-1">Action Taken</p>
                                                <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.actionTaken}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 col-span-full">
                                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Description
                                </h3>
                                <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.description || '-'}</p>
                            </div>

                            {/* Note */}
                            {formData.note && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100 col-span-full">
                                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Note
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.note}</p>
                                </div>
                            )}

                            {/* Attached Document/Image */}
                            {formData.document && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100 col-span-full">
                                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        Attached Document
                                    </h3>
                                    {(() => {
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(formData.document);
                                        const fileUrl = `http://localhost:5000/${formData.document}`;
                                        
                                        if (isImage) {
                                            return (
                                                <div className="space-y-3">
                                                    <div 
                                                        onClick={() => setShowFullImage(true)}
                                                        className="cursor-pointer group relative inline-block rounded-lg overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition"
                                                    >
                                                        <img 
                                                            src={fileUrl} 
                                                            alt="Attached document" 
                                                            className="max-h-48 object-contain group-hover:opacity-90 transition"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Click to view full size</p>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <a 
                                                    href={fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download Document
                                                </a>
                                            );
                                        }
                                    })()}
                                </div>
                            )}
                        </div>

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
                    /* FORM MODE */
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-5">
                            {/* Row 1: Complain By, Phone, Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Complain By *</label>
                                    <input
                                        name="complainBy"
                                        value={formData.complainBy}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter name"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Phone</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Date *</label>
                                    <input
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Description */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    placeholder="Enter complaint description"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                />
                            </div>

                            {/* Row 3: Assigned, Action Taken */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Assigned</label>
                                    <input
                                        name="assigned"
                                        value={formData.assigned}
                                        onChange={handleChange}
                                        placeholder="Assign to person/department"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Action Taken</label>
                                    <textarea
                                        name="actionTaken"
                                        value={formData.actionTaken}
                                        onChange={handleChange}
                                        rows="1"
                                        placeholder="Enter action taken"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Note, Attach Document */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Note</label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows="1"
                                        placeholder="Additional notes"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Attach Document</label>
                                    <div 
                                        onClick={handleFileClick}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-lg transition h-[46px] cursor-pointer ${formData.document ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        
                                        {formData.document ? (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-sm text-indigo-700 font-medium truncate max-w-[180px]">
                                                        {formData.document instanceof File 
                                                            ? formData.document.name 
                                                            : (typeof formData.document === 'string' && formData.document.includes('uploads') 
                                                                ? formData.document.split(/[\\/]/).pop() 
                                                                : formData.document)
                                                        }
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="text-indigo-400 hover:text-indigo-700 transition p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <span className="text-sm text-gray-500 truncate">Click to attach file</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                {initialData ? 'Update Complain' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            </div>

            {/* Full-Size Image Viewer */}
            {showFullImage && formData.document && (
                <div 
                    className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setShowFullImage(false)}
                >
                    <button 
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 p-2 rounded-lg transition"
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={`http://localhost:5000/${formData.document}`}
                        alt="Full size view"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>,
        document.body
    );
};

export default ComplainModal;
