// File: /lessons/shared/hooks/useActivityTimers.js
// Activity timer management hook - reusable across all lessons

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, set as firebaseSet } from 'firebase/database';

export const useActivityTimers = (sessionCode, getCurrentStage, lessonStages) => {
  const [activityTimers, setActivityTimers] = useState({
    'daw-tutorial': { preset: 5, current: 0, isRunning: false },
    'school-beneath': { preset: 10, current: 0, isRunning: false },
    'reflection': { preset: 5, current: 0, isRunning: false }
  });
  
  // Track which timers have been auto-started to prevent repeated calls
  const autoStartedTimers = useRef(new Set());

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Adjust preset time
  const adjustPresetTime = useCallback((activityId, delta) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        preset: Math.max(1, Math.min(60, prev[activityId].preset + delta))
      }
    }));
  }, []);

  // Start timer
  const startActivityTimer = useCallback((activityId) => {
    const preset = activityTimers[activityId].preset;
    const seconds = preset * 60;
    
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        current: seconds,
        isRunning: true
      }
    }));

    // Update Firebase
    if (sessionCode) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: seconds,
        timestamp: Date.now()
      });
    }
  }, [activityTimers, sessionCode, getCurrentStage]);

  // Pause timer
  const pauseActivityTimer = useCallback((activityId) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isRunning: false
      }
    }));
  }, []);

  // Resume timer
  const resumeActivityTimer = useCallback((activityId) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isRunning: true
      }
    }));
  }, []);

  // Reset timer
  const resetActivityTimer = useCallback((activityId) => {
    // Clear auto-started flag so it can be auto-started again
    autoStartedTimers.current.delete(activityId);
    
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        current: 0,
        isRunning: false
      }
    }));

    // Update Firebase to clear timer
    if (sessionCode) {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      
      firebaseSet(sessionRef, {
        currentStage: getCurrentStage ? getCurrentStage() : 'locked',
        countdownTime: 0,
        timestamp: Date.now()
      });
    }
  }, [sessionCode, getCurrentStage]);

  // Countdown effect
  useEffect(() => {
    const intervals = [];
    
    Object.keys(activityTimers).forEach(activityId => {
      const timer = activityTimers[activityId];
      
      if (timer.isRunning && timer.current > 0) {
        const interval = setInterval(() => {
          setActivityTimers(prev => {
            const newCurrent = prev[activityId].current - 1;
            
            // Time's up!
            if (newCurrent <= 0) {
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
                
                firebaseSet(sessionRef, {
                  currentStage: getCurrentStage ? getCurrentStage() : 'locked',
                  countdownTime: 0,
                  timestamp: Date.now()
                });
              }
              
              return {
                ...prev,
                [activityId]: {
                  ...prev[activityId],
                  current: 0,
                  isRunning: false
                }
              };
            }
            
            // Update Firebase at strategic intervals to reduce updates:
            // - Every 10 seconds for times > 60s
            // - Every 5 seconds for times between 10-60s  
            // - Every second for times < 10s (final countdown!)
            const shouldUpdateFirebase = sessionCode && (
              (newCurrent > 60 && newCurrent % 10 === 0) ||   // Every 10s when > 1 min
              (newCurrent >= 10 && newCurrent <= 60 && newCurrent % 5 === 0) ||  // Every 5s in last minute
              (newCurrent < 10)  // Every second in final 10 seconds
            );
            
            if (shouldUpdateFirebase) {
              const db = getDatabase();
              const sessionRef = ref(db, `sessions/${sessionCode}`);
              
              firebaseSet(sessionRef, {
                currentStage: getCurrentStage ? getCurrentStage() : 'locked',
                countdownTime: newCurrent,
                timestamp: Date.now()
              });
            }
            
            return {
              ...prev,
              [activityId]: {
                ...prev[activityId],
                current: newCurrent
              }
            };
          });
        }, 1000);
        
        intervals.push(interval);
      }
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [activityTimers, sessionCode, getCurrentStage]);

  // Auto-start timer when activity stage is unlocked
  useEffect(() => {
    if (!getCurrentStage || !lessonStages) return;
    
    const currentStageId = getCurrentStage();
    if (!currentStageId) return;
    
    const currentStageData = lessonStages.find(s => s.id === currentStageId);
    
    // If this is an activity stage with a recommended time, auto-start the timer
    if (currentStageData?.type === 'activity' && currentStageData.recommendedMinutes) {
      const timer = activityTimers[currentStageId];
      
      // Only auto-start if:
      // 1. Timer hasn't been started yet (current is 0 and not running)
      // 2. Haven't already auto-started this timer (tracked by ref)
      if (timer && timer.current === 0 && !timer.isRunning && !autoStartedTimers.current.has(currentStageId)) {
        // Mark as auto-started
        autoStartedTimers.current.add(currentStageId);
        
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          console.log('Auto-starting timer for', currentStageId);
          startActivityTimer(currentStageId);
        }, 100);
      }
    }
  // Intentionally exclude activityTimers from dependencies to prevent repeated calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentStage, lessonStages, startActivityTimer]);

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