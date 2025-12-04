// File: /pages/JoinWithCode.jsx
// ULTRA-COMPACT JOIN PAGE - Optimized for 1366x768 Chromebook
// ✅ Title, join code, 2 saved items all visible without scrolling
// ✅ Auto-join for preview mode (when preview=true in URL)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionData } from '../firebase/config';

function JoinWithCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionCode, setSessionCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [savedCompositions, setSavedCompositions] = useState([]);

  // Check for preview mode (used by teacher's presentation view)
  const isPreviewMode = searchParams.get('preview') === 'true';
  const urlCode = searchParams.get('code');

  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    loadSavedCompositions(id);
  }, []);

  // Auto-join for preview mode
  useEffect(() => {
    if (isPreviewMode && urlCode && urlCode.length === 4) {
      console.log('🎬 Preview mode detected, auto-joining session:', urlCode);
      handleAutoJoin(urlCode);
    }
  }, [isPreviewMode, urlCode]);

  const loadSavedCompositions = (id) => {
    const compositions = [];

    const cityKey = `city-composition-${id}`;
    const savedCity = localStorage.getItem(cityKey);
    if (savedCity) {
      try {
        const data = JSON.parse(savedCity);
        compositions.push({ type: 'city', key: cityKey, ...data });
      } catch (error) {
        console.error('Error loading city composition:', error);
      }
    }

    const schoolKey = `school-beneath-${id}`;
    const savedSchool = localStorage.getItem(schoolKey);
    if (savedSchool) {
      try {
        const data = JSON.parse(savedSchool);
        compositions.push({ type: 'school', key: schoolKey, ...data });
      } catch (error) {
        console.error('Error loading school composition:', error);
      }
    }

    setSavedCompositions(compositions);
  };

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
      // Add preview=true so the lesson page knows this is a preview
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

  const handleViewComposition = (comp) => {
    // Clear the session storage key to allow fresh load
    const studentId = localStorage.getItem('anonymous-student-id');
    if (studentId) {
      sessionStorage.removeItem(`city-composition-loaded-${studentId}`);
    }
    
    if (comp.type === 'city') {
      // Navigate to lesson 3 with view=saved flag to load composition
      navigate('/lessons/film-music-project/lesson3?view=saved');
    } else if (comp.type === 'school') {
      // Navigate to lesson 1 with view=saved flag
      navigate('/lessons/film-music-project/lesson1?view=saved');
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

      {/* Container for join + compositions */}
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

        {/* Join Code Section - ✅ MORE OBVIOUS with better visual design */}
        <div style={{ 
          marginBottom: '20px',
          backgroundColor: '#f7fafc',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Clear label with icon */}
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

        {/* Saved Compositions - Compact */}
        {savedCompositions.length > 0 ? (
          <>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '10px'
            }}>
              💾 Saved Compositions
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedCompositions.map((comp) => (
                <div
                  key={comp.key}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {comp.type === 'city' && (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontSize: '28px' }}>
                          {comp.composition?.videoEmoji || '🏙️'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#2d3748'
                          }}>
                            {comp.composition?.videoTitle || 'City Soundscape'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#718096'
                          }}>
                            {comp.composition?.placedLoops?.length || 0} loops • {' '}
                            {Math.floor((comp.composition?.videoDuration || 0) / 60)}:{Math.floor((comp.composition?.videoDuration || 0) % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '10px',
                        color: '#a0aec0',
                        marginBottom: '8px'
                      }}>
                        Saved {new Date(comp.lastSaved).toLocaleString()}
                      </div>
                      
                      <button
                        onClick={() => handleViewComposition(comp)}
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
                        👁️ View Composition
                      </button>
                    </>
                  )}

                  {comp.type === 'school' && (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontSize: '28px' }}>🏫</div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#2d3748'
                          }}>
                            The School Beneath
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#718096'
                          }}>
                            {comp.composition?.placedLoops?.length || 0} loops
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '10px',
                        color: '#a0aec0',
                        marginBottom: '8px'
                      }}>
                        Saved {new Date(comp.lastSaved).toLocaleString()}
                      </div>
                      
                      <button
                        onClick={() => handleViewComposition(comp)}
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
                        👁️ View Composition
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Empty state - show helpful message
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
              No Saved Compositions Yet
            </div>
            <div style={{
              fontSize: '12px',
              color: '#718096',
              lineHeight: '1.5'
            }}>
              When you complete a lesson and click "Save", your compositions will appear here.<br/>
              You can return to this page anytime to view your saved work.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinWithCode;