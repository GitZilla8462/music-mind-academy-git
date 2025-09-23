// AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const setAuthHeader = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);
                setIsAuthenticated(true);
                setAuthHeader(storedToken);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_role');
                setAuthHeader(null);
            }
        }
        setLoading(false);
    }, []);

    // ✅ FIXED: Updated login function to accept usernameOrEmail
    const login = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            console.log('🚀 Attempting login for:', usernameOrEmail);
            
            // ✅ Check if the input is an email address
            const payload = usernameOrEmail.includes('@')
                ? { email: usernameOrEmail, password }
                : { name: usernameOrEmail, password };

            const res = await axios.post('http://localhost:5000/api/auth/login', payload);
            console.log('✅ Login response received:', res.data);
            
            const { token: newToken, user: userData } = res.data;
            
            if (!newToken || !userData) {
                setLoading(false);
                return { success: false, error: 'Invalid server response' };
            }
            
            localStorage.setItem('token', newToken);
            localStorage.setItem('user_role', userData.role);
            localStorage.setItem('user_data', JSON.stringify(userData));
            
            setAuthHeader(newToken);
            
            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
            
            if (userData.role === 'teacher') {
                navigate('/teacher');
            } else if (userData.role === 'student') {
                navigate('/student');
            } else if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            
            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Login failed. Please try again.' 
            };
        }
    };

    // ... (rest of AuthContext.jsx remains unchanged)
    const register = async (name, email, password, role = 'student') => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { 
                name, email, password, role 
            });
            setLoading(false);
            return { success: true, message: 'Registration successful! Please log in.' };
        } catch (error) {
            console.error('Registration failed:', error);
            setLoading(false);
            return { 
                success: false, 
                error: error.response?.data?.msg || 'Registration failed' 
            };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        setAuthHeader(null);
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            token, 
            user, 
            login, 
            register, 
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

