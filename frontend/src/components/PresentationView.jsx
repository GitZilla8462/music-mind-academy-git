import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import CanvaImageSlide from "../lessons/shared/components/CanvaImageSlide";

// Professional Timer Component - UNCHANGED
const ProfessionalTimer = ({ seconds, isCountingDown, initialCountdownTime }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!isCountingDown) return '#3b82f6';
    if (seconds > 120) return '#3b82f6';
    if (seconds > 60) return '#f59e0b';
    return '#ef4444';
  };

  const getProgressPercentage = () => {
    if (!isCountingDown) return 0;
    const maxTime = initialCountdownTime > 0 ? initialCountdownTime : seconds;
    if (maxTime === 0) return 0;
    return (seconds / maxTime) * 100;
  };

  const timerColor = getTimerColor();
  const progressPercentage = getProgressPercentage();
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div style={{
      position: 'absolute',
      top: '30px',
      right: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      zIndex: 20,
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '24px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      border: '4px solid #e5e7eb'
    }}>
      <div style={{ position: 'relative', width: '240px', height: '240px' }}>
        <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="120" cy="120" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
          {isCountingDown && (
            <circle
              cx="120" cy="120" r={radius} fill="none"
              stroke={timerColor} strokeWidth="16" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          )}
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
        }}>
          <div style={{
            fontSize: '56px', fontWeight: '600', color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-1px'
          }}>
            {formatTime(seconds)}
          </div>
          <div style={{
            fontSize: '22px', fontWeight: '500', color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            {isCountingDown ? 'remaining' : 'elapsed'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Session Code Badge Component - UPDATED with solid background
const SessionCodeBadge = ({ sessionCode }) => {
  return (
    <div style={{
      position: 'absolute', top: '30px', left: '30px',
      backgroundColor: 'white',
      padding: '24px 48px', borderRadius: '24px',
      border: '4px solid #3b82f6',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)', zIndex: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          color: '#6b7280',
          fontSize: '28px', fontWeight: '600'
        }}>
          Code:
        </span>
        <span style={{
          color: '#3b82f6',
          fontSize: '40px', fontWeight: '700',
          fontFamily: 'monospace', letterSpacing: '4px'
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
  const [lessonPath, setLessonPath] = useState('film-music-project/lesson1'); // Default
  const [timer, setTimer] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [initialCountdownTime, setInitialCountdownTime] = useState(0);
  
  const lastFirebaseCountdown = useRef(null);
  const lastFirebaseStage = useRef(null);
  const lastFirebaseTimerActive = useRef(null);

  // LOCAL COUNTDOWN TIMER - UNCHANGED
  useEffect(() => {
    if (!isCountingDown || countdownTime <= 0) return;
    const interval = setInterval(() => {
      setCountdownTime(prev => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          setIsCountingDown(false);
          return 0;
        }
        return newValue;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCountingDown, countdownTime]);

  // FIREBASE LISTENER - Now also gets lesson path
  useEffect(() => {
    if (!sessionCode) return;
    console.log('📊 Presentation View connected to session:', sessionCode);
    
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log('📡 Firebase update:', data);
      
      // Get lesson path if available
      if (data.lessonPath && data.lessonPath !== lessonPath) {
        setLessonPath(data.lessonPath);
        console.log('📚 Lesson path:', data.lessonPath);
      }
      
      if (data.currentStage && data.currentStage !== lastFirebaseStage.current) {
        console.log('🎬 Stage changed:', lastFirebaseStage.current, '→', data.currentStage);
        lastFirebaseStage.current = data.currentStage;
        setCurrentStage(data.currentStage);
        setTimer(0);
        setCountdownTime(0);
        setIsCountingDown(false);
        setInitialCountdownTime(0);
        lastFirebaseCountdown.current = null;
      }
      
      if (data.countdownTime !== undefined) {
        const firebaseTime = data.countdownTime;
        const firebaseActive = data.timerActive;
        
        if (firebaseTime !== lastFirebaseCountdown.current) {
          lastFirebaseCountdown.current = firebaseTime;
          lastFirebaseTimerActive.current = firebaseActive;
          
          if (firebaseTime > 0) {
            const shouldStart = firebaseActive !== false;
            setInitialCountdownTime(firebaseTime);
            setCountdownTime(firebaseTime);
            setIsCountingDown(shouldStart);
          } else {
            setCountdownTime(0);
            setIsCountingDown(false);
            setInitialCountdownTime(0);
          }
        } else if (firebaseActive !== lastFirebaseTimerActive.current) {
          lastFirebaseTimerActive.current = firebaseActive;
          if (firebaseActive === false) {
            setIsCountingDown(false);
          } else if (firebaseActive === true && countdownTime > 0) {
            setIsCountingDown(true);
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [sessionCode, countdownTime, lessonPath]);

  // ========================================
  // UNIVERSAL IMAGE PATH BUILDER
  // Works for ANY lesson by building path dynamically
  // ========================================
  const getImagePath = (stageId) => {
    // Convention: stage ID maps to same-named PNG file
    return `/lessons/${lessonPath}/slides/${stageId}.png`;
  };

  // Stages that typically have timers (can be customized per lesson)
  const stagesWithTimer = ['daw-tutorial', 'school-beneath', 'reflection', 'sound-effects'];

  // Check if current stage should display a Canva image
  const isCanvaSlideStage = (stage) => {
    // Summary slides, activity instruction screens, welcome screens, etc.
    const canvaStageTypes = [
      'welcome-instructions',
      'intro-summary',
      'daw-summary',
      'activity-summary',
      'school-summary',
      'reflection-summary',
      'daw-tutorial',
      'school-beneath',
      'reflection',
      'sound-effects',
      'conclusion',
      // Add more as needed
    ];
    return canvaStageTypes.includes(stage);
  };

  if (!sessionCode) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#1a202c',
        color: 'white', fontSize: '24px'
      }}>
        No session code provided
      </div>
    );
  }

  // LOCKED - Waiting screen
  if (currentStage === 'locked') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        backgroundColor: '#ffffff', color: '#1f2937', padding: '40px'
      }}>
        <div style={{
          fontSize: '80px', marginBottom: '30px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🎵
        </div>
        <h1 style={{
          fontSize: '48px', fontWeight: '700',
          marginBottom: '20px', color: '#1f2937'
        }}>
          musicroomtools.org/join
        </h1>
        <div style={{
          fontSize: '120px', fontWeight: '700', fontFamily: 'monospace',
          letterSpacing: '20px', color: '#3b82f6', marginBottom: '40px',
          textShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
        }}>
          {sessionCode}
        </div>
        <p style={{
          fontSize: '24px', color: '#6b7280',
          textAlign: 'center', maxWidth: '600px'
        }}>
          Waiting for teacher to start the lesson...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // SESSION ENDED
  if (currentStage === 'ended') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        backgroundColor: '#1a202c', color: 'white', padding: '40px'
      }}>
        <div style={{ fontSize: '100px', marginBottom: '30px' }}>✓</div>
        <h1 style={{
          fontSize: '56px', fontWeight: '700',
          marginBottom: '20px', color: 'white'
        }}>
          Session Ended
        </h1>
        <p style={{
          fontSize: '24px', color: '#a0aec0',
          textAlign: 'center', maxWidth: '600px', marginBottom: '40px'
        }}>
          Thank you for participating! The teacher has ended this session.
        </p>
        <p style={{ fontSize: '18px', color: '#718096', textAlign: 'center' }}>
          You can close this window now.
        </p>
      </div>
    );
  }

  // VIDEO STAGES - Generic video player
  if (currentStage === 'intro-video' || currentStage === 'activity-intro') {
    const videoSrc = currentStage === 'intro-video' 
      ? `/lessons/${lessonPath}/Lesson1intro.mp4`
      : `/lessons/${lessonPath}/Lesson1activityintro.mp4`;
    
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        backgroundColor: 'black', padding: '20px', position: 'relative'
      }}>
        <SessionCodeBadge sessionCode={sessionCode} />
        <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>
          {currentStage === 'intro-video' ? 'Lesson Introduction' : 'Activity Introduction'}
        </h2>
        <video
          key={currentStage} controls autoPlay
          style={{ width: '90%', maxWidth: '1200px', maxHeight: '80vh' }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    );
  }

  // ========================================
  // UNIVERSAL CANVA SLIDES
  // Works for ANY stage that has a corresponding PNG
  // ========================================
  if (isCanvaSlideStage(currentStage)) {
    const needsTimer = stagesWithTimer.includes(currentStage);
    const imagePath = getImagePath(currentStage);
    
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <SessionCodeBadge sessionCode={sessionCode} />
        
        {/* Timer (only for activity stages) */}
        {needsTimer && isCountingDown && countdownTime > 0 && (
          <ProfessionalTimer 
            seconds={countdownTime} 
            isCountingDown={true}
            initialCountdownTime={initialCountdownTime}
          />
        )}
        
        {/* Canva Image */}
        <CanvaImageSlide
          imagePath={imagePath}
          sessionCode={sessionCode}
        />
      </div>
    );
  }

  // Fallback for unknown stages
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#ffffff',
      color: '#1f2937', fontSize: '24px'
    }}>
      Unknown stage: {currentStage}
    </div>
  );
};

export default PresentationView;