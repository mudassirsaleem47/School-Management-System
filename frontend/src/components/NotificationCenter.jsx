import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellDot, CheckCircle, XCircle, Trash2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { notifications, markAsRead, clearNotifications } = useToast();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 150); // Match animation duration
    };

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notifTime) / 60000);
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const handleNotificationClick = (id) => {
        markAsRead(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
                {unreadCount > 0 ? (
                    <BellDot size={20} className="text-blue-600" />
                ) : (
                    <Bell size={20} />
                )}
                
                {/* Badge Counter */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className={`notification-panel ${isClosing ? 'notification-panel-closing' : 'notification-panel-opening'}`}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearNotifications}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                <Trash2 size={14} />
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={40} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`p-4 cursor-pointer transition ${
                                            notification.read 
                                                ? 'bg-white hover:bg-gray-50' 
                                                : 'bg-blue-50 hover:bg-blue-100'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {notification.type === 'success' ? (
                                                    <CheckCircle size={18} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={18} className="text-red-500" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${
                                                    notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>

                                            {/* Unread Indicator */}
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <style jsx>{`
                        .notification-panel {
                            position: absolute;
                            right: 0;
                            margin-top: 0.5rem;
                            width: 20rem;
                            background-color: white;
                            border-radius: 0.5rem;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                            border: 1px solid #e5e7eb;
                            z-index: 50;
                            max-height: 24rem;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                        }

                        .notification-panel-opening {
                            animation: slideDownFadeIn 0.15s ease-out forwards;
                            -webkit-animation: slideDownFadeIn 0.15s ease-out forwards;
                        }

                        .notification-panel-closing {
                            animation: fadeOut 0.15s ease-in forwards;
                            -webkit-animation: fadeOut 0.15s ease-in forwards;
                        }

                        @keyframes slideDownFadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-10px) scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }

                        @-webkit-keyframes slideDownFadeIn {
                            from {
                                opacity: 0;
                                -webkit-transform: translateY(-10px) scale(0.95);
                            }
                            to {
                                opacity: 1;
                                -webkit-transform: translateY(0) scale(1);
                            }
                        }

                        @keyframes fadeOut {
                            from {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                            to {
                                opacity: 0;
                                transform: translateY(-10px) scale(0.95);
                            }
                        }

                        @-webkit-keyframes fadeOut {
                            from {
                                opacity: 1;
                                -webkit-transform: translateY(0) scale(1);
                            }
                            to {
                                opacity: 0;
                                -webkit-transform: translateY(-10px) scale(0.95);
                            }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
