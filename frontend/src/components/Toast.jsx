import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                onClose();
            }, 100); // Wait for exit animation to complete
        }, 2000); // Auto close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 100); // Wait for exit animation to complete
    };

    const baseStyles = "fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-4 rounded-xl shadow-lg min-w-[400px]";
    const typeStyles = type === 'success' 
        ? "bg-green-50 border-2 border-green-200 text-gray-800"
        : "bg-red-50 border-2 border-red-200 text-gray-800";
    const animationStyles = isExiting ? "animate-slide-out" : "animate-slide-in";

    return (
        <div className={`${baseStyles} ${typeStyles} ${animationStyles}`}>
            <div className={`rounded-full p-1 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                    <XCircle className="w-5 h-5 text-white" />
                )}
            </div>
            
            <div className="flex-1">
                <h3 className="font-bold text-base">{type === 'success' ? 'Success!' : 'Error!'}</h3>
                <p className="text-sm text-gray-700">{message}</p>
            </div>

            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
