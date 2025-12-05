// ============================================================================
// FILE: usePlaybackHandlers.js - FIXED with track state initialization
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
      
      // CRITICAL: Resume AudioContext if suspended (browser autoplay policy)
      if (Tone.context.state !== 'running') {
        console.log('🔊 AudioContext suspended - resuming...');
        await Tone.start();
        console.log('✅ AudioContext resumed');
      }
      
      // Check if track states are initialized
      const hasTrackStates = Object.keys(trackStates).length > 0;
      if (!hasTrackStates) {
        console.warn('⚠️  Track states not initialized yet!');
      }
      
      // CRITICAL FIX: Start transport FIRST, then schedule immediately after
      await play();
      console.log('✅ Transport start called');
      
      // Now schedule loops while transport is running
      if (placedLoops.length > 0) {
        console.log('📅 Scheduling loops after transport start...');
        
        // IMPORTANT: Wait longer and verify transport is actually running
        // Transport.start() is synchronous but state update has a tiny delay
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Use track states if available, otherwise create default states
        const statesForScheduling = hasTrackStates 
          ? trackStates 
          : (() => {
              console.log('🔧 Creating default track states for scheduling');
              const defaults = {};
              for (let i = 0; i < 8; i++) {
                defaults[`track-${i}`] = { 
                  volume: 0.7, 
                  muted: false, 
                  solo: false 
                };
              }
              return defaults;
            })();
        
        console.log('🎵 Scheduling with track states:', Object.keys(statesForScheduling));
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
      }
      
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
      
      // Use track states if available, otherwise create defaults
      const hasTrackStates = Object.keys(trackStates).length > 0;
      const statesForScheduling = hasTrackStates 
        ? trackStates 
        : (() => {
            const defaults = {};
            for (let i = 0; i < 8; i++) {
              defaults[`track-${i}`] = { volume: 0.7, muted: false, solo: false };
            }
            return defaults;
          })();
      
      scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
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