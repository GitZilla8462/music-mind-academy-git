// /src/pages/TeacherLoginPage.jsx
// Login page for approved pilot teachers
// Supports: Email/Password (primary), Google, Microsoft

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

// Preload the unit selection page in the background so it's ready after sign-in
const preloadUnitPage = () => {
  import('../pages/MusicClassroomResources');
};

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithEmailPassword,
    resetPassword,
    loading
  } = useFirebaseAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Check if we're on the edu site
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const dashboardRoute = '/music-classroom-resources';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';
  const accentColor = isEduSite ? 'text-violet-600' : 'text-blue-600';
  const buttonBgColor = isEduSite ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700';

  // Preload the unit selection page as soon as login page loads
  useEffect(() => {
    preloadUnitPage();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, loading, navigate, dashboardRoute]);

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (isNewAccount) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSigningIn(true);
    setError(null);

    try {
      await signInWithEmailPassword(email, password);
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Email/password sign-in failed:', err);
      if (err.code === 'auth/account-exists-different-provider') {
        // Account exists via Google/Microsoft — show error, don't send reset email
        setError(err.message);
      } else if (err.code === 'auth/not-approved') {
        setError("Your email hasn't been approved yet. Apply through our form and wait for approval.");
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Try again or use "Forgot password?" below.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err.code === 'auth/not-approved') {
        setError("Your email hasn't been approved yet. Apply through our form and wait for approval.");
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithMicrosoft();
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Microsoft sign-in failed:', err);
      if (err.code === 'auth/not-approved') {
        setError("Your email hasn't been approved yet. Apply through our form and wait for approval.");
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email above, then click "Forgot password?"');
      return;
    }
    setIsSendingReset(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Could not send reset email. Make sure your email is correct.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {!isEduSite && (
              <img
                src="/MusicMindAcademyLogo.png"
                alt="Music Mind Academy"
                className="h-10 w-auto"
              />
            )}
            <span className="text-xl font-bold text-slate-800">{siteName}</span>
          </a>
          <button
            onClick={() => navigate('/join')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Join Class
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* Password Reset Success */}
            {resetSent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email!</h2>
                <p className="text-slate-600 mb-4">
                  We sent a link to <span className="font-semibold">{email}</span> to set your password.
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Click the link in the email to create a password. Then come back here and sign in.
                  <br />Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setPassword('');
                  }}
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  &larr; Back to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {isNewAccount ? 'Create Your Account' : 'Teacher Sign In'}
                  </h1>
                  <p className="text-slate-600">
                    {isNewAccount ? 'Enter your school email and choose a password.' : 'Sign in with your school email.'}
                  </p>
                </div>

                {/* Toggle between Sign In and Create Account */}
                <div className="flex rounded-xl border-2 border-slate-200 mb-5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setIsNewAccount(false); setError(null); setConfirmPassword(''); }}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      !isNewAccount ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsNewAccount(true); setError(null); }}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      isNewAccount ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    New? Create Account
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Email + Password — primary method */}
                <form onSubmit={handleEmailPasswordSignIn} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">School Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {isNewAccount ? 'Choose a Password' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isNewAccount ? 'At least 6 characters' : 'Enter your password'}
                        className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                        required
                        autoComplete={isNewAccount ? 'new-password' : 'current-password'}
                        minLength={6}
                      />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    </div>
                  </div>
                  {isNewAccount && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Type your password again"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                        required
                        autoComplete="new-password"
                        minLength={6}
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSigningIn || !email.trim() || !password.trim() || (isNewAccount && !confirmPassword.trim())}
                    className={`w-full py-3 rounded-xl font-semibold text-white ${buttonBgColor} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSigningIn ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isNewAccount ? 'Creating account...' : 'Signing in...'}
                      </span>
                    ) : (
                      isNewAccount ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </form>

                {!isNewAccount && (
                  <div className="flex items-center justify-end mt-3">
                    <button
                      onClick={handleForgotPassword}
                      disabled={isSendingReset}
                      className={`text-sm font-medium ${accentColor} hover:underline disabled:opacity-50`}
                    >
                      {isSendingReset ? 'Sending...' : 'Forgot password?'}
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or sign in with</span>
                  </div>
                </div>

                {/* Google + Microsoft — secondary */}
                <div className="flex gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleMicrosoftSignIn}
                    disabled={isSigningIn}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    Microsoft
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-center text-slate-500 text-sm">
                    Only approved teachers can sign in.
                    <br />
                    <a href="/" className={`${accentColor} hover:underline font-medium`}>
                      Go back to home
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          {!isEduSite && (
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Having trouble? Email{' '}
                <a href="mailto:rob@musicmindacademy.com" className={`${accentColor} hover:underline`}>
                  rob@musicmindacademy.com
                </a>
              </p>
            </div>
          )}
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
