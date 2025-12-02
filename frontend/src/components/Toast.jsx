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
        }, 3000); // Auto close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 100); // Wait for exit animation to complete
    };

    const baseStyles = "fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl";
    const typeStyles = type === 'success' 
        ? "bg-white border-l-4 border-green-500 text-gray-800" 
        : "bg-white border-l-4 border-red-500 text-gray-800";
    const animationStyles = isExiting ? "animate-slide-out" : "animate-slide-in";

    return (
        <div className={`${baseStyles} ${typeStyles} ${animationStyles} z-999`}>
            {type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
                <XCircle className="w-6 h-6 text-red-500" />
            )}
            
            <div className="flex-1">
                <h3 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Error'}</h3>
                <p className="text-sm text-gray-600">{message}</p>
            </div>

            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
