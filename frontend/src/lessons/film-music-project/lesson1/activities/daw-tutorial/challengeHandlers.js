// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/challengeHandlers.js

import { useCallback } from 'react';

export const useChallengeHandlers = (
  currentChallenge,
  dawContext,
  setDawContext,
  handleCorrectAction,
  isProcessingClick,
  setIsProcessingClick
) => {
  
  // Video player click handler
  const handleVideoPlayerClick = useCallback(() => {
    if (isProcessingClick) return;
    setIsProcessingClick(true);
    
    console.log('Video player clicked');
    
    setDawContext(prev => ({
      ...prev,
      action: 'video-player-clicked'
    }));

    if (currentChallenge?.id === 1) {
      handleCorrectAction();
    }
    
    setTimeout(() => setIsProcessingClick(false), 500);
  }, [currentChallenge, isProcessingClick, setIsProcessingClick, setDawContext, handleCorrectAction]);

  // Loop library click handler
  const handleLoopLibraryClick = useCallback(() => {
    if (isProcessingClick) return;
    setIsProcessingClick(true);
    
    console.log('Loop library clicked');
    
    setDawContext(prev => ({
      ...prev,
      action: 'loop-library-clicked'
    }));

    if (currentChallenge?.id === 3) {
      handleCorrectAction();
    }
    
    setTimeout(() => setIsProcessingClick(false), 500);
  }, [currentChallenge, isProcessingClick, setIsProcessingClick, setDawContext, handleCorrectAction]);

  // Loop preview handler - UPDATED to track pause button click
  const handleLoopPreview = useCallback((loopData, isPlaying) => {
    console.log('Loop preview:', isPlaying ? 'playing' : 'paused/stopped', loopData);
    
    const action = isPlaying ? 'loop-preview' : 'loop-preview-paused';
    
    setDawContext(prev => ({
      ...prev,
      action,
      loopPreviewPlaying: isPlaying,
      previewStopped: !isPlaying,
      hasPlayedLoop: prev.hasPlayedLoop || isPlaying,
      hasPausedLoop: prev.hasPausedLoop || !isPlaying
    }));

    // Check if challenge requires stopping the preview (Challenge 5)
    // Only trigger success when pausing AFTER having played
    if (currentChallenge?.id === 5 && !isPlaying && dawContext.hasPlayedLoop) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction, dawContext.hasPlayedLoop]);

  // Track header click handler
  const handleTrackHeaderClick = useCallback((trackIndex) => {
    if (isProcessingClick) return;
    setIsProcessingClick(true);
    
    console.log('Track header clicked:', trackIndex);
    
    setDawContext(prev => ({
      ...prev,
      action: 'track-header-clicked',
      trackIndex
    }));

    if (currentChallenge?.id === 8) {
      handleCorrectAction();
    }
    
    setTimeout(() => setIsProcessingClick(false), 500);
  }, [currentChallenge, isProcessingClick, setIsProcessingClick, setDawContext, handleCorrectAction]);

  // Loop placement handler
  const handleLoopDrop = useCallback((loopData, trackIndex, startTime) => {
    console.log('Loop dropped:', loopData, 'on track', trackIndex);
    
    const newPlacedLoops = [...dawContext.placedLoops, { loopData, trackIndex, startTime, id: `${loopData.id}-${Date.now()}` }];
    
    setDawContext(prev => ({
      ...prev,
      action: 'loop-placed',
      placedLoops: newPlacedLoops,
      trackIndex
    }));

    if (currentChallenge?.id === 9) {
      handleCorrectAction();
    }
  }, [currentChallenge, dawContext.placedLoops, setDawContext, handleCorrectAction]);

  // Loop movement handler
  const handleLoopMove = useCallback((loopId, newTime) => {
    console.log('Loop moved:', loopId, 'to', newTime);
    
    setDawContext(prev => ({
      ...prev,
      action: 'loop-moved',
      loopId,
      newTime
    }));

    // ONLY validate if current challenge is specifically challenge 11 (move loop)
    if (currentChallenge?.id === 11) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Loop resize handler
  const handleLoopResize = useCallback((loopId, newDuration) => {
    console.log('🔧 RESIZE HANDLER CALLED - loopId:', loopId, 'newDuration:', newDuration);
    console.log('🔧 Current challenge ID:', currentChallenge?.id);
    console.log('🔧 Current challenge:', currentChallenge);
    
    setDawContext(prev => ({
      ...prev,
      action: 'loop-resized',
      loopId,
      newDuration
    }));

    // ONLY validate if current challenge is specifically challenge 20 (resize loop)
    if (currentChallenge?.id === 20) {
      console.log('✅ Challenge 20 detected - calling handleCorrectAction');
      handleCorrectAction();
    } else {
      console.log('❌ Not challenge 20, current challenge is:', currentChallenge?.id);
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Track volume change handler
  const handleTrackVolumeChange = useCallback((trackIndex, volume) => {
    console.log('Track volume changed:', trackIndex, volume);
    
    setDawContext(prev => ({
      ...prev,
      action: 'track-volume-changed',
      trackIndex,
      volume
    }));

    if (currentChallenge?.id === 12) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Solo toggle handler
  const handleSoloToggle = useCallback((trackIndex) => {
    console.log('Solo toggled on track:', trackIndex);
    
    setDawContext(prev => ({
      ...prev,
      action: 'track-solo-toggled',
      trackIndex
    }));

    if (currentChallenge?.id === 14) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Zoom change handler
  const handleZoomChange = useCallback((newZoom, oldZoom) => {
    const direction = newZoom > oldZoom ? 'in' : 'out';
    console.log('Zoom changed:', direction, newZoom);
    
    setDawContext(prev => ({
      ...prev,
      action: 'zoomed',
      zoomLevel: newZoom,
      zoomDirection: direction
    }));

    if (currentChallenge?.id === 16 && direction === 'in') {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Playback started handler
  const handlePlaybackStart = useCallback(() => {
    console.log('Playback started');
    
    setDawContext(prev => ({
      ...prev,
      action: 'playback-started'
    }));

    if (currentChallenge?.id === 18) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Playback stopped handler
  const handlePlaybackStop = useCallback(() => {
    console.log('Playback stopped');
    
    setDawContext(prev => ({
      ...prev,
      action: 'playback-stopped'
    }));

    if (currentChallenge?.id === 19) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  // Loop deletion handler
  const handleLoopDelete = useCallback((loopId) => {
    console.log('Loop deleted:', loopId);
    
    setDawContext(prev => ({
      ...prev,
      action: 'loop-deleted',
      placedLoops: prev.placedLoops.filter(l => l.id !== loopId),
      loopId
    }));

    if (currentChallenge?.id === 21) {
      handleCorrectAction();
    }
  }, [currentChallenge, setDawContext, handleCorrectAction]);

  return {
    handleVideoPlayerClick,
    handleLoopLibraryClick,
    handleLoopPreview,
    handleTrackHeaderClick,
    handleLoopDrop,
    handleLoopMove,
    handleLoopResize,
    handleTrackVolumeChange,
    handleSoloToggle,
    handleZoomChange,
    handlePlaybackStart,
    handlePlaybackStop,
    handleLoopDelete
  };
};