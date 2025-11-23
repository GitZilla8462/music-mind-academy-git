// File: /pages/MusicClassroomResources.jsx
// UPDATED VERSION - Join code area half as small + Saved compositions display below
// ✅ Shows saved city compositions with video thumbnail and composition details

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, getSessionData } from '../firebase/config';

function MusicClassroomResources() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedBonusComposition, setSavedBonusComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);
  const [dawStats, setDawStats] = useState(null);
  
  // ✅ NEW: City composition state
  const [savedCityComposition, setSavedCityComposition] = useState(null);
  
  // Session state
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [sessionError, setSessionError] = useState('');
  
  // Get user role
  const userRole = localStorage.getItem('classroom-user-role');

  // Check if already logged in on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('classroom-logged-in');
    if (isLoggedIn === 'true') {
      setLoggedIn(true);
    }
  }, []);

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

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setSavedComposition(null);
    setSavedBonusComposition(null);
    setSavedReflection(null);
    setDawStats(null);
    setSavedCityComposition(null);
    localStorage.removeItem('classroom-logged-in');
    localStorage.removeItem('classroom-user-role');
  };

  // TEACHER - Start a session with lesson route
  const handleStartSession = async () => {
    setIsCreatingSession(true);
    setSessionError('');
    
    try {
      const code = await createSession(
        'teacher', 
        'lesson1',
        '/lessons/film-music-project/lesson1'
      );
      console.log('✅ Session created with code:', code);
      
      window.location.href = `/lessons/film-music-project/lesson1?session=${code}&role=teacher`;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      setSessionError('Failed to create session. Please try again.');
      setIsCreatingSession(false);
    }
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

      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson1';
      
      console.log(`✅ Student joining session ${sessionCodeInput} at route: ${lessonRoute}`);
      
      window.location.href = `${lessonRoute}?session=${sessionCodeInput}&role=student`;
    } catch (error) {
      console.error('❌ Error joining session:', error);
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
      
      // ✅ NEW: Load city composition
      const studentId = localStorage.getItem('anonymous-student-id');
      if (studentId) {
        const cityKey = `city-composition-${studentId}`;
        const savedCity = localStorage.getItem(cityKey);
        if (savedCity) {
          try {
            const data = JSON.parse(savedCity);
            setSavedCityComposition(data);
            console.log('✅ Loaded saved city composition:', data);
          } catch (error) {
            console.error('Error loading city composition:', error);
          }
        }
      }
    }
  }, [loggedIn]);

  // LOGIN PAGE
  if (!loggedIn) {
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
            Music Room Tools
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
      padding: '40px 20px'
    }}>
      {/* Simple Header */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold',
          color: '#1a202c'
        }}>
          Music Room Tools
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

      {/* Two Boxes Side by Side */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px'
      }}>
        
        {/* BOX 1: Introduction to the DAW */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '2px solid #e2e8f0',
            transition: 'all 0.2s'
          }}
        >
          {/* Icon */}
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            🎬
          </div>
          
          {/* Title */}
          <h3 style={{ 
            fontSize: '26px', 
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Introduction to the DAW
          </h3>
          
          {/* Description */}
          <p style={{ 
            color: '#718096', 
            fontSize: '16px',
            marginBottom: '24px',
            lineHeight: '1.6',
            textAlign: 'center'
          }}>
            This lesson will introduce students how to use the software for the music loops in media project.
          </p>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            margin: '24px 0'
          }}></div>

          {/* Teacher or Student Controls */}
          {userRole === 'teacher' ? (
            // TEACHER: Start Live Session Button
            <div>
              <div style={{
                textAlign: 'center',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#718096'
              }}>
                👨‍🏫 Teacher Mode
              </div>
              
              <button
                onClick={handleStartSession}
                disabled={isCreatingSession}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: isCreatingSession ? '#a0aec0' : '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !isCreatingSession && (e.target.style.backgroundColor = '#3182ce')}
                onMouseLeave={(e) => !isCreatingSession && (e.target.style.backgroundColor = '#4299e1')}
              >
                {isCreatingSession ? 'Creating Session...' : '🎬 Start Live Session'}
              </button>

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
          ) : (
            // STUDENT: Join Session - ✅ HALF AS SMALL
            <div>
              <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#718096'
              }}>
                👨‍🎓 Enter code
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="CODE"
                  value={sessionCodeInput}
                  onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
                  maxLength={4}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRadius: '6px',
                    border: '2px solid #4299e1',
                    letterSpacing: '3px'
                  }}
                />
                <button
                  onClick={handleJoinSession}
                  disabled={isJoiningSession || sessionCodeInput.length !== 4}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: (isJoiningSession || sessionCodeInput.length !== 4) ? '#a0aec0' : '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
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
                  padding: '8px',
                  backgroundColor: '#fed7d7',
                  color: '#742a2a',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  {sessionError}
                </div>
              )}

              {/* Divider */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                margin: '16px 0'
              }}></div>

              {/* Solo Practice Button */}
              <button
                onClick={() => navigate('/lessons/film-music-project/lesson1')}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: '#805ad5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#6b46c1'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#805ad5'}
              >
                Practice Solo
              </button>
              
              {/* ✅ NEW: SAVED CITY COMPOSITION DISPLAY */}
              {savedCityComposition && (
                <div style={{
                  marginTop: '20px',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '20px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '12px'
                  }}>
                    💾 Saved Composition
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '32px' }}>
                        {savedCityComposition.composition.videoEmoji || '🏙️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2d3748'
                        }}>
                          {savedCityComposition.composition.videoTitle || 'City Soundscape'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#718096'
                        }}>
                          {savedCityComposition.composition.placedLoops?.length || 0} loops • {' '}
                          {Math.floor((savedCityComposition.composition.videoDuration || 0) / 60)}:{Math.floor((savedCityComposition.composition.videoDuration || 0) % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '11px',
                      color: '#a0aec0',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}>
                      Saved {new Date(savedCityComposition.lastSaved).toLocaleString()}
                    </div>
                    
                    <button
                      onClick={() => {
                        // Navigate to lesson 3 to view composition
                        navigate('/lessons/film-music-project/lesson3');
                      }}
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show saved work stats for students (Lesson 1) */}
          {userRole === 'student' && (dawStats || savedComposition || savedReflection) && (
            <div style={{ 
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <div style={{ 
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Your Progress (Lesson 1)
              </div>
              
              {dawStats && (
                <div style={{ marginBottom: '8px', color: '#4a5568', textAlign: 'center' }}>
                  ✓ DAW Tutorial: {dawStats.correct} / {dawStats.correct + dawStats.incorrect} correct
                </div>
              )}

              {savedComposition && (
                <div style={{ 
                  backgroundColor: '#e6fffa',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '2px solid #81e6d9',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#234e52', marginBottom: '6px' }}>
                    ✓ Composition Saved!
                  </div>
                  <div style={{ fontSize: '12px', color: '#285e61' }}>
                    {savedComposition.loopCount} loops
                  </div>
                </div>
              )}

              {savedReflection && (
                <div style={{ textAlign: 'center', color: '#4a5568', fontSize: '13px' }}>
                  ✓ Reflection Complete
                </div>
              )}

              <div style={{ 
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                flexWrap: 'wrap'
              }}>
                {savedComposition && (
                  <button
                    onClick={() => window.location.href = '/lessons/film-music-project/lesson1?view=saved'}
                    style={{
                      flex: '1 1 120px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    View Work
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Delete all saved work? This cannot be undone.')) {
                      localStorage.removeItem('school-beneath-composition');
                      localStorage.removeItem('school-beneath-bonus');
                      localStorage.removeItem('school-beneath-reflection');
                      localStorage.removeItem('lesson1-daw-stats');
                      setSavedComposition(null);
                      setSavedBonusComposition(null);
                      setSavedReflection(null);
                      setDawStats(null);
                      alert('All saved work deleted');
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOX 2: Music Loops in Media Project */}
        <div 
          onClick={() => navigate('/music-loops-in-media')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          {/* Icon */}
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            🎵
          </div>
          
          {/* Title */}
          <h3 style={{ 
            fontSize: '26px', 
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            Music Loops in Media Project
          </h3>
          
          {/* Description */}
          <p style={{ 
            fontSize: '16px',
            marginBottom: '24px',
            lineHeight: '1.6',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.95)'
          }}>
            5-lesson unit: Compose music for sports highlights, video games, cooking videos, comedy ads, and student choice projects.
          </p>

          {/* Badges */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              5 Lessons
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              ⏱️ 35 min each
            </div>
          </div>

          {/* Lesson List */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '20px',
            fontSize: '15px',
            lineHeight: '1.8',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
              Includes:
            </div>
            <div>🏀 Sports Highlights</div>
            <div>🎮 Video Game Music</div>
            <div>🍳 Cooking Videos</div>
            <div>😂 Comedy Ads</div>
            <div>⭐ Student Choice</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicClassroomResources;