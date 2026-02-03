import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from './AuthContext';
import API_URL from '../config/api.js';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);
    
    const { currentUser } = useAuth();

    // Get userId from AuthContext
    useEffect(() => {
        if (currentUser && currentUser._id) {
            setUserId(currentUser._id);
        } else {
            setUserId(null);
        }
    }, [currentUser]);

    // Fetch notifications from backend when userId is available
    useEffect(() => {
        if (userId) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            if (!userId) return;
            
            const response = await axios.get(`${API_URL}/Notifications/${userId}`);
            if (response.data.success) {
                // Convert backend format to frontend format
                const formattedNotifications = response.data.notifications.map(notif => ({
                    id: notif._id,
                    message: notif.message,
                    type: notif.type,
                    timestamp: notif.timestamp,
                    read: notif.read
                }));
                setNotifications(formattedNotifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const showToast = async (message, type = 'success') => {
        // Use Sonner toast based on type
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast.info(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            default:
                toast(message);
        }
        
        // Add to notification history in backend
        try {
            if (userId) {
                const response = await axios.post(`${API_URL}/NotificationCreate`, {
                    userId,
                    message,
                    type
                });

                if (response.data.success) {
                    // Add to local state immediately
                    const newNotification = {
                        id: response.data.notification._id,
                        message: response.data.notification.message,
                        type: response.data.notification.type,
                        timestamp: response.data.notification.timestamp,
                        read: false
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                }
            }
        } catch (error) {
            console.error('Failed to save notification:', error);
            // Fallback to local state if backend fails (no persistence)
            const newNotification = {
                id: Date.now() + Math.random(),
                message,
                type,
                timestamp: new Date().toISOString(),
                read: false
            };
            setNotifications(prev => [newNotification, ...prev]);
        }
    };

    const markAsRead = async (id) => {
        try {
            // Update backend
            await axios.put(`${API_URL}/Notification/${id}/read`);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Still update local state even if backend fails
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        }
    };

    const clearNotifications = async () => {
        try {
            if (userId) {
                // Clear from backend
                await axios.delete(`${API_URL}/Notifications/clear-all/${userId}`);
            }
            // Clear local state
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            // Still clear local state even if backend fails
            setNotifications([]);
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, notifications, markAsRead, clearNotifications, fetchNotifications }}>
            {children}
        </ToastContext.Provider>
    );
};
