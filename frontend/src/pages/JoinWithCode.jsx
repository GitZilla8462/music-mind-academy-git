// File: /pages/JoinWithCode.jsx
// JOIN PAGE - Simple code entry for students
// - 4-digit code: Quick/guest session - join directly
// - 6-char code: Class session - show username + PIN form

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { getClassByCode, joinClassSession } from '../firebase/classes';
import { verifyStudentPinByUsername } from '../firebase/enrollments';
import { getStudentId, migrateOldSaves } from '../utils/studentWorkStorage';
import BeatEscapeRoomActivity from '../lessons/shared/activities/beat-escape-room/BeatEscapeRoomActivity';
import MelodyMysteryActivity from '../lessons/shared/activities/melody-mystery/MelodyMysteryActivity';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff, LogIn, ArrowLeft, Clock } from 'lucide-react';

function JoinWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Code input state
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState(null); // 'class' | null
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  // Class login state (shown after class code is detected)
  const [classData, setClassData] = useState(null);
  const [noActiveSession, setNoActiveSession] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Student auth
  const { isAuthenticated, currentStudentInfo } = useStudentAuth();

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

  // Auto-join for preview mode
  useEffect(() => {
    if (isPreviewMode && urlCode && urlCode.length === 4) {
      console.log('Preview mode detected, auto-joining session:', urlCode);
      handleAutoJoin(urlCode);
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

  // Auto-join for preview mode
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

  // Detect code type and handle accordingly
  const handleCodeSubmit = async () => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a code');
      return;
    }

    setIsChecking(true);
    setError('');
    setNoActiveSession(false);

    try {
      // Check if it's a 4-digit session code
      if (/^\d{4}$/.test(trimmedCode)) {
        const sessionData = await getSessionData(trimmedCode);

        if (!sessionData) {
          setError('Session not found. Check the code and try again.');
          setIsChecking(false);
          return;
        }

        // Guest session - join directly
        const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson1';
        window.location.href = `${lessonRoute}?session=${trimmedCode}&role=student`;
        return;
      }

      // Check if it's a 6-character class code
      if (/^[A-Z]{2}\d{4}$/.test(trimmedCode)) {
        const classInfo = await getClassByCode(trimmedCode);

        if (!classInfo) {
          setError('Class not found. Check the code and try again.');
          setIsChecking(false);
          return;
        }

        // Check if class has an active session
        if (!classInfo.currentSession?.active) {
          setClassData(classInfo);
          setNoActiveSession(true);
          setIsChecking(false);
          return;
        }

        // Show username + PIN form
        setCodeType('class');
        setClassData(classInfo);
        setIsChecking(false);
        return;
      }

      // Invalid format
      setError('Enter a 4-digit session code or class code from your teacher');
      setIsChecking(false);

    } catch (err) {
      console.error('Error checking code:', err);
      setError('Something went wrong. Please try again.');
      setIsChecking(false);
    }
  };

  // Handle class login with username + PIN
  const handleClassLogin = async () => {
    if (!username || !pin) {
      setError('Please enter your username and PIN');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Verify PIN by username
      const result = await verifyStudentPinByUsername(classData.id, username.trim().toLowerCase(), pin);

      if (!result.success) {
        setError(result.error || 'Invalid username or PIN');
        setIsJoining(false);
        return;
      }

      // Join the class session
      await joinClassSession(classData.id, result.seatId, {
        seatNumber: result.seatNumber,
        name: result.studentName || result.username
      });

      // Navigate to the lesson
      const lessonRoute = classData.currentSession.lessonRoute || '/lessons/film-music-project/lesson1';
      window.location.href = `${lessonRoute}?classId=${classData.id}&role=student&classCode=${classData.classCode}&seatId=${result.seatId}&username=${result.username}`;

    } catch (err) {
      console.error('Error joining class:', err);
      setError('Failed to join. Please try again.');
      setIsJoining(false);
    }
  };

  // Go back to code entry
  const handleBackToCodeEntry = () => {
    setCodeType(null);
    setClassData(null);
    setNoActiveSession(false);
    setUsername('');
    setPin('');
    setError('');
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
        <img
          src="/MusicMindAcademyLogo.png"
          alt={siteName}
          className="h-16 w-auto mx-auto mb-3"
        />
        <h1 className="text-2xl font-bold text-gray-800">{siteName}</h1>
      </div>

      {/* Main Card */}
      <div className={`w-full ${(!codeType && !noActiveSession) ? 'max-w-2xl' : 'max-w-sm'}`}>
        {/* No Active Session Message */}
        {noActiveSession && classData ? (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{classData.name}</h2>
              <p className="text-gray-500 text-sm">No lesson is running right now.</p>
            </div>

            <p className="text-gray-400 text-sm text-center mb-5">
              Your teacher hasn't started a lesson yet. You can sign in to see your work and grades while you wait.
            </p>

            <button
              onClick={() => navigate('/student-login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-3"
            >
              <LogIn size={18} />
              Sign In to My Account
            </button>

            <button
              onClick={handleBackToCodeEntry}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} />
              Try a different code
            </button>
          </div>
        ) : codeType === 'class' && classData ? (
          /* Username + PIN form for class session */
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            {/* Class info header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center text-xl text-white">
                &#127925;
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{classData.name}</div>
                <div className="text-xs text-gray-400">Code: {classData.classCode}</div>
              </div>
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
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
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
                      setError('');
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg tracking-widest"
                    onKeyDown={(e) => e.key === 'Enter' && username && pin && handleClassLogin()}
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
                onClick={handleClassLogin}
                disabled={isJoining || !username || !pin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Join Class'
                )}
              </button>

              <button
                onClick={handleBackToCodeEntry}
                className="w-full text-gray-400 hover:text-gray-600 text-sm py-1 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>
          </div>
        ) : (
          /* Two equal options side by side: Student Login (left) + Quick Join (right) */
          <div className="grid grid-cols-2 gap-4 items-start">
            {/* Left: Student Login */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Student Login</h2>
                <p className="text-gray-500 text-sm">Sign in to see your work and grades</p>
              </div>

              <div className="flex-1" />

              {isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-3">
                    Signed in as <span className="text-gray-800 font-semibold">{currentStudentInfo?.displayName}</span>
                  </p>
                  <button
                    onClick={() => navigate('/student/home')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-lg flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/student-login')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-lg flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </div>

            {/* Right: Quick Join */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Start Lesson</h2>
                <p className="text-gray-500 text-sm">Your teacher will show the code on screen</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="CODE"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && code.length >= 4 && handleCodeSubmit()}
                  maxLength={6}
                  autoFocus
                  className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-4 text-gray-800 text-center text-2xl font-bold tracking-[0.3em] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  onClick={handleCodeSubmit}
                  disabled={isChecking || code.length < 4}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isChecking ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    'Join'
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher link - always visible unless in class login flow */}
        {codeType !== 'class' && !noActiveSession && (
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
        )}
      </div>
    </div>
  );
}

export default JoinWithCode;
