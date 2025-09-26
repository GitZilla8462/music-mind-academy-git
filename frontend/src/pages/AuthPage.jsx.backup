// /src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { loading } = useAuth();

  // Listen for successful registration to switch to login
  const handleRegistrationSuccess = () => {
    setIsLogin(true);
  };

  // Add an event listener for registration success
  useEffect(() => {
    const handleRegistrationEvent = () => {
      setIsLogin(true);
    };

    // You could use a custom event or just let Register component handle this
    window.addEventListener('registrationSuccess', handleRegistrationEvent);
    
    return () => {
      window.removeEventListener('registrationSuccess', handleRegistrationEvent);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Login' : 'Register'}
          </h1>
        </div>
        {isLogin ? (
          <Login />
        ) : (
          <Register onSuccess={handleRegistrationSuccess} />
        )}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;