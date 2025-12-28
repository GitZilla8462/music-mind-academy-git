// File: /src/components/PresentationView.jsx
// ✅ UPDATED: Added Teacher/Student view toggle button
// ✅ UPDATED: Now uses presentationView data from lesson configs instead of hardcoded stage mappings
// ✅ UPDATED: Added Layer Detective Class Demo support with SessionCodeBadge
// ✅ UPDATED: Added Lesson 4 (Epic Wildlife) support with Sectional Loop Builder game
// ✅ UPDATED: Fixed video sizing to fill full screen

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// Lazy load Layer Detective Class Demo
const LayerDetectiveClassDemo = React.lazy(() => 
  import('../lessons/shared/activities/layer-detective/LayerDetectiveClassDemo')
    .catch(() => {
      console.error('Failed to load LayerDetectiveClassDemo');
      return { default: () => <div>Component not found</div> };
    })
);

// Lazy load Mood Match Teacher View
const MoodMatchTeacherView = React.lazy(() =>
  import('../lessons/shared/activities/mood-match-game/MoodMatchTeacherView')
    .catch(() => {
      console.error('Failed to load MoodMatchTeacherView');
      return { default: () => <div>Component not found</div> };
    })
);

// Session Code Badge Component
const SessionCodeBadge = ({ sessionCode, isDarkBackground = false }) => (
  <div style={{
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '12px 24px',
    backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '4px',
    color: isDarkBackground ? '#1f2937' : 'white',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    border: isDarkBackground ? '2px solid rgba(0, 0, 0, 0.1)' : '2px solid rgba(255, 255, 255, 0.2)'
  }}>
    {sessionCode}
  </div>
);

// View Mode Toggle Button Component
const ViewModeToggle = ({ viewMode, setViewMode, isDarkBackground = false }) => (
  <div style={{
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    display: 'flex',
    backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)',
    borderRadius: '10px',
    padding: '4px',
    zIndex: 1000,
    border: isDarkBackground ? '2px solid rgba(0, 0, 0, 0.1)' : '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }}>
    <button
      onClick={() => setViewMode('teacher')}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: viewMode === 'teacher' 
          ? '#3b82f6' 
          : 'transparent',
        color: viewMode === 'teacher' 
          ? 'white' 
          : (isDarkBackground ? '#374151' : '#d1d5db'),
      }}
    >
      📽️ Teacher View
    </button>
    <button
      onClick={() => setViewMode('student')}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: viewMode === 'student' 
          ? '#10b981' 
          : 'transparent',
        color: viewMode === 'student' 
          ? 'white' 
          : (isDarkBackground ? '#374151' : '#d1d5db'),
      }}
    >
      💻 Student View
    </button>
  </div>
);

// Student View Iframe Component
const StudentViewEmbed = ({ sessionCode }) => {
  const getStudentUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction 
      ? 'https://musicroomtools.org' 
      : 'http://localhost:5173';
    return `${baseUrl}/join?code=${sessionCode}&preview=true`;
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1f2937',
    }}>
      {/* Header bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}>
        <span style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          💻 STUDENT VIEW PREVIEW
        </span>
      </div>
      
      {/* Iframe */}
      <iframe
        src={getStudentUrl()}
        style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          width: '100%',
          height: 'calc(100% - 50px)',
          border: 'none',
        }}
        title="Student View Preview"
      />
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
  const [lessonConfig, setLessonConfig] = useState(null);
  const [lessonBasePath, setLessonBasePath] = useState('');
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'

  // Get join URL based on site
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const joinUrl = isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';

  // Layer Detective components
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  
  // Sectional Loop Builder components
  const [SectionalLoopBuilderLeaderboard, setSectionalLoopBuilderLeaderboard] = useState(null);
  const [SectionalLoopBuilderResults, setSectionalLoopBuilderResults] = useState(null);
  
  const lastFirebaseCountdown = useRef(null);
  const lastFirebaseStage = useRef(null);
  const lastFirebaseTimerActive = useRef(null);
  const currentCountdownRef = useRef(0);

  // Load Layer Detective components on mount
  useEffect(() => {
    import('../lessons/shared/activities/layer-detective/LayerDectectivePresentationView')
      .then(module => {
        setLayerDetectiveLeaderboard(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load Layer Detective leaderboard:', error);
      });
    
    import('../lessons/shared/activities/layer-detective/LayerDetectiveResults')
      .then(module => {
        setLayerDetectiveResults(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load Layer Detective results:', error);
      });
  }, []);

  // Load Sectional Loop Builder components on mount
  useEffect(() => {
    import('../lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView')
      .then(module => {
        setSectionalLoopBuilderLeaderboard(() => module.default);
        console.log('✅ Loaded Sectional Loop Builder leaderboard');
      })
      .catch(error => {
        console.error('❌ Failed to load Sectional Loop Builder leaderboard:', error);
      });
    
    import('../lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderResults')
      .then(module => {
        setSectionalLoopBuilderResults(() => module.default);
        console.log('✅ Loaded Sectional Loop Builder results');
      })
      .catch(error => {
        console.error('❌ Failed to load Sectional Loop Builder results:', error);
      });
  }, []);

  // Load lesson configuration dynamically based on session's lessonRoute
  useEffect(() => {
    if (!sessionData?.lessonRoute) return;

    const loadLessonConfig = async () => {
      try {
        console.log('📚 Loading lesson config for:', sessionData.lessonRoute);
        
        let configModule;
        let basePath;
        
        if (sessionData.lessonRoute.includes('lesson1')) {
          configModule = await import('../lessons/film-music-project/lesson1/lesson1Config');
          basePath = '/lessons/film-music-project/lesson1';
        } else if (sessionData.lessonRoute.includes('lesson2')) {
          configModule = await import('../lessons/film-music-project/lesson2/Lesson2config');
          basePath = '/lessons/film-music-project/lesson2';
        } else if (sessionData.lessonRoute.includes('lesson3')) {
          configModule = await import('../lessons/film-music-project/lesson3/Lesson3config');
          basePath = '/lessons/film-music-project/lesson3';
        } else if (sessionData.lessonRoute.includes('lesson4')) {
          configModule = await import('../lessons/film-music-project/lesson4/Lesson4config');
          basePath = '/lessons/film-music-project/lesson4';
        }
        
        if (configModule && configModule.lessonStages) {
          setLessonConfig(configModule);
          setLessonBasePath(basePath);
          console.log('✅ Loaded', configModule.lessonStages.length, 'stages for', sessionData.lessonId);
        } else {
          console.error('❌ No lessonStages found in config');
        }
      } catch (error) {
        console.error('❌ Error loading lesson config:', error);
      }
    };

    loadLessonConfig();
  }, [sessionData?.lessonRoute, sessionData?.lessonId]);

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

  // LOCAL COUNTDOWN TIMER
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

  // FIREBASE LISTENER
  useEffect(() => {
    if (!sessionCode) return;

    console.log('📡 Presentation View connected to session:', sessionCode);
    
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log('📡 Firebase update:', data);
      setSessionData(data);

      // STAGE CHANGE
      if (data.currentStage && data.currentStage !== lastFirebaseStage.current) {
        console.log('🎬 Stage changed:', lastFirebaseStage.current, '->', data.currentStage);
        lastFirebaseStage.current = data.currentStage;
        setCurrentStage(data.currentStage);
        
        // Reset countdown when stage changes
        setIsCountingDown(false);
        setCountdownTime(0);
        lastFirebaseCountdown.current = null;
      }

      // TIMER COUNTDOWN
      if (data.activityTimers && data.currentStage) {
        const timer = data.activityTimers[data.currentStage];
        if (timer) {
          const firebaseCountdown = timer.countdown || 0;
          const firebaseActive = timer.isActive || false;

          if (firebaseCountdown !== lastFirebaseCountdown.current) {
            console.log('⏱️ Countdown update:', firebaseCountdown);
            lastFirebaseCountdown.current = firebaseCountdown;
            currentCountdownRef.current = firebaseCountdown;
            setCountdownTime(firebaseCountdown);
          }

          if (firebaseActive !== lastFirebaseTimerActive.current) {
            console.log('🎬 Timer active:', firebaseActive);
            lastFirebaseTimerActive.current = firebaseActive;
            setIsCountingDown(firebaseActive);
          }
        }
      }
    });

    return () => unsubscribe();
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

  // Get current stage data
  const currentStageData = lessonConfig?.lessonStages?.find(stage => stage.id === currentStage);

  // ========== STUDENT VIEW MODE ==========
  if (viewMode === 'student') {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <StudentViewEmbed sessionCode={sessionCode} />
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>
    );
  }

  // ========== TEACHER VIEW MODE (default) ==========

  // Waiting screen (both 'locked' and 'join-code' stages)
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
        padding: '40px',
        position: 'relative',
      }}>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={true} />
        
        <div style={{ fontSize: '80px', marginBottom: '30px', animation: 'pulse 2s ease-in-out infinite' }}>
          🎵
        </div>
        <h1 style={{ fontSize: '96px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
          {joinUrl}
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
        <p style={{ fontSize: '48px', color: '#6b7280', textAlign: 'center', maxWidth: '800px' }}>
          Waiting for teacher to start the lesson...
        </p>
        
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
        padding: '40px',
        position: 'relative',
      }}>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
        
        <div style={{ fontSize: '100px', marginBottom: '30px' }}>✓</div>
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

  // Use presentationView from lesson config
  if (currentStageData?.presentationView) {
    const { type, slidePath, videoPath, title, startTime } = currentStageData.presentationView;
    
    // RENDER LAYER DETECTIVE LEADERBOARD
    if (type === 'layer-detective-leaderboard') {
      if (!LayerDetectiveLeaderboard) {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#1a202c',
            color: 'white',
            fontSize: '24px',
            position: 'relative',
          }}>
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
            Loading Layer Detective...
          </div>
        );
      }
      
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <LayerDetectiveLeaderboard sessionData={sessionData} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
        </div>
      );
    }
    
    // RENDER LAYER DETECTIVE RESULTS
    if (type === 'layer-detective-results') {
      if (!LayerDetectiveResults) {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#1a202c',
            color: 'white',
            fontSize: '24px',
            position: 'relative',
          }}>
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
            Loading Results...
          </div>
        );
      }
      
      return (
        <div className="h-screen w-full relative">
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
          <LayerDetectiveResults sessionData={sessionData} />
        </div>
      );
    }
    
    // RENDER LAYER DETECTIVE CLASS DEMO
    if (type === 'layer-detective-class-demo') {
      const handleDemoComplete = () => {
        console.log('✅ Class demo complete - advancing to next stage');
        
        const currentStageIndex = lessonConfig.lessonStages.findIndex(
          stage => stage.id === currentStage
        );
        
        if (currentStageIndex !== -1 && currentStageIndex < lessonConfig.lessonStages.length - 1) {
          const nextStage = lessonConfig.lessonStages[currentStageIndex + 1];
          console.log('📍 Advancing from', currentStage, 'to', nextStage.id);
          
          const db = getDatabase();
          const sessionRef = ref(db, `sessions/${sessionCode}/currentStage`);
          set(sessionRef, nextStage.id).catch(err => {
            console.error('❌ Error advancing stage:', err);
          });
        }
      };
      
      return (
        <div className="h-screen w-full relative">
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
          
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
              <div className="text-white text-2xl">Loading class demo...</div>
            </div>
          }>
            <LayerDetectiveClassDemo onComplete={handleDemoComplete} sessionData={sessionData} />
          </React.Suspense>
        </div>
      );
    }

    // RENDER SECTIONAL LOOP BUILDER LEADERBOARD
    if (type === 'sectional-loop-builder-leaderboard') {
      if (!SectionalLoopBuilderLeaderboard) {
        return (
          <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900" style={{ position: 'relative' }}>
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
            <div className="text-white text-2xl">Loading Epic Wildlife Leaderboard...</div>
          </div>
        );
      }
      
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <SectionalLoopBuilderLeaderboard sessionData={sessionData} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
        </div>
      );
    }

    // RENDER SECTIONAL LOOP BUILDER RESULTS
    if (type === 'sectional-loop-builder-results') {
      if (!SectionalLoopBuilderResults) {
        return (
          <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900" style={{ position: 'relative' }}>
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
            <div className="text-white text-2xl">Loading Results...</div>
          </div>
        );
      }

      return (
        <div className="h-screen w-full relative">
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />
          <SectionalLoopBuilderResults sessionData={sessionData} />
        </div>
      );
    }

    // RENDER MOOD MATCH TEACHER VIEW
    if (type === 'mood-match-teacher') {
      return (
        <div className="h-screen w-full relative">
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={false} />

          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="text-white text-2xl">Loading Mood Match Game...</div>
            </div>
          }>
            <MoodMatchTeacherView />
          </React.Suspense>
        </div>
      );
    }

    // RENDER SLIDE
    if (type === 'slide' && slidePath) {
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
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={true} />
          
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
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              transition: 'all 0.2s ease',
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
            src={slidePath}
            alt={currentStage}
            style={{
              maxWidth: '100%',
              maxHeight: '100vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
            onError={(e) => {
              console.error('❌ Failed to load slide image:', slidePath);
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }
    
    // RENDER VIDEO - Full screen sizing
    if (type === 'video' && videoPath) {
      return (
        <div style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
          overflow: 'hidden'
        }}>
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={true} />
          
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
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              transition: 'all 0.2s ease'
            }}
          >
            {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
          
          <video
            key={currentStage}
            controls
            onLoadedData={(e) => {
              const video = e.target;
              if (startTime && startTime > 0 && video.currentTime < startTime) {
                video.currentTime = startTime;
              }
              video.play().catch(() => {});
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  // LEGACY: Fallback for old hardcoded system (Lesson 1 compatibility)
  const slideImages = {
    'welcome-instructions': '1.png',
    'intro-summary': '2.png',
    'daw-summary': '3.png',
    'daw-tutorial': '4.png',
    'activity-summary': '5.png',
    'school-summary': '5b.png',
    'school-beneath': '6.png',
    'reflection': '7.png',
    'conclusion': '8.png',
  };

  if (slideImages[currentStage] && lessonBasePath) {
    const slideImagePath = `${lessonBasePath}/slides/${slideImages[currentStage]}`;
    
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
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={true} />
        
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
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
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
        
        <img
          src={slideImagePath}
          alt={currentStage}
          style={{
            maxWidth: '100%',
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.error('❌ Failed to load slide image:', slideImagePath);
            e.target.style.display = 'none';
          }}
        />
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
      fontSize: '24px',
      position: 'relative',
    }}>
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} isDarkBackground={true} />
      
      <div className="text-center">
        <div className="text-6xl mb-4">📺</div>
        <div>Stage: {currentStage}</div>
        <div className="text-sm text-gray-500 mt-2">
          {currentStageData?.label || 'Loading...'}
        </div>
      </div>
    </div>
  );
};

export default PresentationView;