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
    // Initial state Local Storage se load kiya
    const [currentUser, setCurrentUser] = useState(getInitialUser); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
    // ----------------------------------------------------------------------

    // Admin Login
    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(LOGIN_URL, credentials);
            const userData = { ...res.data, userType: 'admin' };
            localStorage.setItem('currentUser', JSON.stringify(userData));
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
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, error, login, teacherLogin, parentLogin, staffLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};