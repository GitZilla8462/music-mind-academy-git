// File: /lessons/shared/hooks/useActivityTimers.js
// Activity timer management hook
// ✅ FIXED: Accept currentStage as VALUE instead of getter function to prevent render-time state updates
// ✅ OPTIMIZED: Drastically reduced Firebase updates to prevent network flooding
// ✅ OPTIMIZED: Added isTeacher flag - students don't need local timer management
// ✅ FIXED: Use timestamp-based calculation to prevent time loss when browser tab is backgrounded

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, update } from 'firebase/database';

// Empty timer functions for students (no-ops)
const EMPTY_TIMERS = {
  activityTimers: {},
  formatTime: () => '0:00',
  adjustPresetTime: () => {},
  startActivityTimer: () => {},
  pauseActivityTimer: () => {},
  resumeActivityTimer: () => {},
  resetActivityTimer: () => {}
};

export const useActivityTimers = (sessionCode, currentStage, lessonStages, isTeacher = true) => {
  // ✅ Students don't need timer management - return empty immediately
  // This prevents unnecessary state updates and re-renders for students
  const [activityTimers, setActivityTimers] = useState(() => {
    if (!isTeacher) return {};

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
    return initialTimers;
  });
  
  // Track which timers have been auto-started to prevent repeated calls
  const autoStartedTimers = useRef(new Set());
  const lastStageRef = useRef(null);

  // ✅ FIXED: Track timer end times (absolute timestamps) to prevent time loss on tab switch
  // Key: activityId, Value: { endTime: timestamp, pausedRemaining: ms (when paused) }
  const timerEndTimeRef = useRef({});

  // ✅ NEW: Track last Firebase update to prevent flooding
  const lastFirebaseUpdateRef = useRef(0);
  const pendingFirebaseUpdateRef = useRef(null);

  // ✅ NEW: Throttled Firebase update function
  const updateFirebaseThrottled = useCallback((data, forceImmediate = false) => {
    if (!sessionCode || !isTeacher) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastFirebaseUpdateRef.current;
    
    // Force immediate update for important events (start, stop, pause, resume)
    // Otherwise throttle to max once per 5 seconds
    const shouldUpdateNow = forceImmediate || timeSinceLastUpdate >= 5000;
    
    if (shouldUpdateNow) {
      // Clear any pending update
      if (pendingFirebaseUpdateRef.current) {
        clearTimeout(pendingFirebaseUpdateRef.current);
        pendingFirebaseUpdateRef.current = null;
      }
      
      lastFirebaseUpdateRef.current = now;
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      update(sessionRef, {
        ...data,
        timestamp: now
      }).catch(err => console.error('Firebase update error:', err));
      
    } else {
      // Schedule update for later (debounce)
      if (pendingFirebaseUpdateRef.current) {
        clearTimeout(pendingFirebaseUpdateRef.current);
      }
      
      const delay = 5000 - timeSinceLastUpdate;
      pendingFirebaseUpdateRef.current = setTimeout(() => {
        lastFirebaseUpdateRef.current = Date.now();
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        update(sessionRef, {
          ...data,
          timestamp: Date.now()
        }).catch(err => console.error('Firebase update error:', err));
        
        pendingFirebaseUpdateRef.current = null;
      }, delay);
    }
  }, [sessionCode, isTeacher]);

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

      // ✅ FIXED: Store absolute end time to survive tab throttling
      timerEndTimeRef.current[activityId] = {
        endTime: Date.now() + (seconds * 1000),
        pausedRemaining: null
      };

      // ✅ Force immediate Firebase update for timer start
      updateFirebaseThrottled({
        countdownTime: seconds,
        timerActive: true
      }, true); // forceImmediate = true

      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          timeRemaining: seconds,
          isActive: true
        }
      };
    });
  }, [updateFirebaseThrottled]);

  // Pause timer
  const pauseActivityTimer = useCallback((activityId) => {
    console.log(`⏸️  Pausing timer for ${activityId}`);

    // ✅ FIXED: Calculate remaining time from end time and save it
    const timerData = timerEndTimeRef.current[activityId];
    if (timerData?.endTime) {
      const remainingMs = Math.max(0, timerData.endTime - Date.now());
      timerEndTimeRef.current[activityId] = {
        endTime: null,
        pausedRemaining: remainingMs
      };
    }

    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) return prev;

      // Calculate accurate remaining time
      const timerData = timerEndTimeRef.current[activityId];
      const remainingSeconds = timerData?.pausedRemaining
        ? Math.floor(timerData.pausedRemaining / 1000)
        : currentTimer.timeRemaining;

      // ✅ Force immediate Firebase update for pause
      updateFirebaseThrottled({
        countdownTime: remainingSeconds,
        timerActive: false
      }, true);

      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          timeRemaining: remainingSeconds,
          isActive: false
        }
      };
    });
  }, [updateFirebaseThrottled]);

  // Resume timer
  const resumeActivityTimer = useCallback((activityId) => {
    console.log(`▶️  Resuming timer for ${activityId}`);

    // ✅ FIXED: Recalculate end time from saved remaining time
    const timerData = timerEndTimeRef.current[activityId];
    if (timerData?.pausedRemaining) {
      timerEndTimeRef.current[activityId] = {
        endTime: Date.now() + timerData.pausedRemaining,
        pausedRemaining: null
      };
    }

    setActivityTimers(prev => {
      const currentTimer = prev[activityId];
      if (!currentTimer) return prev;

      // ✅ Force immediate Firebase update for resume
      updateFirebaseThrottled({
        countdownTime: currentTimer.timeRemaining,
        timerActive: true
      }, true);

      return {
        ...prev,
        [activityId]: {
          ...currentTimer,
          isActive: true
        }
      };
    });
  }, [updateFirebaseThrottled]);

  // ✅ Reset timer
  const resetActivityTimer = useCallback((activityId) => {
    console.log(`🔄 Resetting timer for ${activityId}`);

    // Clear auto-started flag so it can be auto-started again
    autoStartedTimers.current.delete(activityId);

    // ✅ FIXED: Clear timer end time data
    delete timerEndTimeRef.current[activityId];

    // ✅ Force immediate Firebase update for reset
    updateFirebaseThrottled({
      countdownTime: 0,
      timerActive: false
    }, true);

    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        timeRemaining: 0,
        isActive: false
      }
    }));
  }, [updateFirebaseThrottled]);

  // ✅ Stop all timers when leaving a timer stage
  useEffect(() => {
    if (!isTeacher || !currentStage || !lessonStages) return;
    
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

          // ✅ FIXED: Clear timer end time data
          delete timerEndTimeRef.current[lastStageRef.current];

          // Immediately stop the timer
          setActivityTimers(prev => ({
            ...prev,
            [lastStageRef.current]: {
              ...prev[lastStageRef.current],
              isActive: false,
              timeRemaining: 0
            }
          }));

          // ✅ Force immediate Firebase update for stage change
          updateFirebaseThrottled({
            countdownTime: null,
            timerActive: null
          }, true);
        }
      } 
      // If entering a non-timer stage, clear Firebase timer data
      else if (!currentStageData?.hasTimer && sessionCode) {
        console.log(`🧹 Entered non-timer stage ${currentStage} - clearing Firebase timer data`);
        updateFirebaseThrottled({
          countdownTime: null,
          timerActive: null
        }, true);
      }
    }
    
    lastStageRef.current = currentStage;
  }, [currentStage, lessonStages, activityTimers, sessionCode, updateFirebaseThrottled]);

  // ✅ Countdown effect - FIXED to use timestamp-based calculation
  // This prevents time loss when browser tab is backgrounded/throttled
  // Only runs for teachers
  useEffect(() => {
    if (!isTeacher) return;

    const intervals = [];

    Object.keys(activityTimers).forEach(activityId => {
      const timer = activityTimers[activityId];

      if (timer.isActive && timer.timeRemaining > 0) {
        const interval = setInterval(() => {
          // ✅ FIXED: Calculate remaining time from absolute end time
          // This survives browser tab throttling
          const timerData = timerEndTimeRef.current[activityId];
          if (!timerData?.endTime) {
            // Fallback: if no end time stored, skip this tick
            return;
          }

          const newTimeRemaining = Math.max(0, Math.floor((timerData.endTime - Date.now()) / 1000));

          setActivityTimers(prev => {
            const currentTimer = prev[activityId];

            // Stop immediately if timer is no longer active or doesn't exist
            if (!currentTimer || !currentTimer.isActive) {
              return prev;
            }

            // Time's up!
            if (newTimeRemaining <= 0) {
              console.log(`⏰ Timer finished for ${activityId}`);

              // Clear the end time ref
              delete timerEndTimeRef.current[activityId];

              // ✅ Force immediate Firebase update when timer finishes
              updateFirebaseThrottled({
                countdownTime: 0,
                timerActive: false
              }, true);

              return {
                ...prev,
                [activityId]: {
                  ...currentTimer,
                  timeRemaining: 0,
                  isActive: false
                }
              };
            }

            // ✅ OPTIMIZED: Update Firebase much less frequently
            // - Every 30 seconds when > 2 minutes remaining
            // - Every 10 seconds when 30s - 2 min remaining
            // - Every 5 seconds when 10-30 seconds remaining
            // - Every second only in last 10 seconds (for dramatic countdown)
            const shouldUpdateFirebase = (
              (newTimeRemaining > 120 && newTimeRemaining % 30 === 0) ||
              (newTimeRemaining > 30 && newTimeRemaining <= 120 && newTimeRemaining % 10 === 0) ||
              (newTimeRemaining > 10 && newTimeRemaining <= 30 && newTimeRemaining % 5 === 0) ||
              (newTimeRemaining <= 10)
            );

            if (shouldUpdateFirebase) {
              // Use throttled update (not forced) so it can batch if needed
              updateFirebaseThrottled({
                countdownTime: newTimeRemaining,
                timerActive: true
              }, newTimeRemaining <= 10); // Force only for last 10 seconds
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
  }, [activityTimers, updateFirebaseThrottled, isTeacher]);

  // ✅ Auto-start timer when activity stage is unlocked
  // Only runs for teachers
  useEffect(() => {
    if (!isTeacher || !currentStage || !lessonStages) return;
    
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
  }, [currentStage, lessonStages, activityTimers, startActivityTimer, isTeacher]);
  
  // ✅ NEW: Cleanup pending updates on unmount
  useEffect(() => {
    return () => {
      if (pendingFirebaseUpdateRef.current) {
        clearTimeout(pendingFirebaseUpdateRef.current);
      }
    };
  }, []);

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