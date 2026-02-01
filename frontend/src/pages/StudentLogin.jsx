// Student Login Page
// src/pages/StudentLogin.jsx
// Handles both:
// 1. Direct account access (students coming to check grades, saved work)
// 2. Session-based login (accounts mode sessions redirect here)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, currentStudentInfo, loading: authLoading, signInWithGoogle, signInWithPin } = useStudentAuth();

  // Check if coming from a session (accounts mode) - must be before useState that uses it
  const sessionCode = searchParams.get('session');
  const returnTo = searchParams.get('returnTo');
  const isFromSession = !!sessionCode && !!returnTo;

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  // Default to 'code' tab when coming from a session, otherwise 'google'
  const [activeTab, setActiveTab] = useState(isFromSession ? 'code' : 'google');

  // PIN login form state
  const [classCode, setClassCode] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Handle redirect after authentication
  const handleSuccessfulLogin = (studentInfo) => {
    if (isFromSession && sessionCode && returnTo) {
      // Redirect back to the session with student info
      const decodedReturnTo = decodeURIComponent(returnTo);
      window.location.href = `${decodedReturnTo}?session=${sessionCode}&role=student&studentId=${studentInfo?.id || ''}`;
    } else {
      // Normal login - go to dashboard
      navigate('/student/home');
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && currentStudentInfo) {
      handleSuccessfulLogin(currentStudentInfo);
    }
  }, [isAuthenticated, authLoading, currentStudentInfo]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const studentInfo = await signInWithGoogle();
      handleSuccessfulLogin(studentInfo);
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err.code === 'auth/is-teacher') {
        setError('This account is registered as a teacher. Please use the teacher login at /login');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <img
          src="/MusicMindAcademyLogo.png"
          alt="Music Mind Academy"
          className="h-16 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-white mb-2">Student Login</h1>
        <p className="text-gray-400">
          {isFromSession
            ? 'Sign in to join your class'
            : 'Sign in to access your classes and work'}
        </p>
        {isFromSession && (
          <div className="mt-3 inline-block bg-blue-900/50 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-lg text-sm">
            Session code: <span className="font-mono font-bold">{sessionCode}</span>
          </div>
        )}
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'google'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Google Sign-In
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'code'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Class Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'google' ? (
            <div className="space-y-4">
              <p className="text-gray-300 text-center mb-6">
                Sign in with your school Google account to access your saved work and grades.
              </p>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <p className="text-gray-500 text-sm text-center mt-4">
                Use your school email for the best experience
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 text-center mb-6">
                Enter the class code, your seat number, and PIN provided by your teacher.
              </p>

              {/* Error Display */}
              {error && activeTab === 'code' && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Class Code Login Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Class Code</label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="e.g., AB1234"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-lg tracking-wider"
                    maxLength={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Seat Number</label>
                    <input
                      type="number"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      placeholder="1-40"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      min={1}
                      max={40}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">PIN</label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 digits"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                        maxLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!classCode || !seatNumber || !pin) {
                      setError('Please fill in all fields');
                      return;
                    }
                    setIsSigningIn(true);
                    setError(null);
                    try {
                      const studentInfo = await signInWithPin(classCode, seatNumber, pin);
                      handleSuccessfulLogin(studentInfo);
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setIsSigningIn(false);
                    }
                  }}
                  disabled={isSigningIn || !classCode || !seatNumber || !pin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    'Sign In'
                  )}
                </button>
                <p className="text-gray-500 text-sm text-center">
                  Your teacher will give you your seat number and PIN
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        {!isFromSession && (
          <p className="text-gray-400">
            Just joining a live session?{' '}
            <button
              onClick={() => navigate('/join')}
              className="text-blue-400 hover:text-blue-300"
            >
              Enter class code here
            </button>
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Are you a teacher?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300"
          >
            Teacher login
          </button>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
