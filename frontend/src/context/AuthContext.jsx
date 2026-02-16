import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api.js';

export const AuthContext = createContext();

const LOGIN_URL = `${API_URL}/AdminLogin`; 
const TEACHER_LOGIN_URL = `${API_URL}/TeacherLogin`;

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
            setCurrentUser(userData);
            setLoading(false);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Check server status.");
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
            setCurrentUser(userData);
            setLoading(false);
            return userData; 
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Check server status.");
            setLoading(false);
            throw err; 
        }
    };

    // Parent/Student Login
    const parentLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/StudentLogin`, credentials);
            const userData = { ...res.data, userType: 'parent' }; // Treat student login as parent view
            setCurrentUser(userData);
            setLoading(false);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Check server status.");
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        const userType = currentUser?.userType;
        setCurrentUser(null);
        setError(null);

        try {
            localStorage.clear();
        } catch (error) {
            console.warn("LocalStorage clear failed:", error);
        }

        setTimeout(() => {
            window.location.href = '/AdminLogin';
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, error, login, teacherLogin, parentLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};