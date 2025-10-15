// ============================================================================
// FILE 2: usePlaybackHandlers.js - FIXED to prevent triple seek
// ============================================================================

import { useCallback, useRef } from 'react';

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

  // CRITICAL: Prevent rapid-fire reschedules after seek
  const lastScheduleTimeRef = useRef(0);
  const SCHEDULE_DEBOUNCE_MS = 200;

  const handlePlay = useCallback(async () => {
    if (lockFeatures.allowPlayback === false) {
      console.log('Playback is locked');
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
      console.log(`Starting playback with ${placedLoops.length} loops`);
      
      if (placedLoops.length > 0) {
        console.log('Scheduling all loops before play...');
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, trackStates);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await play();
      console.log('Playback started successfully');
    } catch (error) {
      console.error('Error starting playback:', error);
      showToast?.('Failed to start playback', 'error');
    }
  }, [
    audioReady, placedLoops, scheduleLoops, selectedVideo?.duration, 
    play, showToast, trackStates, onPlaybackStartCallback, lockFeatures
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

  // FIXED: Don't double-seek on restart
  const handleRestart = useCallback(() => {
    if (!audioReady) return;
    if (lockFeatures.allowPlayback === false) return;
    
    console.log('🔄 Restarting playback');
    
    // Stop will trigger Transport stop event, which is fine
    stop();
    
    // CRITICAL: Only seek once, and the debounced seek will handle it
    // No need to seek again since stop already handles cleanup
    seek(0);
  }, [stop, seek, audioReady, lockFeatures]);
    
  // FIXED: Debounced reschedule after seek
  const handleSeek = useCallback((time) => {
    if (!audioReady) return;
    
    console.log(`Seeking to ${time}s`);
    
    // Seek is already debounced in useAudioEngine
    seek(time);
    
    // FIXED: Debounce the reschedule, not just the seek
    const now = Date.now();
    if (now - lastScheduleTimeRef.current < SCHEDULE_DEBOUNCE_MS) {
      console.log('Skipping reschedule - too soon after last one');
      return;
    }
    
    if (placedLoops.length > 0) {
      lastScheduleTimeRef.current = now;
      console.log('Rescheduling loops after seek...');
      scheduleLoops(placedLoops, selectedVideo?.duration || 60, trackStates);
    }
  }, [audioReady, seek, placedLoops, scheduleLoops, selectedVideo?.duration, trackStates, SCHEDULE_DEBOUNCE_MS]);

  return {
    handlePlay,
    handlePause,
    handleStop,
    handleRestart,
    handleSeek
  };
};