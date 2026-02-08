// File: /pages/MusicClassroomResources.jsx
// REDESIGNED: Clean, professional 6-unit grid without emojis
// All 6 units visible without scrolling

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import TeacherHeader from '../components/teacher/TeacherHeader';
import { Lock, ChevronRight, BookOpen } from 'lucide-react';

// Early access emails for unreleased units
const EARLY_ACCESS_EMAILS = ['robtaube90@gmail.com'];

// 6-Unit Curriculum Data with learning objectives
const CURRICULUM_UNITS = [
  {
    id: 1,
    title: 'The Listening Lab',
    subtitle: 'Elements of Music',
    color: '#8b5cf6',
    icon: '/images/assignments/curriculum/unit1-listening.png',
    standardBadge: 'Responding',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Identify instruments by sound',
      'Analyze dynamics, tempo & texture',
      'Recognize form and structure'
    ],
    status: 'pilot',
    releaseDate: null,
    route: '/listening-lab',
    routeCommercial: '/listening-lab-hub'
  },
  {
    id: 2,
    title: 'Music Around the World',
    subtitle: 'Global Sounds & Cultures',
    color: '#14b8a6',
    icon: '/images/assignments/curriculum/unit2-world.png',
    standardBadge: 'Connecting',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Explore music from 5 continents',
      'Connect culture to musical choices',
      'Compare instruments & traditions'
    ],
    status: 'coming',
    releaseDate: 'August 2026',
    route: null,
    routeCommercial: null
  },
  {
    id: 3,
    title: 'Beat Lab',
    subtitle: 'Rhythm & Groove',
    color: '#ef4444',
    icon: '/images/assignments/curriculum/unit3-beat.png',
    standardBadge: 'Creating',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Create beats using loops',
      'Layer rhythms across genres',
      'Produce an original beat'
    ],
    status: 'coming',
    releaseDate: 'August 2026',
    route: null,
    routeCommercial: null
  },
  {
    id: 4,
    title: 'Music for Media',
    subtitle: 'Loop-Based Composition',
    color: '#3b82f6',
    icon: '/images/assignments/curriculum/unit4-media.png',
    standardBadge: 'Creating',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Score video with loops',
      'Build texture and layers',
      'Create mood through music'
    ],
    status: 'pilot',
    releaseDate: null,
    route: '/music-loops-in-media',
    routeCommercial: '/music-loops-in-media-hub'
  },
  {
    id: 5,
    title: 'Song Lab',
    subtitle: 'Melody & Structure',
    color: '#ec4899',
    icon: '/images/assignments/curriculum/unit5-song.png',
    standardBadge: 'Creating',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Create melodic hooks',
      'Structure verse & chorus',
      'Write an original song sketch'
    ],
    status: 'coming',
    releaseDate: 'August 2026',
    route: null,
    routeCommercial: null
  },
  {
    id: 6,
    title: 'Film Music',
    subtitle: 'Scoring the Story',
    color: '#f59e0b',
    icon: '/images/assignments/curriculum/unit6-film.png',
    standardBadge: 'Creating & Performing',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Compose character themes',
      'Play keyboard melodies',
      'Score a complete film scene'
    ],
    status: 'coming',
    releaseDate: 'August 2026',
    route: '/film-music-hub',
    routeCommercial: '/film-music-hub'
  },
  {
    id: 7,
    title: 'The Production Studio',
    subtitle: 'Music Industry & Collaboration',
    color: '#f97316',
    icon: '/images/assignments/curriculum/unit7-production.png',
    standardBadge: 'Creating & Connecting',
    lessonCount: 5,
    duration: '~35 min per lesson',
    bullets: [
      'Collaborate in music industry roles',
      'Produce an original group track',
      'Create an album release package'
    ],
    status: 'coming',
    releaseDate: 'August 2026',
    route: null,
    routeCommercial: null
  }
];

function MusicClassroomResources() {
  const navigate = useNavigate();

  const { isAuthenticated: legacyAuthenticated, user: legacyUser, logout: legacyLogout } = useAuth();
  const { isAuthenticated: firebaseAuthenticated, user: firebaseUser, signOut: firebaseSignOut } = useFirebaseAuth();

  const isEduMode = import.meta.env.VITE_SITE_MODE === 'edu';
  const isCommercialMode = !isEduMode;

  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('classroom-logged-in') === 'true';
    }
    return false;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const userRole = firebaseUser?.role || localStorage.getItem('classroom-user-role');
  const userEmail = firebaseUser?.email || legacyUser?.email || '';
  const hasEarlyAccess = EARLY_ACCESS_EMAILS.includes(userEmail.toLowerCase());

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

  useEffect(() => {
    if (isCommercialMode) {
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
    if (isEduMode && firebaseSignOut) {
      await firebaseSignOut();
      navigate('/');
      return;
    }

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

    setLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('classroom-logged-in');
    localStorage.removeItem('classroom-user-role');
    navigate('/');
  };

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
      window.location.href = `${lessonRoute}?session=${sessionCodeInput}&role=student`;
    } catch (error) {
      console.error('Error joining session:', error);
      setSessionError('Failed to join session. Please try again.');
      setIsJoiningSession(false);
    }
  };

  const handleUnitClick = (unit) => {
    if (unit.status === 'pilot' || unit.status === 'active') {
      const route = isEduMode ? unit.route : unit.routeCommercial;
      if (route) navigate(route);
    } else if (hasEarlyAccess && unit.route) {
      const route = isEduMode ? unit.route : unit.routeCommercial;
      if (route) navigate(route);
    }
  };

  if (!loggedIn) {
    if (isEduMode) {
      navigate('/');
      return null;
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b' }}>
            Music Mind Academy
          </h1>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          width: '100%',
          maxWidth: '380px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>
            Sign In
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              outline: 'none'
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
              padding: '12px 14px',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              outline: 'none'
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Pulse animation for pilot unit */}
      <style>{`
        @keyframes pilot-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
        .pilot-card {
          animation: pilot-pulse 3s ease-in-out infinite;
        }
      `}</style>
      <TeacherHeader />

      {/* Main Content - Fits viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '20px 24px'
      }}>

        {/* Student Join Session */}
        {userRole === 'student' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
              Join a session:
            </span>
            <input
              type="text"
              placeholder="Code"
              value={sessionCodeInput}
              onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
              maxLength={4}
              style={{
                width: '100px',
                padding: '8px 12px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                letterSpacing: '2px'
              }}
            />
            <button
              onClick={handleJoinSession}
              disabled={isJoiningSession || sessionCodeInput.length !== 4}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: (isJoiningSession || sessionCodeInput.length !== 4) ? '#e2e8f0' : '#3b82f6',
                color: (isJoiningSession || sessionCodeInput.length !== 4) ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isJoiningSession || sessionCodeInput.length !== 4) ? 'not-allowed' : 'pointer'
              }}
            >
              {isJoiningSession ? 'Joining...' : 'Join'}
            </button>
            {sessionError && (
              <span style={{ fontSize: '13px', color: '#dc2626' }}>{sessionError}</span>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
              Curriculum
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              6 units &bull; 30 lessons &bull; Full year &bull; Grades 6-8
            </p>
          </div>
          <button
            onClick={() => navigate('/curriculum-guide')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <BookOpen size={15} />
            Curriculum Guide
          </button>
        </div>

        {/* 6-Unit Grid - 3x2 */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '16px',
          minHeight: 0
        }}>
          {CURRICULUM_UNITS.map((unit) => {
            const isClickable = unit.status === 'pilot' || unit.status === 'active' || (hasEarlyAccess && unit.route);
            const isComingSoon = unit.status === 'coming';

            return (
              <div
                key={unit.id}
                className={unit.status === 'pilot' ? 'pilot-card' : ''}
                onClick={() => handleUnitClick(unit)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: unit.status === 'pilot' ? `2px solid ${unit.color}` : '1px solid #e2e8f0',
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: isComingSoon && !hasEarlyAccess ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Colored top bar */}
                <div style={{
                  height: '4px',
                  backgroundColor: unit.color,
                  opacity: isComingSoon && !hasEarlyAccess ? 0.4 : 1
                }} />

                {/* Card content */}
                <div style={{
                  flex: 1,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  {/* Icon in top-right */}
                  {unit.icon && (
                    <img
                      src={unit.icon}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '72px',
                        height: '72px',
                        objectFit: 'contain',
                        opacity: isComingSoon && !hasEarlyAccess ? 0.5 : 1
                      }}
                    />
                  )}

                  {/* Unit number and status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingRight: '80px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: unit.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Unit {unit.id}
                    </span>
                    {unit.status === 'pilot' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: unit.color,
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        Pilot Unit
                      </span>
                    )}
                    {isComingSoon && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Lock size={11} />
                        {unit.releaseDate}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '4px',
                    lineHeight: '1.3',
                    paddingRight: '80px'
                  }}>
                    {unit.title}
                  </h3>

                  {/* Subtitle */}
                  <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '12px'
                  }}>
                    {unit.subtitle}
                  </p>

                  {/* Bullet points */}
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {unit.bullets.map((bullet, idx) => (
                      <li key={idx} style={{
                        fontSize: '12px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px'
                      }}>
                        <span style={{
                          color: unit.color,
                          fontWeight: '600',
                          lineHeight: '1.4'
                        }}>•</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Standards badge */}
                  {unit.standardBadge && (
                    <div style={{
                      marginTop: '12px'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        Standards: {unit.standardBadge}
                      </span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div style={{ flex: 1, minHeight: '8px' }} />

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#94a3b8'
                    }}>
                      {unit.lessonCount} lessons &bull; {unit.duration}
                    </span>
                    {isClickable && (
                      <ChevronRight size={18} color={unit.color} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          padding: '12px',
          fontSize: '13px',
          color: '#94a3b8'
        }}>
          Full curriculum available August 2026 &bull; Currently piloting Units 1 & 4
        </div>
      </div>
    </div>
  );
}

export default MusicClassroomResources;
