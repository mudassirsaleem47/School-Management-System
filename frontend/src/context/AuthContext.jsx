import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api.js';

export const AuthContext = createContext();

const LOGIN_URL = `${API_URL}/AdminLogin`; 
const TEACHER_LOGIN_URL = `${API_URL}/TeacherLogin`;
const STUDENT_LOGIN_URL = `${API_URL}/StudentLogin`;

// Local Storage se data load karne ka function
const getInitialUser = () => {
    try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.warn("LocalStorage access denied:", error);
        return null;
    }
};      

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(getInitialUser); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSession, setActiveSession] = useState(() => {
        try {
            const s = localStorage.getItem('sms_activeSession');
            return s ? JSON.parse(s) : null;
        } catch { return null; }
    });

    // --- EFFECT: currentUser change hone par Local Storage update karna ---
    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.warn("LocalStorage access denied:", error);
        }
    }, [currentUser]);

    // --- EFFECT: Fetch Active Session on login/reload ---
    useEffect(() => {
        const fetchActiveSession = async () => {
            if (!currentUser) return;
            try {
                // For teachers or students, find their school ID
                const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
                const res = await axios.get(`${API_URL}/Sessions/Active/${schoolId}`);
                if (res.data.success) {
                    setActiveSession(res.data.session);
                    localStorage.setItem('sms_activeSession', JSON.stringify(res.data.session));
                }
            } catch (err) {
                console.error("Failed to fetch active session:", err);
            }
        };
        fetchActiveSession();
    }, [currentUser]);
    // ----------------------------------------------------------------------

    // Admin Login
    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(LOGIN_URL, credentials);
            const userData = { ...res.data, userType: 'admin' };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Populate LocalStorage with DB Settings 
            if (res.data.settings) {
                const s = res.data.settings;
                if (s.notifications) localStorage.setItem('sms_notificationPrefs', JSON.stringify(s.notifications));
                if (s.accentColor) localStorage.setItem('sms_accentColor', JSON.stringify(s.accentColor));
                if (s.borderRadius) localStorage.setItem('sms_borderRadius', s.borderRadius);
                if (s.fontSize) localStorage.setItem('sms_fontSize', s.fontSize);
                if (s.sidebarCompact !== undefined) localStorage.setItem('sms_sidebarCompact', String(s.sidebarCompact));
                if (s.animationsEnabled !== undefined) localStorage.setItem('sms_animations', String(s.animationsEnabled));
                if (s.preferences) localStorage.setItem('sms_appPreferences', JSON.stringify(s.preferences));
            }

            setCurrentUser(userData);
            setLoading(false);
            return userData; // Return full user data including type
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            setLoading(false);
            throw err;
        }
    };

    // Teacher Login
    const teacherLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(TEACHER_LOGIN_URL, credentials);
            const userData = { ...res.data.teacher, userType: 'teacher' };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            setCurrentUser(userData);
            setLoading(false);
            return userData; 
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            setLoading(false);
            throw err; 
        }
    };

    // Parent/Student Login
    const parentLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(STUDENT_LOGIN_URL, credentials);
            const userData = { ...res.data, userType: 'parent' }; // Treat student login as parent view
            localStorage.setItem('currentUser', JSON.stringify(userData));
            setCurrentUser(userData);
            setLoading(false);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            setLoading(false);
            throw err;
        }
    };

    // Staff Login (Accountant, etc.)
    const staffLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/StaffLogin`, credentials);
            const staff = res.data.staff;
            const role = staff.role || staff.designation;

            // Determine userType based on role for frontend routing (Case Insensitive)
            let userType = 'staff';
            const normalizeRole = role ? role.toLowerCase() : '';

            if (normalizeRole === 'accountant') userType = 'accountant';
            else if (normalizeRole === 'teacher') userType = 'teacher';
            else if (normalizeRole === 'receptionist') userType = 'receptionist';
            else if (normalizeRole === 'admin') userType = 'admin';

            const userData = { ...staff, userType: userType };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            setCurrentUser(userData);
            setLoading(false);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('currentUser');
        } catch (e) {
            console.warn("LocalStorage clear failed:", e);
        }
        setCurrentUser(null);
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, activeSession, setActiveSession, loading, error, login, teacherLogin, parentLogin, staffLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};