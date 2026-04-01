// File: /pages/JoinWithCode.jsx
// JOIN PAGE - Classroom mode: username + PIN login for students

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { getClassByCode, getClassSessionByCode, joinClassSession } from '../firebase/classes';
import { logStudentJoined } from '../firebase/analytics';
import { getStudentId, migrateOldSaves } from '../utils/studentWorkStorage';
import BeatEscapeRoomActivity from '../lessons/shared/activities/beat-escape-room/BeatEscapeRoomActivity';
import MelodyMysteryActivity from '../lessons/shared/activities/melody-mystery/MelodyMysteryActivity';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff, LogIn, Clock, Loader2 } from 'lucide-react';

function JoinWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');

  // Login state
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Student auth
  const { isPinAuth, pinSession, currentStudentInfo, signInWithUsername, signOut } = useStudentAuth();

  // Active class session state (for logged-in students)
  const [activeSession, setActiveSession] = useState(null); // { classData, lessonRoute }
  const [checkingSession, setCheckingSession] = useState(false);

  // Preview mode params
  const isPreviewMode = searchParams.get('preview') === 'true';
  const isPassiveMode = searchParams.get('passive') === 'true';
  const urlCode = searchParams.get('code');
  const loadRoomCode = searchParams.get('loadRoom');
  const loadMelodyMysteryCode = searchParams.get('loadMelodyMystery');

  // Site config
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';

  useEffect(() => {
    const id = getStudentId();
    migrateOldSaves(id);
  }, []);

  // Check for active session when PIN-authenticated student visits /join
  useEffect(() => {
    if (!isPinAuth || !pinSession?.classCode) return;

    const checkActiveSession = async () => {
      setCheckingSession(true);
      try {
        const classData = await getClassSessionByCode(pinSession.classCode);
        if (classData?.currentSession?.active) {
          setActiveSession({ classData });
        } else {
          setActiveSession(null);
        }
      } catch (err) {
        console.error('Error checking class session:', err);
        setActiveSession(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkActiveSession();
  }, [isPinAuth, pinSession?.classCode]);

  // Auto-join for preview mode
  useEffect(() => {
    if (!isPreviewMode || !urlCode) return;

    if (urlCode.length === 4) {
      // 4-digit session code
      console.log('Preview mode detected, auto-joining session:', urlCode);
      handleAutoJoin(urlCode);
    } else if (/^[A-Z]{2}\d{4}$/.test(urlCode)) {
      // 6-char class code - look up class and join its active session
      console.log('Preview mode detected, auto-joining class session:', urlCode);
      handleClassPreviewJoin(urlCode);
    }
  }, [isPreviewMode, urlCode]);

  // Activity load handlers
  if (loadRoomCode) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a202c' }}>
        <BeatEscapeRoomActivity onComplete={() => navigate('/join')} />
      </div>
    );
  }

  if (loadMelodyMysteryCode) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a202c' }}>
        <MelodyMysteryActivity
          onComplete={() => navigate('/join')}
          initialLoadCode={loadMelodyMysteryCode}
        />
      </div>
    );
  }

  // Auto-join for preview mode (4-digit session code)
  const handleAutoJoin = async (sessionCode) => {
    try {
      const sessionData = await getSessionData(sessionCode);
      if (!sessionData) {
        setError('Session not found');
        return;
      }
      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson1';
      const passiveParam = isPassiveMode ? '&passive=true' : '';
      window.location.href = `${lessonRoute}?session=${sessionCode}&role=student&preview=true${passiveParam}`;
    } catch (err) {
      console.error('Preview mode error:', err);
      setError('Failed to load preview');
    }
  };

  // Auto-join for preview mode (6-char class code)
  const handleClassPreviewJoin = async (classCode) => {
    try {
      const classInfo = await getClassByCode(classCode);
      if (!classInfo || !classInfo.currentSession?.active) {
        setError('No active session');
        return;
      }
      const lessonRoute = classInfo.currentSession.lessonRoute || '/lessons/film-music-project/lesson1';
      const passiveParam = isPassiveMode ? '&passive=true' : '';
      window.location.href = `${lessonRoute}?classId=${classInfo.id}&classCode=${classCode}&role=student&preview=true${passiveParam}`;
    } catch (err) {
      console.error('Preview mode class join error:', err);
      setError('Failed to load preview');
    }
  };

  // Handle joining active class session (for logged-in students)
  const handleJoinActiveSession = async () => {
    if (!activeSession?.classData || !pinSession) return;

    setIsJoining(true);
    try {
      const seatId = `seat-${pinSession.seatNumber}`;
      await joinClassSession(activeSession.classData.id, seatId, {
        seatNumber: pinSession.seatNumber,
        name: pinSession.displayName || pinSession.username
      });

      // Track student join in analytics (uses classCode as the pilotSessions key)
      logStudentJoined(activeSession.classData.classCode).catch((err) => {
        console.warn('Analytics student count update failed (non-critical):', err);
      });

      const lessonRoute = activeSession.classData.currentSession?.lessonRoute || '/lessons/film-music-project/lesson1';
      window.location.href = `${lessonRoute}?classId=${activeSession.classData.id}&role=student&classCode=${activeSession.classData.classCode}&seatId=${seatId}&username=${pinSession.username}`;
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Failed to join lesson. Please try again.');
      setIsJoining(false);
    }
  };

  // Handle direct username + password login (classroom-only mode)
  const handleDirectLogin = async () => {
    if (!username || !pin) {
      setError('Enter your username and password');
      return;
    }
    setIsJoining(true);
    setError('');
    try {
      await signInWithUsername(username, pin);
      navigate('/student/home');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      setIsJoining(false);
    }
  };

  // Preview mode loading screen
  if (isPreviewMode && urlCode) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800">
        <div className="text-5xl mb-5 animate-pulse">&#127925;</div>
        <div className="text-2xl font-semibold mb-2">Loading Student View...</div>
        <div className="text-gray-500">Session: {urlCode}</div>
        {error && (
          <div className="mt-5 px-6 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        {!isEduSite && (
          <img
            src="/MusicMindAcademyLogo.png"
            alt={siteName}
            className="h-16 w-auto mx-auto mb-3"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-800">{siteName}</h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          {isPinAuth && (activeSession || (!checkingSession && !activeSession)) ? (
            /* Logged in → always go to dashboard */
            <>
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Welcome back, {currentStudentInfo?.displayName}</h2>
                <p className="text-gray-500 text-sm">{pinSession?.className}</p>
              </div>

              <button
                onClick={() => navigate('/student/home')}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-lg flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Go to Dashboard
              </button>

              <button
                onClick={() => signOut()}
                className="w-full mt-3 text-red-400 hover:text-red-600 text-sm font-medium py-2 transition-colors"
              >
                Not you? Sign out
              </button>
            </>
          ) : isPinAuth && checkingSession ? (
            /* Still checking for active session */
            <>
              <div className="text-center py-4">
                <Loader2 size={24} className="animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            </>
          ) : (
            /* Not authenticated — username + password form */
            <>
              <div className="text-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Student Login</h2>
                <p className="text-gray-500 text-sm">Use the username and password from your login card</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      setError('');
                    }}
                    placeholder="tuba123"
                    maxLength={20}
                    autoFocus
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="username"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.toLowerCase().replace(/[^a-z]/g, ''));
                        setError('');
                      }}
                      placeholder="epicdrum"
                      maxLength={20}
                      autoComplete="current-password"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && username && pin && handleDirectLogin()}
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

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleDirectLogin}
                  disabled={isJoining || !username || !pin}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
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
                  Check your login card from your teacher for your username and password
                </p>
              </div>
            </>
          )}
        </div>

        {/* Teacher link */}
        <div className="mt-4 text-center">
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
    </div>
  );
}

export default JoinWithCode;
