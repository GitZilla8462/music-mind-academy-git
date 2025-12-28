// /src/pages/TeacherLoginPage.jsx
// Login page for approved pilot teachers
// Teachers sign in with Google after being approved via email

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signInWithGoogle, loading } = useFirebaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  // Check if we're on the edu site
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  // Skip intermediate page, go directly to lessons hub
  const dashboardRoute = isEduSite ? '/music-loops-in-media' : '/music-loops-in-media-hub';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';
  const gradientColors = isEduSite ? 'from-violet-600 to-purple-500' : 'from-blue-600 to-sky-500';
  const accentColor = isEduSite ? 'text-violet-600' : 'text-blue-600';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, loading, navigate, dashboardRoute]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err.code === 'auth/not-approved') {
        setError("Your email hasn't been approved for the pilot yet. Please apply through our form and wait for approval.");
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors} flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">{siteName}</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h1>
              <p className="text-slate-600">
                Sign in with your approved Google account to access your dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-700 text-sm">{error}</p>
                    {error.includes("hasn't been approved") && (
                      <a
                        href="/"
                        className="text-red-600 text-sm font-medium hover:underline mt-2 inline-block"
                      >
                        Apply for the pilot program
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-center text-slate-500 text-sm">
                Only approved teachers can sign in.
                <br />
                <a href="/" className={`${accentColor} hover:underline font-medium`}>
                  Go back to home
                </a>
              </p>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Having trouble? Email{' '}
              <a href="mailto:rob@musicmindacademy.com" className={`${accentColor} hover:underline`}>
                rob@musicmindacademy.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TeacherLoginPage;
