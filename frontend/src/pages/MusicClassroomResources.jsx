import React, { useState, useEffect } from 'react';
import { staticProjects } from './CreateAssignmentPage';

function MusicClassroomResources() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);

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
    } else {
      alert('Wrong username or password');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setSavedComposition(null);
    setSavedReflection(null);
    localStorage.removeItem('classroom-logged-in');
  };

  // Load saved composition AND reflection from localStorage when logged in
  useEffect(() => {
    if (loggedIn) {
      // Load composition
      const savedComp = localStorage.getItem('school-beneath-composition');
      if (savedComp) {
        try {
          setSavedComposition(JSON.parse(savedComp));
        } catch (error) {
          console.error('Error loading saved composition:', error);
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
            Music Classroom Resources
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
            Music Classroom Resources
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
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Available Resources */}
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#1a202c',
          marginBottom: '16px'
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
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => window.location.href = resource.url}
            >
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  backgroundColor: resource.projectType === 'lesson' ? '#c6f6d5' : resource.projectType === 'project' ? '#bee3f8' : '#e9d5ff',
                  color: resource.projectType === 'lesson' ? '#22543d' : resource.projectType === 'project' ? '#2c5282' : '#5b21b6'
                }}>
                  {resource.projectType}
                </span>
              </div>
              
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                {resource.title}
              </h3>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#718096',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {resource.description}
              </p>
              
              <div style={{ 
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px'
              }}>
                <a 
                  href={resource.demoUrl}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: '14px',
                    color: '#4299e1',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Demo →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Saved Work Section - UPDATED WITH REFLECTION BUTTON */}
        {(savedComposition || savedReflection) && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '16px'
            }}>
              My Saved Work
            </h2>
            <div 
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #48bb78'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: '#c6f6d5',
                      color: '#22543d'
                    }}>
                      ✓ Work Saved
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600',
                    color: '#1a202c',
                    marginBottom: '16px'
                  }}>
                    The School Beneath - Film Music Project
                  </h3>
                  
                  {/* Composition Stats (only if composition exists) */}
                  {savedComposition && (
                    <>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>Loops Used</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748' }}>
                            {savedComposition.loopCount}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>Submitted</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                            {new Date(savedComposition.completedAt).toLocaleDateString()} at {new Date(savedComposition.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>Duration</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
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
                            {savedComposition.requirements.instrumentation ? '✓' : '✗'} Instrumentation
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

                  {/* Reflection Info (only if reflection exists) */}
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
                          ⭐ Two Stars and a Wish
                        </span>
                        <span style={{ fontSize: '12px', color: '#718096' }}>
                          ({savedReflection.reviewType === 'self' ? 'Self-Reflection' : `Partner: ${savedReflection.partnerName}`})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - UPDATED WITH VIEW REFLECTION BUTTON */}
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
                          flex: '1 1 200px',
                          padding: '12px 24px',
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
                        <span>📝</span>
                        <span>View Composition</span>
                      </button>
                    )}

                    {savedReflection && (
                      <button
                        onClick={() => {
                          window.location.href = '/lessons/film-music-project/lesson1?view=reflection';
                        }}
                        style={{
                          flex: '1 1 200px',
                          padding: '12px 24px',
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
                        <span>⭐</span>
                        <span>View Reflection</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete ALL your saved work (composition and reflection)? This cannot be undone.')) {
                          localStorage.removeItem('school-beneath-composition');
                          localStorage.removeItem('school-beneath-reflection');
                          setSavedComposition(null);
                          setSavedReflection(null);
                          alert('All saved work deleted successfully');
                        }
                      }}
                      style={{
                        padding: '12px 24px',
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
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicClassroomResources;