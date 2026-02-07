// Student Login Page
// src/pages/StudentLogin.jsx
// Primary: Username + PIN login (no class code needed)
// Secondary: Google Sign-In at bottom

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, currentStudentInfo, loading: authLoading, signInWithGoogle, signInWithUsername } = useStudentAuth();

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

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const studentInfo = await signInWithGoogle();
      handleSuccessfulLogin(studentInfo);
    } catch (err) {
      if (err.code === 'auth/is-teacher') {
        setError('This account is registered as a teacher. Please use the teacher login.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
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
        <img
          src="/MusicMindAcademyLogo.png"
          alt="Music Mind Academy"
          className="h-16 w-auto mx-auto mb-4"
        />
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs uppercase">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Sign-In - Secondary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-600 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-gray-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
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
