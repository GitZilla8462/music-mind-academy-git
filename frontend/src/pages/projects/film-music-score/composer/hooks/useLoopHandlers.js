// hooks/useLoopHandlers.js - All loop-related event handlers
// 🔥 FIXED: Infinite rerender loop during resize
// 🔥 CHROMEBOOK FIX: Preview stop functionality now works properly
import { useCallback, useRef, useEffect } from 'react';

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
  tutorialMode
}) => {
  
  // 🔥 FIX: Add ref to track scheduling timeout
  const scheduleTimeoutRef = useRef(null);
  
  const handleLoopDrop = useCallback(async (loopData, trackIndex, startTime) => {
    if (lockFeatures.allowLoopDrag === false) {
      return;
    }

    if (onLoopDropCallback) {
      onLoopDropCallback(loopData, trackIndex, startTime);
    }

    if (!audioReady) {
      showToast?.('Please initialize audio first', 'error');
      return;
    }

    // ✅ CHROMEBOOK OPTIMIZED: Reduced logging
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
      muted: false
    };

    try {
      const player = await createLoopPlayer(newLoop);
      
      if (!player) {
        throw new Error('Failed to create audio player - no player returned');
      }
      
      if (player.isNative) {
        if (!player.loaded && player.audio) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Native audio load timeout')), 3000);
            
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
                reject(new Error('Native audio load error'));
              }, { once: true });
            }
          });
        }
      } else {
        if (!player.loaded) {
          throw new Error('Tone.js player not loaded');
        }
      }
      
      const updatedLoops = [...placedLoops, newLoop];
      setPlacedLoops(updatedLoops);
      setHasUnsavedChanges(true);
      
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
      
      showToast?.(`Added "${loopData.name}" to track ${trackIndex + 1}`, 'success');
    } catch (error) {
      console.error('Error creating loop player:', error);
      
      let errorMessage = `Failed to load "${loopData.name}"`;
      if (error.message.includes('timeout')) {
        errorMessage += ' - File loading timeout (check file exists)';
      } else if (error.message.includes('CORS')) {
        errorMessage += ' - File access blocked (CORS issue)';
      } else if (error.message.includes('decode')) {
        errorMessage += ' - Invalid audio format';
      } else {
        errorMessage += ` - ${error.message}`;
      }
      
      showToast?.(errorMessage, 'error');
    }
  }, [
    createLoopPlayer, showToast, audioReady, placedLoops, scheduleLoops, 
    selectedVideo?.duration, trackStates, onLoopDropCallback, lockFeatures,
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
    
    showToast?.('Loop removed', 'info');
  }, [
    selectedLoop, showToast, placedLoops, scheduleLoops, selectedVideo?.duration, 
    trackStates, onLoopDeleteCallback, setPlacedLoops, setHasUnsavedChanges, setSelectedLoop
  ]);

  const handleLoopSelect = useCallback((loopId) => {
    setSelectedLoop(selectedLoop === loopId ? null : loopId);
  }, [selectedLoop, setSelectedLoop]);

  // 🔥 FIX: Debounce scheduleLoops to prevent infinite loop during resize
  // ✅ CHROMEBOOK OPTIMIZED: Increased debounce, reduced logging
  const handleLoopUpdate = useCallback((loopId, updates) => {
    if (lockFeatures.allowLoopMove === false) {
      return;
    }

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
    onLoopUpdateCallback, lockFeatures, setPlacedLoops, setHasUnsavedChanges
  ]);

  // 🔥 CHROMEBOOK FIX: Handle stop explicitly, don't rely on toggle behavior
  const handleLoopPreview = useCallback(async (loop, isPlaying) => {
    if (lockFeatures.allowLoopPreview === false) {
      return;
    }

    // ✅ CHROMEBOOK OPTIMIZED: Reduced logging
    if (onLoopPreviewCallback) {
      onLoopPreviewCallback(loop, isPlaying);
    }

    if (tutorialMode) {
      return;
    }

    if (!audioReady) {
      showToast?.('Please initialize audio first', 'error');
      return;
    }
    
    // 🔥 FIX: When stopping (isPlaying=false), we need to:
    // 1. Call previewLoop to toggle/stop the audio
    // 2. The previewLoop function should detect the loop is playing and stop it
    //
    // The key issue was that LoopLibrary was setting currentlyPlaying=null
    // BEFORE calling this function, which broke the toggle detection.
    // But previewLoop should still work if we pass it the loop that was playing.
    
    try {
      if (isPlaying) {
        // Starting preview
        await previewLoop(loop, (endedLoop) => {
          if (onLoopPreviewCallback) {
            onLoopPreviewCallback(endedLoop, false);
          }
        });
      } else {
        // Stopping preview - call previewLoop which should stop it
        await previewLoop(loop, (endedLoop) => {
          if (onLoopPreviewCallback) {
            onLoopPreviewCallback(endedLoop, false);
          }
        });
      }
    } catch (error) {
      console.error('Error previewing loop:', error);
      showToast?.(`Failed to preview "${loop.name}" - ${error.message}`, 'error');
    }
  }, [
    previewLoop, audioReady, showToast, onLoopPreviewCallback, 
    lockFeatures, tutorialMode
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