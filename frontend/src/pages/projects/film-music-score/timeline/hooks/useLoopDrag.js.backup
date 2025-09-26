// /timeline/hooks/useLoopDrag.js - FIXED TO PREVENT WAVEFORM LOSS
import { useEffect, useCallback, useRef } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

export const useLoopDrag = (
  timelineRef,
  timelineScrollRef,
  draggedLoop,
  setDraggedLoop,
  dragOffset,
  setDragOffset,
  pixelToTime,
  timeToPixel,
  duration,
  zoom,
  onLoopUpdate,
  onLoopSelect
) => {
  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    initialStartTime: 0,
    initialTrackIndex: 0,
    loopOffsetX: 0
  });

  // FIXED: Reduce update frequency to prevent waveform loss
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const pendingUpdateRef = useRef(null);
  const updateIntervalRef = useRef(null);

  const handleLoopMouseDown = (e, loop) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate offset from mouse position to loop's left edge
    const loopLeft = timeToPixel(loop.startTime);
    const loopOffsetX = mouseX - loopLeft;
    
    dragStartRef.current = {
      startX: mouseX,
      startY: mouseY,
      initialStartTime: loop.startTime,
      initialTrackIndex: loop.trackIndex,
      loopOffsetX: loopOffsetX
    };
    
    setDraggedLoop(loop);
    onLoopSelect(loop.id);
    setDragOffset({ x: 0, y: 0 });
    
    console.log(`Started dragging loop: ${loop.name}`);
  };

  // FIXED: Batch updates with longer intervals to preserve waveform
  const applyUpdate = useCallback(() => {
    if (!pendingUpdateRef.current || !draggedLoop) return;
    
    const { trackIndex, startTime, endTime } = pendingUpdateRef.current;
    
    // Only update if values actually changed significantly
    if (draggedLoop.trackIndex !== trackIndex || 
        Math.abs(draggedLoop.startTime - startTime) > 0.05) {
      console.log(`Updating loop position: track ${trackIndex}, time ${startTime.toFixed(2)}s`);
      onLoopUpdate(draggedLoop.id, {
        trackIndex,
        startTime,
        endTime
      });
    }
    
    pendingUpdateRef.current = null;
  }, [draggedLoop, onLoopUpdate]);

  const handleMouseMove = useCallback((e) => {
    if (!draggedLoop || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const currentMouseX = e.clientX - rect.left;
    const currentMouseY = e.clientY - rect.top;
    
    // Account for scroll
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const adjustedMouseX = currentMouseX + scrollLeft;
    
    // Calculate new position
    const targetLoopLeft = adjustedMouseX - dragStartRef.current.loopOffsetX;
    const newStartTime = pixelToTime(targetLoopLeft);
    
    // Calculate track index
    const yPos = currentMouseY - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    const newTrackIndex = Math.floor(yPos / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    
    // Apply constraints
    const constrainedTrackIndex = Math.max(0, Math.min(TIMELINE_CONSTANTS.NUM_TRACKS - 1, newTrackIndex));
    const constrainedStartTime = Math.max(0, Math.min(duration - draggedLoop.duration, newStartTime));
    
    // Store the pending update
    pendingUpdateRef.current = {
      trackIndex: constrainedTrackIndex,
      startTime: constrainedStartTime,
      endTime: constrainedStartTime + draggedLoop.duration
    };
    
    // FIXED: Use much less frequent updates to prevent waveform regeneration
    const now = Date.now();
    if (now - lastUpdateRef.current > 100) { // Only update every 100ms instead of 16ms
      lastUpdateRef.current = now;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(applyUpdate);
    }
    
  }, [draggedLoop, duration, timelineRef, timelineScrollRef, pixelToTime, applyUpdate]);

  const handleMouseUp = useCallback(() => {
    if (draggedLoop) {
      console.log(`Finished dragging loop: ${draggedLoop.name}`);
      
      // Apply any pending final update
      if (pendingUpdateRef.current) {
        applyUpdate();
      }
      
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Clear update interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      
      // IMPORTANT: Prevent timeline click events for a short time after drag ends
      setTimeout(() => {
        setDraggedLoop(null);
        setDragOffset({ x: 0, y: 0 });
      }, 50); // Small delay to prevent click events
      
      // Reset refs
      dragStartRef.current = {
        startX: 0,
        startY: 0,
        initialStartTime: 0,
        initialTrackIndex: 0,
        loopOffsetX: 0
      };
      pendingUpdateRef.current = null;
      lastUpdateRef.current = 0;
      
      // Prevent any clicks from firing immediately after drag
      document.addEventListener('click', preventClick, { capture: true, once: true });
      setTimeout(() => {
        document.removeEventListener('click', preventClick, { capture: true });
      }, 100);
    }
  }, [draggedLoop, setDraggedLoop, setDragOffset, applyUpdate]);

  // Function to prevent clicks immediately after drag
  const preventClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (draggedLoop) {
      // Use passive listeners for better performance
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });
      
      // Disable text selection and set cursor
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.body.style.pointerEvents = 'none';
      if (timelineRef.current) {
        timelineRef.current.style.pointerEvents = 'auto';
      }
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.pointerEvents = '';
        
        // Clean up any pending operations
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      };
    }
  }, [draggedLoop, handleMouseMove, handleMouseUp, timelineRef]);

  return {
    handleLoopMouseDown
  };
};