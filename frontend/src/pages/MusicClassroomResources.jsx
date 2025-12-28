// File: /pages/MusicClassroomResources.jsx
// UPDATED VERSION - Skips built-in login if user is already authenticated via Firebase
// Works on both musicroomtools.org (edu) and musicmindacademy.com (commercial)
// TUTORIAL VIDEO COMMENTED OUT - outdated

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, getSessionData } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

function MusicClassroomResources() {
  const navigate = useNavigate();

  // Get legacy auth state (for commercial mode)
  const { isAuthenticated: legacyAuthenticated, user: legacyUser, logout: legacyLogout } = useAuth();

  // Get Firebase auth state (for edu mode)
  const { isAuthenticated: firebaseAuthenticated, user: firebaseUser, signOut: firebaseSignOut } = useFirebaseAuth();

  // Check if we're in edu mode (musicroomtools.org)
  const isEduMode = import.meta.env.VITE_SITE_MODE === 'edu';
  const isCommercialMode = !isEduMode;
  
  const [loggedIn, setLoggedIn] = useState(() => {
    // Initialize from localStorage synchronously to avoid flash of login page
    if (typeof window !== 'undefined') {
      return localStorage.getItem('classroom-logged-in') === 'true';
    }
    return false;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedBonusComposition, setSavedBonusComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);
  const [dawStats, setDawStats] = useState(null);
  
  // City composition state
  const [savedCityComposition, setSavedCityComposition] = useState(null);
  
  // Epic Wildlife composition state
  const [savedEpicWildlifeComposition, setSavedEpicWildlifeComposition] = useState(null);
  
  // Sound Garden state
  const [savedSoundGarden, setSavedSoundGarden] = useState(null);
  
  // Session state
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [sessionError, setSessionError] = useState('');
  
  // Tutorial video modal state - COMMENTED OUT (outdated)
  // const [showTutorial, setShowTutorial] = useState(false);
  // const [videoKey, setVideoKey] = useState(0);
  
  // Get user role - check Firebase first, then localStorage
  const userRole = firebaseUser?.role || localStorage.getItem('classroom-user-role');

  // Handle opening tutorial - COMMENTED OUT (outdated)
  // const handleOpenTutorial = () => {
  //   if (window.Tone && window.Tone.context && window.Tone.context.state === 'running') {
  //     window.Tone.context.suspend();
  //   }
  //   setVideoKey(prev => prev + 1);
  //   setShowTutorial(true);
  // };
  
  // Handle closing tutorial - COMMENTED OUT (outdated)
  // const handleCloseTutorial = () => {
  //   setShowTutorial(false);
  //   if (window.Tone && window.Tone.context && window.Tone.context.state === 'suspended') {
  //     window.Tone.context.resume();
  //   }
  // };

  // For edu mode: use Firebase auth state
  useEffect(() => {
    if (isEduMode) {
      if (firebaseAuthenticated) {
        setLoggedIn(true);
        localStorage.setItem('classroom-logged-in', 'true');
        localStorage.setItem('classroom-user-role', 'teacher');
        localStorage.setItem('classroom-username', firebaseUser?.displayName || firebaseUser?.email || 'Teacher');
        localStorage.setItem('classroom-user-id', firebaseUser?.uid || 'firebase-user');
      } else {
        setLoggedIn(false);
      }
    }
  }, [isEduMode, firebaseAuthenticated, firebaseUser]);

  // For commercial mode: check Firebase auth first, then legacy auth or localStorage
  useEffect(() => {
    if (isCommercialMode) {
      // First check Firebase auth (pilot teachers)
      if (firebaseAuthenticated) {
        setLoggedIn(true);
        localStorage.setItem('classroom-logged-in', 'true');
        localStorage.setItem('classroom-user-role', 'teacher');
        localStorage.setItem('classroom-username', firebaseUser?.displayName || firebaseUser?.email || 'Teacher');
        localStorage.setItem('classroom-user-id', firebaseUser?.uid || 'firebase-user');
      } else if (legacyAuthenticated) {
        setLoggedIn(true);
        localStorage.setItem('classroom-logged-in', 'true');
        localStorage.setItem('classroom-user-role', legacyUser?.role || 'teacher');
        localStorage.setItem('classroom-username', legacyUser?.name || legacyUser?.email || 'Teacher');
        localStorage.setItem('classroom-user-id', legacyUser?.uid || 'legacy-user');
      } else {
        const isLoggedIn = localStorage.getItem('classroom-logged-in');
        if (isLoggedIn === 'true') {
          setLoggedIn(true);
        }
      }
    }
  }, [isCommercialMode, firebaseAuthenticated, firebaseUser, legacyAuthenticated, legacyUser]);

  const handleLogin = () => {
    if (username === 'tuba343' && password === 'music2025') {
      setLoggedIn(true);
      localStorage.setItem('classroom-logged-in', 'true');
      localStorage.setItem('classroom-user-role', 'student');
      localStorage.setItem('classroom-username', username);
      localStorage.setItem('classroom-user-id', username);
    } else if (username === 'teacher' && password === 'teach2025') {
      setLoggedIn(true);
      localStorage.setItem('classroom-logged-in', 'true');
      localStorage.setItem('classroom-user-role', 'teacher');
      localStorage.setItem('classroom-username', 'Teacher');
      localStorage.setItem('classroom-user-id', 'teacher');
    } else {
      alert('Wrong username or password');
    }
  };

  const handleLogout = async () => {
    // For edu mode, use Firebase sign out
    if (isEduMode && firebaseSignOut) {
      await firebaseSignOut();
      navigate('/');
      return;
    }

    // For commercial mode, check Firebase auth first, then legacy
    if (isCommercialMode) {
      if (firebaseAuthenticated && firebaseSignOut) {
        await firebaseSignOut();
        navigate('/');
        return;
      }
      if (legacyLogout) {
        legacyLogout();
        navigate('/');
        return;
      }
    }

    // Fallback: clear localStorage and redirect
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setSavedComposition(null);
    setSavedBonusComposition(null);
    setSavedReflection(null);
    setDawStats(null);
    setSavedCityComposition(null);
    setSavedEpicWildlifeComposition(null);
    setSavedSoundGarden(null);
    localStorage.removeItem('classroom-logged-in');
    localStorage.removeItem('classroom-user-role');
    navigate('/');
  };

  // STUDENT - Join a session and go to correct lesson
  const handleJoinSession = async () => {
    if (!sessionCodeInput || sessionCodeInput.length !== 4) {
      setSessionError('Please enter a 4-digit code');
      return;
    }

    setIsJoiningSession(true);
    setSessionError('');

    try {
      const sessionData = await getSessionData(sessionCodeInput);
      
      if (!sessionData) {
        setSessionError('Session not found. Check the code and try again.');
        setIsJoiningSession(false);
        return;
      }

      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson2';
      
      console.log(`Student joining session ${sessionCodeInput} at route: ${lessonRoute}`);
      
      window.location.href = `${lessonRoute}?session=${sessionCodeInput}&role=student`;
    } catch (error) {
      console.error('Error joining session:', error);
      setSessionError('Failed to join session. Please try again.');
      setIsJoiningSession(false);
    }
  };

  // Load ALL saved data from localStorage when logged in
  useEffect(() => {
    if (loggedIn) {
      const savedComp = localStorage.getItem('school-beneath-composition');
      if (savedComp) {
        try {
          setSavedComposition(JSON.parse(savedComp));
        } catch (error) {
          console.error('Error loading saved composition:', error);
        }
      }

      const savedBonus = localStorage.getItem('school-beneath-bonus');
      if (savedBonus) {
        try {
          setSavedBonusComposition(JSON.parse(savedBonus));
        } catch (error) {
          console.error('Error loading bonus composition:', error);
        }
      }

      const savedRefl = localStorage.getItem('school-beneath-reflection');
      if (savedRefl) {
        try {
          setSavedReflection(JSON.parse(savedRefl));
        } catch (error) {
          console.error('Error loading saved reflection:', error);
        }
      }

      const stats = localStorage.getItem('lesson1-daw-stats');
      if (stats) {
        try {
          setDawStats(JSON.parse(stats));
        } catch (error) {
          console.error('Error loading DAW stats:', error);
        }
      }
      
      // Load city composition
      const studentId = localStorage.getItem('anonymous-student-id');
      if (studentId) {
        const cityKey = `city-composition-${studentId}`;
        const savedCity = localStorage.getItem(cityKey);
        if (savedCity) {
          try {
            const data = JSON.parse(savedCity);
            setSavedCityComposition(data);
            console.log('Loaded saved city composition:', data);
          } catch (error) {
            console.error('Error loading city composition:', error);
          }
        }
        
        // Load Sound Garden artwork
        const soundGardenKey = `sound-garden-${studentId}`;
        const savedGarden = localStorage.getItem(soundGardenKey);
        if (savedGarden) {
          try {
            const data = JSON.parse(savedGarden);
            setSavedSoundGarden(data);
            console.log('Loaded saved Sound Garden:', data);
          } catch (error) {
            console.error('Error loading Sound Garden:', error);
          }
        }
      }
      
      // Load Epic Wildlife composition
      const savedEpicWildlife = localStorage.getItem('epic-wildlife-composition');
      if (savedEpicWildlife) {
        try {
          const data = JSON.parse(savedEpicWildlife);
          setSavedEpicWildlifeComposition(data);
          console.log('Loaded saved Epic Wildlife composition:', data);
        } catch (error) {
          console.error('Error loading Epic Wildlife composition:', error);
        }
      }
    }
  }, [loggedIn]);

  // For edu mode: if not authenticated via Firebase, redirect to landing page
  // For commercial mode: show the old login form as fallback
  if (!loggedIn) {
    if (isEduMode) {
      // Edu mode requires Firebase auth - redirect to landing page
      navigate('/');
      return null;
    }

    // Commercial mode fallback - show old login form
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f4f8'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '10px'
          }}>
            Music Mind Academy
          </h1>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#2d3748'
          }}>
            Classroom Login
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '16px'
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '16px'
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f7fafc',
      padding: '20px'
    }}>
      {/* Tutorial Video Modal - COMMENTED OUT (outdated)
      {showTutorial && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={handleCloseTutorial}
        >
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseTutorial}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <video
              key={videoKey}
              controls
              autoPlay
              playsInline
              preload="auto"
              onSeeked={(e) => {
                const video = e.target;
                if (video.paused) {
                  video.play().catch(() => {});
                }
              }}
              onError={(e) => {
                console.error('Video error:', e);
              }}
              style={{
                width: '100%',
                display: 'block'
              }}
            >
              <source src="/lessons/film-music-project/Lesson Tutorial.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      */}

      {/* Header */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: '#1a202c'
        }}>
          {isCommercialMode ? 'Music Mind Academy' : 'Music Room Tools'}
        </h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Content container */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto'
      }}>
        
        {/* Tutorial Button - COMMENTED OUT (outdated)
        {userRole === 'teacher' && (
          <button
            onClick={handleOpenTutorial}
            style={{
              width: '100%',
              padding: '16px 24px',
              marginBottom: '20px',
              backgroundColor: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0f2fe';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '24px' }}>🎬</span>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#0369a1'
            }}>
              How to Run a Lesson
            </span>
            <span style={{ 
              fontSize: '13px', 
              color: '#0284c7',
              backgroundColor: '#bae6fd',
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              Watch Tutorial
            </span>
          </button>
        )}
        */}
        
        {/* Student Join Session Area - Only for students */}
        {userRole === 'student' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            border: '2px solid #4299e1'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              👨‍🎓 Join a Live Session
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={sessionCodeInput}
                onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px solid #4299e1',
                  letterSpacing: '4px'
                }}
              />
              <button
                onClick={handleJoinSession}
                disabled={isJoiningSession || sessionCodeInput.length !== 4}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: (isJoiningSession || sessionCodeInput.length !== 4) ? '#a0aec0' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isJoiningSession || sessionCodeInput.length !== 4) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {isJoiningSession ? 'Joining...' : 'Join'}
              </button>
            </div>

            {sessionError && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fed7d7',
                color: '#742a2a',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {sessionError}
              </div>
            )}
          </div>
        )}

        {/* Music for Media Unit Card */}
        <div
          onClick={() => navigate('/music-loops-in-media-hub')}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            {/* Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '28px' }}>🎬</span>
            </div>

            {/* Title & Meta */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '4px'
              }}>
                Music for Media
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#64748b',
                marginBottom: '8px'
              }}>
                Create soundtracks for video — the way professionals do it.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>
                  5 Lessons
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>
                  ~40 min each
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>
                  Grades 6-8
                </span>
              </div>
            </div>
          </div>

          {/* Lesson List */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              Unit Overview
            </div>

            {/* Lesson Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>1</span>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  <strong>Score the Adventure</strong> — Mood & Expression
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</span>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  <strong>City Soundscapes</strong> — Texture & Layering
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>3</span>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  <strong>Epic Wildlife</strong> — Form & Structure
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>4</span>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  <strong>Sports Highlight Reel</strong> — Rhythm & Beat
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>5</span>
                <span style={{ fontSize: '14px', color: '#334155' }}>
                  <strong>Game On!</strong> — Melody & Contour
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#94a3b8',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>6</span>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  <strong>Director's Cut</strong> — Capstone (Coming Soon)
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '600' }}>
              View Lessons →
            </span>
          </div>
        </div>

        {/* Saved Work Section */}
        {userRole === 'student' && (savedCityComposition || savedSoundGarden || savedComposition || savedEpicWildlifeComposition) && (
          <div style={{
            marginTop: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              📁 Your Saved Work
            </h3>

            {/* Sound Garden */}
            {savedSoundGarden && (
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #86efac'
              }}>
                <div style={{ fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                  🌱 Sound Garden Artwork
                </div>
                <div style={{ fontSize: '13px', color: '#15803d' }}>
                  Saved {new Date(savedSoundGarden.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* City Composition */}
            {savedCityComposition && (
              <div style={{
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                  🏙️ City Soundscape Composition
                </div>
                <div style={{ fontSize: '13px', color: '#1d4ed8' }}>
                  {savedCityComposition.loopCount || 0} loops • Saved {new Date(savedCityComposition.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Epic Wildlife Composition */}
            {savedEpicWildlifeComposition && (
              <div style={{
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                  🌍 Epic Wildlife Composition
                </div>
                <div style={{ fontSize: '13px', color: '#047857' }}>
                  {savedEpicWildlifeComposition.loopCount || 0} loops • {savedEpicWildlifeComposition.sectionCount || 0} sections • Saved {new Date(savedEpicWildlifeComposition.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Sports Composition */}
            {savedComposition && (
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #fcd34d'
              }}>
                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  🏀 Sports Highlight Composition
                </div>
                <div style={{ fontSize: '13px', color: '#b45309' }}>
                  {savedComposition.loopCount || 0} loops
                </div>
              </div>
            )}

            {/* Delete All Button */}
            <button
              onClick={() => {
                if (window.confirm('Delete all saved work? This cannot be undone.')) {
                  localStorage.removeItem('school-beneath-composition');
                  localStorage.removeItem('school-beneath-bonus');
                  localStorage.removeItem('school-beneath-reflection');
                  localStorage.removeItem('lesson1-daw-stats');
                  localStorage.removeItem('epic-wildlife-composition');
                  localStorage.removeItem('epic-wildlife-bonus');
                  localStorage.removeItem('epic-wildlife-reflection');
                  const studentId = localStorage.getItem('anonymous-student-id');
                  if (studentId) {
                    localStorage.removeItem(`sound-garden-${studentId}`);
                    localStorage.removeItem(`city-composition-${studentId}`);
                    localStorage.removeItem(`listening-map-${studentId}`);
                  }
                  setSavedComposition(null);
                  setSavedBonusComposition(null);
                  setSavedReflection(null);
                  setDawStats(null);
                  setSavedSoundGarden(null);
                  setSavedCityComposition(null);
                  setSavedEpicWildlifeComposition(null);
                  alert('All saved work deleted');
                }
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete All Saved Work
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicClassroomResources;