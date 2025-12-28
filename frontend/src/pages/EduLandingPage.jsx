// /src/pages/EduLandingPage.jsx
// Landing page for musicroomtools.org - free educational site

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const EduLandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signInWithGoogle, loading: firebaseLoading } = useFirebaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(null);

  // If logged in via Firebase, redirect directly to lessons hub
  useEffect(() => {
    if (isAuthenticated && !firebaseLoading) {
      navigate('/music-loops-in-media');
    }
  }, [isAuthenticated, firebaseLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      await signInWithGoogle();
      navigate('/music-loops-in-media');
    } catch (err) {
      console.error('Sign-in failed:', err);
      setSignInError('Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const goToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
        }
        
        .card-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* Simple Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-slate-800">Music Room Tools</span>
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="btn-primary px-5 py-2 rounded-full text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Teacher Login
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Sign-in Error Toast */}
      {signInError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {signInError}
          <button onClick={() => setSignInError(null)} className="ml-2 text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Hero - Personal Story */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">Music Room Tools</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Hello! I'm a middle school music teacher in New York. I built this because I wanted my students 
            to experience the joy of creating music—without needing expensive software or musical training. 
            Now I'm sharing it with you.
          </p>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg text-white inline-flex items-center gap-2 disabled:opacity-50"
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
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Get Started
              </>
            )}
          </button>

          <p className="text-slate-500 text-sm mt-4">
            Teachers sign in with Google. No account required for students.
          </p>
        </div>
      </section>

      {/* What It Is - Simple */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-slate-800">
            What Your Students Will Do
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Add Music to Video</h3>
              <p className="text-slate-600 text-sm">
                Drag and drop music loops onto video clips—sports highlights, city scenes, and more.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Create with Loops</h3>
              <p className="text-slate-600 text-sm">
                Drag and drop loops to build songs. No instrument skills needed.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Works on Chromebooks</h3>
              <p className="text-slate-600 text-sm">
                Browser-based. No downloads, no installs, no headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Lessons */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-slate-800">
            Ready-to-Use Lessons
          </h2>
          <p className="text-center text-slate-600 mb-10">
            Each lesson is about 35 minutes with video instruction and hands-on creation time.
          </p>
          
          <div className="space-y-4">
            {[
              { emoji: '🏀', title: 'Sports Highlight Reel', desc: 'Intro to the DAW', available: true },
              { emoji: '🏙️', title: 'City Soundscapes', desc: 'Texture & Layering', available: true },
              { emoji: '🌍', title: 'Epic Wildlife', desc: 'Sectional Form', available: false },
              { emoji: '🎮', title: 'Video Game Montage', desc: 'Musical Storytelling', available: false },
            ].map((lesson, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  lesson.available 
                    ? 'bg-white border-slate-200' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <span className="text-3xl">{lesson.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{lesson.title}</div>
                  <div className="text-sm text-slate-500">{lesson.desc}</div>
                </div>
                {lesson.available ? (
                  <span className="text-green-600 text-sm font-medium">✓ Available</span>
                ) : (
                  <span className="text-slate-400 text-sm">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy - Important */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-4 text-slate-800">
              Student Privacy First
            </h2>
            <p className="text-slate-600">
              I built this with the same concerns I have for my own students.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">No student accounts</div>
                  <div className="text-sm text-slate-600">Students join with a class code and pick any nickname</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">No emails collected</div>
                  <div className="text-sm text-slate-600">We never ask students for personal information</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Work saves locally</div>
                  <div className="text-sm text-slate-600">Student compositions stay on their device only</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Zero PII</div>
                  <div className="text-sm text-slate-600">Nothing to report, nothing to breach</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                FERPA
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                COPPA
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                NY Ed Law 2-D
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-4 text-slate-800">
            Give It a Try
          </h2>
          <p className="text-slate-600 mb-8">
            It's free. If your students enjoy it, that's all the thanks I need.
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg text-white inline-flex items-center gap-2 disabled:opacity-50"
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
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Enter Music Room Tools
              </>
            )}
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-slate-700">Music Room Tools</span>
          </div>
          
          <p className="text-slate-500 text-sm">
            Made with ❤️ by a fellow music teacher
          </p>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Student Privacy First
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EduLandingPage;