// Student Login Page
// src/pages/StudentLogin.jsx
// Username + PIN login (no class code needed)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const [searchParams] = useSearchParams();
  const { isAuthenticated, currentStudentInfo, loading: authLoading, signInWithUsername } = useStudentAuth();

  // Check if coming from a session redirect
  const sessionCode = searchParams.get('session');
  const returnTo = searchParams.get('returnTo');
  const isFromSession = !!sessionCode && !!returnTo;

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  // Form state - just username and PIN
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Handle redirect after authentication
  const handleSuccessfulLogin = (studentInfo) => {
    if (isFromSession && sessionCode && returnTo) {
      const decodedReturnTo = decodeURIComponent(returnTo);
      window.location.href = `${decodedReturnTo}?session=${sessionCode}&role=student&studentId=${studentInfo?.id || ''}`;
    } else {
      navigate('/student/home');
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && currentStudentInfo) {
      handleSuccessfulLogin(currentStudentInfo);
    }
  }, [isAuthenticated, authLoading, currentStudentInfo]);

  const handleLogin = async () => {
    if (!username || !pin) {
      setError('Enter your username and PIN');
      return;
    }
    setIsSigningIn(true);
    setError(null);
    try {
      const studentInfo = await signInWithUsername(username, pin);
      handleSuccessfulLogin(studentInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username && pin) {
      handleLogin();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="text-center mb-6">
        {!isEduSite && (
          <img
            src="/MusicMindAcademyLogo.png"
            alt="Music Mind Academy"
            className="h-16 w-auto mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Student Login</h1>
        <p className="text-gray-500">
          {isFromSession
            ? 'Sign in to join your class'
            : 'Use the username and PIN from your login card'}
        </p>
        {isFromSession && (
          <div className="mt-3 inline-block bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
            Session code: <span className="font-mono font-bold">{sessionCode}</span>
          </div>
        )}
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Username + PIN Form */}
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  setError(null);
                }}
                placeholder="tuba123"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1.5">PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  placeholder="1234"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg tracking-widest"
                  maxLength={4}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isSigningIn || !username || !pin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSigningIn ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            <p className="text-gray-400 text-xs text-center">
              Check your login card from your teacher
            </p>
          </div>

        </div>
      </div>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        {!isFromSession && (
          <p className="text-gray-500 text-sm">
            Just joining a live session?{' '}
            <button
              onClick={() => navigate('/join')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Enter code here
            </button>
          </p>
        )}
        <p className="text-gray-400 text-sm">
          Are you a teacher?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700"
          >
            Teacher login
          </button>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
