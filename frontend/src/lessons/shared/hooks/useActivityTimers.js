// File: /lessons/shared/hooks/useActivityTimers.js
// Activity timer management hook
// ✅ FIXED: Accept currentStage as VALUE instead of getter function to prevent render-time state updates

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, update } from 'firebase/database';

export const useActivityTimers = (sessionCode, currentStage, lessonStages) => {
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
    console.log(`▶️  Starting timer for ${activityId}`, { durationMinutes });
    
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
      
      // Update Firebase inside setState callback to get latest values
      if (sessionCode) {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          countdownTime: seconds,
          timerActive: true,
          timestamp: Date.now()
        }).then(() => {
          console.log(`📡 Firebase updated: ${seconds}s, active: true`);
        });
      }
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          timeRemaining: seconds,
          isActive: true
        }
      };
    });
  }, [sessionCode]);

  // Pause timer
  const pauseActivityTimer = useCallback((activityId) => {
    console.log(`⏸️  Pausing timer for ${activityId}`);
    
    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) return prev;
      
      // Update Firebase
      if (sessionCode) {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          countdownTime: currentTimer.timeRemaining,
          timerActive: false,
          timestamp: Date.now()
        });
      }
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          isActive: false
        }
      };
    });
  }, [sessionCode]);

  // Resume timer
  const resumeActivityTimer = useCallback((activityId) => {
    console.log(`▶️  Resuming timer for ${activityId}`);
    
    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) return prev;
      
      // Update Firebase
      if (sessionCode) {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          countdownTime: currentTimer.timeRemaining,
          timerActive: true,
          timestamp: Date.now()
        });
      }
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          isActive: true
        }
      };
    });
  }, [sessionCode]);

  // ✅ Reset timer
  const resetActivityTimer = useCallback((activityId) => {
    console.log(`🔄 Resetting timer for ${activityId}`);
    
    // Clear auto-started flag so it can be auto-started again
    autoStartedTimers.current.delete(activityId);
    
    setActivityTimers(prev => {
      // Update Firebase
      if (sessionCode) {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          countdownTime: 0,
          timerActive: false,
          timestamp: Date.now()
        });
      }
      
      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          timeRemaining: 0,
          isActive: false
        }
      };
    });
  }, [sessionCode]);

  // ✅ Stop all timers when leaving a timer stage
  useEffect(() => {
    if (!currentStage || !lessonStages) return;
    
    // If stage changed
    if (lastStageRef.current && lastStageRef.current !== currentStage) {
      const previousStageData = lessonStages.find(s => s.id === lastStageRef.current);
      const currentStageData = lessonStages.find(s => s.id === currentStage);
      
      // If leaving a timer stage
      if (previousStageData?.hasTimer) {
        const previousTimer = activityTimers[lastStageRef.current];
        
        // If timer was running, stop it immediately
        if (previousTimer?.isActive) {
          console.log(`🛑 Stage changed from ${lastStageRef.current} to ${currentStage} - stopping timer`);
          
          // Immediately stop the timer
          setActivityTimers(prev => ({
            ...prev,
            [lastStageRef.current]: {
              ...prev[lastStageRef.current],
              isActive: false,
              timeRemaining: 0
            }
          }));
          
          // Clear Firebase timer data
          if (sessionCode) {
            const db = getDatabase();
            const sessionRef = ref(db, `sessions/${sessionCode}`);
            
            update(sessionRef, {
              countdownTime: null,
              timerActive: null,
              timestamp: Date.now()
            });
          }
        }
      } 
      // If entering a non-timer stage, clear Firebase timer data
      else if (!currentStageData?.hasTimer && sessionCode) {
        console.log(`🧹 Entered non-timer stage ${currentStage} - clearing Firebase timer data`);
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          countdownTime: null,
          timerActive: null,
          timestamp: Date.now()
        });
      }
    }
    
    lastStageRef.current = currentStage;
  }, [currentStage, lessonStages, activityTimers, sessionCode]);

  // ✅ Countdown effect
  useEffect(() => {
    const intervals = [];
    
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
              
              // Update Firebase when timer finishes
              if (sessionCode) {
                const db = getDatabase();
                const sessionRef = ref(db, `sessions/${sessionCode}`);
                
                update(sessionRef, {
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
            
            // Update Firebase at strategic intervals
            const shouldUpdateFirebase = sessionCode && (
              (newTimeRemaining > 60 && newTimeRemaining % 10 === 0) ||
              (newTimeRemaining >= 10 && newTimeRemaining <= 60 && newTimeRemaining % 5 === 0) ||
              (newTimeRemaining < 10)
            );
            
            if (shouldUpdateFirebase) {
              const db = getDatabase();
              const sessionRef = ref(db, `sessions/${sessionCode}`);
              
              update(sessionRef, {
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
        
        intervals.push(interval);
      }
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [activityTimers, sessionCode]);

  // ✅ Auto-start timer when activity stage is unlocked
  useEffect(() => {
    if (!currentStage || !lessonStages) return;
    
    const currentStageData = lessonStages.find(s => s.id === currentStage);
    
    // If this stage has a timer, auto-start it
    if (currentStageData?.hasTimer && activityTimers[currentStage]) {
      const timer = activityTimers[currentStage];
      
      // Only auto-start if:
      // 1. Timer hasn't been started yet (timeRemaining is 0 and not active)
      // 2. Haven't already auto-started this timer
      if (timer.timeRemaining === 0 && !timer.isActive && !autoStartedTimers.current.has(currentStage)) {
        // Mark as auto-started
        autoStartedTimers.current.add(currentStage);
        
        // Use setTimeout to ensure this happens after render
        setTimeout(() => {
          console.log('🚀 Auto-starting timer for', currentStage, 'with adjusted time:', timer.presetTime, 'min');
          startActivityTimer(currentStage, timer.presetTime);
        }, 100);
      }
    }
  }, [currentStage, lessonStages, activityTimers, startActivityTimer]);

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