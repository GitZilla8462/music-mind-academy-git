// File: /pages/MusicClassroomResources.jsx
// UPDATED VERSION - Matches new lesson structure
// ✅ Epic Wildlife as Lesson 3 (available)
// ✅ Video Game Montage as Lesson 4 (coming soon)
// ✅ Shows saved compositions with video thumbnail and composition details

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
  
  // City composition state
  const [savedCityComposition, setSavedCityComposition] = useState(null);
  
  // Epic Wildlife composition state
  const [savedEpicWildlifeComposition, setSavedEpicWildlifeComposition] = useState(null);
  
  // Sound Garden state
  const [savedSoundGarden, setSavedSoundGarden] = useState(null);
  
  // Session state
  const [sessionCodeInput, setSessionCodeInput] = useState('');
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
    setSavedEpicWildlifeComposition(null);
    setSavedSoundGarden(null);
    localStorage.removeItem('classroom-logged-in');
    localStorage.removeItem('classroom-user-role');
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

      const lessonRoute = sessionData.lessonRoute || '/lessons/film-music-project/lesson2';
      
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
      
      // Load city composition
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
        
        // Load Sound Garden artwork
        const soundGardenKey = `sound-garden-${studentId}`;
        const savedGarden = localStorage.getItem(soundGardenKey);
        if (savedGarden) {
          try {
            const data = JSON.parse(savedGarden);
            setSavedSoundGarden(data);
            console.log('✅ Loaded saved Sound Garden:', data);
          } catch (error) {
            console.error('Error loading Sound Garden:', error);
          }
        }
      }
      
      // Load Epic Wildlife composition
      const savedEpicWildlife = localStorage.getItem('epic-wildlife-composition');
      if (savedEpicWildlife) {
        try {
          const data = JSON.parse(savedEpicWildlife);
          setSavedEpicWildlifeComposition(data);
          console.log('✅ Loaded saved Epic Wildlife composition:', data);
        } catch (error) {
          console.error('Error loading Epic Wildlife composition:', error);
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
        maxWidth: '800px', 
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

      {/* Single centered box */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto'
      }}>
        
        {/* Student Join Session Area */}
        {userRole === 'student' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            border: '2px solid #4299e1'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              👨‍🎓 Join a Live Session
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={sessionCodeInput}
                onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px solid #4299e1',
                  letterSpacing: '4px'
                }}
              />
              <button
                onClick={handleJoinSession}
                disabled={isJoiningSession || sessionCodeInput.length !== 4}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: (isJoiningSession || sessionCodeInput.length !== 4) ? '#a0aec0' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
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
        )}

        {/* Music Loops in Media Project Card */}
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
            Learn to compose music for different types of media using loops and a digital audio workstation.
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
              4 Lessons + Sandbox
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

          {/* Lesson List - UPDATED */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '20px',
            fontSize: '15px',
            lineHeight: '1.8',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
              Lessons:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#90EE90' }}>✓</span>
              <span>🏀 Sports Highlight Reel - Intro to DAW</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#90EE90' }}>✓</span>
              <span>🏙️ City Soundscapes - Texture & Layering</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#90EE90' }}>✓</span>
              <span>🌍 Epic Wildlife - Sectional Loop Form</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
              <span>🔜</span>
              <span>🎮 Video Game Montage - Coming Soon</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
              <span>🔜</span>
              <span>🎨 Student Choice Sandbox - Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Saved Work Section */}
        {userRole === 'student' && (savedCityComposition || savedSoundGarden || savedComposition || savedEpicWildlifeComposition) && (
          <div style={{
            marginTop: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              📁 Your Saved Work
            </h3>

            {/* Sound Garden */}
            {savedSoundGarden && (
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #86efac'
              }}>
                <div style={{ fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                  🌱 Sound Garden Artwork
                </div>
                <div style={{ fontSize: '13px', color: '#15803d' }}>
                  Saved {new Date(savedSoundGarden.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* City Composition */}
            {savedCityComposition && (
              <div style={{
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                  🏙️ City Soundscape Composition
                </div>
                <div style={{ fontSize: '13px', color: '#1d4ed8' }}>
                  {savedCityComposition.loopCount || 0} loops • Saved {new Date(savedCityComposition.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Epic Wildlife Composition */}
            {savedEpicWildlifeComposition && (
              <div style={{
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                  🌍 Epic Wildlife Composition
                </div>
                <div style={{ fontSize: '13px', color: '#047857' }}>
                  {savedEpicWildlifeComposition.loopCount || 0} loops • {savedEpicWildlifeComposition.sectionCount || 0} sections • Saved {new Date(savedEpicWildlifeComposition.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Sports Composition */}
            {savedComposition && (
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #fcd34d'
              }}>
                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  🏀 Sports Highlight Composition
                </div>
                <div style={{ fontSize: '13px', color: '#b45309' }}>
                  {savedComposition.loopCount || 0} loops
                </div>
              </div>
            )}

            {/* Delete All Button */}
            <button
              onClick={() => {
                if (window.confirm('Delete all saved work? This cannot be undone.')) {
                  localStorage.removeItem('school-beneath-composition');
                  localStorage.removeItem('school-beneath-bonus');
                  localStorage.removeItem('school-beneath-reflection');
                  localStorage.removeItem('lesson1-daw-stats');
                  localStorage.removeItem('epic-wildlife-composition');
                  localStorage.removeItem('epic-wildlife-bonus');
                  localStorage.removeItem('epic-wildlife-reflection');
                  const studentId = localStorage.getItem('anonymous-student-id');
                  if (studentId) {
                    localStorage.removeItem(`sound-garden-${studentId}`);
                    localStorage.removeItem(`city-composition-${studentId}`);
                    localStorage.removeItem(`listening-map-${studentId}`);
                  }
                  setSavedComposition(null);
                  setSavedBonusComposition(null);
                  setSavedReflection(null);
                  setDawStats(null);
                  setSavedSoundGarden(null);
                  setSavedCityComposition(null);
                  setSavedEpicWildlifeComposition(null);
                  alert('All saved work deleted');
                }
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete All Saved Work
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicClassroomResources;