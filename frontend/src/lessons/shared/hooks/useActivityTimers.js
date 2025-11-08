// File: /lessons/shared/hooks/useActivityTimers.js
// Activity timer management hook - FIXED: Use update() to preserve studentsJoined

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, set as firebaseSet, update } from 'firebase/database';

export const useActivityTimers = (sessionCode, getCurrentStage, lessonStages) => {
  // ✅ Initialize ALL stages with timers from lessonStages
  const [activityTimers, setActivityTimers] = useState(() => {
    const initialTimers = {};
    lessonStages?.forEach(stage => {
      if (stage.hasTimer && stage.duration) {
        initialTimers[stage.id] = {
          presetTime: stage.duration,  // ✅ Changed from 'preset' to 'presetTime'
          timeRemaining: 0,             // ✅ Changed from 'current' to 'timeRemaining'
          isActive: false                // ✅ Changed from 'isRunning' to 'isActive'
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
      
      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          timeRemaining: seconds,
          isActive: true
        }
      };
    });

    // Update Firebase - FIXED: use update() instead of set()
    if (sessionCode) {
      const minutes = durationMinutes !== null ? durationMinutes : activityTimers[activityId]?.presetTime || 5;
      const seconds = minutes * 60;
      
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      update(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: seconds,
        timerActive: true,
        timestamp: Date.now()
      });
      
      console.log(`📡 Firebase updated: ${seconds}s, active: true`);
    }
  }, [activityTimers, sessionCode, getCurrentStage]);

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
    
    // Update Firebase - FIXED: use update() instead of set()
    if (sessionCode) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      update(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: activityTimers[activityId]?.timeRemaining || 0,
        timerActive: false,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage, activityTimers]);

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
    
    // Update Firebase - FIXED: use update() instead of set()
    if (sessionCode) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      update(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: activityTimers[activityId]?.timeRemaining || 0,
        timerActive: true,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage, activityTimers]);

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

    // Update Firebase to clear timer - FIXED: use update() instead of set()
    if (sessionCode) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      update(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: 0,
        timerActive: false,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage]);

  // ✅ NEW: Stop all timers when leaving a timer stage
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
          
          // Immediately stop the timer to prevent race conditions
          setActivityTimers(prev => ({
            ...prev,
            [lastStageRef.current]: {
              ...prev[lastStageRef.current],
              isActive: false,
              timeRemaining: 0
            }
          }));
          
          // Immediately clear Firebase to prevent lingering updates - FIXED: use update() instead of set()
          if (sessionCode) {
            const db = getDatabase();
            const sessionRef = ref(db, `sessions/${sessionCode}`);
            
            update(sessionRef, {
              currentStage: currentStageId,
              countdownTime: null,
              timerActive: null,
              timestamp: Date.now()
            });
          }
        }
      } 
      // If entering a non-timer stage from a non-timer stage, still clear Firebase timer data
      // FIXED: use update() instead of set() - THIS WAS THE MAIN BUG!
      else if (!currentStage?.hasTimer && sessionCode) {
        console.log(`🧹 Entered non-timer stage ${currentStageId} - clearing Firebase timer data`);
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          currentStage: currentStageId,
          countdownTime: null,
          timerActive: null,
          timestamp: Date.now()
        });
      }
    }
    
    lastStageRef.current = currentStageId;
  }, [getCurrentStage, lessonStages, activityTimers, sessionCode]);

  // ✅ Countdown effect
  useEffect(() => {
    const intervals = [];
    
    Object.keys(activityTimers).forEach(activityId => {
      const timer = activityTimers[activityId];
      
      if (timer.isActive && timer.timeRemaining > 0) {
        const interval = setInterval(() => {
          setActivityTimers(prev => {
            const currentTimer = prev[activityId];
            
            // ✅ CRITICAL: Stop immediately if timer is no longer active or doesn't exist
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
              
              // Update Firebase when timer finishes - FIXED: use update() instead of set()
              if (sessionCode) {
                const db = getDatabase();
                const sessionRef = ref(db, `sessions/${sessionCode}`);
                
                update(sessionRef, {
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
            
            // Update Firebase at strategic intervals - FIXED: use update() instead of set()
            const shouldUpdateFirebase = sessionCode && (
              (newTimeRemaining > 60 && newTimeRemaining % 10 === 0) ||
              (newTimeRemaining >= 10 && newTimeRemaining <= 60 && newTimeRemaining % 5 === 0) ||
              (newTimeRemaining < 10)
            );
            
            if (shouldUpdateFirebase) {
              const db = getDatabase();
              const sessionRef = ref(db, `sessions/${sessionCode}`);
              
              update(sessionRef, {
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
        
        intervals.push(interval);
      }
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [activityTimers, sessionCode, getCurrentStage]);

  // ✅ Auto-start timer when activity stage is unlocked
  useEffect(() => {
    if (!getCurrentStage || !lessonStages) return;
    
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
          // ✅ FIXED: Pass the adjusted presetTime to ensure adjusted time is used
          startActivityTimer(currentStageId, timer.presetTime);
        }, 100);
      }
    }
  }, [getCurrentStage, lessonStages, activityTimers, startActivityTimer]);

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