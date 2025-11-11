import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

// Simple Static Timer Component - Similar to Session Code Badge
const StaticTimer = ({ seconds, isCountingDown }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!isCountingDown) return '#3b82f6'; // Blue
    if (seconds > 120) return '#3b82f6';   // Blue
    if (seconds > 60) return '#f59e0b';    // Orange/Amber
    return '#ef4444';                       // Red
  };

  const timerColor = getTimerColor();

  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'inline-block'
    }}>
      <div style={{
        fontSize: '48px',
        fontWeight: '700',
        color: timerColor,
        fontFamily: 'monospace',
        letterSpacing: '2px',
        transition: 'color 0.3s ease'
      }}>
        {formatTime(seconds)}
      </div>
    </div>
  );
};

// Session Code Badge Component - RESPONSIVE with viewport-based sizing
const SessionCodeBadge = ({ sessionCode, isDarkBackground }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '1.2vw',
      left: '1.2vw',
      display: 'flex',
      alignItems: 'center',
      gap: '1vw',
      padding: '0.5vw 0.8vw',
      backgroundColor: isDarkBackground ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.8vw',
      backdropFilter: 'blur(10px)',
      border: isDarkBackground ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: isDarkBackground 
        ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1vw'
      }}>
        <span style={{
          color: isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
          fontSize: '1.8vw',
          fontWeight: '600'
        }}>
          Code:
        </span>
        <span style={{
          color: isDarkBackground ? '#ffffff' : '#3b82f6',
          fontSize: '2.5vw',
          fontWeight: '700',
          fontFamily: 'monospace',
          letterSpacing: '0.25vw'
        }}>
          {sessionCode}
        </span>
      </div>
    </div>
  );
};

const PresentationView = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const [currentStage, setCurrentStage] = useState('locked');
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  
  const lastFirebaseCountdown = useRef(null);
  const lastFirebaseStage = useRef(null);
  const lastFirebaseTimerActive = useRef(null);
  const currentCountdownRef = useRef(0);

  // FULLSCREEN TOGGLE
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // LOCAL COUNTDOWN TIMER - Runs independently every second
  useEffect(() => {
    if (!isCountingDown || countdownTime <= 0) return;

    const interval = setInterval(() => {
      setCountdownTime(prev => {
        const newValue = prev - 1;
        currentCountdownRef.current = newValue;
        if (newValue <= 0) {
          setIsCountingDown(false);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown, countdownTime]);

  // FIREBASE LISTENER - Only for control signals
  useEffect(() => {
    if (!sessionCode) return;

    console.log('Presentation View connected to session:', sessionCode);
    
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log('Firebase update:', data);
      setSessionData(data); // Store session data for student count
      
      // STAGE CHANGES - Reset everything
      if (data.currentStage && data.currentStage !== lastFirebaseStage.current) {
        console.log('Stage changed:', lastFirebaseStage.current, '->', data.currentStage);
        lastFirebaseStage.current = data.currentStage;
        setCurrentStage(data.currentStage);
        
        setCountdownTime(0);
        currentCountdownRef.current = 0;
        setIsCountingDown(false);
        lastFirebaseCountdown.current = null;
      }
      
      // COUNTDOWN CONTROL SIGNALS
      if (data.countdownTime !== undefined) {
        const firebaseTime = data.countdownTime;
        const firebaseActive = data.timerActive;
        
        if (firebaseTime !== lastFirebaseCountdown.current) {
          console.log('Countdown time changed:', lastFirebaseCountdown.current, '->', firebaseTime);
          
          const isTimerIncrease = firebaseTime > (currentCountdownRef.current || 0);
          const isNewTimer = currentCountdownRef.current === 0 || isTimerIncrease || firebaseTime === 0;
          const shouldRestart = !isCountingDown || isNewTimer;
          
          if (shouldRestart) {
            console.log('Restarting timer');
            lastFirebaseCountdown.current = firebaseTime;
            lastFirebaseTimerActive.current = firebaseActive;
            
            if (firebaseTime > 0) {
              const shouldStart = firebaseActive !== false;
              console.log('Starting countdown from', firebaseTime);
              setCountdownTime(firebaseTime);
              currentCountdownRef.current = firebaseTime;
              setIsCountingDown(shouldStart);
            } else {
              console.log('Stopping countdown');
              setCountdownTime(0);
              currentCountdownRef.current = 0;
              setIsCountingDown(false);
            }
          } else {
            console.log('Ignoring Firebase sync - timer running locally');
            lastFirebaseCountdown.current = firebaseTime;
          }
        } 
        else if (firebaseActive !== lastFirebaseTimerActive.current) {
          console.log('Timer active state changed:', lastFirebaseTimerActive.current, '->', firebaseActive);
          lastFirebaseTimerActive.current = firebaseActive;
          
          if (firebaseActive === false) {
            console.log('Teacher paused timer');
            setIsCountingDown(false);
          } else if (firebaseActive === true && currentCountdownRef.current > 0) {
            console.log('Teacher resumed timer');
            setIsCountingDown(true);
          }
        }
      }
    });
    
    return () => {
      console.log('Disconnecting from session:', sessionCode);
      unsubscribe();
    };
  }, [sessionCode]);

  if (!sessionCode) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        fontSize: '24px'
      }}>
        No session code provided
      </div>
    );
  }

  // ✅ FIXED: Waiting screen with session code (both 'locked' and 'join-code' stages)
  if (currentStage === 'locked' || currentStage === 'join-code') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        padding: '40px'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '30px', animation: 'pulse 2s ease-in-out infinite' }}>
          🎵
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
          musicroomtools.org/join
        </h1>
        <div style={{
          fontSize: '120px',
          fontWeight: '700',
          fontFamily: 'monospace',
          letterSpacing: '20px',
          color: '#3b82f6',
          marginBottom: '40px',
          textShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
        }}>
          {sessionCode}
        </div>
        <p style={{ fontSize: '24px', color: '#6b7280', textAlign: 'center', maxWidth: '600px' }}>
          Waiting for teacher to start the lesson...
        </p>
        
        {/* Student count */}
        {sessionData?.studentsJoined && (
          <div style={{ 
            marginTop: '40px', 
            fontSize: '28px', 
            color: '#10b981',
            fontWeight: '600'
          }}>
            👥 {Object.keys(sessionData.studentsJoined).length} student(s) joined
          </div>
        )}
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // Session Ended Screen
  if (currentStage === 'ended') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '40px'
      }}>
        <div style={{ fontSize: '100px', marginBottom: '30px' }}>✔</div>
        <h1 style={{ fontSize: '56px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>
          Session Ended
        </h1>
        <p style={{ fontSize: '24px', color: '#a0aec0', textAlign: 'center', maxWidth: '600px', marginBottom: '40px' }}>
          Thank you for participating! The teacher has ended this session.
        </p>
        <p style={{ fontSize: '18px', color: '#718096', textAlign: 'center' }}>
          You can close this window now.
        </p>
      </div>
    );
  }

  // Map stages to slide image filenames (using numbered slides 1.png - 8.png, plus 5b.png)
  const slideImages = {
    'welcome-instructions': '1.png',
    'intro-summary': '2.png',
    'daw-summary': '3.png',
    'daw-tutorial': '4.png',
    'activity-summary': '5.png',
    'school-summary': '5b.png',
    'school-beneath': '6.png',
    'reflection': '7.png',
    'conclusion': '8.png'
  };

  // Render slide image if available
  if (slideImages[currentStage]) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
        
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
        
        {/* Slide Image */}
        <img
          src={`/lessons/film-music-project/lesson1/slides/${slideImages[currentStage]}`}
          alt={currentStage}
          style={{
            maxWidth: '100%',
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // Video stages
  if (currentStage === 'intro-video') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'black',
        padding: '20px',
        position: 'relative'
      }}>
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
        
        <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>
          Lesson Introduction
        </h2>
        <video
          key="intro-video"
          controls
          autoPlay
          style={{ width: '90%', maxWidth: '1200px', maxHeight: '80vh' }}
        >
          <source src="/lessons/film-music-project/lesson1/Lesson1intro.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  if (currentStage === 'activity-intro') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'black',
        padding: '20px',
        position: 'relative'
      }}>
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
        <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>
          Activity Introduction
        </h2>
        <video
          key="activity-intro-video"
          controls
          autoPlay
          style={{ width: '90%', maxWidth: '1200px', maxHeight: '80vh' }}
        >
          <source src="/lessons/film-music-project/lesson1/Lesson1activityintro.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  // Fallback for unknown stages
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontSize: '24px'
    }}>
      Unknown stage: {currentStage}
    </div>
  );
};

export default PresentationView;