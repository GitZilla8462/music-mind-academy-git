import React, { useState, useEffect } from 'react';
import { staticProjects } from './CreateAssignmentPage';

function MusicClassroomResources() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedBonusComposition, setSavedBonusComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);
  const [dawStats, setDawStats] = useState(null);

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
    } else if (username === 'teacher' && password === 'teach2025') {
      setLoggedIn(true);
      localStorage.setItem('classroom-logged-in', 'true');
      localStorage.setItem('classroom-user-role', 'teacher');
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
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#1a202c',
            margin: 0
          }}>
            Music Room Tools
          </h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>
            Available Lessons & Activities
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
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
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px' }}>
        {/* Resources Grid */}
        {classroomResources.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '20px'
            }}>
              Available Lessons
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {classroomResources.map((resource) => (
                <div
                  key={resource.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ 
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: '#ebf8ff',
                    color: '#2c5282',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    {resource.projectType.toUpperCase()}
                  </div>

                  <h3 style={{ 
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '8px'
                  }}>
                    {resource.title}
                  </h3>

                  <p style={{ 
                    fontSize: '14px',
                    color: '#718096',
                    marginBottom: '20px',
                    lineHeight: '1.6'
                  }}>
                    {resource.description}
                  </p>

                  <button
                    onClick={() => {
                      window.location.href = resource.url;
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
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
                    {resource.projectType === 'lesson' ? 'Start Lesson' : 'Start Activity'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY WORK SECTION - EXPANDED */}
        {(savedComposition || savedBonusComposition || savedReflection || dawStats) && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '20px'
            }}>
              ðŸ“ My Saved Work
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {/* Card for Lesson 1 Saved Work */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <span style={{ fontSize: '32px' }}>ðŸŽµ</span>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#2d3748',
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
                      <span>ðŸŽ¯</span>
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
                    {dawStats.correct + dawStats.incorrect > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                          Accuracy Rate
                        </div>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '600', 
                          color: '#2d3748'
                        }}>
                          {Math.round((dawStats.correct / (dawStats.correct + dawStats.incorrect)) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Composition Info */}
                {savedComposition && (
                  <>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Main Composition</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                          {savedComposition.loopCount} loops
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Submitted</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#2d3748' }}>
                          {new Date(savedComposition.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>Duration</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#2d3748' }}>
                          {Math.round(savedComposition.videoDuration)}s
                        </div>
                      </div>
                    </div>

                    {/* Requirements Status */}
                    <div style={{ 
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                        Requirements Met:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.instrumentation ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.instrumentation ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.instrumentation ? 'âœ“' : 'âœ—'} Instrumentation
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.layering ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.layering ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.layering ? 'âœ“' : 'âœ—'} Layering
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          backgroundColor: savedComposition.requirements.structure ? '#c6f6d5' : '#fed7d7',
                          color: savedComposition.requirements.structure ? '#22543d' : '#742a2a'
                        }}>
                          {savedComposition.requirements.structure ? 'âœ“' : 'âœ—'} Structure
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
                      <span>âœ¨</span>
                      <span>Bonus Composition Created!</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#744210' }}>
                      {savedBonusComposition.loopCount} loops â€¢ Saved on {new Date(savedBonusComposition.savedAt).toLocaleDateString()}
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
                        â­ Two Stars and a Wish
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
                      <span>ðŸ“</span>
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
                      <span>âœ¨</span>
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
                      <span>â­</span>
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