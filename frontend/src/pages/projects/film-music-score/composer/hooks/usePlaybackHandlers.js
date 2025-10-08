// composer/hooks/usePlaybackHandlers.js - Playback control handlers
import { useCallback } from 'react';

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

  const handleRestart = useCallback(() => {
    if (!audioReady) return;
    if (lockFeatures.allowPlayback === false) return;
    stop();
    seek(0);
  }, [stop, seek, audioReady, lockFeatures]);
    
  const handleSeek = useCallback((time) => {
    if (!audioReady) return;
    
    console.log(`Seeking to ${time}s`);
    seek(time);
    
    if (placedLoops.length > 0) {
      console.log('Rescheduling loops after seek...');
      scheduleLoops(placedLoops, selectedVideo?.duration || 60, trackStates);
    }
  }, [audioReady, seek, placedLoops, scheduleLoops, selectedVideo?.duration, trackStates]);

  return {
    handlePlay,
    handlePause,
    handleStop,
    handleRestart,
    handleSeek
  };
};