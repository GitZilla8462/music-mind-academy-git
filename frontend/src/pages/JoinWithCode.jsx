// File: /pages/JoinWithCode.jsx
// JOIN PAGE - Handles both session codes (4 digits) and class codes (6 chars)
// - 4-digit code: Quick/guest session - join directly
// - 6-char code: Class session - show seat + PIN form

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { getClassByCode, joinClassSession } from '../firebase/classes';
import { verifyStudentPinByUsername } from '../firebase/enrollments';
import { getStudentId, getAllStudentWork, migrateOldSaves } from '../utils/studentWorkStorage';
import BeatEscapeRoomActivity from '../lessons/shared/activities/beat-escape-room/BeatEscapeRoomActivity';
import MelodyMysteryActivity from '../lessons/shared/activities/melody-mystery/MelodyMysteryActivity';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Eye, EyeOff } from 'lucide-react';

function JoinWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Code input state
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState(null); // 'session' | 'class' | null
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  // Class login state (shown after class code is detected)
  const [classData, setClassData] = useState(null);
  const [username, setUsername] = useState(''); // Musical username like "tuba123"
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Saved work
  const [studentId, setStudentId] = useState('');
  const [savedWork, setSavedWork] = useState([]);

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
    setStudentId(id);
    migrateOldSaves(id);
    const work = getAllStudentWork(id);
    setSavedWork(work);
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
          setError('No active session for this class. Ask your teacher to start the lesson.');
          setIsChecking(false);
          return;
        }

        // Show seat + PIN form
        setCodeType('class');
        setClassData(classInfo);
        setIsChecking(false);
        return;
      }

      // Invalid format
      setError('Enter a 4-digit session code or 6-character class code (like AB1234)');
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

      // Navigate to the lesson - include classCode for session joining
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
    setUsername('');
    setPin('');
    setError('');
  };

  const handleViewWork = (work) => {
    if (work.viewRoute) {
      navigate(work.viewRoute);
    }
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  // Preview mode loading screen
  if (isPreviewMode && urlCode) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>🎵</div>
        <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px' }}>
          Loading Student View...
        </div>
        <div style={{ fontSize: '16px', color: '#a0aec0' }}>
          Session: {urlCode}
        </div>
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#fc8181',
            color: '#742a2a',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: '20px',
        marginTop: '10px'
      }}>
        {siteName}
      </h1>

      <div style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{ height: '1px', backgroundColor: '#cbd5e0', marginBottom: '15px' }}></div>

        {/* Show seat + PIN form if class code was entered */}
        {codeType === 'class' && classData ? (
          <div style={{
            marginBottom: '20px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Class info header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#4299e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎵
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>
                  {classData.name}
                </div>
                <div style={{ fontSize: '13px', color: '#718096' }}>
                  Code: {classData.classCode}
                </div>
              </div>
            </div>

            {/* Username + PIN form */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g., tuba123"
                maxLength={20}
                autoCapitalize="off"
                autoCorrect="off"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="4-digit PIN"
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '44px',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    letterSpacing: '4px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  onKeyPress={(e) => e.key === 'Enter' && handleClassLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#718096',
                    padding: '4px'
                  }}
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px',
                backgroundColor: '#fed7d7',
                color: '#742a2a',
                borderRadius: '8px',
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleClassLogin}
              disabled={isJoining || !username || !pin}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: (isJoining || !username || !pin) ? '#cbd5e0' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (isJoining || !username || !pin) ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {isJoining ? 'Joining...' : 'Join Class'}
            </button>

            <button
              onClick={handleBackToCodeEntry}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'transparent',
                color: '#718096',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ← Back to code entry
            </button>
          </div>
        ) : (
          /* Code entry form */
          <div style={{
            marginBottom: '20px',
            backgroundColor: '#f7fafc',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '16px' }}>👉</span>
              Enter Class Code
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: error ? '6px' : '0' }}>
              <input
                type="text"
                placeholder="CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
                maxLength={6}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '6px',
                  border: '2px solid #4299e1',
                  letterSpacing: '3px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCodeSubmit}
                disabled={isChecking || code.length < 4}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: (isChecking || code.length < 4) ? '#cbd5e0' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (isChecking || code.length < 4) ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: (isChecking || code.length < 4) ? 'none' : '0 2px 4px rgba(72,187,120,0.3)'
                }}
              >
                {isChecking ? 'Checking...' : 'Join'}
              </button>
            </div>

            {error && (
              <div style={{
                padding: '8px',
                backgroundColor: '#fed7d7',
                color: '#742a2a',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '6px'
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Student Account Access Banner - only show on code entry screen */}
        {codeType !== 'class' && (
          <>
            {!isAuthenticated ? (
              <div style={{
                marginBottom: '15px',
                padding: '12px 15px',
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ fontSize: '13px', color: '#4a5568' }}>
                  <span style={{ fontWeight: '600' }}>Need to check grades or saved work?</span>
                </div>
                <button
                  onClick={() => navigate('/student-login')}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#718096',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Student Login
                </button>
              </div>
            ) : (
              <div style={{
                marginBottom: '15px',
                padding: '12px 15px',
                backgroundColor: '#f0fff4',
                border: '1px solid #9ae6b4',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ fontSize: '13px', color: '#276749' }}>
                  <span style={{ fontWeight: '600' }}>Signed in as {currentStudentInfo?.displayName || 'Student'}</span>
                </div>
                <button
                  onClick={() => navigate('/student/home')}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  My Dashboard
                </button>
              </div>
            )}

            <div style={{ height: '1px', backgroundColor: '#cbd5e0', marginBottom: '15px' }}></div>

            {/* Saved Work */}
            {savedWork.length > 0 ? (
              <>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '10px'
                }}>
                  💾 Your Saved Work
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedWork.map((work) => (
                    <div
                      key={work.activityId}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontSize: '28px' }}>
                          {work.emoji || '📁'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
                            {work.title || 'Untitled'}
                          </div>
                          {work.subtitle && (
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                              {work.subtitle}
                            </div>
                          )}
                          {work.category && (
                            <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '2px' }}>
                              {work.category}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '10px', color: '#a0aec0', marginBottom: '8px' }}>
                        Saved {formatDate(work.lastSaved)}
                      </div>

                      <button
                        onClick={() => handleViewWork(work)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#4299e1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        👁️ View
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💾</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
                  No Saved Work Yet
                </div>
                <div style={{ fontSize: '12px', color: '#718096', lineHeight: '1.5' }}>
                  When you complete activities and click "Save", your work will appear here.<br/>
                  You can return to this page anytime to view your saved work.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JoinWithCode;
