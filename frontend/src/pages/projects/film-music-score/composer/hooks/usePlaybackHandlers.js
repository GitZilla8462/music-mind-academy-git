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
  setAudioReady,
  initializeAudio,
  showToast,
  placedLoops,
  selectedVideo,
  trackStates,
  play,
  pause,
  stop,
  seek,
  scheduleLoops,
  // Passive mode - disable all playback for iframe previews
  isPassive = false
}) => {

  const lastScheduleTimeRef = useRef(0);
  const SCHEDULE_DEBOUNCE_MS = 200;

  // Debounce play button to prevent multiple rapid triggers
  const lastPlayClickRef = useRef(0);
  const PLAY_DEBOUNCE_MS = 300;

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
    // Debounce: prevent multiple rapid play triggers (from multiple UI buttons)
    const now = Date.now();
    if (now - lastPlayClickRef.current < PLAY_DEBOUNCE_MS) {
      console.log('⏸️ Play debounced - ignoring rapid click');
      return;
    }
    lastPlayClickRef.current = now;

    if (lockFeatures.allowPlayback === false) {
      return;
    }

    if (onPlaybackStartCallback) {
      onPlaybackStartCallback();
    }

    try {
      // Initialize audio on first play (user gesture unlocks audio)
      if (!audioReady) {
        console.log('🎵 Initializing audio on first play...');
        await initializeAudio();
        setAudioReady(true);
        console.log('✅ Audio initialized on play click');
      }

      console.log(`🎬 Starting playback with ${placedLoops.length} loops`);

      // Resume AudioContext if suspended (browser autoplay policy)
      if (Tone.context.state !== 'running') {
        console.log('🔊 AudioContext suspended - resuming...');
        await Tone.start();
        console.log('✅ AudioContext resumed');
      }

      // Start transport, then immediately schedule loops in the same tick
      await play();

      // Schedule loops right after transport starts
      const statesForScheduling = getTrackStatesForScheduling();
      if (placedLoops.length > 0) {
        console.log('📅 Scheduling loops after transport start...');
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
      }
      console.log('✅ Transport started with loops scheduled');

      console.log('✅ Playback begun');

    } catch (error) {
      console.error('Error starting playback:', error);
      showToast?.('Failed to start playback', 'error');
    }
  }, [
    audioReady, initializeAudio, setAudioReady, placedLoops, scheduleLoops, selectedVideo?.duration,
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

    // Stop completely — clears events and resets transport to 0
    stop();

    // Wait long enough for stop to complete and debounce window to pass
    await new Promise(resolve => setTimeout(resolve, 100));

    // Play from the beginning (handlePlay starts transport then schedules loops)
    await handlePlay();
  }, [stop, audioReady, lockFeatures, handlePlay]);
    
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