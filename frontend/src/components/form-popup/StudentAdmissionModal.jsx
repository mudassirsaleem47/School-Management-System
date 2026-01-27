import React from 'react';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import StudentAdmissionForm from '../forms/StudentAdmissionForm';

const StudentAdmissionModal = ({ isOpen, onClose, onSuccess }) => {
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[90vh] ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Student Admission</h2>
                        <p className="text-gray-500 text-sm">Enter student details for admission</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 md:p-8">
                    <StudentAdmissionForm onSuccess={() => { if(onSuccess) onSuccess(); handleClose(); }} onCancel={handleClose} />
                </div>

            </div>
        </div>
    );
};

export default StudentAdmissionModal;
