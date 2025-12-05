// File: /pages/JoinWithCode.jsx
// ULTRA-COMPACT JOIN PAGE - Optimized for 1366x768 Chromebook
// ✅ Title, join code, saved items all visible without scrolling
// ✅ Auto-join for preview mode (when preview=true in URL)
// ✅ GENERIC: Automatically displays ANY saved student work

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionData } from '../firebase/config';
import { getStudentId, getAllStudentWork, migrateOldSaves } from '../utils/studentWorkStorage';

function JoinWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionCode, setSessionCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [savedWork, setSavedWork] = useState([]);

  // Check for preview mode (used by teacher's presentation view)
  const isPreviewMode = searchParams.get('preview') === 'true';
  const urlCode = searchParams.get('code');

  useEffect(() => {
    const id = getStudentId();
    setStudentId(id);
    
    // Migrate old saves to new format (runs once, safe to call multiple times)
    migrateOldSaves(id);
    
    // Load all saved work
    const work = getAllStudentWork(id);
    setSavedWork(work);
  }, []);

  // Auto-join for preview mode
  useEffect(() => {
    if (isPreviewMode && urlCode && urlCode.length === 4) {
      console.log('🎬 Preview mode detected, auto-joining session:', urlCode);
      handleAutoJoin(urlCode);
    }
  }, [isPreviewMode, urlCode]);

  // Auto-join for preview mode (no user interaction needed)
  const handleAutoJoin = async (code) => {
    try {
      const sessionData = await getSessionData(code);
      
      if (!sessionData) {
        console.error('❌ Preview mode: Session not found');
        setError('Session not found');
        return;
      }

      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson1';
      window.location.href = `${lessonRoute}?session=${code}&role=student&preview=true`;
    } catch (error) {
      console.error('❌ Preview mode error:', error);
      setError('Failed to load preview');
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode || sessionCode.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const sessionData = await getSessionData(sessionCode);
      
      if (!sessionData) {
        setError('Session not found. Check the code and try again.');
        setIsJoining(false);
        return;
      }

      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson1';
      window.location.href = `${lessonRoute}?session=${sessionCode}&role=student`;
    } catch (error) {
      console.error('❌ Error joining session:', error);
      setError('Failed to join session. Please try again.');
      setIsJoining(false);
    }
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

  // Show loading screen during preview auto-join
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
      {/* Title - Compact */}
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: '20px',
        marginTop: '10px'
      }}>
        Music Room Tools
      </h1>

      {/* Container for join + saved work */}
      <div style={{ 
        maxWidth: '700px', 
        width: '100%'
      }}>
        {/* Thin line */}
        <div style={{
          height: '1px',
          backgroundColor: '#cbd5e0',
          marginBottom: '15px'
        }}></div>

        {/* Join Code Section */}
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
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
              maxLength={4}
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
              onClick={handleJoinSession}
              disabled={isJoining || sessionCode.length !== 4}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: (isJoining || sessionCode.length !== 4) ? '#cbd5e0' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isJoining || sessionCode.length !== 4) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: (isJoining || sessionCode.length !== 4) ? 'none' : '0 2px 4px rgba(72,187,120,0.3)'
              }}
            >
              {isJoining ? 'Joining...' : 'Join'}
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

        {/* Thin line */}
        <div style={{
          height: '1px',
          backgroundColor: '#cbd5e0',
          marginBottom: '15px'
        }}></div>

        {/* Saved Work - Generic Rendering */}
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
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        {work.title || 'Untitled'}
                      </div>
                      {work.subtitle && (
                        <div style={{
                          fontSize: '12px',
                          color: '#718096'
                        }}>
                          {work.subtitle}
                        </div>
                      )}
                      {work.category && (
                        <div style={{
                          fontSize: '10px',
                          color: '#a0aec0',
                          marginTop: '2px'
                        }}>
                          {work.category}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '10px',
                    color: '#a0aec0',
                    marginBottom: '8px'
                  }}>
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
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              No Saved Work Yet
            </div>
            <div style={{
              fontSize: '12px',
              color: '#718096',
              lineHeight: '1.5'
            }}>
              When you complete activities and click "Save", your work will appear here.<br/>
              You can return to this page anytime to view your saved work.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinWithCode;