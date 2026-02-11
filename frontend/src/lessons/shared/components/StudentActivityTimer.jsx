// File: /src/lessons/shared/components/StudentActivityTimer.jsx
// Floating timer for students during activities
// Receives countdown time from Firebase (set by teacher)
// Includes minimize/expand toggle and drag-to-reposition

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Clock, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';
import { useTimerSound } from '../hooks/useTimerSound';

const StudentActivityTimer = ({ sessionCode }) => {
  const [countdownTime, setCountdownTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastFirebaseTime = useRef(null);
  const lastFirebaseActive = useRef(null);

  // Drag state
  const [position, setPosition] = useState(null); // null = default CSS position (top-4 right-4)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const timerRef = useRef(null);

  // Timer sound hook (plays chime when timer ends)
  const { isMuted, toggleMute, playTimerEndSound } = useTimerSound();

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
          // Play timer end sound
          playTimerEndSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, countdownTime, playTimerEndSound]);

  // Drag handlers
  const handlePointerDown = useCallback((e) => {
    // Don't start drag on button clicks
    if (e.target.closest('button')) return;

    const el = timerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // If this is the first drag, initialize position from current rendered location
    const currentX = rect.left;
    const currentY = rect.top;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      elemX: currentX,
      elemY: currentY,
    };

    setIsDragging(true);
    el.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    let newX = dragStartRef.current.elemX + dx;
    let newY = dragStartRef.current.elemY + dy;

    // Clamp to viewport
    const el = timerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
    }

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Don't render if no active timer
  if (!timerActive && countdownTime <= 0) {
    return null;
  }

  // Determine colors based on time remaining
  const isUrgent = countdownTime <= 60;
  const isWarning = countdownTime <= 30;

  // Style: use absolute positioning when dragged, otherwise default fixed top-right
  const positionStyle = position
    ? { position: 'fixed', left: position.x, top: position.y, right: 'auto' }
    : {};

  const dragProps = {
    ref: timerRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    style: { ...positionStyle, cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' },
  };

  // Minimized view - just a small icon with time
  if (isMinimized) {
    return (
      <div
        {...dragProps}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border select-none ${
          isWarning
            ? 'bg-red-600 border-red-500 text-white'
            : isUrgent
            ? 'bg-amber-500 border-amber-400 text-white'
            : 'bg-gray-800/95 border-gray-700 text-white'
        }`}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Expand timer"
        >
          <Clock size={18} className={isWarning ? 'animate-pulse' : ''} />
          <span className={`font-mono font-bold ${isWarning ? 'animate-pulse' : ''}`}>
            {formatTime(countdownTime)}
          </span>
          <Maximize2 size={14} className="opacity-70" />
        </button>
        <button
          onClick={toggleMute}
          className="p-1 rounded hover:bg-white/20 transition-colors"
          title={isMuted ? 'Unmute timer sound' : 'Mute timer sound'}
        >
          {isMuted ? '🔇' : '🔔'}
        </button>
      </div>
    );
  }

  // Expanded view - full timer display
  return (
    <div
      {...dragProps}
      className={`fixed top-4 right-4 z-50 rounded-xl shadow-2xl border backdrop-blur-sm select-none ${
        isDragging ? '' : 'transition-all'
      } ${
        isWarning
          ? 'bg-red-600/95 border-red-500'
          : isUrgent
          ? 'bg-amber-500/95 border-amber-400'
          : 'bg-gray-800/95 border-gray-700'
      }`}
    >
      {/* Drag handle + header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <GripHorizontal size={16} className="opacity-50" />
          <Clock size={16} />
          <span>Time Remaining</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            title={isMuted ? 'Unmute timer sound' : 'Mute timer sound'}
          >
            {isMuted ? '🔇' : '🔔'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            title="Minimize timer"
          >
            <Minimize2 size={16} />
          </button>
        </div>
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
