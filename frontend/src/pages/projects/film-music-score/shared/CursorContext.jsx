// File: /src/pages/projects/film-music-score/shared/CursorContext.jsx
// UNIFIED CURSOR MANAGER
// Solves the "cursor stuck in two places" issue on Chromebooks by:
// 1. Providing a single source of truth for cursor state
// 2. Coordinating between HTML5 drag-drop (LoopLibrary) and InteractionOverlay
// 3. Disabling CustomCursor during library drag operations

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Detect Chromebook/ChromeOS
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

const CursorContext = createContext(null);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    // Return a no-op fallback if used outside provider
    return {
      cursorType: 'default',
      setCursorType: () => {},
      isDraggingFromLibrary: false,
      setDraggingFromLibrary: () => {},
      isCustomCursorEnabled: false,
      disableCustomCursor: () => {},
      enableCustomCursor: () => {},
      isChromebook: false
    };
  }
  return context;
};

export const CursorProvider = ({ children }) => {
  // Current cursor type (default, grab, grabbing, ew-resize, col-resize, crosshair)
  const [cursorType, setCursorType] = useState('default');

  // Whether we're currently dragging from the loop library (HTML5 drag-drop)
  const [isDraggingFromLibrary, setDraggingFromLibrary] = useState(false);

  // Whether custom cursor should be shown (disabled during library drag)
  const [isCustomCursorEnabled, setIsCustomCursorEnabled] = useState(isChromebook);

  // Ref to track drag state without re-renders
  const dragStateRef = useRef({
    isDragging: false,
    dragStartTime: 0,
    dropPosition: null // Track where the drop happened
  });

  // Disable custom cursor (called when HTML5 drag starts)
  const disableCustomCursor = useCallback(() => {
    dragStateRef.current.isDragging = true;
    dragStateRef.current.dragStartTime = Date.now();
    setIsCustomCursorEnabled(false);
    setDraggingFromLibrary(true);

    // Set grabbing cursor on body during drag
    if (isChromebook) {
      document.body.style.cursor = 'grabbing';
    }
  }, []);

  // Re-enable custom cursor (called when drag ends)
  const enableCustomCursor = useCallback(() => {
    dragStateRef.current.isDragging = false;

    // Small delay to prevent flicker during drop transition
    setTimeout(() => {
      if (!dragStateRef.current.isDragging) {
        setIsCustomCursorEnabled(isChromebook);
        setDraggingFromLibrary(false);

        // Reset body cursor
        if (isChromebook) {
          document.body.style.cursor = '';
        }
      }
    }, 50);
  }, []);

  // Global drag event listeners to catch drag end even if drop happens outside
  useEffect(() => {
    const handleDragEnd = (e) => {
      if (dragStateRef.current.isDragging) {
        // Capture drop position so cursor can appear there (not where drag started)
        if (e && e.clientX !== undefined && e.clientY !== undefined) {
          dragStateRef.current.dropPosition = { x: e.clientX, y: e.clientY };
          // Dispatch a synthetic mousemove to update cursor position
          setTimeout(() => {
            const moveEvent = new MouseEvent('mousemove', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            });
            document.dispatchEvent(moveEvent);
          }, 60); // After cursor re-enables (50ms delay in enableCustomCursor)
        }
        enableCustomCursor();
      }
    };

    // Listen for dragend on document to catch all cases
    document.addEventListener('dragend', handleDragEnd);

    // Also listen for drop in case dragend doesn't fire
    document.addEventListener('drop', handleDragEnd);

    // Fallback: if drag lasts more than 10 seconds, assume it ended
    const checkStale = setInterval(() => {
      if (dragStateRef.current.isDragging &&
          Date.now() - dragStateRef.current.dragStartTime > 10000) {
        enableCustomCursor();
      }
    }, 1000);

    return () => {
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', handleDragEnd);
      clearInterval(checkStale);
    };
  }, [enableCustomCursor]);

  const value = {
    cursorType,
    setCursorType,
    isDraggingFromLibrary,
    setDraggingFromLibrary,
    isCustomCursorEnabled,
    disableCustomCursor,
    enableCustomCursor,
    isChromebook
  };

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
};

export default CursorContext;
