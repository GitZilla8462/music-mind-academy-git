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

// DEBUG: Cursor state logging (disabled for production - enable for debugging)
const DEBUG_CURSOR = false;
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
      onSelectClose: () => {},
      // CHROMEBOOK FIX: Direct position access
      getLastMousePosition: () => ({ x: 0, y: 0 }),
      // CHROMEBOOK FIX: Cursor remount key
      cursorKey: 0
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

  // CHROMEBOOK FIX: Force cursor remount after dropdown to fix Chrome rendering bug
  // Start at 1 (not 0) so the first remount behaves like subsequent remounts
  const [cursorKey, setCursorKey] = useState(1);

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

  // CHROMEBOOK FIX: "Warm up" the cursor by forcing a remount cycle on page load
  // This ensures the cursor has been through a full mount/unmount/remount cycle
  // BEFORE the user interacts with any dropdown, fixing the first-dropdown-fails bug
  useEffect(() => {
    if (isChromebook) {
      // Wait for initial render to complete
      const warmupTimer = setTimeout(() => {
        logCursor('WARMUP: Starting cursor warmup cycle');
        // First remount
        setCursorKey(k => k + 1);

        setTimeout(() => {
          // Second remount
          setCursorKey(k => k + 1);
          logCursor('WARMUP: Cursor warmup complete');
        }, 100);
      }, 500); // Wait 500ms after mount for everything to stabilize

      return () => clearTimeout(warmupTimer);
    }
  }, []);

  // Ref to track drag state without re-renders
  const dragStateRef = useRef({
    isDragging: false,
    dragStartTime: 0,
    dropPosition: null // Track where the drop happened
  });

  // CHROMEBOOK FIX: Track last known mouse position for synthetic events
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // CHROMEBOOK FIX: Track pending synthetic mousemove timeout
  // This allows us to cancel it if a new dropdown opens before it fires
  const pendingSyntheticMousemoveRef = useRef(null);

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
  // PERF OPTIMIZED: Removed double-RAF, use single RAF for minimal latency
  const enableCustomCursor = useCallback(() => {
    logCursor('enableCustomCursor CALLED (drag end)');
    dragStateRef.current.isDragging = false;

    // CHROMEBOOK FIX: Immediately show default cursor to prevent invisible cursor gap
    if (isChromebook) {
      document.body.style.cursor = 'default';
      logCursor('enableCustomCursor SET body cursor to default');
    }

    // PERF: Single RAF is sufficient - no need for double RAF
    requestAnimationFrame(() => {
      if (!dragStateRef.current.isDragging) {
        logCursor('enableCustomCursor RAF complete, re-enabling custom cursor');
        setIsCustomCursorEnabled(isChromebook);
        setDraggingFromLibrary(false);
      }
    });
  }, []);

  // CHROMEBOOK FIX: Handle native select dropdown open/close
  // SIMPLIFIED: Don't disable custom cursor on dropdown open - just track the state
  // Hiding/showing was causing the cursor to disappear permanently on first interaction
  const onSelectOpen = useCallback(() => {
    logCursor('onSelectOpen CALLED (dropdown focused) - NOT disabling cursor');
    setIsSelectOpen(true);
    // Don't disable custom cursor - let it stay visible
    // The slight visual overlap is better than cursor disappearing
  }, []);

  const onSelectClose = useCallback(() => {
    logCursor('onSelectClose CALLED (dropdown blurred) - simplified, no cursor changes');
    setIsSelectOpen(false);
    // SIMPLIFIED: Don't do any cursor manipulation
    // Since we're not hiding cursor on open, we don't need to show it on close
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
          // Update last known position immediately
          lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
        // Re-enable cursor first, then dispatch synthetic mousemove
        enableCustomCursor();

        // PERF: Single RAF is sufficient - cursor re-enable happens in same frame
        if (e && e.clientX !== undefined) {
          requestAnimationFrame(() => {
            logCursor('handleDragEnd dispatching synthetic mousemove');
            const moveEvent = new MouseEvent('mousemove', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            });
            document.dispatchEvent(moveEvent);
          });
        }
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

  // CHROMEBOOK FIX: Getter for last mouse position so CustomCursor can position immediately
  const getLastMousePosition = useCallback(() => lastMousePosition.current, []);

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
    onSelectClose,
    // CHROMEBOOK FIX: Direct position access for immediate cursor positioning
    getLastMousePosition,
    // CHROMEBOOK FIX: Key to force cursor remount after dropdown
    cursorKey
  };

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
};

export default CursorContext;
