// /timeline/hooks/useLoopResize.js
// Hook for resizing loops with magnetic snap guides (similar to useLoopDrag.js)
import { useEffect, useCallback, useRef } from 'react';

export const useLoopResize = (
  timelineRef,
  placedLoops,
  duration,
  timeToPixel,
  pixelToTime
) => {
  const snapGuideRef = useRef(null);
  const isShiftKeyPressed = useRef(false);

  // Track shift key state for disabling snap
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
    if (!timelineRef?.current) return;

    if (!snapGuideRef.current) {
      const guide = document.createElement('div');
      guide.id = 'resize-snap-guide';
      guide.style.position = 'absolute';
      guide.style.top = '0';
      guide.style.bottom = '0';
      guide.style.width = '3px';  // Slightly wider for better visibility
      guide.style.backgroundColor = '#3b82f6';
      guide.style.boxShadow = '0 0 12px rgba(59, 130, 246, 1), 0 0 24px rgba(59, 130, 246, 0.6)';  // More glow
      guide.style.zIndex = '100';  // Very high z-index to ensure visibility
      guide.style.pointerEvents = 'none';
      guide.style.transition = 'opacity 0.15s ease';
      guide.style.opacity = '0';
      timelineRef.current.appendChild(guide);
      snapGuideRef.current = guide;
    }

    const guide = snapGuideRef.current;

    if (isSnapping && snapTime !== null) {
      const xPos = timeToPixel(snapTime);
      guide.style.left = `${xPos}px`;
      guide.style.opacity = '1';  // Full opacity
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

  // Find snap points from all loops (for resize edges)
  const findSnapPoints = useCallback((currentLoopId) => {
    if (!placedLoops) return [];
    
    const snapPoints = [];
    
    // Always add timeline boundaries as snap points
    snapPoints.push({
      time: 0,
      type: 'timeline-start',
      loopName: 'Timeline Start'
    });
    
    snapPoints.push({
      time: duration,
      type: 'timeline-end',
      loopName: 'Timeline End'
    });
    
    // Add snap points from all OTHER loops
    placedLoops.forEach(loop => {
      if (loop.id === currentLoopId) return; // Skip the loop being resized
      
      const originalDuration = loop.duration;
      const currentDuration = loop.endTime - loop.startTime;
      const numRepeats = Math.ceil(currentDuration / originalDuration);
      
      // Start of loop
      snapPoints.push({
        time: loop.startTime,
        type: 'start',
        loopName: loop.name
      });
      
      // End of loop
      snapPoints.push({
        time: loop.endTime,
        type: 'end',
        loopName: loop.name
      });
      
      // Internal repeat boundaries
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
  }, [placedLoops, duration]);

  // Apply snapping to a time value (can be disabled with Shift key)
  const applySnapping = useCallback((targetTime, currentLoopId) => {
    // If shift key is pressed, disable snapping for fine control
    if (isShiftKeyPressed.current) {
      return {
        time: targetTime,
        isSnapping: false,
        snapPoint: null
      };
    }

    const snapPoints = findSnapPoints(currentLoopId);
    const SNAP_THRESHOLD = 0.5; // seconds
    
    let closestSnap = null;
    let minDistance = SNAP_THRESHOLD;
    
    // Prioritize timeline boundaries
    snapPoints.forEach(snapPoint => {
      const distance = Math.abs(targetTime - snapPoint.time);
      const isTimelineBoundary = snapPoint.type === 'timeline-start' || snapPoint.type === 'timeline-end';
      
      if (distance < minDistance) {
        // If current closest is a timeline boundary, only replace with another boundary or closer snap
        if (closestSnap && (closestSnap.type === 'timeline-start' || closestSnap.type === 'timeline-end')) {
          if (isTimelineBoundary || distance < minDistance * 0.5) {
            minDistance = distance;
            closestSnap = snapPoint;
          }
        } else {
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

  // Hide snap guide (useful for cleanup)
  const hideSnapGuide = useCallback(() => {
    updateSnapGuide(null, false);
  }, [updateSnapGuide]);

  return {
    applySnapping,
    updateSnapGuide,
    hideSnapGuide
  };
};