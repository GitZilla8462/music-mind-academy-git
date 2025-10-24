// hooks/useLoopHandlers.js - All loop-related event handlers
// ðŸ”¥ FIXED: Infinite rerender loop during resize
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
  
  // ðŸ”¥ FIX: Add ref to track scheduling timeout
  const scheduleTimeoutRef = useRef(null);
  
  const handleLoopDrop = useCallback(async (loopData, trackIndex, startTime) => {
    if (lockFeatures.allowLoopDrag === false) {
      console.log('Loop dragging is locked');
      return;
    }

    if (onLoopDropCallback) {
      onLoopDropCallback(loopData, trackIndex, startTime);
    }

    if (!audioReady) {
      showToast?.('Please initialize audio first', 'error');
      return;
    }

    console.log(`Dropping loop: ${loopData.name} at track ${trackIndex}, time ${startTime}`);

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
      console.log(`Creating audio player for ${newLoop.name} from ${newLoop.file}`);
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
      
      console.log(`Audio player created successfully for ${newLoop.name}`);
      
      const updatedLoops = [...placedLoops, newLoop];
      setPlacedLoops(updatedLoops);
      setHasUnsavedChanges(true);
      
      console.log(`Rescheduling all ${updatedLoops.length} loops after drop`);
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
      console.log(`Not adding loop to timeline due to player creation failure`);
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

    console.log(`Deleting loop: ${loopId}`);
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

  // ðŸ”¥ FIX: Debounce scheduleLoops to prevent infinite loop during resize
  const handleLoopUpdate = useCallback((loopId, updates) => {
    if (lockFeatures.allowLoopMove === false) {
      console.log('Loop movement is locked');
      return;
    }

    if (onLoopUpdateCallback) {
      onLoopUpdateCallback(loopId, updates);
    }

    console.log(`Updating loop ${loopId}:`, updates);
    const updatedLoops = placedLoops.map(loop => 
      loop.id === loopId 
        ? { ...loop, ...updates }
        : loop
    );
    setPlacedLoops(updatedLoops);
    setHasUnsavedChanges(true);
    
    // ðŸ”¥ FIX: Debounce scheduleLoops to prevent infinite loop during resize
    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current);
    }
    
    scheduleTimeoutRef.current = setTimeout(() => {
      scheduleLoops(updatedLoops, selectedVideo?.duration || 60, trackStates);
      scheduleTimeoutRef.current = null;
    }, 150); // Wait 150ms after last update before rescheduling
  }, [
    placedLoops, scheduleLoops, selectedVideo?.duration, trackStates, 
    onLoopUpdateCallback, lockFeatures, setPlacedLoops, setHasUnsavedChanges
  ]);

  const handleLoopPreview = useCallback(async (loop, isPlaying) => {
    if (lockFeatures.allowLoopPreview === false) {
      console.log('Loop preview is locked');
      return;
    }

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
    
    // Only call previewLoop when starting playback
    // When isPlaying is false, the user clicked stop - no action needed
    // as clicking the same loop again will stop it via previewLoop's built-in stop logic
    if (!isPlaying) {
      return;
    }
    
    try {
      // Pass a callback to notify when preview ends
      await previewLoop(loop, (endedLoop) => {
        // Notify parent that preview stopped
        if (onLoopPreviewCallback) {
          onLoopPreviewCallback(endedLoop, false);
        }
      });
    } catch (error) {
      console.error('Error previewing loop:', error);
      showToast?.(`Failed to preview "${loop.name}" - ${error.message}`, 'error');
    }
  }, [
    previewLoop, audioReady, showToast, onLoopPreviewCallback, 
    lockFeatures, tutorialMode
  ]);

  // ðŸ”¥ FIX: Cleanup timeout on unmount
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