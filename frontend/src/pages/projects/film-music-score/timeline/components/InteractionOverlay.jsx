// File: /src/pages/projects/film-music-score/timeline/components/InteractionOverlay.jsx
// OVERLAY PATTERN: Single transparent layer handles ALL mouse events
// This eliminates cursor flickering by having ONE element control the cursor
// Professional web DAWs (Soundtrap, BandLab) use this same approach
//
// UNIFIED CURSOR SYSTEM:
// - Now integrates with CursorContext for coordinated cursor management
// - Respects isDraggingFromLibrary to hide custom cursor during library drag

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';
import CustomCursor from './CustomCursor.jsx';
import { useCursor } from '../../shared/CursorContext';

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
  // UNIFIED CURSOR: Get global cursor state from context
  const { isChromebook, isDraggingFromLibrary, isCustomCursorEnabled } = useCursor();

  // CHROMEBOOK FIX: Use ref instead of state for cursor to prevent flicker on re-renders
  // State changes cause re-renders which briefly reset cursor to default
  const overlayRef = useRef(null);
  const currentCursorRef = useRef('default');

  // CHROMEBOOK FIX: Track cursor type in state for CustomCursor component
  // This is separate from the DOM cursor style
  const [cursorType, setCursorType] = useState('default');
  
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

  // CHROMEBOOK OPTIMIZED: Cache CSS zoom to avoid DOM tree traversal on every mouse move
  const cachedCssZoomRef = useRef(1);

  // Calculate and cache CSS zoom on mount and resize
  useEffect(() => {
    const calculateCssZoom = () => {
      if (!timelineRef.current) return;

      let zoom = 1;
      let element = timelineRef.current;
      while (element) {
        const style = window.getComputedStyle(element);
        const z = parseFloat(style.zoom);
        if (z && z !== 1) {
          zoom *= z;
        }
        element = element.parentElement;
      }
      cachedCssZoomRef.current = zoom;
    };

    // Calculate initially
    calculateCssZoom();

    // Recalculate on resize (zoom might change with responsive layouts)
    window.addEventListener('resize', calculateCssZoom);

    // Also recalculate after a short delay (for dynamic zoom changes)
    const timeoutId = setTimeout(calculateCssZoom, 100);

    return () => {
      window.removeEventListener('resize', calculateCssZoom);
      clearTimeout(timeoutId);
    };
  }, [timelineRef]);

  // CHROMEBOOK FIX: Direct DOM cursor update - bypasses React state entirely
  // This prevents cursor flicker during re-renders from auto-save, session updates, etc.
  // On Chromebook, we also update cursorType state for the CustomCursor component
  //
  // UNIFIED CURSOR: When dragging from library, show native cursor instead of hiding
  const setCursor = useCallback((cursor) => {
    if (currentCursorRef.current !== cursor) {
      currentCursorRef.current = cursor;

      // Update DOM cursor
      // - On Chromebook with custom cursor enabled: hide native cursor
      // - During library drag: show native cursor (custom cursor is disabled)
      // - Otherwise: show native cursor
      if (overlayRef.current) {
        const shouldHideNativeCursor = isChromebook && isCustomCursorEnabled && !isDraggingFromLibrary;
        overlayRef.current.style.cursor = shouldHideNativeCursor ? 'none' : cursor;
      }

      // Update state for CustomCursor (Chromebook only, but safe to always update)
      setCursorType(cursor);
    }
  }, [isChromebook, isCustomCursorEnabled, isDraggingFromLibrary]);

  // ============================================================================
  // HIT TESTING FUNCTIONS - Mathematical detection, no DOM events
  // ============================================================================
  
  /**
   * Get mouse position relative to timeline content area
   * Handles: CSS zoom, browser zoom, display scaling, and various Chromebook configurations
   * CHROMEBOOK OPTIMIZED: Uses cached CSS zoom instead of recalculating on every call
   */
  const getMousePosition = useCallback((e) => {
    if (!timelineRef.current) return { x: 0, y: 0 };

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const scrollTop = timelineScrollRef.current?.scrollTop || 0;

    // Use cached CSS zoom instead of walking DOM tree on every mouse move
    const cssZoom = cachedCssZoomRef.current;

    // Calculate position relative to the element
    // clientX/Y are already in viewport coordinates, rect is also in viewport coordinates
    // But if CSS zoom is applied, rect is scaled but clientX/Y are not
    const viewportX = (e.clientX - rect.left) / cssZoom;
    const viewportY = (e.clientY - rect.top) / cssZoom;

    return {
      x: viewportX + scrollLeft,
      y: viewportY + scrollTop,
      viewportX: viewportX,
      viewportY: viewportY
    };
  }, [timelineRef, timelineScrollRef]);

  /**
   * Find which loop (if any) is under the mouse position
   * FIXED: Account for CSS zoom when comparing coordinates
   * FIXED: Don't double-add scroll offset - use viewport coordinates consistently
   * CHROMEBOOK OPTIMIZED: Uses cached CSS zoom
   */
  const getLoopAtPosition = useCallback((x, y) => {
    if (!placedLoops || placedLoops.length === 0) return null;
    if (!timelineRef.current) return null;

    // Use cached CSS zoom instead of walking DOM tree
    const cssZoom = cachedCssZoomRef.current;

    // Get timeline's position for coordinate conversion
    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    // Convert x, y (which include scroll offset) back to viewport-relative
    // since getBoundingClientRect returns viewport coordinates
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const scrollTop = timelineScrollRef.current?.scrollTop || 0;
    const viewportX = x - scrollLeft;
    const viewportY = y - scrollTop;
    
    // Check loops in reverse order (top-most first based on render order)
    // Use actual DOM elements for hit detection to handle different screen sizes/scaling
    for (let i = placedLoops.length - 1; i >= 0; i--) {
      const loop = placedLoops[i];
      
      // Skip if track is hidden
      if (trackStates[`track-${loop.trackIndex}`]?.visible === false) continue;
      
      // Find the actual DOM element for this loop
      const loopElement = timelineRef.current.querySelector(`[data-loop-id="${loop.id}"]`);
      
      if (loopElement) {
        const loopRect = loopElement.getBoundingClientRect();
        
        // Convert loop rect to be relative to timeline, accounting for CSS zoom
        // getBoundingClientRect returns viewport coordinates (already accounts for scroll)
        // so we compare with viewportX/viewportY, not x/y
        const left = (loopRect.left - timelineRect.left) / cssZoom;
        const right = (loopRect.right - timelineRect.left) / cssZoom;
        const top = (loopRect.top - timelineRect.top) / cssZoom;
        const bottom = (loopRect.bottom - timelineRect.top) / cssZoom;
        
        if (viewportX >= left && viewportX <= right && viewportY >= top && viewportY <= bottom) {
          return loop;
        }
      } else {
        // Fallback to calculated position if DOM element not found
        // These ARE in content coordinates, so use x/y directly
        const left = timeToPixel(loop.startTime);
        const right = timeToPixel(loop.endTime);
        const top = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
        const bottom = top + TIMELINE_CONSTANTS.TRACK_HEIGHT;
        
        if (x >= left && x <= right && y >= top && y <= bottom) {
          return loop;
        }
      }
    }
    return null;
  }, [placedLoops, trackStates, timeToPixel, timelineRef, timelineScrollRef]);

  /**
   * Determine if mouse is in a resize zone (within threshold of loop edge)
   * Uses actual DOM position for accurate hit detection
   * FIXED: Account for CSS zoom and increased threshold for easier grabbing
   * FIXED: Use viewport coordinates consistently (don't double-add scroll)
   * CHROMEBOOK OPTIMIZED: Uses cached CSS zoom
   */
  const getResizeZone = useCallback((x, loop) => {
    if (!loop) return null;
    if (!timelineRef.current) return null;

    // Increased threshold for easier grabbing, especially with CSS zoom
    const RESIZE_THRESHOLD = 20; // pixels (increased from 12)

    // Convert x (which includes scroll) back to viewport-relative
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const viewportX = x - scrollLeft;

    // Try to get actual DOM element position
    const loopElement = timelineRef.current.querySelector(`[data-loop-id="${loop.id}"]`);

    if (loopElement) {
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const loopRect = loopElement.getBoundingClientRect();

      // Use cached CSS zoom instead of walking DOM tree
      const cssZoom = cachedCssZoomRef.current;

      // Calculate right edge position in viewport coordinates, accounting for zoom
      // getBoundingClientRect returns viewport coordinates (no scroll needed)
      const right = (loopRect.right - timelineRect.left) / cssZoom;
      
      // Check if mouse is in resize zone (using viewportX, not x)
      if (viewportX >= right - RESIZE_THRESHOLD && viewportX <= right + 8) {
        return 'right';
      }
    } else {
      // Fallback to calculated position (these are in content coordinates, use x)
      const right = timeToPixel(loop.endTime);
      if (x >= right - RESIZE_THRESHOLD && x <= right + 8) {
        return 'right';
      }
    }
    
    return null;
  }, [timeToPixel, timelineRef, timelineScrollRef]);

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
    
    // CHROMEBOOK FIX: Update cursor via direct DOM manipulation (not React state)
    // This prevents flicker during re-renders from auto-save, session updates, etc.
    // Throttle to 16ms (60fps) for smooth cursor movement on Chromebook
    if (!isDraggingLoop && !isResizing && !isDraggingPlayhead && !isSelecting) {
      const now = Date.now();
      if (now - cursorUpdateRef.current > 16) {
        cursorUpdateRef.current = now;
        setCursor(calculateCursor(x, y));
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
      
      if (resizeZone) {
        // Start resize
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(true);
        setResizeDirection(resizeZone);
        setActiveLoop(loop);
        setCursor('ew-resize');
        
        dragStateRef.current = {
          initialStartTime: loop.startTime,
          initialEndTime: loop.endTime,
          startX: x
        };
        
        onLoopSelect?.(loop.id);
        return;
      }
      
      // Start loop drag - no lockFeatures restrictions
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingLoop(true);
      setActiveLoop(loop);
      setCursor('grabbing');
      
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
    
    // Check for playhead click
    if (isNearPlayhead(x) && y > 0) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingPlayhead?.(true);
      setCursor('col-resize');
      onPlayheadDragStart?.();
      return;
    }
    
    // Start selection box (if clicking on empty area)
    if (y > TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT) {
      e.preventDefault();
      
      setIsSelecting(true);
      setCursor('crosshair');
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
    setCursor(calculateCursor(x, y));
    
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
    if (!timelineRef.current) return;
    
    const targetLoopLeft = x - dragStateRef.current.loopOffsetX;
    const targetLoopTop = y - dragStateRef.current.loopOffsetY;
    
    let newStartTime = pixelToTime(targetLoopLeft);
    
    // Apply snapping
    const snapResult = applySnapping(newStartTime, activeLoop.id);
    newStartTime = snapResult.time;
    
    // Calculate track index using constants (more reliable than DOM queries)
    // CHROMEBOOK FIX: DOM getBoundingClientRect returns viewport pixels,
    // but our y coordinate is already zoom-corrected, causing ~1 track offset
    const yRelativeToTracks = targetLoopTop - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    const newTrackIndex = Math.floor(yRelativeToTracks / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    
    // Constrain values
    const loopDuration = activeLoop.endTime - activeLoop.startTime;
    const constrainedTrack = Math.max(0, Math.min(TIMELINE_CONSTANTS.NUM_TRACKS - 1, newTrackIndex));
    const constrainedStart = Math.max(0, Math.min(duration - loopDuration, newStartTime));
    
    // Throttle updates for performance (25ms = ~40fps, balanced for Chromebook)
    const now = Date.now();
    if (now - lastUpdateRef.current > 25) {
      lastUpdateRef.current = now;
      
      onLoopUpdate?.(activeLoop.id, {
        trackIndex: constrainedTrack,
        startTime: constrainedStart,
        endTime: constrainedStart + loopDuration
      });
    }
  }, [activeLoop, pixelToTime, applySnapping, duration, onLoopUpdate, timelineRef, timelineScrollRef]);

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
    
    // Throttle updates (25ms = ~40fps, balanced for Chromebook)
    const now = Date.now();
    if (now - lastUpdateRef.current > 25) {
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

  // UNIFIED CURSOR: Determine if custom cursor should be active
  // Only active when: Chromebook + custom cursor enabled + not dragging from library
  const isCustomCursorActive = isChromebook && isCustomCursorEnabled && !isDraggingFromLibrary;

  // UNIFIED CURSOR: Determine native cursor style
  // During library drag, show the native cursor; otherwise hide on Chromebook
  const nativeCursorStyle = isCustomCursorActive ? 'none' : 'default';

  return (
    <>
      {/* CHROMEBOOK FIX: Always render CustomCursor on Chromebook to avoid mount/unmount delays */}
      {/* The component handles its own visibility internally via CursorContext */}
      {isChromebook && (
        <CustomCursor
          name="TIMELINE"
          cursorType={cursorType}
          containerRef={overlayRef}
          enabled={true}
        />
      )}

      <div
        ref={overlayRef}
        className="interaction-overlay absolute inset-0"
        data-cursor-handled="true"
        style={{
          // UNIFIED CURSOR: Show native cursor during library drag
          cursor: nativeCursorStyle,
          zIndex: 50,
          // Transparent but captures all events
          backgroundColor: 'transparent',
          // GPU acceleration
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
    </>
  );
};

export default InteractionOverlay;