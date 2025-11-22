// File: /src/components/PresentationView.jsx
// ✅ UPDATED: Now uses presentationView data from lesson configs instead of hardcoded stage mappings
// ✅ UPDATED: Added Layer Detective Class Demo support with SessionCodeBadge
// ✅ UPDATED: Added Lesson 4 (Chef's Soundtrack) support

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
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  
  const lastFirebaseCountdown = useRef(null);
  const lastFirebaseStage = useRef(null);
  const lastFirebaseTimerActive = useRef(null);
  const currentCountdownRef = useRef(0);

  // ✅ Load Layer Detective components on mount
  useEffect(() => {
    // Load leaderboard component
    import('../lessons/shared/activities/layer-detective/LayerDectectivePresentationView')
      .then(module => {
        setLayerDetectiveLeaderboard(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load Layer Detective leaderboard:', error);
      });
    
    // Load results component
    import('../lessons/shared/activities/layer-detective/LayerDetectiveResults')
      .then(module => {
        setLayerDetectiveResults(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load Layer Detective results:', error);
      });
  }, []);

  // ✅ Load lesson configuration dynamically based on session's lessonRoute
  useEffect(() => {
    if (!sessionData?.lessonRoute) return;

    const loadLessonConfig = async () => {
      try {
        console.log('📚 Loading lesson config for:', sessionData.lessonRoute);
        
        // Determine which lesson config to load based on route
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
        // Add more lessons here as needed
        
        if (configModule && configModule.lessonStages) {
          setLessonConfig(configModule);
          setLessonBasePath(basePath);
          console.log('✅ Loaded', configModule.lessonStages.length, 'stages for', sessionData.lessonId);
          console.log('🔍 First stage sample:', configModule.lessonStages[0]);
          console.log('🔍 Config module keys:', Object.keys(configModule));
        } else {
          console.error('❌ No lessonStages found in config');
          console.error('🔍 Config module:', configModule);
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

          // NEW countdown from Firebase
          if (firebaseCountdown !== lastFirebaseCountdown.current) {
            console.log('⏱️ Countdown update:', firebaseCountdown);
            lastFirebaseCountdown.current = firebaseCountdown;
            currentCountdownRef.current = firebaseCountdown;
            setCountdownTime(firebaseCountdown);
          }

          // Timer started/stopped
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
  console.log('📍 Current stage data:', currentStageData);
  console.log('🔍 Looking for stage:', currentStage);
  console.log('🔍 Available stages:', lessonConfig?.lessonStages?.map(s => s.id));

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

  // ✅ NEW SYSTEM: Use presentationView from lesson config
  if (currentStageData?.presentationView) {
    const { type, slidePath, videoPath, title, component } = currentStageData.presentationView;
    
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
            fontSize: '24px'
          }}>
            Loading Layer Detective...
          </div>
        );
      }
      
      // Note: Session code is already built into LayerDetectivePresentationView component header
      return <LayerDetectiveLeaderboard sessionData={sessionData} />;
    }
    
    // RENDER LAYER DETECTIVE RESULTS (Winner Celebration)
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
            fontSize: '24px'
          }}>
            Loading Results...
          </div>
        );
      }
      
      return (
        <div className="h-screen w-full relative">
          <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
          <LayerDetectiveResults sessionData={sessionData} />
        </div>
      );
    }
    
    // ✅ NEW: RENDER LAYER DETECTIVE CLASS DEMO WITH SESSION CODE BADGE
    if (type === 'layer-detective-class-demo') {
      const handleDemoComplete = () => {
        console.log('✅ Class demo complete - advancing to next stage');
        
        // Find current stage index in lessonStages
        const currentStageIndex = lessonConfig.lessonStages.findIndex(
          stage => stage.id === currentStage
        );
        
        // Get next stage
        if (currentStageIndex !== -1 && currentStageIndex < lessonConfig.lessonStages.length - 1) {
          const nextStage = lessonConfig.lessonStages[currentStageIndex + 1];
          console.log('📍 Advancing from', currentStage, 'to', nextStage.id);
          
          // Update Firebase to advance stage
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
    
    // RENDER VIDEO
    if (type === 'video' && videoPath) {
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
          >
            {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
          
          <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>
            {title || 'Video'}
          </h2>
          <video
            key={currentStage}
            controls
            autoPlay
            style={{ width: '90%', maxWidth: '1200px', maxHeight: '80vh' }}
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  // LEGACY: Fallback for old hardcoded system (Lesson 1 compatibility without presentationView)
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
      fontSize: '24px'
    }}>
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