// File: /lessons/shared/hooks/useTimerSound.js
// Timer sound hook with Web Audio API chime and mute toggle
// Persists mute preference in localStorage
// Uses shared Tone.js audio context to avoid "different audio context" errors

import { useState, useCallback, useRef, useEffect } from 'react';
import { getSharedAudioContext, resumeAudioContext } from '../../../utils/sharedAudioContext';

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

  // Toggle mute state and prime audio context (user gesture unlocks audio)
  const toggleMute = useCallback(async () => {
    setIsMuted(prev => !prev);

    // Prime the shared audio context on user interaction (this unlocks browser audio)
    try {
      await resumeAudioContext();
      audioContextRef.current = getSharedAudioContext();
      console.log('🔊 Shared audio context unlocked by user interaction');
    } catch (e) {
      console.warn('Failed to prime audio context:', e);
    }
  }, []);

  // Play an attention-grabbing pulse alert using Web Audio API
  const playTimerEndSound = useCallback(async () => {
    if (isMuted) return;

    try {
      // Use the shared Tone.js audio context
      await resumeAudioContext();
      const ctx = getSharedAudioContext();
      audioContextRef.current = ctx;

      console.log('🔔 Playing timer sound, context state:', ctx.state);

      const now = ctx.currentTime;

      // Create beep-beep-beep pattern, repeated 3 times
      const frequency = 660; // E5 - pleasant but noticeable
      const beepDuration = 0.15;
      const beepGap = 0.1;
      const groupGap = 0.35;
      const groupLength = (beepDuration + beepGap) * 3;

      // Pattern: beep-beep-beep ... beep-beep-beep ... beep-beep-beep
      const beepTimes = [];
      for (let group = 0; group < 3; group++) {
        for (let beep = 0; beep < 3; beep++) {
          beepTimes.push(group * (groupLength + groupGap) + beep * (beepDuration + beepGap));
        }
      }

      beepTimes.forEach((offset) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Use sine wave for smooth, pleasant tone
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        // Smooth attack and release - LOUD volume
        const startTime = now + offset;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.03); // Smooth attack, loud
        gainNode.gain.setValueAtTime(0.8, startTime + beepDuration - 0.04);
        gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration); // Smooth release

        oscillator.start(startTime);
        oscillator.stop(startTime + beepDuration + 0.05);
      });

    } catch (error) {
      console.error('🔇 Failed to play timer sound:', error);
    }
  }, [isMuted]);

  // Cleanup on unmount - don't close shared context, just clear ref
  useEffect(() => {
    return () => {
      // Don't close the shared context - it's used across the app
      audioContextRef.current = null;
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    playTimerEndSound
  };
};

export default useTimerSound;
