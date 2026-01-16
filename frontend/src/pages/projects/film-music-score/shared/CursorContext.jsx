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

// DEBUG: Cursor state logging
const DEBUG_CURSOR = true;
const logCursor = (action, data = {}) => {
  if (DEBUG_CURSOR) {
    console.log(`🖱️ [Cursor] ${action}`, {
      ...data,
      bodyCursor: document.body.style.cursor,
      isChromebook,
      timestamp: new Date().toISOString().split('T')[1]
    });
  }
};

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
      isChromebook: false,
      // CHROMEBOOK FIX: Select/dropdown tracking
      onSelectOpen: () => {},
      onSelectClose: () => {}
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

  // CHROMEBOOK FIX: Track when native select dropdowns are open
  // Native selects render outside React DOM, causing two cursors to appear
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // DEBUG: Log state changes
  useEffect(() => {
    logCursor('STATE CHANGE', {
      isCustomCursorEnabled,
      isDraggingFromLibrary,
      isSelectOpen,
      cursorType
    });
  }, [isCustomCursorEnabled, isDraggingFromLibrary, isSelectOpen, cursorType]);

  // DEBUG: Log on mount
  useEffect(() => {
    logCursor('CursorProvider MOUNTED', { isChromebook });
  }, []);

  // Ref to track drag state without re-renders
  const dragStateRef = useRef({
    isDragging: false,
    dragStartTime: 0,
    dropPosition: null // Track where the drop happened
  });

  // CHROMEBOOK FIX: Track last known mouse position for synthetic events
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Disable custom cursor (called when HTML5 drag starts)
  const disableCustomCursor = useCallback(() => {
    logCursor('disableCustomCursor CALLED (drag start)');
    dragStateRef.current.isDragging = true;
    dragStateRef.current.dragStartTime = Date.now();
    setIsCustomCursorEnabled(false);
    setDraggingFromLibrary(true);

    // Set grabbing cursor on body during drag
    if (isChromebook) {
      document.body.style.cursor = 'grabbing';
      logCursor('disableCustomCursor SET body cursor to grabbing');
    }
  }, []);

  // Re-enable custom cursor (called when drag ends)
  // CHROMEBOOK FIX: Use requestAnimationFrame instead of fixed timeouts
  // This syncs with the actual render cycle instead of guessing timing
  const enableCustomCursor = useCallback(() => {
    logCursor('enableCustomCursor CALLED (drag end)');
    dragStateRef.current.isDragging = false;

    // CHROMEBOOK FIX: Immediately show default cursor to prevent invisible cursor gap
    // The custom cursor will take over once it's positioned
    if (isChromebook) {
      document.body.style.cursor = 'default';
      logCursor('enableCustomCursor SET body cursor to default');
    }

    // Use requestAnimationFrame to sync with render cycle
    // Double-RAF ensures the browser has completed the current frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!dragStateRef.current.isDragging) {
          logCursor('enableCustomCursor RAF complete, re-enabling custom cursor');
          setIsCustomCursorEnabled(isChromebook);
          setDraggingFromLibrary(false);
        }
      });
    });
  }, []);

  // CHROMEBOOK FIX: Handle native select dropdown open/close
  // Native selects render outside React DOM, so we need to hide custom cursor
  const onSelectOpen = useCallback(() => {
    logCursor('onSelectOpen CALLED (dropdown focused)');
    setIsSelectOpen(true);
    setIsCustomCursorEnabled(false);
    // CHROMEBOOK FIX: Ensure native cursor is visible when custom cursor is disabled
    if (isChromebook) {
      document.body.style.cursor = 'default';
      logCursor('onSelectOpen SET body cursor to default');
    }
  }, []);

  const onSelectClose = useCallback(() => {
    logCursor('onSelectClose CALLED (dropdown blurred)');
    setIsSelectOpen(false);
    // CHROMEBOOK FIX: Immediately re-enable custom cursor (no RAF delay)
    // The RAF delay was causing cursor to disappear when user quickly moved to timeline
    // after selecting from dropdown
    if (!dragStateRef.current.isDragging) {
      logCursor('onSelectClose re-enabling custom cursor immediately');
      setIsCustomCursorEnabled(isChromebook);
      // Keep body cursor as 'default' instead of empty string
      if (isChromebook) {
        document.body.style.cursor = 'default';
        logCursor('onSelectClose SET body cursor to default');
      }
      // CHROMEBOOK FIX: Dispatch synthetic mousemove to trigger cursor visibility update
      // This is needed because the user may have stopped moving before state updated
      // Use setTimeout to ensure React has fully completed re-rendering
      // RAF alone isn't enough because React 18's concurrent rendering can defer updates
      setTimeout(() => {
        logCursor('onSelectClose dispatching synthetic mousemove', lastMousePosition.current);
        const moveEvent = new MouseEvent('mousemove', {
          clientX: lastMousePosition.current.x,
          clientY: lastMousePosition.current.y,
          bubbles: true
        });
        document.dispatchEvent(moveEvent);
      }, 50);
    } else {
      logCursor('onSelectClose still dragging - skipping re-enable');
    }
  }, []);

  // CHROMEBOOK FIX: Global mousemove listener to track last known position
  // This is needed so we can dispatch synthetic mousemove after dropdown closes
  useEffect(() => {
    const trackMousePosition = (e) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', trackMousePosition, { passive: true });
    return () => {
      document.removeEventListener('mousemove', trackMousePosition);
    };
  }, []);

  // Global drag event listeners to catch drag end even if drop happens outside
  useEffect(() => {
    const handleDragEnd = (e) => {
      logCursor('handleDragEnd EVENT fired', {
        isDragging: dragStateRef.current.isDragging,
        eventType: e.type,
        clientX: e.clientX,
        clientY: e.clientY
      });
      if (dragStateRef.current.isDragging) {
        // Capture drop position so cursor can appear there (not where drag started)
        if (e && e.clientX !== undefined && e.clientY !== undefined) {
          dragStateRef.current.dropPosition = { x: e.clientX, y: e.clientY };
          // Dispatch a synthetic mousemove to update cursor position
          // CHROMEBOOK FIX: Use triple-RAF to ensure cursor is re-enabled first
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                logCursor('handleDragEnd dispatching synthetic mousemove');
                const moveEvent = new MouseEvent('mousemove', {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  bubbles: true
                });
                document.dispatchEvent(moveEvent);
              });
            });
          });
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
    isChromebook,
    // CHROMEBOOK FIX: Select/dropdown tracking
    isSelectOpen,
    onSelectOpen,
    onSelectClose
  };

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
};

export default CursorContext;
