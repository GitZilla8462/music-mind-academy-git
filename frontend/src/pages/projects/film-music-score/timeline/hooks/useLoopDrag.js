// /timeline/hooks/useLoopDrag.js - FIXED: Smoother dragging with optional magnetic snap
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
  onLoopSelect,
  allLoops
) => {
  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    initialStartTime: 0,
    initialTrackIndex: 0,
    loopOffsetX: 0,
    loopOffsetY: 0,
    initialScrollLeft: 0,
    initialScrollTop: 0
  });

  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const pendingUpdateRef = useRef(null);
  const snapGuideRef = useRef(null);
  const isShiftKeyPressed = useRef(false);

  // Track shift key state
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        isShiftKeyPressed.current = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        isShiftKeyPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Create or update the visual snap guide
  const updateSnapGuide = useCallback((snapTime, isSnapping) => {
    if (!timelineRef.current) return;

    if (!snapGuideRef.current) {
      const guide = document.createElement('div');
      guide.id = 'snap-guide';
      guide.style.position = 'absolute';
      guide.style.top = '0';
      guide.style.bottom = '0';
      guide.style.width = '2px';
      guide.style.backgroundColor = '#3b82f6';
      guide.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.8)';
      guide.style.zIndex = '35';
      guide.style.pointerEvents = 'none';
      guide.style.transition = 'opacity 0.1s ease';
      guide.style.opacity = '0';
      timelineRef.current.appendChild(guide);
      snapGuideRef.current = guide;
    }

    const guide = snapGuideRef.current;

    if (isSnapping && snapTime !== null) {
      const xPos = timeToPixel(snapTime);
      guide.style.left = `${xPos}px`;
      guide.style.opacity = '0.9';
    } else {
      guide.style.opacity = '0';
    }
  }, [timelineRef, timeToPixel]);

  // Remove snap guide on cleanup
  useEffect(() => {
    return () => {
      if (snapGuideRef.current && snapGuideRef.current.parentNode) {
        snapGuideRef.current.parentNode.removeChild(snapGuideRef.current);
        snapGuideRef.current = null;
      }
    };
  }, []);

  // Find snap points from all other loops
  const findSnapPoints = useCallback((draggedLoopId) => {
    if (!allLoops) return [];
    
    const snapPoints = [];
    
    // FIXED: Always add timeline start (0:00) as a snap point
    snapPoints.push({
      time: 0,
      type: 'timeline-start',
      loopName: 'Timeline Start'
    });
    
    // FIXED: Also add timeline end as a snap point
    snapPoints.push({
      time: duration,
      type: 'timeline-end',
      loopName: 'Timeline End'
    });
    
    allLoops.forEach(loop => {
      if (loop.id === draggedLoopId) return;
      
      const originalDuration = loop.duration;
      const currentDuration = loop.endTime - loop.startTime;
      const numRepeats = Math.ceil(currentDuration / originalDuration);
      
      snapPoints.push({
        time: loop.startTime,
        type: 'start',
        loopName: loop.name
      });
      
      snapPoints.push({
        time: loop.endTime,
        type: 'end',
        loopName: loop.name
      });
      
      for (let i = 1; i < numRepeats; i++) {
        const repeatTime = loop.startTime + (i * originalDuration);
        if (repeatTime <= loop.endTime + 0.01) {
          snapPoints.push({
            time: repeatTime,
            type: 'repeat',
            loopName: loop.name,
            repeatIndex: i
          });
        }
      }
    });
    
    return snapPoints;
  }, [allLoops, duration]);

  // Apply snapping to a time value (can be disabled with Shift key)
  const applySnapping = useCallback((targetTime, draggedLoopId) => {
    // If shift key is pressed, disable snapping for fine control
    if (isShiftKeyPressed.current) {
      return {
        time: targetTime,
        isSnapping: false,
        snapPoint: null
      };
    }

    const snapPoints = findSnapPoints(draggedLoopId);
    const SNAP_THRESHOLD = 0.5; // Increased from 0.3 for less aggressive snapping
    
    let closestSnap = null;
    let minDistance = SNAP_THRESHOLD;
    
    // FIXED: Prioritize timeline boundaries over other snap points
    // Check timeline start and end first with higher priority
    snapPoints.forEach(snapPoint => {
      const distance = Math.abs(targetTime - snapPoint.time);
      
      // Timeline boundaries get priority when within threshold
      const isTimelineBoundary = snapPoint.type === 'timeline-start' || snapPoint.type === 'timeline-end';
      
      if (distance < minDistance) {
        // If current closest is a timeline boundary, only replace with another timeline boundary or closer snap
        if (closestSnap && (closestSnap.type === 'timeline-start' || closestSnap.type === 'timeline-end')) {
          // Only replace if this is also a timeline boundary or significantly closer
          if (isTimelineBoundary || distance < minDistance * 0.5) {
            minDistance = distance;
            closestSnap = snapPoint;
          }
        } else {
          // No timeline boundary currently selected, accept any closer snap
          minDistance = distance;
          closestSnap = snapPoint;
        }
      }
    });
    
    if (closestSnap) {
      return {
        time: closestSnap.time,
        isSnapping: true,
        snapPoint: closestSnap
      };
    }
    
    return {
      time: targetTime,
      isSnapping: false,
      snapPoint: null
    };
  }, [findSnapPoints]);

  const handleLoopMouseDown = (e, loop) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!timelineRef.current || !timelineScrollRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current.scrollLeft;
    const scrollTop = timelineScrollRef.current.scrollTop;
    
    // Mouse position relative to viewport
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate loop's actual position in timeline coordinates
    const loopTopInTimeline = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
    const loopLeftInTimeline = timeToPixel(loop.startTime);
    
    // Calculate offset from mouse to loop's position
    const timelineMouseX = mouseX + scrollLeft;
    const timelineMouseY = mouseY + scrollTop;
    
    const loopOffsetX = timelineMouseX - loopLeftInTimeline;
    const loopOffsetY = timelineMouseY - loopTopInTimeline;
    
    dragStartRef.current = {
      startX: timelineMouseX,
      startY: timelineMouseY,
      initialStartTime: loop.startTime,
      initialTrackIndex: loop.trackIndex,
      loopOffsetX: loopOffsetX,
      loopOffsetY: loopOffsetY,
      initialScrollLeft: scrollLeft,
      initialScrollTop: scrollTop
    };
    
    setDraggedLoop(loop);
    onLoopSelect(loop.id);
    setDragOffset({ x: 0, y: 0 });
    
    console.log(`Started dragging loop: ${loop.name} on track ${loop.trackIndex} (Hold Shift for fine positioning)`);
  };

  const applyUpdate = useCallback(() => {
    if (!pendingUpdateRef.current || !draggedLoop) return;
    
    const { trackIndex, startTime, endTime } = pendingUpdateRef.current;
    
    if (draggedLoop.trackIndex !== trackIndex || 
        Math.abs(draggedLoop.startTime - startTime) > 0.01) { // Reduced from 0.05 for smoother updates
      onLoopUpdate(draggedLoop.id, {
        trackIndex,
        startTime,
        endTime
      });
    }
    
    pendingUpdateRef.current = null;
  }, [draggedLoop, onLoopUpdate]);

  const handleMouseMove = useCallback((e) => {
    if (!draggedLoop || !timelineRef.current || !timelineScrollRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current.scrollLeft;
    const scrollTop = timelineScrollRef.current.scrollTop;
    
    // Current mouse position relative to viewport
    const currentMouseX = e.clientX - rect.left;
    const currentMouseY = e.clientY - rect.top;
    
    // Current mouse position in timeline coordinates
    const timelineMouseX = currentMouseX + scrollLeft;
    const timelineMouseY = currentMouseY + scrollTop;
    
    // Calculate new loop position by subtracting the stored offsets
    const targetLoopLeft = timelineMouseX - dragStartRef.current.loopOffsetX;
    const targetLoopTop = timelineMouseY - dragStartRef.current.loopOffsetY;
    
    let newStartTime = pixelToTime(targetLoopLeft);
    
    // Apply magnetic snapping (disabled when Shift is held)
    const snapResult = applySnapping(newStartTime, draggedLoop.id);
    newStartTime = snapResult.time;
    
    // Update visual snap guide
    updateSnapGuide(snapResult.isSnapping ? snapResult.time : null, snapResult.isSnapping);
    
    // Calculate track index from the loop's top position
    const yPosRelativeToTracks = targetLoopTop - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    const newTrackIndex = Math.floor(yPosRelativeToTracks / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    
    // Apply constraints
    const constrainedTrackIndex = Math.max(0, Math.min(TIMELINE_CONSTANTS.NUM_TRACKS - 1, newTrackIndex));
    const loopDuration = draggedLoop.endTime - draggedLoop.startTime;
    const constrainedStartTime = Math.max(0, Math.min(duration - loopDuration, newStartTime));
    
    pendingUpdateRef.current = {
      trackIndex: constrainedTrackIndex,
      startTime: constrainedStartTime,
      endTime: constrainedStartTime + loopDuration
    };
    
    const now = Date.now();
    // Reduced from 100ms to 50ms for smoother updates
    if (now - lastUpdateRef.current > 50) {
      lastUpdateRef.current = now;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(applyUpdate);
    }
    
  }, [draggedLoop, duration, timelineRef, timelineScrollRef, pixelToTime, applyUpdate, applySnapping, updateSnapGuide]);

  const handleMouseUp = useCallback(() => {
    if (draggedLoop) {
      console.log(`Finished dragging loop: ${draggedLoop.name}`);
      
      // Hide snap guide
      updateSnapGuide(null, false);
      
      if (pendingUpdateRef.current) {
        applyUpdate();
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      setTimeout(() => {
        setDraggedLoop(null);
        setDragOffset({ x: 0, y: 0 });
      }, 50);
      
      dragStartRef.current = {
        startX: 0,
        startY: 0,
        initialStartTime: 0,
        initialTrackIndex: 0,
        loopOffsetX: 0,
        loopOffsetY: 0,
        initialScrollLeft: 0,
        initialScrollTop: 0
      };
      pendingUpdateRef.current = null;
      lastUpdateRef.current = 0;
      
      window.lastDragEndTime = Date.now();
      
      document.addEventListener('click', preventClick, { capture: true, once: true });
      setTimeout(() => {
        document.removeEventListener('click', preventClick, { capture: true });
      }, 100);
    }
  }, [draggedLoop, setDraggedLoop, setDragOffset, applyUpdate, updateSnapGuide]);

  const preventClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (draggedLoop) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });
      
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
        
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }
  }, [draggedLoop, handleMouseMove, handleMouseUp, timelineRef]);

  return {
    handleLoopMouseDown
  };
};