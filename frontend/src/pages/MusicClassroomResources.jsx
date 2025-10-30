import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staticProjects } from './CreateAssignmentPage';
import { createSession, sessionExists } from '../firebase/config';

function MusicClassroomResources() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedBonusComposition, setSavedBonusComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);
  const [dawStats, setDawStats] = useState(null);
  
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
      localStorage.setItem('classroom-username', username); // Store username
      localStorage.setItem('classroom-user-id', username);  // Store user ID
    } else if (username === 'teacher' && password === 'teach2025') {
      setLoggedIn(true);
      localStorage.setItem('classroom-logged-in', 'true');
      localStorage.setItem('classroom-user-role', 'teacher');
      localStorage.setItem('classroom-username', 'Teacher'); // Store username
      localStorage.setItem('classroom-user-id', 'teacher');  // Store user ID
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
    localStorage.removeItem('classroom-logged-in');
    localStorage.removeItem('classroom-user-role');
  };

  // TEACHER: Start a session - GO DIRECTLY TO CONTROL PANEL
  const handleStartSession = async (lessonId) => {
    setIsCreatingSession(true);
    setSessionError('');
    
    try {
      const code = await createSession('teacher', lessonId);
      console.log('Session created with code:', code);
      
      // Go directly to lesson control panel (not session start page)
      window.location.href = `/lessons/film-music-project/lesson1?session=${code}&role=teacher`;
    } catch (error) {
      console.error('Error creating session:', error);
      setSessionError('Failed to create session. Please try again.');
      setIsCreatingSession(false);
    }
  };

  // STUDENT: Join a session
  const handleJoinSession = async () => {
    if (!sessionCodeInput || sessionCodeInput.length !== 4) {
      setSessionError('Please enter a 4-digit code');
      return;
    }

    setIsJoiningSession(true);
    setSessionError('');

    try {
      const exists = await sessionExists(sessionCodeInput);
      
      if (!exists) {
        setSessionError('Session not found. Check the code and try again.');
        setIsJoiningSession(false);
        return;
      }

      // Redirect to lesson in student mode
      window.location.href = `/lessons/film-music-project/lesson1?session=${sessionCodeInput}&role=student`;
    } catch (error) {
      console.error('Error joining session:', error);
      setSessionError('Failed to join session. Please try again.');
      setIsJoiningSession(false);
    }
  };

  // Load ALL saved data from localStorage when logged in
  useEffect(() => {
    if (loggedIn) {
      // Load main composition
      const savedComp = localStorage.getItem('school-beneath-composition');
      if (savedComp) {
        try {
          setSavedComposition(JSON.parse(savedComp));
        } catch (error) {
          console.error('Error loading saved composition:', error);
        }
      }

      // Load bonus composition
      const savedBonus = localStorage.getItem('school-beneath-bonus');
      if (savedBonus) {
        try {
          setSavedBonusComposition(JSON.parse(savedBonus));
        } catch (error) {
          console.error('Error loading bonus composition:', error);
        }
      }

      // Load reflection
      const savedRefl = localStorage.getItem('school-beneath-reflection');
      if (savedRefl) {
        try {
          setSavedReflection(JSON.parse(savedRefl));
        } catch (error) {
          console.error('Error loading saved reflection:', error);
        }
      }

      // Load DAW stats
      const stats = localStorage.getItem('lesson1-daw-stats');
      if (stats) {
        try {
          setDawStats(JSON.parse(stats));
        } catch (error) {
          console.error('Error loading DAW stats:', error);
        }
      }
    }
  }, [loggedIn]);

  // Pull projects from CreateAssignmentPage and map to classroom format
  // Filter to only show the DAW lesson
  const classroomResources = staticProjects
    .filter(project => project.projectId === 'film-music-unit-lesson-1')
    .map(project => ({
      id: project.projectId,
      title: project.projectTitle,
      projectType: project.projectType,
      description: project.description,
      demoUrl: project.demoUrl,
      url: project.projectType === 'lesson' ? project.demoUrl : '/projects/video-selection'
    }));

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
            style={{ 
              display: 'block', 
              margin: '12px 0', 
              padding: '12px 16px', 
              width: '100%',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4299e1'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{ 
              display: 'block', 
              margin: '12px 0', 
              padding: '12px 16px', 
              width: '100%',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4299e1'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <button 
            onClick={handleLogin} 
            style={{ 
              padding: '14px', 
              marginTop: '24px',
              width: '100%',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
          >
            Access Resources
          </button>
        </div>
      </div>
    );
  }

  // RESOURCES PAGE (after login)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '2px solid #e2e8f0',
        padding: '20px 0'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1a202c',
            margin: 0
          }}>
            Music Room Tools
          </h1>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 24px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {/* STUDENT: Join Session Box */}
        {userRole === 'student' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '600px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px'
            }}>
              Join Live Session
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#718096',
              marginBottom: '16px'
            }}>
              Enter the 4-digit code from your teacher to join the lesson
            </p>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <input
                type="text"
                placeholder="Enter code (e.g. 7284)"
                value={sessionCodeInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setSessionCodeInput(value);
                  setSessionError('');
                }}
                maxLength={4}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
              />
              <button
                onClick={handleJoinSession}
                disabled={isJoiningSession || sessionCodeInput.length !== 4}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: sessionCodeInput.length === 4 && !isJoiningSession ? '#48bb78' : '#e2e8f0',
                  color: sessionCodeInput.length === 4 && !isJoiningSession ? 'white' : '#a0aec0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: sessionCodeInput.length === 4 && !isJoiningSession ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (sessionCodeInput.length === 4 && !isJoiningSession) {
                    e.target.style.backgroundColor = '#38a169';
                  }
                }}
                onMouseLeave={(e) => {
                  if (sessionCodeInput.length === 4 && !isJoiningSession) {
                    e.target.style.backgroundColor = '#48bb78';
                  }
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
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {sessionError}
              </div>
            )}
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '600px'
        }}>
          {/* Resources Cards */}
          {classroomResources.map(resource => (
            <div key={resource.id} style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: resource.projectType === 'lesson' ? '#bee3f8' : '#c6f6d5',
                  color: resource.projectType === 'lesson' ? '#2c5282' : '#22543d',
                  borderRadius: '16px',
                  textTransform: 'uppercase'
                }}>
                  {resource.projectType}
                </span>
              </div>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                {resource.title}
              </h2>
              <p style={{ 
                fontSize: '15px',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {resource.description}
              </p>
              
              {/* TEACHER: Show two buttons */}
              {userRole === 'teacher' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => handleStartSession(resource.id)}
                    disabled={isCreatingSession}
                    style={{ 
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: isCreatingSession ? '#e2e8f0' : '#48bb78',
                      color: isCreatingSession ? '#a0aec0' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCreatingSession) e.target.style.backgroundColor = '#38a169';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCreatingSession) e.target.style.backgroundColor = '#48bb78';
                    }}
                  >
                    {isCreatingSession ? 'Creating Session...' : '🎯 Start Live Session'}
                  </button>
                  <button 
                    onClick={() => window.location.href = resource.url}
                    style={{ 
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                  >
                    📖 Preview Lesson
                  </button>
                </div>
              ) : (
                /* STUDENT: Show regular open button */
                <button 
                  onClick={() => window.location.href = resource.url}
                  style={{ 
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                >
                  Open {resource.projectType === 'lesson' ? 'Lesson' : 'Project'}
                </button>
              )}
              
              {sessionError && userRole === 'teacher' && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#fed7d7',
                  color: '#742a2a',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  {sessionError}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saved Work Section - keeping all your existing code */}
        {(savedComposition || savedBonusComposition || savedReflection || dawStats) && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '24px'
            }}>
              My Saved Work
            </h2>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div>
                {/* Title section */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    backgroundColor: '#4299e1',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '24px', color: 'white' }}>♪</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1a202c',
                      margin: 0
                    }}>
                      Lesson 1: School Beneath
                    </h3>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#718096',
                      margin: '4px 0 0 0'
                    }}>
                      Film Music Composition
                    </p>
                  </div>
                </div>

                {/* DAW Tutorial Stats */}
                {dawStats && (
                  <div style={{ 
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>DAW Tutorial Performance</span>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Correct Answers</div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: '700', 
                          color: '#48bb78'
                        }}>
                          {dawStats.correct}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Incorrect Answers</div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: '700', 
                          color: '#f56565'
                        }}>
                          {dawStats.incorrect}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Accuracy Rate</div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#4299e1'
                      }}>
                        {dawStats.correct + dawStats.incorrect > 0 
                          ? Math.round((dawStats.correct / (dawStats.correct + dawStats.incorrect)) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Composition Info */}
                {savedComposition && (
                  <>
                    <div style={{ 
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      border: '2px solid #4299e1'
                    }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600',
                        color: '#2b6cb0',
                        marginBottom: '8px'
                      }}>
                        Main Composition Saved
                      </div>
                      <div style={{ fontSize: '12px', color: '#2c5282' }}>
                        {savedComposition.loopCount} loops • Saved on {new Date(savedComposition.savedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Requirements Status */}
                    <div style={{ 
                      backgroundColor: '#f7fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                        Requirements Met:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.minLoops ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.minLoops ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.minLoops ? '✓' : '✗'} Minimum Loops
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.layering ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.layering ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.layering ? '✓' : '✗'} Layering
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.structure ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.structure ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.structure ? '✓' : '✗'} Structure
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Bonus Composition Info */}
                {savedBonusComposition && (
                  <div style={{ 
                    backgroundColor: '#fef5e7',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '2px solid #f6ad55'
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '600',
                      color: '#c05621',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Bonus Composition Created!</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#744210' }}>
                      {savedBonusComposition.loopCount} loops • Saved on {new Date(savedBonusComposition.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Reflection Info */}
                {savedReflection && (
                  <div style={{ 
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                      Reflection Completed:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        backgroundColor: '#e9d5ff',
                        color: '#5b21b6',
                        fontWeight: '600'
                      }}>
                        Two Stars and a Wish
                      </span>
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        ({savedReflection.reviewType === 'self' ? 'Self-Reflection' : `Partner: ${savedReflection.partnerName}`})
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ 
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '16px',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {savedComposition && (
                    <button
                      onClick={() => {
                        window.location.href = '/lessons/film-music-project/lesson1?view=saved';
                      }}
                      style={{
                        flex: '1 1 150px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: '#4299e1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                    >
                      <span>View Main</span>
                    </button>
                  )}

                  {savedBonusComposition && (
                    <button
                      onClick={() => {
                        window.location.href = '/lessons/film-music-project/lesson1?view=bonus';
                      }}
                      style={{
                        flex: '1 1 150px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: '#ed8936',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6b20'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ed8936'}
                    >
                      <span>View Bonus</span>
                    </button>
                  )}

                  {savedReflection && (
                    <button
                      onClick={() => {
                        window.location.href = '/lessons/film-music-project/lesson1?view=reflection';
                      }}
                      style={{
                        flex: '1 1 150px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: '#9f7aea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#805ad5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#9f7aea'}
                    >
                      <span>Reflection</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete ALL your saved work (DAW stats, compositions, and reflection)? This cannot be undone.')) {
                        localStorage.removeItem('school-beneath-composition');
                        localStorage.removeItem('school-beneath-bonus');
                        localStorage.removeItem('school-beneath-reflection');
                        localStorage.removeItem('lesson1-daw-stats');
                        setSavedComposition(null);
                        setSavedBonusComposition(null);
                        setSavedReflection(null);
                        setDawStats(null);
                        alert('All saved work deleted successfully');
                      }
                    }}
                    style={{
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicClassroomResources;