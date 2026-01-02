// File: /src/lessons/shared/components/StudentActivityTimer.jsx
// Floating timer for students during activities
// Receives countdown time from Firebase (set by teacher)
// Includes minimize/expand toggle

import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Clock, Minimize2, Maximize2 } from 'lucide-react';

const StudentActivityTimer = ({ sessionCode }) => {
  const [countdownTime, setCountdownTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastFirebaseTime = useRef(null);
  const lastFirebaseActive = useRef(null);

  // Format time as M:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Listen to Firebase for timer updates from teacher
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Get countdown time
      if (data.countdownTime !== undefined && data.countdownTime !== lastFirebaseTime.current) {
        lastFirebaseTime.current = data.countdownTime;
        setCountdownTime(data.countdownTime || 0);
      }

      // Get timer active state
      if (data.timerActive !== undefined && data.timerActive !== lastFirebaseActive.current) {
        lastFirebaseActive.current = data.timerActive;
        setTimerActive(data.timerActive || false);
      }
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Local countdown when timer is active
  useEffect(() => {
    if (!timerActive || countdownTime <= 0) return;

    const interval = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, countdownTime]);

  // Don't render if no active timer
  if (!timerActive && countdownTime <= 0) {
    return null;
  }

  // Determine colors based on time remaining
  const isUrgent = countdownTime <= 60;
  const isWarning = countdownTime <= 30;

  // Minimized view - just a small icon with time
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border transition-all hover:scale-105 ${
          isWarning
            ? 'bg-red-600 border-red-500 text-white'
            : isUrgent
            ? 'bg-amber-500 border-amber-400 text-white'
            : 'bg-gray-800/95 border-gray-700 text-white'
        }`}
        title="Expand timer"
      >
        <Clock size={18} className={isWarning ? 'animate-pulse' : ''} />
        <span className={`font-mono font-bold ${isWarning ? 'animate-pulse' : ''}`}>
          {formatTime(countdownTime)}
        </span>
        <Maximize2 size={14} className="opacity-70" />
      </button>
    );
  }

  // Expanded view - full timer display
  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-xl shadow-2xl border backdrop-blur-sm transition-all ${
        isWarning
          ? 'bg-red-600/95 border-red-500'
          : isUrgent
          ? 'bg-amber-500/95 border-amber-400'
          : 'bg-gray-800/95 border-gray-700'
      }`}
    >
      {/* Header with minimize button */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Clock size={16} />
          <span>Time Remaining</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          title="Minimize timer"
        >
          <Minimize2 size={16} />
        </button>
      </div>

      {/* Timer display */}
      <div className="px-6 pb-4">
        <div
          className={`text-5xl font-bold font-mono text-center text-white ${
            isWarning ? 'animate-pulse' : ''
          }`}
        >
          {formatTime(countdownTime)}
        </div>

        {/* Status message */}
        {isWarning && (
          <div className="text-center text-white/90 text-sm mt-2 font-medium">
            Almost time!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentActivityTimer;
