// File: /src/pages/projects/film-music-score/timeline/components/InteractionOverlay.jsx
// OVERLAY PATTERN: Single transparent layer handles ALL mouse events
// This eliminates cursor flickering by having ONE element control the cursor
// Professional web DAWs (Soundtrap, BandLab) use this same approach

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const InteractionOverlay = ({
  // Data
  placedLoops,
  duration,
  currentTime,
  trackStates,
  selectedLoop,
  selectedLoopIds,
  
  // Conversion functions
  timeToPixel,
  pixelToTime,
  
  // Refs
  timelineRef,
  timelineScrollRef,
  
  // Loop handlers
  onLoopSelect,
  onLoopUpdate,
  onLoopDelete,
  onLoopDrop,
  
  // Playhead handlers
  onSeek,
  onPlayheadDragStart,
  onPlayheadDragEnd,
  
  // Selection box
  onSelectionStart,
  onSelectionUpdate,
  onSelectionEnd,
  
  // Resize handler
  onLoopResize,
  
  // State
  isDraggingPlayhead,
  setIsDraggingPlayhead,
  
  // Context menu
  onContextMenu,
  
  // Lock features (tutorial mode)
  lockFeatures = {},
  
  // Drag and drop from library
  hoveredTrack,
  setHoveredTrack
}) => {
  // Cursor state - this is the ONLY place cursor is determined
  const [cursorStyle, setCursorStyle] = useState('default');
  
  // Interaction state
  const [isDraggingLoop, setIsDraggingLoop] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeLoop, setActiveLoop] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  
  // Drag state refs (avoid re-renders during drag)
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    loopOffsetX: 0,
    loopOffsetY: 0,
    initialStartTime: 0,
    initialTrackIndex: 0,
    initialEndTime: 0
  });
  
  const selectionStartRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);
  const rafRef = useRef(null);
  const isShiftKeyRef = useRef(false);
  
  // CHROMEBOOK FIX: Throttle cursor updates to prevent flickering
  const cursorUpdateRef = useRef(0);
  
  // Snap guide ref
  const snapGuideRef = useRef(null);

  // ============================================================================
  // HIT TESTING FUNCTIONS - Mathematical detection, no DOM events
  // ============================================================================
  
  /**
   * Get mouse position relative to timeline content area
   * CHROMEBOOK FIX: Compensates for CSS zoom applied by parent components (DAWTutorialActivity uses zoom: 0.75)
   */
  const getMousePosition = useCallback((e) => {
    if (!timelineRef.current) return { x: 0, y: 0 };
    
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const scrollTop = timelineScrollRef.current?.scrollTop || 0;
    
    // Detect CSS zoom applied to parent elements
    // When zoom is applied, getBoundingClientRect returns scaled dimensions,
    // but we need unscaled coordinates for hit testing
    let zoomFactor = 1;
    let element = timelineRef.current;
    while (element) {
      const style = window.getComputedStyle(element);
      const zoom = parseFloat(style.zoom);
      if (zoom && zoom !== 1) {
        zoomFactor = zoom;
        break;
      }
      element = element.parentElement;
    }
    
    // Scale coordinates by zoom factor
    const viewportX = (e.clientX - rect.left) / zoomFactor;
    const viewportY = (e.clientY - rect.top) / zoomFactor;
    
    return {
      x: viewportX + scrollLeft,
      y: viewportY + scrollTop,
      viewportX: viewportX,
      viewportY: viewportY
    };
  }, [timelineRef, timelineScrollRef]);

  /**
   * Find which loop (if any) is under the mouse position
   */
  const getLoopAtPosition = useCallback((x, y) => {
    if (!placedLoops || placedLoops.length === 0) return null;
    
    // Check loops in reverse order (top-most first based on render order)
    for (let i = placedLoops.length - 1; i >= 0; i--) {
      const loop = placedLoops[i];
      
      // Skip if track is hidden
      if (trackStates[`track-${loop.trackIndex}`]?.visible === false) continue;
      
      const left = timeToPixel(loop.startTime);
      const right = timeToPixel(loop.endTime);
      const top = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
      const bottom = top + TIMELINE_CONSTANTS.TRACK_HEIGHT;
      
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return loop;
      }
    }
    return null;
  }, [placedLoops, trackStates, timeToPixel]);

  /**
   * Determine if mouse is in a resize zone (within threshold of loop edge)
   */
  const getResizeZone = useCallback((x, loop) => {
    if (!loop) return null;
    
    const left = timeToPixel(loop.startTime);
    const right = timeToPixel(loop.endTime);
    const RESIZE_THRESHOLD = 12; // pixels
    
    // Only right edge resize for now (matching current behavior)
    if (x >= right - RESIZE_THRESHOLD && x <= right + 4) {
      return 'right';
    }
    
    // Left edge resize (optional - currently disabled in your app)
    // if (x >= left - 4 && x <= left + RESIZE_THRESHOLD) {
    //   return 'left';
    // }
    
    return null;
  }, [timeToPixel]);

  // Store currentTime in a ref to avoid re-renders
  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  /**
   * Check if mouse is near the playhead
   * CHROMEBOOK FIX: Uses ref instead of direct prop to avoid re-creating callback on every frame
   */
  const isNearPlayhead = useCallback((x) => {
    const playheadX = timeToPixel(currentTimeRef.current);
    const PLAYHEAD_THRESHOLD = 8;
    return Math.abs(x - playheadX) <= PLAYHEAD_THRESHOLD;
  }, [timeToPixel]);

  /**
   * Get track index from Y position
   */
  const getTrackIndexFromY = useCallback((y) => {
    const yRelativeToTracks = y - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    if (yRelativeToTracks < 0) return -1; // Video track area
    
    const trackIndex = Math.floor(yRelativeToTracks / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    if (trackIndex >= TIMELINE_CONSTANTS.NUM_TRACKS) return -1;
    
    return trackIndex;
  }, []);

  // ============================================================================
  // CURSOR CALCULATION - Single source of truth
  // ============================================================================
  
  const calculateCursor = useCallback((x, y) => {
    // Active states take priority
    if (isDraggingLoop) return 'grabbing';
    if (isResizing) return 'ew-resize';
    if (isDraggingPlayhead) return 'col-resize';
    if (isSelecting) return 'crosshair';
    
    // Check playhead first (highest priority for hover)
    if (isNearPlayhead(x) && y > 0) {
      return 'col-resize';
    }
    
    // Check loops
    const loop = getLoopAtPosition(x, y);
    if (loop) {
      // Check resize zones
      const resizeZone = getResizeZone(x, loop);
      if (resizeZone) {
        return 'ew-resize';
      }
      // Default loop cursor
      return 'grab';
    }
    
    // Default timeline cursor
    return 'default';
  }, [
    isDraggingLoop, isResizing, isDraggingPlayhead, isSelecting,
    isNearPlayhead, getLoopAtPosition, getResizeZone
  ]);

  // ============================================================================
  // SNAP LOGIC
  // ============================================================================
  
  const findSnapPoints = useCallback((excludeLoopId) => {
    const snapPoints = [
      { time: 0, type: 'timeline-start' },
      { time: duration, type: 'timeline-end' }
    ];
    
    placedLoops.forEach(loop => {
      if (loop.id === excludeLoopId) return;
      
      snapPoints.push({ time: loop.startTime, type: 'loop-start', loopId: loop.id });
      snapPoints.push({ time: loop.endTime, type: 'loop-end', loopId: loop.id });
      
      // Add repeat markers
      const originalDuration = loop.duration;
      const currentDuration = loop.endTime - loop.startTime;
      const numRepeats = Math.ceil(currentDuration / originalDuration);
      
      for (let i = 1; i < numRepeats; i++) {
        const repeatTime = loop.startTime + (i * originalDuration);
        if (repeatTime < loop.endTime) {
          snapPoints.push({ time: repeatTime, type: 'repeat', loopId: loop.id });
        }
      }
    });
    
    return snapPoints;
  }, [placedLoops, duration]);

  const applySnapping = useCallback((targetTime, excludeLoopId) => {
    if (isShiftKeyRef.current) {
      return { time: targetTime, snapped: false };
    }
    
    const snapPoints = findSnapPoints(excludeLoopId);
    const SNAP_THRESHOLD = 0.5; // seconds
    
    let closestSnap = null;
    let minDistance = SNAP_THRESHOLD;
    
    for (const point of snapPoints) {
      const distance = Math.abs(targetTime - point.time);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = point;
      }
    }
    
    if (closestSnap) {
      updateSnapGuide(closestSnap.time, true);
      return { time: closestSnap.time, snapped: true, snapPoint: closestSnap };
    }
    
    updateSnapGuide(null, false);
    return { time: targetTime, snapped: false };
  }, [findSnapPoints]);

  const updateSnapGuide = useCallback((snapTime, show) => {
    if (!timelineRef.current) return;
    
    if (!snapGuideRef.current) {
      const guide = document.createElement('div');
      guide.className = 'snap-guide';
      guide.style.cssText = `
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: #3b82f6;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
        z-index: 45;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.1s ease;
      `;
      timelineRef.current.appendChild(guide);
      snapGuideRef.current = guide;
    }
    
    if (show && snapTime !== null) {
      snapGuideRef.current.style.left = `${timeToPixel(snapTime)}px`;
      snapGuideRef.current.style.opacity = '0.9';
    } else {
      snapGuideRef.current.style.opacity = '0';
    }
  }, [timelineRef, timeToPixel]);

  // Cleanup snap guide on unmount
  useEffect(() => {
    return () => {
      if (snapGuideRef.current?.parentNode) {
        snapGuideRef.current.parentNode.removeChild(snapGuideRef.current);
      }
    };
  }, []);

  // ============================================================================
  // MOUSE EVENT HANDLERS
  // ============================================================================

  const handleMouseMove = useCallback((e) => {
    const { x, y } = getMousePosition(e);
    
    // CHROMEBOOK FIX: Throttle cursor updates to 100ms when not actively dragging
    // This prevents visible cursor flicker on slower GPU compositors
    if (!isDraggingLoop && !isResizing && !isDraggingPlayhead && !isSelecting) {
      const now = Date.now();
      if (now - cursorUpdateRef.current > 100) {
        cursorUpdateRef.current = now;
        setCursorStyle(calculateCursor(x, y));
      }
    }
    
    // Handle active drag operations
    if (isDraggingLoop && activeLoop) {
      handleLoopDrag(e, x, y);
    } else if (isResizing && activeLoop) {
      handleResizeDrag(e, x);
    } else if (isDraggingPlayhead) {
      handlePlayheadDrag(e, x);
    } else if (isSelecting) {
      handleSelectionDrag(e, x, y);
    }
  }, [
    getMousePosition, calculateCursor, isDraggingLoop, isResizing,
    isDraggingPlayhead, isSelecting, activeLoop
  ]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Left click only
    
    const { x, y, viewportX, viewportY } = getMousePosition(e);
    
    // Check what we clicked on
    const loop = getLoopAtPosition(x, y);
    
    if (loop) {
      // Check for resize zone first
      const resizeZone = getResizeZone(x, loop);
      
      if (resizeZone && lockFeatures.allowLoopResize !== false) {
        // Start resize
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(true);
        setResizeDirection(resizeZone);
        setActiveLoop(loop);
        setCursorStyle('ew-resize');
        
        dragStateRef.current = {
          initialStartTime: loop.startTime,
          initialEndTime: loop.endTime,
          startX: x
        };
        
        onLoopSelect?.(loop.id);
        return;
      }
      
      if (lockFeatures.allowLoopMove !== false) {
        // Start loop drag
        e.preventDefault();
        e.stopPropagation();
        
        setIsDraggingLoop(true);
        setActiveLoop(loop);
        setCursorStyle('grabbing');
        
        const loopLeft = timeToPixel(loop.startTime);
        const loopTop = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
        
        dragStateRef.current = {
          startX: x,
          startY: y,
          loopOffsetX: x - loopLeft,
          loopOffsetY: y - loopTop,
          initialStartTime: loop.startTime,
          initialTrackIndex: loop.trackIndex,
          initialEndTime: loop.endTime
        };
        
        onLoopSelect?.(loop.id);
        return;
      }
    }
    
    // Check for playhead click
    if (isNearPlayhead(x) && y > 0) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingPlayhead?.(true);
      setCursorStyle('col-resize');
      onPlayheadDragStart?.();
      return;
    }
    
    // Start selection box (if clicking on empty area)
    if (y > TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT) {
      e.preventDefault();
      
      setIsSelecting(true);
      setCursorStyle('crosshair');
      selectionStartRef.current = { x: viewportX, y: viewportY };
      onSelectionStart?.({ x: viewportX, y: viewportY });
    }
  }, [
    getMousePosition, getLoopAtPosition, getResizeZone, isNearPlayhead,
    lockFeatures, onLoopSelect, onPlayheadDragStart, onSelectionStart,
    setIsDraggingPlayhead, timeToPixel
  ]);

  const handleMouseUp = useCallback((e) => {
    // End any active operation
    if (isDraggingLoop) {
      updateSnapGuide(null, false);
      setIsDraggingLoop(false);
      setActiveLoop(null);
    }
    
    if (isResizing) {
      updateSnapGuide(null, false);
      setIsResizing(false);
      setResizeDirection(null);
      setActiveLoop(null);
    }
    
    if (isDraggingPlayhead) {
      setIsDraggingPlayhead?.(false);
      onPlayheadDragEnd?.();
    }
    
    if (isSelecting) {
      setIsSelecting(false);
      onSelectionEnd?.();
    }
    
    // Reset cursor based on current position
    const { x, y } = getMousePosition(e);
    setCursorStyle(calculateCursor(x, y));
    
    // Reset drag state
    dragStateRef.current = {};
    lastUpdateRef.current = 0;
  }, [
    isDraggingLoop, isResizing, isDraggingPlayhead, isSelecting,
    getMousePosition, calculateCursor, setIsDraggingPlayhead,
    onPlayheadDragEnd, onSelectionEnd, updateSnapGuide
  ]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    
    const { x, y } = getMousePosition(e);
    const loop = getLoopAtPosition(x, y);
    
    if (loop) {
      onContextMenu?.(e, loop);
    }
  }, [getMousePosition, getLoopAtPosition, onContextMenu]);

  const handleDoubleClick = useCallback((e) => {
    const { x, y } = getMousePosition(e);
    const loop = getLoopAtPosition(x, y);
    
    if (loop) {
      // Double-click on loop - could trigger rename or properties
      // For now, just select it
      onLoopSelect?.(loop.id);
    } else {
      // Double-click on empty area - seek to that position
      const time = pixelToTime(x);
      onSeek?.(Math.max(0, Math.min(duration, time)));
    }
  }, [getMousePosition, getLoopAtPosition, onLoopSelect, pixelToTime, onSeek, duration]);

  // ============================================================================
  // DRAG OPERATION HANDLERS
  // ============================================================================

  const handleLoopDrag = useCallback((e, x, y) => {
    if (!activeLoop) return;
    
    const targetLoopLeft = x - dragStateRef.current.loopOffsetX;
    const targetLoopTop = y - dragStateRef.current.loopOffsetY;
    
    let newStartTime = pixelToTime(targetLoopLeft);
    
    // Apply snapping
    const snapResult = applySnapping(newStartTime, activeLoop.id);
    newStartTime = snapResult.time;
    
    // Calculate track
    const yRelativeToTracks = targetLoopTop - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    const newTrackIndex = Math.floor(yRelativeToTracks / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    
    // Constrain values
    const loopDuration = activeLoop.endTime - activeLoop.startTime;
    const constrainedTrack = Math.max(0, Math.min(TIMELINE_CONSTANTS.NUM_TRACKS - 1, newTrackIndex));
    const constrainedStart = Math.max(0, Math.min(duration - loopDuration, newStartTime));
    
    // Throttle updates for performance
    const now = Date.now();
    if (now - lastUpdateRef.current > 50) {
      lastUpdateRef.current = now;
      
      onLoopUpdate?.(activeLoop.id, {
        trackIndex: constrainedTrack,
        startTime: constrainedStart,
        endTime: constrainedStart + loopDuration
      });
    }
  }, [activeLoop, pixelToTime, applySnapping, duration, onLoopUpdate]);

  const handleResizeDrag = useCallback((e, x) => {
    if (!activeLoop || !resizeDirection) return;
    
    const newTime = pixelToTime(x);
    const snapResult = applySnapping(newTime, activeLoop.id);
    const snappedTime = snapResult.time;
    
    let newStartTime = activeLoop.startTime;
    let newEndTime = activeLoop.endTime;
    
    if (resizeDirection === 'right') {
      // Minimum duration constraint
      const minEndTime = activeLoop.startTime + 0.5;
      newEndTime = Math.max(minEndTime, Math.min(duration, snappedTime));
    } else if (resizeDirection === 'left') {
      // Left resize
      const maxStartTime = activeLoop.endTime - 0.5;
      newStartTime = Math.max(0, Math.min(maxStartTime, snappedTime));
    }
    
    // Throttle updates
    const now = Date.now();
    if (now - lastUpdateRef.current > 50) {
      lastUpdateRef.current = now;
      
      onLoopResize?.(activeLoop.id, {
        startTime: newStartTime,
        endTime: newEndTime
      });
      
      // Also call onLoopUpdate for state consistency
      onLoopUpdate?.(activeLoop.id, {
        startTime: newStartTime,
        endTime: newEndTime
      });
    }
  }, [activeLoop, resizeDirection, pixelToTime, applySnapping, duration, onLoopResize, onLoopUpdate]);

  const handlePlayheadDrag = useCallback((e, x) => {
    const newTime = pixelToTime(x);
    const constrainedTime = Math.max(0, Math.min(duration, newTime));
    
    // Throttle for performance
    const now = Date.now();
    if (now - lastUpdateRef.current > 30) {
      lastUpdateRef.current = now;
      onSeek?.(constrainedTime);
    }
  }, [pixelToTime, duration, onSeek]);

  const handleSelectionDrag = useCallback((e, x, y) => {
    const { viewportX, viewportY } = getMousePosition(e);
    onSelectionUpdate?.({
      startX: selectionStartRef.current.x,
      startY: selectionStartRef.current.y,
      currentX: viewportX,
      currentY: viewportY
    });
  }, [getMousePosition, onSelectionUpdate]);

  // ============================================================================
  // KEYBOARD HANDLERS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        isShiftKeyRef.current = true;
      }
      
      // Delete selected loop
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLoop) {
        e.preventDefault();
        onLoopDelete?.(selectedLoop);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        isShiftKeyRef.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedLoop, onLoopDelete]);

  // ============================================================================
  // DRAG & DROP FROM LIBRARY
  // ============================================================================

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const { y } = getMousePosition(e);
    const trackIndex = getTrackIndexFromY(y);
    
    setHoveredTrack?.(trackIndex >= 0 ? trackIndex : null);
  }, [getMousePosition, getTrackIndexFromY, setHoveredTrack]);

  const handleDragLeave = useCallback(() => {
    setHoveredTrack?.(null);
  }, [setHoveredTrack]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    
    const { x, y } = getMousePosition(e);
    const trackIndex = getTrackIndexFromY(y);
    const startTime = pixelToTime(x);
    
    if (trackIndex >= 0 && trackIndex < TIMELINE_CONSTANTS.NUM_TRACKS && startTime >= 0) {
      try {
        const loopData = JSON.parse(e.dataTransfer.getData('application/json'));
        onLoopDrop?.(loopData, trackIndex, startTime);
      } catch (error) {
        console.error('Error parsing dropped loop data:', error);
      }
    }
    
    setHoveredTrack?.(null);
  }, [getMousePosition, getTrackIndexFromY, pixelToTime, onLoopDrop, setHoveredTrack]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="interaction-overlay absolute inset-0"
      style={{
        cursor: cursorStyle,
        zIndex: 50,
        // Transparent but captures all events
        backgroundColor: 'transparent',
        // CHROMEBOOK FIX: GPU acceleration to prevent cursor flicker
        willChange: 'cursor',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        isolation: 'isolate'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
};

export default InteractionOverlay;