// AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Temporary fix: hardcode production URL since REACT_APP_API_URL isn't being loaded by Vercel
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? ''
  : 'http://localhost:5000';

console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 Using API base URL:', API_BASE_URL);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_role');
            }
        }
        setLoading(false);
    }, []);

    // Helper function to make API requests
    const apiRequest = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('🌐 Making API request to:', url); // Debug log
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.msg || errorData.message || 'API request failed');
        }
        
        return response.json();
    };

    const login = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            console.log('[Launch] Attempting login for:', usernameOrEmail);
            console.log('🔍 Using API base URL:', API_BASE_URL);
            
            // Check if the input is an email address
            const payload = usernameOrEmail.includes('@')
                ? { email: usernameOrEmail, password }
                : { name: usernameOrEmail, password };

            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log('[OK] Login response received:', data);
            
            const { token: newToken, user: userData } = data;
            
            if (!newToken || !userData) {
                setLoading(false);
                return { success: false, error: 'Invalid server response' };
            }
            
            localStorage.setItem('token', newToken);
            localStorage.setItem('user_role', userData.role);
            localStorage.setItem('user_data', JSON.stringify(userData));
            
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
            console.error('Login error:', error);
            setLoading(false);
            return { 
                success: false, 
                error: error.message || 'Login failed. Please try again.' 
            };
        }
    };

    const register = async (name, email, password, role = 'student') => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, role })
            });
            
            setLoading(false);
            return { success: true, message: 'Registration successful! Please log in.' };
        } catch (error) {
            console.error('Registration failed:', error);
            setLoading(false);
            return { 
                success: false, 
                error: error.message || 'Registration failed' 
            };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
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