// composer/MusicComposer.jsx - Main orchestrator (refactored)
// FIXED: Added compositionKey prop for universal auto-save/load
// FIXED: Added onDAWReadyCallback with tutorial mode support
// UPDATED: Added showSoundEffects prop support
// UPDATED: Added Chromebook swipe protection to prevent accidental back navigation
// FIXED: Player creation now works for localStorage-loaded loops (not just initialPlacedLoops prop)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Tone from 'tone';

// Hooks
import { useAudioEngine } from '../shared/useAudioEngine';
import { useVolumeControl } from '../shared/useVolumeControl';
import { useComposerState } from './hooks/useComposerState';
import { useLoopHandlers } from './hooks/useLoopHandlers';
import { usePlaybackHandlers } from './hooks/usePlaybackHandlers';
import { useComposerEffects } from './hooks/useComposerEffects';
import { usePreventAccidentalNavigation } from '../../../../hooks/usePreventAccidentalNavigation';
import { renderBeatToBlob, renderMelodyToBlob } from '../shared/beatRenderUtils';

// Components
import ComposerHeader from './components/ComposerHeader';
import ComposerLayout from './components/ComposerLayout';
import AudioInitModal from './components/AudioInitModal';
import CustomCursor from '../timeline/components/CustomCursor';
import { CursorProvider, useCursor } from '../shared/CursorContext';
import DAWLoadingScreen from '../shared/DAWLoadingScreen';
import FullScreenPreview from '../shared/FullScreenPreview';

// CHROMEBOOK FIX: Wrapper component that uses context to get cursorKey for forced remount
// This fixes the cursor disappearing after dropdown selection bug
const GlobalCursorWithKey = ({ cursorType, initiallyVisible, initialPosition }) => {
  const { cursorKey } = useCursor();
  return (
    <CustomCursor
      key={`global-cursor-${cursorKey}`}
      name="GLOBAL"
      cursorType={cursorType}
      enabled={true}
      initiallyVisible={initiallyVisible}
      initialPosition={initialPosition}
    />
  );
};

// CHROMEBOOK FIX: Detect Chromebook for global custom cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

// Check if we're in passive mode (iframe preview) - disable audio to improve performance
const isPassiveMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('passive') === 'true';
};

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
  isLessonMode = false,
  // NEW: Universal composition key for auto-save/load
  // Examples: "city-composition", "sports-composition", "lesson1-activity"
  // If not provided, falls back to videoPath or assignmentId
  compositionKey = null,
  // NEW: Enable creator tools (Beat Maker panel)
  showCreatorTools = false,
  // NEW: Initial custom loops (e.g., beats from StudentBeatMakerActivity)
  initialCustomLoops = null,
  // NEW: Initial cursor position (for seamless cursor when MusicComposer remounts)
  initialCursorPosition = null
}) => {
  const { videoId, assignmentId } = useParams();
  const navigate = useNavigate();
  const savedLoopsRef = useRef(null);
  const dawReadyCalledRef = useRef(false);
  const initialLoopsLoadedRef = useRef(false);
  const [currentlyPlayingPreview, setCurrentlyPlayingPreview] = useState(null);

  // Check passive mode once on mount - disables audio in iframe previews for performance
  const isPassive = useRef(isPassiveMode()).current;

  // Creator tools state (Beat Maker and Melody Maker panels)
  const [creatorMenuOpen, setCreatorMenuOpen] = useState(false);
  const [beatMakerOpen, setBeatMakerOpen] = useState(false);
  const [melodyMakerOpen, setMelodyMakerOpen] = useState(false);

  // Full screen preview mode
  const [fullScreenPreviewOpen, setFullScreenPreviewOpen] = useState(false);

  // CHROMEBOOK FIX: Global custom cursor state
  // PERFORMANCE FIX: Use refs instead of state to avoid re-renders on every mousemove
  // React 18 batching doesn't help across separate mousemove events (60+/sec)
  // Use initialCursorPosition if provided (fixes cursor jump when MusicComposer remounts)
  const globalMousePosRef = useRef(initialCursorPosition || { x: 0, y: 0 });
  const globalCursorTypeRef = useRef('default');
  const showGlobalCursorRef = useRef(true);
  // State only for values that need to trigger re-renders (cursor type changes)
  const [globalCursorType, setGlobalCursorType] = useState('default');
  const dawContainerRef = useRef(null);

  // Loading screen state - show fun loading messages while DAW initializes underneath
  const [loadingMinTimePassed, setLoadingMinTimePassed] = useState(false);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  // PERFORMANCE FIX: Ref to track hide timeout to prevent race condition
  const loadingHideTimeoutRef = useRef(null);
  // Initialize with initialCustomLoops if provided, otherwise empty array
  // initialCustomLoops may come from StudentBeatMakerActivity saved beats
  const [customLoops, setCustomLoops] = useState(() => {
    if (initialCustomLoops && Array.isArray(initialCustomLoops) && initialCustomLoops.length > 0) {
      console.log('📂 Initializing with', initialCustomLoops.length, 'custom loops from props');
      // Mark them as needing re-rendering (blob URLs don't persist)
      return initialCustomLoops.map(loop => ({
        ...loop,
        file: null,
        needsRender: true,
        loaded: false,
        accessible: false
      }));
    }
    return [];
  });

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

  // 🛡️ CHROMEBOOK SWIPE PROTECTION
  // Prevents two-finger swipe back gesture and other accidental navigation
  usePreventAccidentalNavigation({
    hasUnsavedWork: placedLoops.length > 0 || hasUnsavedChanges,
    onNavigationAttempt: () => {
      showToast?.('⚠️ Use the Back button in the app to exit safely!', 'warning');
    }
  });

  // 🖱️ CHROMEBOOK GLOBAL CURSOR
  // Track mouse position and detect cursor type based on hovered element
  // SEAMLESS CURSOR: Custom cursor covers entire screen on Chromebook
  // Parent activities should add 'chromebook-hide-cursor' class to hide native cursor
  // PERFORMANCE FIX: Use refs to avoid re-renders, only setState when cursor type changes
  useEffect(() => {
    if (!isChromebook) return;

    const handleMouseMove = (e) => {
      // PERFORMANCE FIX: Update ref (no re-render) instead of state
      globalMousePosRef.current = { x: e.clientX, y: e.clientY };

      // Detect cursor type from the element under the cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        // Check if element (or ancestor) handles its own cursor
        // If so, hide global cursor and let local cursor handle it
        let el = element;
        let hasLocalCursor = false;
        let cursorType = 'default';

        while (el && el !== document.body) {
          // Check for data-cursor-handled (component has its own CustomCursor)
          if (el.dataset?.cursorHandled === 'true') {
            hasLocalCursor = true;
            break;
          }
          // Check for data-cursor (explicit cursor type)
          if (el.dataset?.cursor && cursorType === 'default') {
            cursorType = el.dataset.cursor;
          }
          el = el.parentElement;
        }

        // PERFORMANCE FIX: Update ref instead of state
        showGlobalCursorRef.current = !hasLocalCursor;

        // PERFORMANCE FIX: Removed getComputedStyle - it forces layout recalculation
        // Cursor type detection now relies solely on data-cursor attributes
        // Elements that need custom cursor types should add data-cursor="pointer" etc.

        // PERFORMANCE FIX: Only call setState if cursor type actually changed
        if (cursorType !== globalCursorTypeRef.current) {
          globalCursorTypeRef.current = cursorType;
          setGlobalCursorType(cursorType);
        }
      }
    };

    // Hide cursor when mouse leaves the viewport (e.g., to address bar)
    const handleMouseLeave = (e) => {
      // Check if mouse actually left the document (not just moved to a child element)
      if (e.relatedTarget === null || e.relatedTarget.nodeName === 'HTML') {
        showGlobalCursorRef.current = false;
      }
    };

    // Show cursor when mouse re-enters the viewport
    const handleMouseEnter = () => {
      // Don't automatically show - let handleMouseMove decide based on position
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // DEBUG: Log showSoundEffects prop
  React.useEffect(() => {
    console.log('🎵 MusicComposer showSoundEffects prop:', showSoundEffects);
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
    stopPreview,
    createLoopPlayer,
    scheduleLoops,
    initializeAudio,
    playersRef,
    activeGainNodesRef  // ✅ NEW: For real-time volume updates during playback
  } = useAudioEngine(selectedVideo?.duration);

  // 🛑 CLEANUP: Stop audio on component unmount
  // This prevents music from playing in the background after navigating away
  useEffect(() => {
    return () => {
      console.log('🛑 MusicComposer unmounting - stopping audio');
      try {
        if (window.Tone && window.Tone.Transport) {
          window.Tone.Transport.stop();
          window.Tone.Transport.cancel();
        }
      } catch (e) {
        console.warn('Audio cleanup error:', e);
      }
    };
  }, []);

  // Notify when DAW is ready for tutorial mode
  useEffect(() => {
    // For tutorial mode: DAW is ready once audio initializes (no video needed)
    // For normal mode: DAW is ready when we have video AND audio
    const isDawReady = tutorialMode
      ? audioReady && !videoLoading  // Tutorial just needs audio
      : selectedVideo && audioReady && !videoLoading;  // Normal needs video + audio

    if (isDawReady && !dawReadyCalledRef.current && onDAWReadyCallback) {
      console.log('✅ DAW is fully initialized - calling onDAWReadyCallback');
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

  // STEP 1: Store initial loops from props and load into state immediately
  // ✅ OPTIMIZED: Only run once on mount, not on every initialPlacedLoops reference change
  useEffect(() => {
    // Skip if already loaded or no loops to load
    if (initialLoopsLoadedRef.current || !initialPlacedLoops || initialPlacedLoops.length === 0) {
      return;
    }
    
    console.log('🎵 Initializing with saved loops from props:', initialPlacedLoops.length, 'loops');
    savedLoopsRef.current = initialPlacedLoops;
    setPlacedLoops(initialPlacedLoops);
    initialLoopsLoadedRef.current = true;
  }, [initialPlacedLoops, setPlacedLoops]);

  // STEP 2: Re-render custom beats on timeline that have invalid blob URLs
  // Custom beats saved with blob URLs lose those URLs on page reload
  // We detect them by: type === 'custom-beat' && has pattern data && needs re-rendering
  // We track which beats have been re-rendered using a ref to prevent infinite loops
  const [customBeatsRendering, setCustomBeatsRendering] = useState(false);
  const reRenderedBeatsRef = useRef(new Set());

  useEffect(() => {
    // Find custom beats in placedLoops that need re-rendering
    // Only re-render beats that have needsRender: true (loaded from localStorage)
    // Freshly placed beats already have valid blob URLs and don't need re-rendering
    // Skip beats that have already been re-rendered in this session
    const customBeatsNeedingRender = placedLoops.filter(loop =>
      loop.type === 'custom-beat' &&
      loop.pattern &&
      loop.needsRender === true &&  // Only re-render beats marked from localStorage load
      !reRenderedBeatsRef.current.has(loop.id)
    );

    if (customBeatsNeedingRender.length === 0 || customBeatsRendering) {
      return;
    }

    console.log(`🔄 Re-rendering ${customBeatsNeedingRender.length} custom beats on timeline...`);
    setCustomBeatsRendering(true);

    const renderTimelineBeats = async () => {
      const updatedPlacedLoops = [...placedLoops];
      let anyUpdated = false;

      for (const beat of customBeatsNeedingRender) {
        try {
          // Mark as re-rendered BEFORE starting to prevent re-triggering
          reRenderedBeatsRef.current.add(beat.id);

          const { blobURL, duration } = await renderBeatToBlob({
            pattern: beat.pattern,
            bpm: beat.bpm,
            kit: beat.kit,
            steps: beat.steps
          });

          // Find and update the beat in placedLoops
          const index = updatedPlacedLoops.findIndex(l => l.id === beat.id);
          if (index !== -1) {
            updatedPlacedLoops[index] = {
              ...updatedPlacedLoops[index],
              file: blobURL,
              duration: duration || updatedPlacedLoops[index].duration,
              needsRender: false  // Mark as rendered
            };
            anyUpdated = true;
            console.log(`✅ Re-rendered timeline beat: ${beat.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to re-render timeline beat ${beat.name}:`, error);
          // Remove from set so it can retry later if needed
          reRenderedBeatsRef.current.delete(beat.id);
        }
      }

      if (anyUpdated) {
        setPlacedLoops(updatedPlacedLoops);
      }
      setCustomBeatsRendering(false);
    };

    renderTimelineBeats();
  }, [placedLoops, customBeatsRendering, setPlacedLoops]);

  // STEP 3: Create audio players when audio becomes ready
  // ✅ FIX: Handle BOTH initialPlacedLoops (via savedLoopsRef) AND localStorage-loaded loops (via placedLoops)
  // ✅ OPTIMIZED: Reduced logging for better Chromebook performance
  // ✅ FIX: Skip custom beats that are still being re-rendered
  useEffect(() => {
    // Don't proceed if audio isn't ready or custom beats are still rendering
    if (!audioReady || customBeatsRendering) {
      return;
    }

    // ✅ FIX: Always use placedLoops - it contains both saved loops AND newly dropped loops
    // Previously used savedLoopsRef.current which missed newly dropped loops
    if (placedLoops.length === 0) {
      return;
    }

    // ✅ FIX: Find loops that are missing players (check by ID)
    // Also skip custom beats with stale blob URLs (they need re-rendering first)
    const loopsWithoutPlayers = placedLoops.filter(loop => {
      const hasPlayer = playersRef.current && (
        playersRef.current.has(loop.id) ||
        playersRef.current.get(loop.id)
      );

      // Skip loops that already have players
      if (hasPlayer) return false;

      // Skip custom beats with blob URLs that might be stale (they need re-rendering first)
      if (loop.type === 'custom-beat' && loop.file && loop.file.startsWith('blob:') && loop.pattern) {
        // Check if this is a potentially stale blob URL by looking for re-rendered ones in placedLoops
        const currentLoop = placedLoops.find(l => l.id === loop.id);
        if (currentLoop && currentLoop.file !== loop.file) {
          // The loop was updated with a new blob URL, use the new one
          loop.file = currentLoop.file;
        }
      }

      return true;
    });

    if (loopsWithoutPlayers.length === 0) {
      return; // All loops already have players - no need to log every time
    }

    console.log('🎵 Creating players for', loopsWithoutPlayers.length, 'loops without players...');

    // ✅ FIX: Use async function to properly await player creation
    const createMissingPlayers = async () => {
      for (const loop of loopsWithoutPlayers) {
        const loopData = {
          id: loop.id,
          originalId: loop.originalId || loop.id.split('-')[0] + '-' + loop.id.split('-')[1],
          name: loop.name,
          file: loop.file,
          duration: loop.duration,
          category: loop.category
        };

        try {
          await createLoopPlayer(loopData, loop.id);
        } catch (error) {
          console.error('❌ Failed to create player for:', loopData.name, error);
        }
      }

      console.log('✅ Audio players created');

      // ✅ FIX: If playback is already running, re-schedule loops so newly created players get included
      if (Tone.Transport.state === 'started') {
        console.log('🔄 Playback running - re-scheduling loops to include newly created players');
        // Build track states for scheduling
        const statesForScheduling = {};
        for (let i = 0; i < 6; i++) {
          const trackKey = `track-${i}`;
          statesForScheduling[trackKey] = trackStates[trackKey] || { volume: 0.7, solo: false, mute: false };
        }
        scheduleLoops(placedLoops, selectedVideo?.duration || 60, statesForScheduling);
      }
    };

    createMissingPlayers();
  }, [audioReady, createLoopPlayer, placedLoops, playersRef, customBeatsRendering, scheduleLoops, selectedVideo?.duration, trackStates]);

  // Volume control hook
  useVolumeControl({
    audioReady,
    playersRef,
    activeGainNodesRef,  // ✅ NEW: For real-time volume updates during playback
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
    isPassive
  });

  // ============================================================================
  // IMMEDIATE SAVE - For delete operations to prevent race condition with refresh
  // Must be defined before useLoopHandlers so it can be passed as a prop
  // ============================================================================
  const saveCompositionImmediately = useCallback((updatedPlacedLoops) => {
    const saveKey = compositionKey
      || assignmentId
      || videoId
      || preselectedVideo?.id
      || preselectedVideo?.videoPath
      || 'default-composition';

    const hasContent = updatedPlacedLoops.length > 0 || customLoops.length > 0;

    if (!hasContent) {
      // If no content left, remove the saved composition entirely
      localStorage.removeItem(`composition-${saveKey}`);
      console.log('🗑️ Removed empty composition from localStorage');
      return;
    }

    // Save custom loops with pattern data (exclude blob URLs which don't persist)
    const customLoopsToSave = customLoops.map(loop => ({
      id: loop.id,
      name: loop.name,
      instrument: loop.instrument,
      mood: loop.mood,
      color: loop.color,
      category: loop.category,
      duration: loop.duration,
      type: loop.type,
      bpm: loop.bpm,
      kit: loop.kit,
      steps: loop.steps,
      pattern: loop.pattern
    }));

    const compositionData = {
      selectedVideo,
      placedLoops: updatedPlacedLoops,
      submissionNotes,
      videoId,
      customLoops: customLoopsToSave,
      lastModified: new Date().toISOString()
    };

    localStorage.setItem(`composition-${saveKey}`, JSON.stringify(compositionData));
    console.log(`💾 Immediate save: ${updatedPlacedLoops.length} loops`);
  }, [compositionKey, assignmentId, videoId, preselectedVideo, selectedVideo, submissionNotes, customLoops]);

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
      // FIX: Use functional update to handle race condition when clicking between loops quickly
      // Only clear if the loop that ended is the same as the currently playing loop
      setCurrentlyPlayingPreview(prev => {
        if (isPlaying) return loop.id;
        // Only clear if this loop is the one currently playing (prevents race condition)
        return prev === loop.id ? null : prev;
      });

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
    stopPreview,
    tutorialMode,
    saveCompositionImmediately
  });

  // All useEffect logic - NOW WITH compositionKey and customLoops
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
    isPlaying,
    // NEW: Pass compositionKey for universal save/load
    compositionKey,
    // NEW: Custom loops (Beat Maker) for save/load
    customLoops,
    setCustomLoops,
    // Passive mode - disable audio for iframe previews
    isPassive
  });

  // Re-render custom beats AND melodies that were loaded from localStorage
  // These have needsRender: true because blob URLs don't persist
  useEffect(() => {
    const loopsNeedingRender = customLoops.filter(loop => loop.needsRender && loop.pattern);

    if (loopsNeedingRender.length === 0) return;

    const beatsCount = loopsNeedingRender.filter(l => l.type === 'custom-beat').length;
    const melodiesCount = loopsNeedingRender.filter(l => l.type === 'custom-melody').length;
    console.log(`🔄 Re-rendering ${beatsCount} beats and ${melodiesCount} melodies...`);

    const renderLoops = async () => {
      const updatedLoops = [...customLoops];

      for (const loop of loopsNeedingRender) {
        try {
          let blobURL, duration;

          if (loop.type === 'custom-melody') {
            // Render melody
            const result = await renderMelodyToBlob({
              pattern: loop.pattern,
              bpm: loop.bpm,
              synthType: loop.synthType,
              notes: loop.notes,
              beats: loop.beats,
              mood: loop.mood
            });
            blobURL = result.blobURL;
            duration = result.duration;
          } else {
            // Render beat (default)
            const result = await renderBeatToBlob({
              pattern: loop.pattern,
              bpm: loop.bpm,
              kit: loop.kit,
              steps: loop.steps
            });
            blobURL = result.blobURL;
            duration = result.duration;
          }

          // Find and update the loop in the array
          const index = updatedLoops.findIndex(l => l.id === loop.id);
          if (index !== -1) {
            updatedLoops[index] = {
              ...updatedLoops[index],
              file: blobURL,
              duration: duration,
              needsRender: false,
              loaded: true,
              accessible: true
            };
          }
        } catch (error) {
          console.error(`Failed to re-render ${loop.type || 'loop'} ${loop.name}:`, error);
        }
      }

      setCustomLoops(updatedLoops);
      console.log('✅ Custom loops re-rendered successfully');
    };

    renderLoops();
  }, [customLoops, setCustomLoops]);

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

    // Reschedule loops during playback so mute/solo changes take effect immediately
    if (isPlaying && placedLoops.length > 0) {
      scheduleLoops(placedLoops, selectedVideo?.duration || 60, newTrackStates);
    }
  }, [trackStates, onTrackVolumeChangeCallback, onTrackSoloToggleCallback, setTrackStates, isPlaying, placedLoops, scheduleLoops, selectedVideo?.duration]);

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

  // Handle adding custom loops from Beat Maker
  const handleAddCustomLoop = useCallback((beatLoop) => {
    setCustomLoops(prev => [...prev, beatLoop]);
    setBeatMakerOpen(false);
    showToast?.('Beat added to Loop Library!', 'success');
  }, [showToast]);

  // Handle adding custom loops from Melody Maker
  const handleAddMelodyLoop = useCallback((melodyLoop) => {
    setCustomLoops(prev => [...prev, melodyLoop]);
    setMelodyMakerOpen(false);
    showToast?.('Melody added to Loop Library!', 'success');
  }, [showToast]);

  // Handle deleting custom loops
  const handleDeleteCustomLoop = useCallback((loopId) => {
    setCustomLoops(prev => {
      const loop = prev.find(l => l.id === loopId);
      if (loop?.file?.startsWith('blob:')) {
        URL.revokeObjectURL(loop.file);
      }
      return prev.filter(l => l.id !== loopId);
    });
  }, []);

  // Audio is initialized on first play button click (see usePlaybackHandlers)
  // This ensures we have a valid user gesture for browser autoplay policy

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
        
        // Clear saved composition using the same key logic
        const saveKey = compositionKey || assignmentId || videoId || preselectedVideo?.videoPath || 'default-composition';
        localStorage.removeItem(`composition-${saveKey}`);
        
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

  // Start minimum loading timer on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingMinTimePassed(true);
    }, 3000); // Minimum 3 seconds of loading screen

    return () => clearTimeout(timer);
  }, []);

  // Fallback: hide loading screen after max 12 seconds even if audio/beats aren't ready
  // (browser may block audio without user gesture on page reload)
  // Increased from 6s to 12s to allow time for custom beat re-rendering
  // PERFORMANCE FIX: Cancel any pending hide timeout to prevent race condition
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loadingScreenVisible) {
        // Cancel any pending condition-based hide timeout
        if (loadingHideTimeoutRef.current) {
          clearTimeout(loadingHideTimeoutRef.current);
          loadingHideTimeoutRef.current = null;
        }
        console.log('⏱️ Loading screen fallback timeout - hiding anyway');
        setLoadingScreenVisible(false);
      }
    }, 12000);

    return () => clearTimeout(fallbackTimer);
  }, [loadingScreenVisible]);

  // Hide loading screen when: minimum time passed AND video ready AND audio ready AND custom beats rendered
  // FIXED: Wait for custom beat re-rendering to complete before hiding loading screen
  // This prevents the 2-3 second lag on Chromebook after loading screen hides
  useEffect(() => {
    const isVideoReady = tutorialMode || (selectedVideo && !videoLoading);

    // Check if any custom beats still need rendering
    const customBeatsNeedRender = placedLoops.some(loop =>
      loop.type === 'custom-beat' &&
      loop.pattern &&
      loop.needsRender === true
    );
    const isCustomBeatsReady = !customBeatsNeedRender && !customBeatsRendering;

    const isFullyReady = isVideoReady && audioReady && isCustomBeatsReady;

    if (loadingMinTimePassed && isFullyReady && loadingScreenVisible) {
      console.log('✅ All conditions met - hiding loading screen in 300ms');
      // PERFORMANCE FIX: Store timeout in ref so it can be cancelled if fallback fires first
      // Clear any existing timeout first to prevent multiple pending hides
      if (loadingHideTimeoutRef.current) {
        clearTimeout(loadingHideTimeoutRef.current);
      }
      // Small delay to ensure everything is settled
      loadingHideTimeoutRef.current = setTimeout(() => {
        loadingHideTimeoutRef.current = null;
        setLoadingScreenVisible(false);
      }, 300);
    }
  }, [loadingMinTimePassed, selectedVideo, videoLoading, tutorialMode, loadingScreenVisible, audioReady, placedLoops, customBeatsRendering]);

  return (
    <CursorProvider>
      <div
        ref={dawContainerRef}
        className={`h-full bg-gray-900 text-white flex flex-col relative ${isChromebook ? 'chromebook-hide-cursor' : ''}`}
      >
        {/* CHROMEBOOK FIX: Global custom cursor - always rendered, hides itself when over LoopLibrary */}
        {/* UNIFIED CURSOR: This will be automatically disabled during library drag via CursorContext */}
        {/* PERFORMANCE FIX: Mount cursor during loading (hidden) so it's warmed up when loading ends */}
        {/* This prevents 2-3 second lag after loading screen hides from cursor initialization */}
        {/* Uses GlobalCursorWithKey wrapper to force remount after dropdown selection */}
        {isChromebook && (
          <GlobalCursorWithKey
            cursorType={globalCursorType}
            initiallyVisible={true}
            initialPosition={globalMousePosRef.current}
          />
        )}

      {/* Audio is initialized via useEffect on mount, not inline */}

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
        playersReady={audioReady}  // FIX: Pass playersReady to enable play button
        // Creator tools (Beat Maker, Melody Maker)
        showCreatorTools={showCreatorTools}
        creatorMenuOpen={creatorMenuOpen}
        setCreatorMenuOpen={setCreatorMenuOpen}
        beatMakerOpen={beatMakerOpen}
        setBeatMakerOpen={setBeatMakerOpen}
        melodyMakerOpen={melodyMakerOpen}
        setMelodyMakerOpen={setMelodyMakerOpen}
        customLoops={customLoops}
        onAddCustomLoop={handleAddCustomLoop}
        onAddMelodyLoop={handleAddMelodyLoop}
        onDeleteCustomLoop={handleDeleteCustomLoop}
        // Passive mode - disable video playback in iframe previews
        isPassive={isPassive}
        // Full screen preview
        onFullScreenClick={() => setFullScreenPreviewOpen(true)}
      />

      {/* Full Screen Preview Modal */}
      <FullScreenPreview
        isOpen={fullScreenPreviewOpen}
        onClose={() => setFullScreenPreviewOpen(false)}
        placedLoops={placedLoops}
        selectedVideo={selectedVideo}
        currentTime={currentTime}
        duration={selectedVideo?.duration || 60}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onRestart={handleRestart}
        volume={volume}
        onVolumeChange={setMasterVolume}
      />

      {/* Loading screen overlay - shows while DAW initializes underneath */}
      {/* Custom cursor stays visible during loading for consistent UX */}
      {loadingScreenVisible && (
        <div className="absolute inset-0 z-[9999]">
          <DAWLoadingScreen />
        </div>
      )}
      </div>
    </CursorProvider>
  );
};

export default MusicComposer;