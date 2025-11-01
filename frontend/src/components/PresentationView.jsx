import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import SummarySlide from '../lessons/film-music-project/lesson1/components/Summaryslide';
import { summarySlides } from '../lessons/film-music-project/lesson1/summarySlideContent';

// Professional Timer Component
const ProfessionalTimer = ({ seconds, isCountingDown, initialCountdownTime }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Calculate color based on time remaining (for countdown)
  const getTimerColor = () => {
    if (!isCountingDown) return '#3b82f6'; // Soft blue for count-up
    
    if (seconds > 120) return '#3b82f6'; // Soft blue - plenty of time
    if (seconds > 60) return '#f59e0b'; // Warm amber - halfway
    return '#ef4444'; // Gentle coral/red - running out
  };

  // Calculate progress percentage (0-100)
  // For countdown: starts at 100% (full circle) and goes to 0% (empty)
  const getProgressPercentage = () => {
    if (!isCountingDown) return 0; // No progress ring for count-up
    
    // Use the initial countdown time - this is the key fix!
    // If initialCountdownTime is 0 or not set, use current seconds as fallback
    const maxTime = initialCountdownTime > 0 ? initialCountdownTime : seconds;
    
    if (maxTime === 0) return 0;
    
    // Return percentage remaining (100% when full time, 0% when time is up)
    return (seconds / maxTime) * 100;
  };

  const timerColor = getTimerColor();
  const progressPercentage = getProgressPercentage();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  // strokeDashoffset calculation:
  // When progress is 100%, offset should be 0 (full circle visible)
  // When progress is 0%, offset should be circumference (nothing visible)
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div style={{
      position: 'absolute',
      top: '30px',
      right: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      {/* Circular Progress Ring */}
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {/* Background circle */}
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle - only show for countdown */}
          {isCountingDown && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={timerColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          )}
        </svg>
        
        {/* Time display in center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.5px'
          }}>
            {formatTime(seconds)}
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isCountingDown ? 'remaining' : 'elapsed'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Session Code Badge Component - for top left corner
const SessionCodeBadge = ({ sessionCode, isDarkBackground = false }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '30px',
      left: '30px',
      backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      backdropFilter: 'blur(8px)',
      padding: '12px 24px',
      borderRadius: '12px',
      border: `2px solid ${isDarkBackground ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.3)'}`,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          color: isDarkBackground ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Code:
        </span>
        <span style={{
          color: isDarkBackground ? '#ffffff' : '#3b82f6',
          fontSize: '20px',
          fontWeight: '700',
          fontFamily: 'monospace',
          letterSpacing: '2px'
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
  const [timer, setTimer] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [initialCountdownTime, setInitialCountdownTime] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

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
      setInitialCountdownTime(0);
      setLastUpdateTime(0);
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
          
          // Check if stage changed - reset timer states
          if (data.currentStage && data.currentStage !== currentStage) {
            console.log('Stage changed from', currentStage, 'to', data.currentStage);
            setCurrentStage(data.currentStage);
            // Reset all timer states when stage changes
            setTimer(0);
            setCountdownTime(0);
            setIsCountingDown(false);
            setInitialCountdownTime(0);
            setLastUpdateTime(0);
          }
          
          // Sync countdown timer if present
          if (data.countdownTime !== undefined && data.timestamp) {
            const newCountdownTime = data.countdownTime;
            const newTimestamp = data.timestamp;
            
            // Only process if this is a newer update than the last one we saw
            // This helps ignore stale/competing timer updates
            if (newTimestamp > lastUpdateTime) {
              console.log('Processing countdown update:', newCountdownTime, 'timestamp:', newTimestamp);
              setLastUpdateTime(newTimestamp);
              
              if (newCountdownTime > 0) {
                // Only update initial time if this is a significant increase
                // OR if we don't have an initial time yet
                const isSignificantIncrease = newCountdownTime > countdownTime + 100;
                const needsInitialTime = initialCountdownTime === 0;
                
                if (isSignificantIncrease || needsInitialTime) {
                  console.log('New countdown detected! Setting initialCountdownTime to:', newCountdownTime);
                  setInitialCountdownTime(newCountdownTime);
                }
                
                setCountdownTime(newCountdownTime);
                setIsCountingDown(true);
              } else {
                setIsCountingDown(false);
                // Reset initial time when countdown stops
                if (newCountdownTime === 0) {
                  setInitialCountdownTime(0);
                }
              }
            } else {
              console.log('Ignoring stale countdown update:', newCountdownTime, 'timestamp:', newTimestamp);
            }
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [sessionCode, currentStage, isCountingDown, initialCountdownTime, countdownTime, lastUpdateTime]);

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
  // Note: Session code is already the main focus of this screen, so no badge needed
  if (currentStage === 'locked') {
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
        <div style={{
          fontSize: '80px',
          marginBottom: '30px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ♪
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#1f2937'
        }}>
          Session Code
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
        <p style={{
          fontSize: '24px',
          color: '#6b7280',
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
              opacity: 0.7;
            }
          }
        `}</style>
      </div>
    );
  }

  // Summary slides
  const summaryStages = {
    'intro-summary': 'introVideo',
    'daw-summary': 'dawTutorial',
    'activity-summary': 'activityIntro',
    'school-summary': 'schoolBeneath',
    'reflection-summary': 'reflection'
  };

  if (summaryStages[currentStage]) {
    const slideContent = summarySlides[summaryStages[currentStage]];
    
    if (slideContent) {
      return (
        <SummarySlide
          title={slideContent.title}
          points={slideContent.points}
          estimatedTime={slideContent.estimatedTime}
          icon={slideContent.icon}
          sessionCode={sessionCode}
        />
      );
    }
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
        {/* Session Code Badge */}
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
        
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
        padding: '20px',
        position: 'relative'
      }}>
        {/* Session Code Badge */}
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={true} />
        
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
      icon: '🎹',
      subtitle: 'Learn the fundamentals of Digital Audio Workstation',
      steps: [
        { number: '1', text: 'Complete all interactive questions about the DAW interface.' },
        { number: '2', text: 'Click every button, control, and panel to learn what they accomplish.' },
        { number: '3', text: 'Finish the tutorial to unlock the next activity.' }
      ],
      bonus: 'You can experiment with sounds in Exploration Mode!',
      color: '#3b82f6'
    },
    'school-beneath': {
      title: 'The School Beneath Composition Assignment',
      icon: '🎵',
      subtitle: 'Create mysterious music for the underwater school',
      steps: [
        { number: '1', text: 'Use five or more different loops in your composition.' },
        { number: '2', text: 'Create three or more layers by playing loops together.' },
        { number: '3', text: 'Place five or more total loops to complete your musical score.' }
      ],
      bonus: 'You will unlock the Name That Loop game when you complete your composition!',
      color: '#8b5cf6'
    },
    'reflection': {
      title: 'Reflection Activity: Two Stars and a Wish',
      icon: '⭐⭐',
      subtitle: 'Reflect on your learning and composition process',
      steps: [
        { number: '1', text: 'Identify two things that went well in your work today.' },
        { number: '2', text: 'Share one thing you want to improve or learn more about.' },
        { number: '3', text: 'Think about what you learned about film music today.' }
      ],
      bonus: 'You can play the Name That Loop game with your partner!',
      color: '#ec4899'
    },
    'sound-effects': {
      title: 'Class Sharing & Reflection',
      icon: '🎤',
      subtitle: 'Share your compositions and learning as a class',
      steps: [
        { number: '1', text: 'Observe your partner\'s work and share one star you noticed.' },
        { number: '2', text: 'Reflect on one challenge you overcame in your composition.' },
        { number: '3', text: 'Share what you learned about film music today with the class.' }
      ],
      bonus: 'Listen carefully to hear the variety of musical choices your classmates made!',
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
        backgroundColor: '#ffffff',
        color: '#1f2937',
        padding: '80px 60px',
        position: 'relative'
      }}>
        {/* Session Code Badge */}
        <SessionCodeBadge sessionCode={sessionCode} isDarkBackground={false} />
        
        {/* Professional Timer */}
        <ProfessionalTimer 
          seconds={isCountingDown ? countdownTime : timer} 
          isCountingDown={isCountingDown}
          initialCountdownTime={initialCountdownTime}
        />

        {/* Icon */}
        <div style={{
          fontSize: '100px',
          marginBottom: '32px'
        }}>
          {activityData.icon}
        </div>

        {/* Title - MUCH LARGER */}
        <h1 style={{
          fontSize: '56px',
          fontWeight: '700',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#1f2937',
          maxWidth: '1100px',
          lineHeight: '1.2'
        }}>
          {activityData.title}
        </h1>

        {/* Subtitle - LARGER */}
        <p style={{
          fontSize: '24px',
          color: '#6b7280',
          marginBottom: '56px',
          textAlign: 'center',
          maxWidth: '800px'
        }}>
          {activityData.subtitle}
        </p>

        {/* Steps - Numbered with MUCH LARGER TEXT */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          width: '100%',
          maxWidth: '1100px',
          marginBottom: '40px'
        }}>
          {activityData.steps.map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '32px',
              padding: '36px',
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              border: '2px solid #e5e7eb'
            }}>
              {/* Number circle - LARGER */}
              <div style={{
                minWidth: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: activityData.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {step.number}
              </div>
              
              {/* Content - MUCH LARGER TEXT - Full sentence only */}
              <div style={{ flex: 1, paddingTop: '8px' }}>
                <div style={{
                  fontSize: '32px',
                  color: '#374151',
                  lineHeight: '1.4',
                  fontWeight: '400'
                }}>
                  {step.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus text - LARGER */}
        {activityData.bonus && (
          <p style={{
            fontSize: '22px',
            color: '#f59e0b',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            {activityData.bonus}
          </p>
        )}

        {/* Status badge - LARGER */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 36px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '999px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#166534'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          Activity In Progress
        </div>
      </div>
    );
  }

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
      Unknown activity: {currentStage}
    </div>
  );
};

export default PresentationView;