// /src/pages/TeacherLoginPage.jsx
// Login page for approved pilot teachers
// Supports: Google, Microsoft, and Magic Link authentication

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    signInWithGoogle,
    sendMagicLink,
    completeMagicLinkSignIn,
    isMagicLinkUrl,
    loading
  } = useFirebaseAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isCompletingMagicLink, setIsCompletingMagicLink] = useState(false);
  const [needsEmailForMagicLink, setNeedsEmailForMagicLink] = useState(false);

  // Check if we're on the edu site
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  // Skip intermediate page, go directly to lessons hub
  const dashboardRoute = isEduSite ? '/music-loops-in-media' : '/music-loops-in-media-hub';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';
  const gradientColors = isEduSite ? 'from-violet-600 to-purple-500' : 'from-blue-600 to-sky-500';
  const accentColor = isEduSite ? 'text-violet-600' : 'text-blue-600';
  const buttonBgColor = isEduSite ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700';

  // Handle magic link return (when user clicks link in email)
  useEffect(() => {
    const handleMagicLinkReturn = async () => {
      if (isMagicLinkUrl()) {
        setIsCompletingMagicLink(true);
        setError(null);

        try {
          const result = await completeMagicLinkSignIn();
          if (result) {
            navigate(dashboardRoute);
          }
        } catch (err) {
          console.error('Magic link completion failed:', err);
          if (err.code === 'auth/needs-email') {
            // User opened link on different device, needs to enter email
            setNeedsEmailForMagicLink(true);
          } else if (err.code === 'auth/not-approved') {
            setError("Your email is not registered for access. Contact support@musicmindacademy.com");
          } else {
            setError(err.message || 'Failed to complete sign-in. Please try again.');
          }
        } finally {
          setIsCompletingMagicLink(false);
        }
      }
    };

    handleMagicLinkReturn();
  }, []);

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
        setError("Your email is not registered for access. Contact support@musicmindacademy.com");
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    if (!magicLinkEmail.trim()) return;

    setIsSendingMagicLink(true);
    setError(null);

    try {
      await sendMagicLink(magicLinkEmail);
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Failed to send magic link:', err);
      if (err.code === 'auth/not-approved') {
        setError("This email is not registered. Contact support@musicmindacademy.com");
      } else {
        setError(err.message || 'Failed to send login link. Please try again.');
      }
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleCompleteMagicLinkWithEmail = async (e) => {
    e.preventDefault();
    if (!magicLinkEmail.trim()) return;

    setIsCompletingMagicLink(true);
    setError(null);

    try {
      await completeMagicLinkSignIn(magicLinkEmail);
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Magic link completion failed:', err);
      if (err.code === 'auth/not-approved') {
        setError("Your email is not registered for access. Contact support@musicmindacademy.com");
      } else {
        setError(err.message || 'Failed to complete sign-in. Please try again.');
      }
    } finally {
      setIsCompletingMagicLink(false);
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
            {/* Magic Link Sent Success */}
            {magicLinkSent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email!</h2>
                <p className="text-slate-600 mb-4">
                  We sent a login link to <span className="font-semibold">{magicLinkEmail}</span>
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Click the link in the email to sign in. The link expires in 1 hour.
                </p>
                <button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setMagicLinkEmail('');
                  }}
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  ← Use a different email
                </button>
              </div>
            ) : needsEmailForMagicLink ? (
              /* Need email to complete magic link (opened on different device) */
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Complete Sign In</h1>
                  <p className="text-slate-600">
                    Enter your email to complete the sign-in process.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCompleteMagicLinkWithEmail} className="space-y-4">
                  <input
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isCompletingMagicLink || !magicLinkEmail.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-white ${buttonBgColor} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCompletingMagicLink ? 'Signing in...' : 'Complete Sign In'}
                  </button>
                </form>
              </div>
            ) : isCompletingMagicLink ? (
              /* Completing magic link sign-in */
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Completing sign-in...</p>
              </div>
            ) : (
              /* Normal login view */
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h1>
                  <p className="text-slate-600">
                    Sign in to access your dashboard.
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or</span>
                  </div>
                </div>

                {/* Magic Link Section */}
                <div>
                  <p className="text-sm text-slate-600 mb-3 text-center">Sign in with email link</p>
                  <form onSubmit={handleSendMagicLink} className="space-y-3">
                    <input
                      type="email"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      placeholder="you@school.edu"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSendingMagicLink || !magicLinkEmail.trim()}
                      className={`w-full py-3 rounded-xl font-semibold text-white ${buttonBgColor} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSendingMagicLink ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send login link'
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    We'll email you a magic link to sign in
                  </p>
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
