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
      // Upbeat loops are short (~7.6s) — place as 2 cycles so they're a usable length
      duration: loopData.mood === 'Upbeat' ? loopData.duration * 2 : loopData.duration,
      category: loopData.category,
      color: loopData.color,
      trackIndex,
      startTime,
      endTime: startTime + (loopData.mood === 'Upbeat' ? loopData.duration * 2 : loopData.duration),
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
      }),
      // Custom melody properties (for re-rendering after page reload)
      ...(loopData.type === 'custom-melody' && {
        type: loopData.type,
        pattern: loopData.pattern,
        bpm: loopData.bpm,
        synthType: loopData.synthType,
        beats: loopData.beats,
        notes: loopData.notes,
        key: loopData.key,
        mood: loopData.mood,
        needsRender: true
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

      // FIX: Correct placed loop size to match actual AudioBuffer
      // Skip if duration is already a clean multiple of beatAligned (intentional multi-cycle placement)
      if (player.beatAlignedDuration) {
        const ratio = newLoop.duration / player.beatAlignedDuration;
        const isCleanMultiple = Math.abs(ratio - Math.round(ratio)) < 0.05;
        if (!isCleanMultiple && Math.abs(player.beatAlignedDuration - newLoop.duration) > 0.1) {
          const correctedDuration = player.beatAlignedDuration;
          const correctedEndTime = startTime + correctedDuration;
          const correctedLoops = updatedLoops.map(l =>
            l.id === newLoop.id
              ? { ...l, duration: correctedDuration, endTime: correctedEndTime }
              : l
          );
          setPlacedLoops(correctedLoops);
          scheduleLoops(correctedLoops, selectedVideo?.duration || 60, trackStates);
          return;
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
  // 🔥 FIX: Use functional update to avoid stale closure issue
  // When a loop is dropped and immediately dragged, the callback might have
  // stale placedLoops that doesn't include the new loop, causing it to disappear
  const handleLoopUpdate = useCallback((loopId, updates) => {
    if (onLoopUpdateCallback) {
      onLoopUpdateCallback(loopId, updates);
    }

    // 🔥 FIX: Use functional update to always get latest state
    // This prevents the bug where dragging a newly-dropped loop would use
    // stale placedLoops from closure and lose the loop
    setPlacedLoops(prevLoops => {
      const updatedLoops = prevLoops.map(loop =>
        loop.id === loopId
          ? { ...loop, ...updates }
          : loop
      );

      // Schedule audio update with the updated loops
      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current);
      }
      scheduleTimeoutRef.current = setTimeout(() => {
        scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
        scheduleTimeoutRef.current = null;
      }, 250);

      return updatedLoops;
    });
    setHasUnsavedChanges(true);
  }, [
    scheduleLoops, selectedVideo?.duration, trackStates,
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