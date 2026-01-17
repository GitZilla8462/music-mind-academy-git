// File: /lessons/shared/hooks/useTimerSound.js
// Timer sound hook with Web Audio API chime and mute toggle
// Persists mute preference in localStorage

import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'timer-sound-muted';

/**
 * Hook for playing a gentle chime when timer ends
 * Uses Web Audio API to synthesize a pleasant two-tone chime
 *
 * @returns {Object} { isMuted, toggleMute, playTimerEndSound }
 */
export const useTimerSound = () => {
  // Load mute preference from localStorage
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false; // Default to sound ON
    }
  });

  // Audio context ref (created on first play to comply with browser autoplay policy)
  const audioContextRef = useRef(null);

  // Save mute preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isMuted.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, [isMuted]);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Play a gentle two-tone chime using Web Audio API
  const playTimerEndSound = useCallback(() => {
    if (isMuted) return;

    try {
      // Create or reuse audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Create a gentle two-note chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteDuration = 0.3;
      const noteGap = 0.15;

      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Use a soft sine wave
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        // Envelope: quick attack, gentle decay
        const startTime = now + (i * (noteDuration + noteGap));
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration); // Decay

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration + 0.1);
      });

    } catch (error) {
      console.warn('Failed to play timer sound:', error);
    }
  }, [isMuted]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    playTimerEndSound
  };
};

export default useTimerSound;
