// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { register, loading } = useAuth();
    const { name, email, password, role } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        const result = await register(name, email, password, role);
        if (result.success) {
            setSuccess(result.message);
            // Clear form
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'student'
            });
            // Trigger event to switch to login after 2 seconds
            setTimeout(() => {
                window.dispatchEvent(new Event('registrationSuccess'));
            }, 2000);
        } else {
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
            {success && (
                <div className="p-3 text-green-600 bg-green-100 border border-green-300 rounded-lg">
                    {success}
                </div>
            )}
            <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={name}
                onChange={onChange}
                required
                autoComplete="name"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={onChange}
                required
                autoComplete="email"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
                autoComplete="new-password"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                name="role"
                value={role}
                onChange={onChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
            </select>
            <button 
                type="submit"
                disabled={loading}
                className="w-full p-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default Register;