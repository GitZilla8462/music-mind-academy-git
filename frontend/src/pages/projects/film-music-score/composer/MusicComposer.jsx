// composer/MusicComposer.jsx - Main orchestrator (refactored)
// FIXED: Added onDAWReadyCallback with tutorial mode support
// UPDATED: Added showSoundEffects prop support
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Hooks
import { useAudioEngine } from '../shared/useAudioEngine';
import { useVolumeControl } from '../shared/useVolumeControl';
import { useComposerState } from './hooks/useComposerState';
import { useLoopHandlers } from './hooks/useLoopHandlers';
import { usePlaybackHandlers } from './hooks/usePlaybackHandlers';
import { useComposerEffects } from './hooks/useComposerEffects';

// Components
import ComposerHeader from './components/ComposerHeader';
import ComposerLayout from './components/ComposerLayout';
import AudioInitModal from './components/AudioInitModal';

const MusicComposer = ({ 
  showToast,
  isDemo = false,
  isPractice = false,
  tutorialMode = false,
  onLoopDropCallback,
  onLoopDeleteCallback,
  onLoopUpdateCallback,
  onLoopResizeCallback,
  onTrackVolumeChangeCallback,
  onTrackSoloToggleCallback,
  onZoomChangeCallback,
  onLoopLibraryClickCallback,
  onTrackHeaderClickCallback,
  onVideoPlayerClickCallback,
  onLoopPreviewCallback,
  onPlaybackStartCallback,
  onPlaybackStopCallback,
  onDAWReadyCallback,
  lockFeatures = {},
  highlightSelector,
  hideHeader = false,
  hideSubmitButton = false,
  preselectedVideo = null,
  initialPlacedLoops = undefined,
  readOnly = false,
  restrictToCategory = null,
  lockedMood = null,
  showSoundEffects = false,
  assignmentPanelContent = null,
  isLessonMode = false  // NEW PROP - indicates if in a lesson or standalone
}) => {
  const { videoId, assignmentId } = useParams();
  const navigate = useNavigate();
  const playersCreatedRef = useRef(false);
  const savedLoopsRef = useRef(null);
  const dawReadyCalledRef = useRef(false);
  const [currentlyPlayingPreview, setCurrentlyPlayingPreview] = useState(null);

  // Central state management FIRST (so selectedVideo exists)
  const {
    selectedVideo,
    setSelectedVideo,
    placedLoops,
    setPlacedLoops,
    selectedCategory,
    setSelectedCategory,
    selectedLoop,
    setSelectedLoop,
    submissionNotes,
    setSubmissionNotes,
    videoLoading,
    setVideoLoading,
    isSubmitting,
    setIsSubmitting,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showNotesPanel,
    setShowNotesPanel,
    audioReady,
    setAudioReady,
    trackStates,
    setTrackStates,
    leftPanelWidth,
    setLeftPanelWidth,
    topPanelHeight,
    setTopPanelHeight,
    isResizingLeft,
    setIsResizingLeft,
    isResizingTop,
    setIsResizingTop,
    containerRef
  } = useComposerState(preselectedVideo);

  // DEBUG: Log showSoundEffects prop
  React.useEffect(() => {
    console.log('Ã°Å¸Å½Âµ MusicComposer showSoundEffects prop:', showSoundEffects);
  }, [showSoundEffects]);

  // Audio engine hook SECOND (now selectedVideo exists)
  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    play,
    pause,
    stop,
    seek,
    setMasterVolume,
    toggleMute,
    previewLoop,
    createLoopPlayer,
    scheduleLoops,
    initializeAudio,
    playersRef
  } = useAudioEngine(selectedVideo?.duration);

  // Notify when DAW is ready for tutorial mode
  useEffect(() => {
    // For tutorial mode: DAW is ready once audio initializes (no video needed)
    // For normal mode: DAW is ready when we have video AND audio
    const isDawReady = tutorialMode 
      ? audioReady && !videoLoading  // Tutorial just needs audio
      : selectedVideo && audioReady && !videoLoading;  // Normal needs video + audio
    
    if (isDawReady && !dawReadyCalledRef.current && onDAWReadyCallback) {
      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ DAW is fully initialized - calling onDAWReadyCallback');
      console.log('   - tutorialMode:', tutorialMode);
      console.log('   - selectedVideo:', !!selectedVideo);
      console.log('   - audioReady:', audioReady);
      console.log('   - videoLoading:', videoLoading);
      dawReadyCalledRef.current = true;
      
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        onDAWReadyCallback();
      }, 100);
    }
  }, [selectedVideo, audioReady, tutorialMode, videoLoading, onDAWReadyCallback]);

  // STEP 1: Store initial loops and load into state immediately
  useEffect(() => {
    if (initialPlacedLoops && initialPlacedLoops.length > 0) {
      console.log('ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ Initializing with saved loops:', initialPlacedLoops);
      savedLoopsRef.current = initialPlacedLoops;
      setPlacedLoops(initialPlacedLoops);
    }
  }, [initialPlacedLoops, setPlacedLoops]);

  // STEP 2: Create audio players when audio becomes ready
  useEffect(() => {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Player creation check:', {
      audioReady,
      hasSavedLoops: savedLoopsRef.current !== null,
      playersCreated: playersCreatedRef.current,
      placedLoopsCount: placedLoops.length
    });

    if (audioReady && savedLoopsRef.current && !playersCreatedRef.current) {
      console.log('ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ Audio ready! Creating players for', savedLoopsRef.current.length, 'saved loops...');
      
      savedLoopsRef.current.forEach(loop => {
        const loopData = {
          id: loop.id,
          originalId: loop.originalId || loop.id.split('-')[0] + '-' + loop.id.split('-')[1],
          name: loop.name,
          file: loop.file,
          duration: loop.duration,
          category: loop.category
        };
        
        console.log('  ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Creating player for:', loopData.name, 'with ID:', loop.id);
        
        try {
          createLoopPlayer(loopData, loop.id);
          console.log('  ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Player stored with key:', loop.id);
        } catch (error) {
          console.error('  ÃƒÂ¢Ã‚ÂÃ…â€™ Failed to create player for:', loopData.name, error);
        }
      });
      
      playersCreatedRef.current = true;
      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ All audio players created for saved loops');
    }
  }, [audioReady, createLoopPlayer, placedLoops.length]);

  // Volume control hook
  useVolumeControl({
    audioReady,
    playersRef,
    placedLoops,
    trackStates,
    volume,
    isMuted
  });

  // Playback handlers
  const {
    handlePlay,
    handlePause,
    handleStop,
    handleRestart,
    handleSeek
  } = usePlaybackHandlers({
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
  });

  // Loop handlers
  const {
    handleLoopDrop,
    handleLoopDelete,
    handleLoopSelect,
    handleLoopUpdate,
    handleLoopPreview
  } = useLoopHandlers({
    lockFeatures,
    onLoopDropCallback,
    onLoopDeleteCallback,
    onLoopUpdateCallback,
    onLoopPreviewCallback: useCallback((loop, isPlaying) => {
      // Track which loop is currently playing
      setCurrentlyPlayingPreview(isPlaying ? loop.id : null);
      
      // Call the original callback
      if (onLoopPreviewCallback) {
        onLoopPreviewCallback(loop, isPlaying);
      }
    }, [onLoopPreviewCallback]),
    audioReady,
    showToast,
    placedLoops,
    setPlacedLoops,
    setHasUnsavedChanges,
    selectedLoop,
    setSelectedLoop,
    selectedVideo,
    trackStates,
    createLoopPlayer,
    scheduleLoops,
    previewLoop,
    tutorialMode
  });

  // All useEffect logic
  useComposerEffects({
    videoId,
    preselectedVideo,
    assignmentId,
    tutorialMode,
    isDemo,
    isPractice,
    selectedVideo,
    setSelectedVideo,
    setVideoLoading,
    hasUnsavedChanges,
    placedLoops,
    setPlacedLoops,
    submissionNotes,
    setSubmissionNotes,
    audioReady,
    setAudioReady,
    isResizingLeft,
    isResizingTop,
    setIsResizingLeft,
    setIsResizingTop,
    leftPanelWidth,
    setLeftPanelWidth,
    topPanelHeight,
    setTopPanelHeight,
    containerRef,
    currentTime,
    lockFeatures,
    showToast,
    navigate,
    initializeAudio,
    pause,
    seek,
    handlePlay,
    handleRestart,
    isPlaying
  });

  // Track state change handler with callback
  const handleTrackStateChange = useCallback((newTrackStates) => {
    setTrackStates(newTrackStates);
    
    if (onTrackVolumeChangeCallback || onTrackSoloToggleCallback) {
      Object.keys(newTrackStates).forEach(trackKey => {
        const oldState = trackStates[trackKey];
        const newState = newTrackStates[trackKey];
        
        if (oldState && newState) {
          if (oldState.volume !== newState.volume && onTrackVolumeChangeCallback) {
            onTrackVolumeChangeCallback(trackKey, newState.volume);
          }
          if (oldState.solo !== newState.solo && onTrackSoloToggleCallback) {
            onTrackSoloToggleCallback(trackKey, newState.solo);
          }
        }
      });
    }
  }, [trackStates, onTrackVolumeChangeCallback, onTrackSoloToggleCallback, setTrackStates]);

  // UI Actions
  const handleBack = () => {
    if (isDemo) {
      navigate('/teacher/projects/film-music-score-demo');
    } else if (isPractice) {
      navigate('/student/practice/film-music-score');
    } else {
      navigate(-1);
    }
  };

  const handleInitializeAudio = async () => {
    try {
      await initializeAudio();
      setAudioReady(true);
      showToast?.('Audio engine ready!', 'success');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      showToast?.('Failed to initialize audio engine', 'error');
    }
  };

  const handleSubmit = async () => {
    if (placedLoops.length === 0) {
      showToast?.('Please add some music loops before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const compositionData = {
        selectedVideo,
        placedLoops,
        submissionNotes,
        videoId,
        duration: selectedVideo?.duration || 60,
        submittedAt: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentWork: JSON.stringify(compositionData)
        }),
      });

      if (response.ok) {
        showToast?.('Film score submitted successfully!', 'success');
        setHasUnsavedChanges(false);
        localStorage.removeItem(`composition-${assignmentId}`);
        setTimeout(() => navigate('/student'), 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit composition');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast?.('Failed to submit composition: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearComposition = () => {
    if (window.confirm('Are you sure you want to clear all loops? This cannot be undone.')) {
      setPlacedLoops([]);
      setSelectedLoop(null);
      setHasUnsavedChanges(true);
      showToast?.('Composition cleared', 'info');
    }
  };

  // Loading state
  if (videoLoading || (!selectedVideo && !tutorialMode)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading video...</div>
          <div className="text-sm text-gray-400 mt-2">Detecting video duration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Audio Init Modal */}
      {!audioReady && !tutorialMode && (
        <AudioInitModal onInitialize={handleInitializeAudio} />
      )}

      {/* Header */}
      {!hideHeader && (
        <ComposerHeader
          tutorialMode={tutorialMode}
          isDemo={isDemo}
          isPractice={isPractice}
          selectedVideo={selectedVideo}
          currentTime={currentTime}
          placedLoops={placedLoops}
          audioReady={audioReady}
          hasUnsavedChanges={hasUnsavedChanges}
          showNotesPanel={showNotesPanel}
          isSubmitting={isSubmitting}
          hideSubmitButton={hideSubmitButton}
          onBack={handleBack}
          onToggleNotesPanel={() => setShowNotesPanel(!showNotesPanel)}
          onClearAll={clearComposition}
          onSubmit={handleSubmit}
        />
      )}

      {/* Main Layout */}
      <ComposerLayout
        leftPanelWidth={leftPanelWidth}
        topPanelHeight={topPanelHeight}
        tutorialMode={tutorialMode}
        selectedVideo={selectedVideo}
        selectedCategory={selectedCategory}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        isMuted={isMuted}
        placedLoops={placedLoops}
        selectedLoop={selectedLoop}
        trackStates={trackStates}
        showNotesPanel={showNotesPanel}
        submissionNotes={submissionNotes}
        isDemo={isDemo}
        isPractice={isPractice}
        onLoopLibraryClick={onLoopLibraryClickCallback}
        onVideoPlayerClick={onVideoPlayerClickCallback}
        onTrackHeaderClick={onTrackHeaderClickCallback}
        onZoomChange={onZoomChangeCallback}
        setIsResizingLeft={setIsResizingLeft}
        setIsResizingTop={setIsResizingTop}
        setSelectedCategory={setSelectedCategory}
        handleLoopPreview={handleLoopPreview}
        handleSeek={handleSeek}
        setMasterVolume={setMasterVolume}
        toggleMute={toggleMute}
        handleLoopDrop={handleLoopDrop}
        handleLoopDelete={handleLoopDelete}
        handleLoopSelect={handleLoopSelect}
        handleLoopUpdate={handleLoopUpdate}
        onLoopResizeCallback={onLoopResizeCallback}
        handleTrackStateChange={handleTrackStateChange}
        handlePlay={handlePlay}
        pause={handlePause}
        handleStop={handleStop}
        handleRestart={handleRestart}
        setSubmissionNotes={setSubmissionNotes}
        setHasUnsavedChanges={setHasUnsavedChanges}
        containerRef={containerRef}
        restrictToCategory={restrictToCategory}
        lockedMood={lockedMood}
        showSoundEffects={showSoundEffects}
        lockFeatures={lockFeatures}
        highlightSelector={highlightSelector}
        currentlyPlayingPreview={currentlyPlayingPreview}
        assignmentPanelContent={assignmentPanelContent}
      />
    </div>
  );
};

export default MusicComposer;