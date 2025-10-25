// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '', // [OK] Change 'email' to 'usernameOrEmail'
        password: ''
    });
    const [error, setError] = useState('');
    
    const { login, loading } = useAuth();
    const { usernameOrEmail, password } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        
        // [OK] Call the updated login function with both username and password
        const result = await login(usernameOrEmail, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
            {error && (
                <div className="p-3 text-red-600 bg-red-100 border border-red-300 rounded-lg">
                    {error}
                </div>
            )}
            <input
                type="text" // [OK] Change input type to 'text'
                placeholder="Email or Username" // [OK] Update placeholder
                name="usernameOrEmail"
                value={usernameOrEmail}
                onChange={onChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
            />
            <button 
                type="submit"
                disabled={loading}
                className="w-full p-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;