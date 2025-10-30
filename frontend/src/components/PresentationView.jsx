import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const PresentationView = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const [currentStage, setCurrentStage] = useState('locked');
  const [timer, setTimer] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Timer effect - starts when activity is unlocked
  useEffect(() => {
    if (currentStage !== 'locked') {
      const interval = setInterval(() => {
        if (isCountingDown && countdownTime > 0) {
          // Countdown mode
          setCountdownTime(prev => Math.max(0, prev - 1));
        } else if (!isCountingDown) {
          // Count-up mode
          setTimer(prev => prev + 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimer(0);
      setCountdownTime(0);
      setIsCountingDown(false);
    }
  }, [currentStage, isCountingDown, countdownTime]);

  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Subscribe to session updates without joining
  useEffect(() => {
    if (sessionCode) {
      console.log('Presentation View listening to session:', sessionCode);
      
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('Session data received:', data);
          setCurrentStage(data.currentStage || 'locked');
          
          // Sync countdown timer if present
          if (data.countdownTime !== undefined) {
            setCountdownTime(data.countdownTime);
            setIsCountingDown(data.countdownTime > 0);
          }
        }
      });
      
      return () => unsubscribe();
    }
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

  // Waiting screen with session code
  if (currentStage === 'locked') {
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
        <div style={{
          fontSize: '80px',
          marginBottom: '30px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ♪
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Session Code
        </h1>
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          letterSpacing: '20px',
          color: '#60a5fa',
          marginBottom: '40px',
          textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
        }}>
          {sessionCode}
        </div>
        <p style={{
          fontSize: '24px',
          color: '#9ca3af',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          Waiting for teacher to start the lesson...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
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
        padding: '20px'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '32px',
          marginBottom: '20px'
        }}>
          Lesson Introduction
        </h2>
        <video
          key="intro-video"
          controls
          autoPlay
          onEnded={() => {
            // Automatically advance to daw-tutorial when video ends
            const db = getDatabase();
            const sessionRef = ref(db, `sessions/${sessionCode}`);
            set(sessionRef, {
              currentStage: 'daw-tutorial',
              timestamp: Date.now()
            });
          }}
          style={{
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '80vh'
          }}
        >
          <source src="/lessons/film-music-project/lesson1/Lesson1intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Activity intro video
  if (currentStage === 'activity-intro') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'black',
        padding: '20px'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '32px',
          marginBottom: '20px'
        }}>
          Activity Introduction
        </h2>
        <video
          key="activity-intro-video"
          controls
          autoPlay
          onEnded={() => {
            // Automatically advance to school-beneath activity when video ends
            const db = getDatabase();
            const sessionRef = ref(db, `sessions/${sessionCode}`);
            set(sessionRef, {
              currentStage: 'school-beneath',
              timestamp: Date.now()
            });
          }}
          style={{
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '80vh'
          }}
        >
          <source src="/lessons/film-music-project/lesson1/Lesson1activityintro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Activity stages with timer
  const activityScreens = {
    'daw-tutorial': {
      title: 'DAW Basics Interactive Tutorial',
      icon: '📝',
      description: 'Students are completing an interactive tutorial on their devices',
      subtitle: 'They are learning about Digital Audio Workstation basics and answering questions as they go.',
      color: '#3b82f6'
    },
    'school-beneath': {
      title: 'The School Beneath',
      icon: '🎵',
      description: 'Students are creating their mysterious film score',
      subtitle: 'Composing music that matches the mood and atmosphere of an underwater school.',
      color: '#8b5cf6'
    },
    'reflection': {
      title: 'Reflection Activity',
      icon: '⭐⭐',
      description: 'Students are reflecting on their learning',
      subtitle: 'Two Stars and a Wish - What went well and what they want to improve.',
      color: '#ec4899'
    },
    'sound-effects': {
      title: 'Bonus: Add Sound Effects',
      icon: '🎧',
      description: 'Bonus Challenge: Adding Sound Effects!',
      subtitle: 'Enhancing compositions with atmospheric sounds and effects.',
      color: '#10b981'
    }
  };

  const activityData = activityScreens[currentStage];

  if (activityData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '60px',
        position: 'relative'
      }}>
        {/* Timer in top right */}
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          fontSize: isCountingDown ? '48px' : '28px',
          fontFamily: 'monospace',
          backgroundColor: isCountingDown && countdownTime <= 60 
            ? 'rgba(239, 68, 68, 0.9)' 
            : isCountingDown 
            ? 'rgba(59, 130, 246, 0.9)' 
            : 'rgba(255, 255, 255, 0.1)',
          padding: isCountingDown ? '25px 40px' : '15px 25px',
          borderRadius: '12px',
          border: isCountingDown && countdownTime <= 60
            ? '3px solid rgb(220, 38, 38)'
            : '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxShadow: isCountingDown ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
          animation: isCountingDown && countdownTime <= 10 ? 'pulse 1s ease-in-out infinite' : 'none'
        }}>
          {isCountingDown ? (
            <>
              <span style={{ fontSize: '20px', opacity: 0.8 }}>Time Remaining</span>
              <div style={{ 
                fontSize: '56px', 
                fontWeight: 'bold',
                color: countdownTime <= 60 ? '#fef2f2' : 'white'
              }}>
                {formatTime(countdownTime)}
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: '24px' }}>⏱️</span>
              {formatTime(timer)}
            </>
          )}
        </div>

        <div style={{
          fontSize: '100px',
          marginBottom: '30px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          {activityData.icon}
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {activityData.title}
        </h1>

        <p style={{
          fontSize: '28px',
          color: '#9ca3af',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {activityData.description}
        </p>

        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          textAlign: 'center',
          maxWidth: '800px',
          marginBottom: '40px'
        }}>
          {activityData.subtitle}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '20px 40px',
          backgroundColor: activityData.color,
          borderRadius: '50px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          <span style={{ fontSize: '28px' }}>⏱️</span>
          Activity In Progress
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </div>
    );
  }

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
      Unknown activity: {currentStage}
    </div>
  );
};

export default PresentationView;