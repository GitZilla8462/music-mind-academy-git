// ============================================================================
// FILE: usePlaybackHandlers.js - FIXED version
// Key fixes:
// 1. Schedule loops BEFORE starting transport (removes 150ms gap)
// 2. Only reschedule on seek if transport was playing
// 3. Use requestAnimationFrame for post-seek scheduling
// ============================================================================

import { useCallback, useRef } from 'react';
import * as Tone from 'tone';

export const usePlaybackHandlers = ({
  lockFeatures,
  onPlaybackStartCallback,
  onPlaybackStopCallback,
  audioReady,
  showToast,
  placedLoops,
  selectedVideo,
  trackStates,
  play,
  pause,
  stop,
  seek,
  scheduleLoops
}) => {

  const lastScheduleTimeRef = useRef(0);
  const SCHEDULE_DEBOUNCE_MS = 200;

  // Helper to get track states (with fallback defaults)
  const getTrackStatesForScheduling = useCallback(() => {
    const hasTrackStates = Object.keys(trackStates).length > 0;
    if (hasTrackStates) return trackStates;
    
    console.log('🔧 Creating default track states for scheduling');
    const defaults = {};
    for (let i = 0; i < 8; i++) {
      defaults[`track-${i}`] = { volume: 0.7, muted: false, solo: false };
    }
    return defaults;
  }, [trackStates]);

  const handlePlay = useCallback(async () => {
    if (lockFeatures.allowPlayback === false) {
      return;
    }

    if (onPlaybackStartCallback) {
      onPlaybackStartCallback();
    }

    if (!audioReady) {
      showToast?.('Audio not ready', 'error');
      return;
    }
    
    try {
      console.log(`🎬 Starting playback with ${placedLoops.length} loops`);
      
      // Resume AudioContext if suspended (browser autoplay policy)
      if (Tone.context.state !== 'running') {
        console.log('🔊 AudioContext suspended - resuming...');
        await Tone.start();
        console.log('✅ AudioContext resumed');
      }
      
      const statesForScheduling = getTrackStatesForScheduling();
      
      // ✅ FIX: Schedule loops BEFORE starting transport
      // This ensures all events are queued and ready to fire at time 0+
      if (placedLoops.length > 0) {
        console.log('📅 Pre-scheduling loops before transport start...');
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
      }
      
      // Now start transport - scheduled events will fire immediately
      await play();
      console.log('✅ Transport started - playback begun');
      
    } catch (error) {
      console.error('Error starting playback:', error);
      showToast?.('Failed to start playback', 'error');
    }
  }, [
    audioReady, placedLoops, scheduleLoops, selectedVideo?.duration, 
    play, showToast, getTrackStatesForScheduling, onPlaybackStartCallback, lockFeatures
  ]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleStop = useCallback(() => {
    if (onPlaybackStopCallback) {
      onPlaybackStopCallback();
    }
    stop();
  }, [stop, onPlaybackStopCallback]);

  const handleRestart = useCallback(async () => {
    if (!audioReady) return;
    if (lockFeatures.allowPlayback === false) return;
    
    console.log('🔄 Restarting playback');
    
    // Stop and reset
    stop();
    seek(0);
    
    // Small delay then restart with fresh scheduling
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Now play (which will schedule loops)
    await handlePlay();
  }, [stop, seek, audioReady, lockFeatures, handlePlay]);
    
  const handleSeek = useCallback((time) => {
    if (!audioReady) return;
    
    // ✅ FIX: Capture playing state BEFORE seek
    const wasPlaying = Tone.Transport.state === 'started';
    
    // Perform the seek
    seek(time);
    
    // ✅ FIX: Only reschedule if transport was playing
    if (!wasPlaying) {
      return;
    }
    
    // Debounce rapid seeks
    const now = Date.now();
    if (now - lastScheduleTimeRef.current < SCHEDULE_DEBOUNCE_MS) {
      return;
    }
    
    if (placedLoops.length > 0) {
      lastScheduleTimeRef.current = now;
      
      // ✅ FIX: Use requestAnimationFrame to let seek complete first
      requestAnimationFrame(() => {
        console.log('  📅 Rescheduling loops after seek...');
        const statesForScheduling = getTrackStatesForScheduling();
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
      });
    }
  }, [audioReady, seek, placedLoops, scheduleLoops, selectedVideo?.duration, getTrackStatesForScheduling]);

  return {
    handlePlay,
    handlePause,
    handleStop,
    handleRestart,
    handleSeek
  };
};