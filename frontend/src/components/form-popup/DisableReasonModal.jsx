import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const DisableReasonModal = ({ isOpen, onClose, onConfirm, studentName }) => {
    const { shouldRender, animationClass } = useModalAnimation(isOpen);
    const [formData, setFormData] = useState({
        reason: '',
        description: ''
    });
    const [error, setError] = useState('');

    if (!shouldRender) return null;

    const reasons = [
        'Left School',
        'Transferred',
        'Expelled',
        'Medical',
        'Financial',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.reason) {
            setError('Please select a reason');
            return;
        }

        onConfirm(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({ reason: '', description: '' });
        setError('');
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${animationClass}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Disable Student</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Disabling: <span className="font-600 text-gray-900">{studentName}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Reason Dropdown */}
                    <div>
                        <label className="block text-sm font-600 text-gray-700 mb-2">
                            Reason for Disabling <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.reason}
                            onChange={(e) => {
                                setFormData({ ...formData, reason: e.target.value });
                                setError('');
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                            required
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label className="block text-sm font-600 text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add additional details about why this student is being disabled..."
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-600 mb-1">Warning</p>
                            <p>This student will be moved to the disabled students list and will no longer appear in active students.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-600"
                        >
                            Disable Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisableReasonModal;
