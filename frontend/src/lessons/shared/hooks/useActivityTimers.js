// File: /lessons/shared/hooks/useActivityTimers.js
// Activity timer management hook - FIXED: Only teacher controls countdown

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, set as firebaseSet } from 'firebase/database';

export const useActivityTimers = (sessionCode, getCurrentStage, lessonStages, userRole) => {
  // ✅ Initialize ALL stages with timers from lessonStages
  const [activityTimers, setActivityTimers] = useState(() => {
    const initialTimers = {};
    lessonStages?.forEach(stage => {
      if (stage.hasTimer && stage.duration) {
        initialTimers[stage.id] = {
          presetTime: stage.duration,
          timeRemaining: 0,
          isActive: false
        };
      }
    });
    console.log('📊 Initialized timers:', initialTimers);
    return initialTimers;
  });
  
  // Track which timers have been auto-started to prevent repeated calls
  const autoStartedTimers = useRef(new Set());
  const lastStageRef = useRef(null);
  const intervalsRef = useRef([]);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ✅ Adjust preset time - accepts minutes as delta
  const adjustPresetTime = useCallback((activityId, delta) => {
    console.log(`⏱️  Adjusting ${activityId} by ${delta} minutes`);
    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) return prev;
      
      const newPreset = Math.max(1, Math.min(60, currentTimer.presetTime + delta));
      console.log(`   New preset: ${newPreset} minutes`);
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          presetTime: newPreset
        }
      };
    });
  }, []);

  // ✅ Start timer - accepts activityId and optional duration in MINUTES
  const startActivityTimer = useCallback((activityId, durationMinutes = null) => {
    console.log(`▶️  Starting timer for ${activityId}`, { durationMinutes, userRole });
    
    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) {
        console.warn(`⚠️  No timer config for ${activityId}`);
        return prev;
      }
      
      // Use provided duration or fall back to preset
      const minutes = durationMinutes !== null ? durationMinutes : currentTimer.presetTime;
      const seconds = minutes * 60;
      
      console.log(`   Starting with ${minutes} minutes (${seconds} seconds)`);
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          timeRemaining: seconds,
          isActive: true
        }
      };
    });

    // Update Firebase - only if teacher or no session
    if (sessionCode && (!userRole || userRole === 'teacher')) {
      const currentTimer = activityTimers[activityId];
      const minutes = durationMinutes !== null ? durationMinutes : currentTimer?.presetTime || 5;
      const seconds = minutes * 60;
      
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: seconds,
        timerActive: true,
        timestamp: Date.now()
      });
      
      console.log(`📡 Firebase updated: ${seconds}s, active: true`);
    }
  }, [activityTimers, sessionCode, getCurrentStage, userRole]);

  // Pause timer
  const pauseActivityTimer = useCallback((activityId) => {
    console.log(`⏸️  Pausing timer for ${activityId}`);
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isActive: false
      }
    }));
    
    // Update Firebase - only if teacher or no session
    if (sessionCode && (!userRole || userRole === 'teacher')) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: activityTimers[activityId]?.timeRemaining || 0,
        timerActive: false,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage, activityTimers, userRole]);

  // Resume timer
  const resumeActivityTimer = useCallback((activityId) => {
    console.log(`▶️  Resuming timer for ${activityId}`);
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isActive: true
      }
    }));
    
    // Update Firebase - only if teacher or no session
    if (sessionCode && (!userRole || userRole === 'teacher')) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: activityTimers[activityId]?.timeRemaining || 0,
        timerActive: true,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage, activityTimers, userRole]);

  // ✅ Reset timer
  const resetActivityTimer = useCallback((activityId) => {
    console.log(`🔄 Resetting timer for ${activityId}`);
    
    // Clear auto-started flag so it can be auto-started again
    autoStartedTimers.current.delete(activityId);
    
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        timeRemaining: 0,
        isActive: false
      }
    }));

    // Update Firebase to clear timer - only if teacher or no session
    if (sessionCode && (!userRole || userRole === 'teacher')) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: 0,
        timerActive: false,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage, userRole]);

  // ✅ Stop all timers when leaving a timer stage
  useEffect(() => {
    if (!getCurrentStage || !lessonStages) return;
    
    const currentStageId = getCurrentStage();
    if (!currentStageId) return;
    
    // If stage changed
    if (lastStageRef.current && lastStageRef.current !== currentStageId) {
      const previousStage = lessonStages.find(s => s.id === lastStageRef.current);
      const currentStage = lessonStages.find(s => s.id === currentStageId);
      
      // If leaving a timer stage
      if (previousStage?.hasTimer) {
        const previousTimer = activityTimers[lastStageRef.current];
        
        // If timer was running, stop it immediately
        if (previousTimer?.isActive) {
          console.log(`🛑 Stage changed from ${lastStageRef.current} to ${currentStageId} - stopping timer`);
          
          // Clear any running intervals
          intervalsRef.current.forEach(interval => clearInterval(interval));
          intervalsRef.current = [];
          
          // Immediately stop the timer to prevent race conditions
          setActivityTimers(prev => ({
            ...prev,
            [lastStageRef.current]: {
              ...prev[lastStageRef.current],
              isActive: false,
              timeRemaining: 0
            }
          }));
          
          // Immediately clear Firebase - only if teacher or no session
          if (sessionCode && (!userRole || userRole === 'teacher')) {
            const db = getDatabase();
            const sessionRef = ref(db, `sessions/${sessionCode}`);
            
            firebaseSet(sessionRef, {
              currentStage: currentStageId,
              countdownTime: null,
              timerActive: null,
              timestamp: Date.now()
            });
          }
        }
      } 
      // If entering a non-timer stage, clear Firebase timer data
      else if (!currentStage?.hasTimer && sessionCode && (!userRole || userRole === 'teacher')) {
        console.log(`🧹 Entered non-timer stage ${currentStageId} - clearing Firebase timer data`);
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        firebaseSet(sessionRef, {
          currentStage: currentStageId,
          countdownTime: null,
          timerActive: null,
          timestamp: Date.now()
        });
      }
    }
    
    lastStageRef.current = currentStageId;
  }, [getCurrentStage, lessonStages, activityTimers, sessionCode, userRole]);

  // ✅ Countdown effect - ONLY TEACHER CONTROLS THE COUNTDOWN
  useEffect(() => {
    // 🚨 CRITICAL: Students should NEVER run countdown timers
    // They only display what Firebase tells them
    if (sessionCode && userRole === 'student') {
      console.log('⏭️  Student mode: Skipping countdown effect (reading from Firebase only)');
      return;
    }

    // Clear old intervals
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];
    
    Object.keys(activityTimers).forEach(activityId => {
      const timer = activityTimers[activityId];
      
      if (timer.isActive && timer.timeRemaining > 0) {
        const interval = setInterval(() => {
          setActivityTimers(prev => {
            const currentTimer = prev[activityId];
            
            // Stop immediately if timer is no longer active or doesn't exist
            if (!currentTimer || !currentTimer.isActive || currentTimer.timeRemaining <= 0) {
              return prev;
            }
            
            const newTimeRemaining = currentTimer.timeRemaining - 1;
            
            // Time's up!
            if (newTimeRemaining <= 0) {
              setTimeout(() => {
                alert(`⏰ Time's Up for ${activityId}! Students can continue working.`);
              }, 100);
              
              // Play notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Time\'s Up!', {
                  body: `${activityId} timer has finished.`
                });
              }
              
              // Update Firebase when timer finishes - only if teacher or no session
              if (sessionCode && (!userRole || userRole === 'teacher')) {
                const db = getDatabase();
                const sessionRef = ref(db, `sessions/${sessionCode}`);
                
                firebaseSet(sessionRef, {
                  currentStage: getCurrentStage ? getCurrentStage() : 'locked',
                  countdownTime: 0,
                  timerActive: false,
                  timestamp: Date.now()
                });
              }
              
              return {
                ...prev,
                [activityId]: {
                  ...currentTimer,
                  timeRemaining: 0,
                  isActive: false
                }
              };
            }
            
            // Update Firebase at strategic intervals - only if teacher or no session
            const shouldUpdateFirebase = (sessionCode && (!userRole || userRole === 'teacher')) && (
              (newTimeRemaining > 60 && newTimeRemaining % 10 === 0) ||
              (newTimeRemaining >= 10 && newTimeRemaining <= 60 && newTimeRemaining % 5 === 0) ||
              (newTimeRemaining < 10)
            );
            
            if (shouldUpdateFirebase) {
              const db = getDatabase();
              const sessionRef = ref(db, `sessions/${sessionCode}`);
              
              firebaseSet(sessionRef, {
                currentStage: getCurrentStage ? getCurrentStage() : 'locked',
                countdownTime: newTimeRemaining,
                timerActive: true,
                timestamp: Date.now()
              });
            }
            
            return {
              ...prev,
              [activityId]: {
                ...currentTimer,
                timeRemaining: newTimeRemaining
              }
            };
          });
        }, 1000);
        
        intervalsRef.current.push(interval);
      }
    });
    
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
    };
  }, [activityTimers, sessionCode, getCurrentStage, userRole]);

  // ✅ Auto-start timer when activity stage is unlocked - TEACHER ONLY
  useEffect(() => {
    if (!getCurrentStage || !lessonStages) return;
    
    // Students don't auto-start timers
    if (sessionCode && userRole === 'student') return;
    
    const currentStageId = getCurrentStage();
    if (!currentStageId) return;
    
    const currentStageData = lessonStages.find(s => s.id === currentStageId);
    
    // If this stage has a timer, auto-start it
    if (currentStageData?.hasTimer && activityTimers[currentStageId]) {
      const timer = activityTimers[currentStageId];
      
      // Only auto-start if:
      // 1. Timer hasn't been started yet (timeRemaining is 0 and not active)
      // 2. Haven't already auto-started this timer
      if (timer.timeRemaining === 0 && !timer.isActive && !autoStartedTimers.current.has(currentStageId)) {
        // Mark as auto-started
        autoStartedTimers.current.add(currentStageId);
        
        setTimeout(() => {
          console.log('🚀 Auto-starting timer for', currentStageId, 'with adjusted time:', timer.presetTime, 'min');
          startActivityTimer(currentStageId, timer.presetTime);
        }, 100);
      }
    }
  }, [getCurrentStage, lessonStages, activityTimers, startActivityTimer, sessionCode, userRole]);

  return {
    activityTimers,
    formatTime,
    adjustPresetTime,
    startActivityTimer,
    pauseActivityTimer,
    resumeActivityTimer,
    resetActivityTimer
  };
};