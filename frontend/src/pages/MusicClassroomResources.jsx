// File: /pages/MusicClassroomResources.jsx
// REDESIGNED: Clean, professional 6-unit grid without emojis
// All 6 units visible without scrolling

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import TeacherHeader from '../components/teacher/TeacherHeader';
import WelcomeBanner, { shouldShowWelcomeBanner } from '../components/teacher/onboarding/WelcomeBanner';
import CreateClassModal from '../components/teacher/CreateClassModal';
import { getTeacherClasses } from '../firebase/classes';
import { ChevronRight, BookOpen } from 'lucide-react';

// Early access emails for unreleased units
const EARLY_ACCESS_EMAILS = ['robtaube90@gmail.com'];

// 7-Unit Curriculum Data with learning objectives
const CURRICULUM_UNITS = [
  {
    id: 1,
    title: 'The Loop Lab',
    subtitle: 'Loop-Based Composition',
    color: '#3b82f6',
    icon: '/images/assignments/curriculum/unit4-media.png',
    standardBadge: 'Creating',
    lessonCount: 5,
    duration: '~40 min per lesson',
    bullets: [
      'Score video using loops & layers',
      'Explore mood, texture & form',
      'Create beats and melodies'
    ],
    status: 'pilot',
    releaseDate: null,
    route: '/music-loops-in-media',
    routeCommercial: '/music-loops-in-media-hub'
  },
  {
    id: 2,
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
    releaseDate: 'April 1st',
    route: '/listening-lab',
    routeCommercial: '/listening-lab-hub'
  },
  {
    id: 3,
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
    status: 'preview',
    releaseDate: 'May 1st',
    route: null,
    routeCommercial: null
  },
  {
    id: 4,
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
    status: 'preview',
    releaseDate: 'June 1st',
    route: null,
    routeCommercial: null
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
    status: 'preview',
    releaseDate: 'September 1st',
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
    status: 'preview',
    releaseDate: 'September 1st',
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
    status: 'preview',
    releaseDate: 'September 1st',
    route: null,
    routeCommercial: null
  }
];

function MusicClassroomResources() {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';

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

  // Onboarding state
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

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

  // Fetch teacher classes for onboarding checklist
  useEffect(() => {
    const fetchClasses = async () => {
      const uid = firebaseUser?.uid;
      if (!uid) return;
      try {
        const classes = await getTeacherClasses(uid);
        setTeacherClasses(classes || []);
      } catch (err) {
        // Non-critical — checklist just won't auto-detect
      }
    };
    fetchClasses();
  }, [firebaseUser]);

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
    if (unit.status === 'pilot' || unit.status === 'active' || unit.status === 'preview') {
      const route = isEduMode ? unit.route : unit.routeCommercial;
      if (route) {
        localStorage.setItem('teacher-previewed-lesson', 'true');
        navigate(route);
      }
    } else if (hasEarlyAccess && unit.route) {
      const route = isEduMode ? unit.route : unit.routeCommercial;
      if (route) {
        localStorage.setItem('teacher-previewed-lesson', 'true');
        navigate(route);
      }
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
            {isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}
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
      {/* Card animations + responsive styles */}
      <style>{`
        @keyframes pilot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
        .active-pilot-card {
          animation: pilot-pulse 2.5s ease-in-out infinite;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
        }

        /* Responsive: Main content */
        .mcr-content { max-width: 1400px; width: 100%; margin: 0 auto; padding: 12px 24px; }
        .mcr-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 12px; }
        .mcr-join-bar { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .mcr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .mcr-card-body { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; position: relative; }
        .mcr-card-icon { position: absolute; top: 6px; right: 8px; width: 44px; height: 44px; object-fit: contain; }
        .mcr-unit-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; padding-right: 50px; }
        .mcr-card-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 1px; line-height: 1.25; padding-right: 50px; }
        .mcr-badge-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

        @media (max-width: 1024px) {
          .mcr-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .mcr-content { padding: 10px; }
          .mcr-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .mcr-card-body { padding: 10px; }
          .mcr-card-icon { width: 40px; height: 40px; top: 6px; right: 6px; }
          .mcr-unit-row { padding-right: 46px; }
          .mcr-card-title { padding-right: 46px; font-size: 14px; }
          .mcr-header { flex-wrap: wrap; }
        }
        @media (max-width: 540px) {
          .mcr-content { padding: 8px; }
          .mcr-grid { grid-template-columns: 1fr; gap: 8px; }
          .mcr-card-body { padding: 10px; }
          .mcr-card-icon { width: 40px; height: 40px; top: 6px; right: 6px; }
          .mcr-unit-row { padding-right: 46px; }
          .mcr-card-title { padding-right: 46px; font-size: 14px; }
          .mcr-header h1 { font-size: 20px !important; }
          .mcr-badge-row { gap: 4px; }
          .mcr-join-bar { flex-direction: column; gap: 8px; }
          .mcr-join-bar input, .mcr-join-bar button { min-height: 44px; }
        }
      `}</style>
      <TeacherHeader />

      {/* Main Content */}
      <div className="mcr-content" style={{
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Welcome Banner for new teachers */}
        {userRole !== 'student' && !bannerDismissed && shouldShowWelcomeBanner() && (
          <WelcomeBanner
            teacherName={firebaseUser?.displayName?.split(' ')[0]}
            classes={teacherClasses}
            onCreateClass={() => setShowCreateClassModal(true)}
            onBrowseLessons={() => navigate('/music-loops-in-media')}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Student Join Session */}
        {userRole === 'student' && (
          <div className="mcr-join-bar" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0'
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
        <div className="mcr-header">
          <div>
            <h1 className="mcr-header" style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '1px' }}>
              6-8 General Music Curriculum
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              7 units &bull; 35 lessons &bull; Full year &bull; Grades 6-8 &bull; Optimized for Chromebooks
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

        {/* Unit Grid */}
        <div className="mcr-grid">
          {CURRICULUM_UNITS.map((unit) => {
            const isActivePilot = unit.status === 'pilot' && !unit.releaseDate;
            const isUpcomingPilot = unit.status === 'pilot' && unit.releaseDate;
            const isClickable = unit.status === 'pilot' || unit.status === 'active' || unit.status === 'preview' || (hasEarlyAccess && unit.route);
            const isPreview = unit.status === 'preview';

            const cardClass = isActivePilot ? 'active-pilot-card' : '';
            const cardOpacity = isActivePilot ? 1 : isUpcomingPilot ? 1 : isPreview ? 0.8 : 1;

            return (
              <div
                key={unit.id}
                id={`unit-card-${unit.id}`}
                className={cardClass}
                onClick={() => handleUnitClick(unit)}
                style={{
                  backgroundColor: isUpcomingPilot ? '#faf5ff' : 'white',
                  borderRadius: '10px',
                  border: isActivePilot ? `2px solid ${unit.color}` : isUpcomingPilot ? `1px solid ${unit.color}40` : '1px solid #e2e8f0',
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: cardOpacity,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.boxShadow = isActivePilot
                      ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                      : '0 4px 12px rgba(0,0,0,0.1)';
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
                  height: isActivePilot ? '4px' : isUpcomingPilot ? '3px' : '2px',
                  backgroundColor: unit.color,
                  opacity: isPreview ? 0.4 : 1
                }} />

                {/* Card content */}
                <div className="mcr-card-body">
                  {/* Icon in top-right */}
                  {unit.icon && (
                    <img
                      src={unit.icon}
                      alt=""
                      className="mcr-card-icon"
                      style={{ opacity: isPreview ? 0.5 : 1 }}
                    />
                  )}

                  {/* Unit number and status */}
                  <div className="mcr-unit-row">
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: unit.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}>
                      Unit {unit.id}
                    </span>
                    <div className="mcr-badge-row">
                      {isActivePilot && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          color: 'white',
                          backgroundColor: '#16a34a',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap'
                        }}>
                          Pilot Now
                        </span>
                      )}
                      {isUpcomingPilot && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          color: 'white',
                          backgroundColor: unit.color,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap'
                        }}>
                          Pilot {unit.releaseDate}
                        </span>
                      )}
                      {isPreview && unit.releaseDate && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#94a3b8'
                        }}>
                          Unlocks {unit.releaseDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mcr-card-title">
                    {unit.title}
                  </h3>

                  {/* Subtitle */}
                  <p style={{
                    fontSize: '12px',
                    color: '#475569',
                    marginBottom: '5px'
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
                    gap: '1px'
                  }}>
                    {unit.bullets.map((bullet, idx) => (
                      <li key={idx} style={{
                        fontSize: '11px',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '4px',
                        lineHeight: '1.4'
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
                      marginTop: '4px'
                    }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        color: '#475569',
                        backgroundColor: '#f1f5f9',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}>
                        Standards: {unit.standardBadge}
                      </span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div style={{ flex: 1, minHeight: '3px' }} />

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      {unit.lessonCount} lessons &bull; {unit.duration}
                    </span>
                    {isActivePilot ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: unit.color
                      }}>
                        Start Teaching <ChevronRight size={14} />
                      </span>
                    ) : isClickable ? (
                      <ChevronRight size={18} color={unit.color} />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          padding: '6px',
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          Full curriculum rolling out through 2026 &bull; Currently piloting Units 1 &amp; 2
        </div>
      </div>

      {/* Create Class Modal (triggered from onboarding checklist) */}
      {showCreateClassModal && (
        <CreateClassModal
          isOpen={showCreateClassModal}
          onClose={() => setShowCreateClassModal(false)}
          teacherUid={firebaseUser?.uid}
          onClassCreated={(newClass) => {
            setTeacherClasses(prev => [...prev, newClass]);
            setShowCreateClassModal(false);
          }}
        />
      )}

    </div>
  );
}

export default MusicClassroomResources;
