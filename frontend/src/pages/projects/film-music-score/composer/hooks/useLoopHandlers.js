// hooks/useLoopHandlers.js - All loop-related event handlers
// 🔥 FIXED: Infinite rerender loop during resize
// 🔥 CHROMEBOOK FIX: Preview stop functionality now works properly
// 🔥 CHROMEBOOK FIX: Auto-initialize audio on preview click (don't require play first)
// 🔥 FIXED: Removed lockFeatures restrictions to allow free interaction during tutorial
import { useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

export const useLoopHandlers = ({
  lockFeatures,
  onLoopDropCallback,
  onLoopDeleteCallback,
  onLoopUpdateCallback,
  onLoopResizeCallback,
  onLoopPreviewCallback,
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
}) => {
  
  // 🔥 FIX: Add ref to track scheduling timeout
  const scheduleTimeoutRef = useRef(null);
  
  const handleLoopDrop = useCallback(async (loopData, trackIndex, startTime) => {
    // 🔥 REMOVED: lockFeatures restriction - allow drops anytime
    // if (lockFeatures.allowLoopDrag === false) {
    //   return;
    // }

    console.log('🎵 handleLoopDrop called:', { loopData: loopData?.name, trackIndex, startTime });

    // 🔥 REMOVED: audioReady check - allow loops to be placed before audio initializes
    // The audio players will be created when audio becomes ready
    // if (!audioReady) {
    //   showToast?.('Please initialize audio first', 'error');
    //   return;
    // }

    // ✅ CHROMEBOOK OPTIMIZED: Reduced logging
    // ✅ FIX: Preserve all custom beat properties (pattern, bpm, kit, steps, type)
    //    These are needed for re-rendering custom beats after page reload
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      color: loopData.color,
      trackIndex,
      startTime,
      endTime: startTime + loopData.duration,
      volume: 1,
      muted: false,
      // Custom beat properties (for re-rendering after page reload)
      ...(loopData.type === 'custom-beat' && {
        type: loopData.type,
        pattern: loopData.pattern,
        bpm: loopData.bpm,
        kit: loopData.kit,
        steps: loopData.steps,
        mood: loopData.mood
      })
    };

    // 🔥 FIX: Call callback AFTER creating the loop, passing the full loop object
    // This ensures CityCompositionActivity uses the SAME loop ID as MusicComposer
    // Previously, both components created their own loops with different IDs,
    // causing updates/deletes to fail (ID mismatch)
    if (onLoopDropCallback) {
      onLoopDropCallback(newLoop);
    }

    // ✅ Add loop to UI IMMEDIATELY (optimistic update)
    const updatedLoops = [...placedLoops, newLoop];
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);
    showToast?.(`Added "${loopData.name}" to track ${trackIndex + 1}`, 'success');

    // Only create audio players if audio is ready
    if (!audioReady) {
      console.log('⏳ Audio not ready yet - loop placed visually, audio will load later');
      return;
    }

    // Load audio in background - don't block UI
    try {
      const player = await createLoopPlayer(newLoop);
      
      if (!player) {
        console.warn('Failed to create audio player - loop visible but may not play');
        return;
      }
      
      if (player.isNative) {
        if (!player.loaded && player.audio) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve(), 3000); // Don't reject, just continue
            
            if (player.audio.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              player.audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                resolve();
              }, { once: true });
              
              player.audio.addEventListener('error', () => {
                clearTimeout(timeout);
                resolve(); // Don't reject - loop is already visible
              }, { once: true });
            }
          });
        }
      }
      
      // Schedule loops after audio is ready
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
      
    } catch (error) {
      console.error('Error creating loop player:', error);
      // Don't remove loop or show error - it's already visible
      // Audio will just not play for this loop
    }
  }, [
    createLoopPlayer, showToast, audioReady, placedLoops, scheduleLoops, 
    selectedVideo?.duration, trackStates, onLoopDropCallback,
    setPlacedLoops, setHasUnsavedChanges
  ]);

  const handleLoopDelete = useCallback((loopId) => {
    if (onLoopDeleteCallback) {
      onLoopDeleteCallback(loopId);
    }

    const updatedLoops = placedLoops.filter(loop => loop.id !== loopId);
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);

    if (selectedLoop === loopId) {
      setSelectedLoop(null);
    }

    if (updatedLoops.length > 0) {
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
    }

    // 🔥 FIX: Save immediately to prevent race condition with page refresh
    // The debounced auto-save (2 second delay) can miss deletions if user refreshes quickly
    if (saveCompositionImmediately) {
      saveCompositionImmediately(updatedLoops);
    }

    showToast?.('Loop removed', 'info');
  }, [
    selectedLoop, showToast, placedLoops, scheduleLoops, selectedVideo?.duration,
    trackStates, onLoopDeleteCallback, setPlacedLoops, setHasUnsavedChanges, setSelectedLoop,
    saveCompositionImmediately
  ]);

  const handleLoopSelect = useCallback((loopId) => {
    setSelectedLoop(selectedLoop === loopId ? null : loopId);
  }, [selectedLoop, setSelectedLoop]);

  // 🔥 FIX: Debounce scheduleLoops to prevent infinite loop during resize
  // ✅ CHROMEBOOK OPTIMIZED: Increased debounce, reduced logging
  const handleLoopUpdate = useCallback((loopId, updates) => {
    // 🔥 REMOVED: lockFeatures restriction - allow moves anytime
    // if (lockFeatures.allowLoopMove === false) {
    //   return;
    // }

    if (onLoopUpdateCallback) {
      onLoopUpdateCallback(loopId, updates);
    }

    const updatedLoops = placedLoops.map(loop => 
      loop.id === loopId 
        ? { ...loop, ...updates }
        : loop
    );
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);
    
    // 🔥 FIX: Debounce scheduleLoops to prevent infinite loop during resize
    // ✅ CHROMEBOOK: Increased to 250ms for smoother performance on low-end devices
    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current);
    }
    
    scheduleTimeoutRef.current = setTimeout(() => {
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
      scheduleTimeoutRef.current = null;
    }, 250); // Increased from 150ms for Chromebook performance
  }, [
    placedLoops, scheduleLoops, selectedVideo?.duration, trackStates, 
    onLoopUpdateCallback, setPlacedLoops, setHasUnsavedChanges
  ]);

  // 🔥 CHROMEBOOK FIX: Handle stop explicitly, don't rely on toggle behavior
  // 🔥 CHROMEBOOK FIX: Auto-resume AudioContext if suspended (tab visibility change)
  const handleLoopPreview = useCallback(async (loop, isPlaying) => {
    // 🔥 REMOVED: lockFeatures restriction - allow preview anytime
    // if (lockFeatures.allowLoopPreview === false) {
    //   return;
    // }

    // ✅ CHROMEBOOK OPTIMIZED: Reduced logging
    if (onLoopPreviewCallback) {
      onLoopPreviewCallback(loop, isPlaying);
    }

    if (tutorialMode) {
      return;
    }

    // CHROMEBOOK FIX: If audio isn't ready but we need to preview, try to initialize it
    // This handles the case where user clicks preview before clicking play
    if (!audioReady) {
      try {
        // Try to start Tone.js AudioContext (requires user gesture - we have one!)
        if (Tone.context.state !== 'running') {
          console.log('🔊 Auto-initializing audio for preview...');
          await Tone.start();
        }
        // Note: audioReady will still be false, but the AudioContext is now running
        // previewLoop will handle the actual audio playback
      } catch (err) {
        console.error('Failed to auto-initialize audio:', err);
        showToast?.('Tap the Play button first to enable audio', 'info');
        return;
      }
    }

    try {
      if (isPlaying) {
        // Starting preview
        await previewLoop(loop, (endedLoop) => {
          if (onLoopPreviewCallback) {
            onLoopPreviewCallback(endedLoop, false);
          }
        });
      } else {
        // 🔥 FIX: Use stopPreview() directly instead of toggle behavior
        // This guarantees the previous audio stops immediately, no race conditions
        stopPreview();
      }
    } catch (error) {
      console.error('Error previewing loop:', error);
      // Provide user-friendly error messages
      if (error.message?.includes('failed to load')) {
        showToast?.(`"${loop.name}" can't play on this device`, 'error');
      } else {
        showToast?.(`Failed to preview "${loop.name}"`, 'error');
      }
    }
  }, [
    previewLoop, stopPreview, audioReady, showToast, onLoopPreviewCallback,
    tutorialMode
  ]);

  // 🔥 FIX: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleLoopDrop,
    handleLoopDelete,
    handleLoopSelect,
    handleLoopUpdate,
    handleLoopPreview
  };
};