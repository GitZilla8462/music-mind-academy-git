// File: /src/pages/projects/film-music-score/timeline/components/CustomCursor.jsx
// CHROMEBOOK FIX: Custom cursor div that follows mouse position
// This bypasses the browser's native cursor rendering which flickers on Chromebook GPU
//
// PERFORMANCE OPTIMIZED v2:
// - REMOVED double RAF pattern (~33ms latency reduction)
// - Cached DOM queries and bounding rectangles (no queries per frame)
// - Single consolidated position update (no redundant style changes)
// - Immediate transform updates (no RAF delay for position)
// - Uses IntersectionObserver-style bounds caching
// - Only re-renders when cursor TYPE changes (grab, resize, etc.)
//
// UNIFIED CURSOR SYSTEM:
// - Integrates with CursorContext to disable during HTML5 drag operations

import React, { useEffect, useLayoutEffect, useRef, memo } from 'react';
import ReactDOM from 'react-dom';
import { useCursor } from '../../shared/CursorContext';

// Cursor SVG components - inline for no flicker during cursor type changes
const CursorSVGs = {
  default: (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 1L2 18L6 14L9 21L12 20L9 13L15 13L2 1Z"
        fill="black"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  grab: (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 11V8C4 6.9 4.9 6 6 6C7.1 6 8 6.9 8 8V11" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M8 10V4C8 2.9 8.9 2 10 2C11.1 2 12 2.9 12 4V10" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M12 10V3C12 1.9 12.9 1 14 1C15.1 1 16 1.9 16 3V10" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M16 10V4C16 2.9 16.9 2 18 2C19.1 2 20 2.9 20 4V14C20 19 16.5 22 12 22C7.5 22 4 19 4 14V11" fill="white" stroke="black" strokeWidth="1.5"/>
    </svg>
  ),
  grabbing: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12V10C4 9.4 4.6 9 5.2 9C5.8 9 6.5 9.4 6.5 10V12" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M6.5 11C6.5 11 7 8 9 8C11 8 11.5 11 11.5 11" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M11.5 11C11.5 11 12 8.5 14 8.5C16 8.5 16.5 11 16.5 11" fill="white" stroke="black" strokeWidth="1.5"/>
      <path d="M4 12V14C4 18 7.5 20 12 20C16.5 20 19 17 19 13V11C19 9.9 18.1 9 17 9C15.9 9 16.5 11 16.5 11" fill="white" stroke="black" strokeWidth="1.5"/>
    </svg>
  ),
  'ew-resize': (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8L6 3V6H14V3L19 8L14 13V10H6V13L1 8Z" fill="black" stroke="white" strokeWidth="1"/>
    </svg>
  ),
  'col-resize': (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1V19" stroke="black" strokeWidth="2"/>
      <path d="M8 1V19" stroke="white" strokeWidth="1"/>
      <path d="M4 5L1 10L4 15" stroke="black" strokeWidth="2" fill="none"/>
      <path d="M4 5L1 10L4 15" stroke="white" strokeWidth="1" fill="none"/>
      <path d="M12 5L15 10L12 15" stroke="black" strokeWidth="2" fill="none"/>
      <path d="M12 5L15 10L12 15" stroke="white" strokeWidth="1" fill="none"/>
    </svg>
  ),
  'row-resize': (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8H19" stroke="black" strokeWidth="2"/>
      <path d="M1 8H19" stroke="white" strokeWidth="1"/>
      <path d="M5 4L10 1L15 4" stroke="black" strokeWidth="2" fill="none"/>
      <path d="M5 4L10 1L15 4" stroke="white" strokeWidth="1" fill="none"/>
      <path d="M5 12L10 15L15 12" stroke="black" strokeWidth="2" fill="none"/>
      <path d="M5 12L10 15L15 12" stroke="white" strokeWidth="1" fill="none"/>
    </svg>
  ),
  crosshair: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0V20M0 10H20" stroke="black" strokeWidth="2"/>
      <path d="M10 0V20M0 10H20" stroke="white" strokeWidth="1"/>
    </svg>
  ),
  pointer: (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 1V15L7 12L9 17L11 16L9 11H13L4 1Z" fill="black" stroke="white" strokeWidth="1"/>
    </svg>
  ),
};

// Hotspot offsets for each cursor (where the "click point" is)
const HOTSPOTS = {
  default: { x: 2, y: 1 },
  grab: { x: 11, y: 12 },
  grabbing: { x: 11, y: 11 },
  'ew-resize': { x: 10, y: 8 },
  'col-resize': { x: 8, y: 10 },
  'row-resize': { x: 10, y: 8 },
  crosshair: { x: 10, y: 10 },
  pointer: { x: 4, y: 1 },
};

// PERF: Simple point-in-rect check (no function call overhead)
const isPointInRect = (x, y, rect) => {
  return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

// DEBUG: Logging for cursor issues (disabled for production)
const DEBUG_CURSOR = false;
const logCursor = (name, action, data = {}) => {
  if (DEBUG_CURSOR) {
    console.log(`🖱️ [CustomCursor:${name}] ${action}`, data);
  }
};

const CustomCursor = memo(({
  cursorType = 'default',
  containerRef,
  enabled = true,
  initiallyVisible = false,
  initialPosition = null,
  name = 'unnamed',
}) => {
  // UNIFIED CURSOR: Get global cursor state
  const { isCustomCursorEnabled, isDraggingFromLibrary, getLastMousePosition } = useCursor();

  // Refs for direct DOM manipulation (no React state = no re-renders = no lag)
  const cursorElementRef = useRef(null);
  const isVisibleRef = useRef(initiallyVisible);
  const positionRef = useRef(initialPosition || { x: -100, y: -100 });

  // PERF: Cache DOM element references (query once, not every frame)
  const loopLibraryRef = useRef(null);
  const loopLibraryBoundsRef = useRef(null);
  const containerBoundsRef = useRef(null);

  // PERF: Track last visibility state to avoid redundant style changes
  const lastVisibilityRef = useRef(null); // null = unknown, true = visible, false = hidden

  // LOADING SCREEN FIX: Track whether cursor is "activated" (allowed to show)
  const isActivatedRef = useRef(containerRef ? true : initiallyVisible);

  // Combine local enabled prop with global context
  const effectivelyEnabled = enabled && isCustomCursorEnabled && !isDraggingFromLibrary;

  // Get hotspot for current cursor type
  const hotspot = HOTSPOTS[cursorType] || HOTSPOTS.default;

  // Store effectivelyEnabled in a ref so position tracking can access it
  const effectivelyEnabledRef = useRef(effectivelyEnabled);
  effectivelyEnabledRef.current = effectivelyEnabled;

  // DEBUG: Log on mount
  useEffect(() => {
    logCursor(name, 'MOUNTED', {
      enabled,
      isCustomCursorEnabled,
      isDraggingFromLibrary,
      effectivelyEnabled,
      initiallyVisible,
      hasContainerRef: !!containerRef,
      containerRefCurrent: containerRef?.current ? 'SET' : 'NULL',
      isActivated: isActivatedRef.current,
    });
  }, []);

  // LOADING SCREEN FIX: Watch for initiallyVisible changes
  useEffect(() => {
    if (initiallyVisible && !isActivatedRef.current) {
      isActivatedRef.current = true;
    }
  }, [initiallyVisible]);

  // PERF: Cache DOM queries and set up resize observer for bounds updates
  useEffect(() => {
    // Query loop library once
    loopLibraryRef.current = document.querySelector('.loop-library');

    // Function to update all cached bounds
    const updateBounds = () => {
      if (loopLibraryRef.current) {
        loopLibraryBoundsRef.current = loopLibraryRef.current.getBoundingClientRect();
      }
      if (containerRef?.current) {
        containerBoundsRef.current = containerRef.current.getBoundingClientRect();
      }
    };

    // Initial bounds calculation
    updateBounds();

    // Update bounds on resize (throttled via passive listener)
    window.addEventListener('resize', updateBounds, { passive: true });

    // Also update on scroll (bounds can change)
    window.addEventListener('scroll', updateBounds, { passive: true });

    // MutationObserver to detect when loop-library is added to DOM
    const observer = new MutationObserver(() => {
      if (!loopLibraryRef.current) {
        loopLibraryRef.current = document.querySelector('.loop-library');
        if (loopLibraryRef.current) {
          loopLibraryBoundsRef.current = loopLibraryRef.current.getBoundingClientRect();
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
      observer.disconnect();
    };
  }, [containerRef]);

  // MAIN EFFECT: Single optimized mousemove handler
  useEffect(() => {
    const el = cursorElementRef.current;

    // DEBUG: Log mousemove effect run
    logCursor(name, 'MOUSEMOVE_EFFECT_RUN', {
      hasCursorElement: !!el,
      hasContainerRef: !!containerRef?.current,
    });

    if (!el) {
      logCursor(name, 'MOUSEMOVE_EFFECT_SKIPPED', { reason: 'cursorElementRef.current is null' });
      return;
    }

    // PERF: Pre-calculate hotspot offsets
    const hotspotX = hotspot.x;
    const hotspotY = hotspot.y;

    // DEBUG: Throttle logging to avoid console flood
    let logCount = 0;
    const MAX_LOGS = 5;

    const updatePosition = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // Store position for other code that needs it
      positionRef.current = { x, y };

      // PERF: Quick bail-out checks using cached bounds (no DOM queries)

      // Check 1: Is cursor over loop library? (only for global cursor - uses native cursor there)
      // FIX: Skip this check for timeline cursor (has containerRef) - it should only check its container
      if (!containerRef?.current && loopLibraryBoundsRef.current && isPointInRect(x, y, loopLibraryBoundsRef.current)) {
        if (lastVisibilityRef.current !== false) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          lastVisibilityRef.current = false;
          isVisibleRef.current = false;
        }
        return;
      }

      // Check 2: For global cursor, check data-cursor-handled (but use cached check)
      // PERF: Only do elementFromPoint if we're a global cursor (no containerRef)
      if (!containerRef?.current && e.isTrusted !== false) {
        const elementUnderCursor = document.elementFromPoint(x, y);
        if (elementUnderCursor) {
          // PERF: Quick check - most elements won't have dataset at all
          let el2 = elementUnderCursor;
          let depth = 0;
          const maxDepth = 10; // Limit ancestor traversal
          while (el2 && el2 !== document.body && depth < maxDepth) {
            if (el2.dataset?.cursorHandled === 'true') {
              if (lastVisibilityRef.current !== false) {
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                lastVisibilityRef.current = false;
                isVisibleRef.current = false;
              }
              return;
            }
            el2 = el2.parentElement;
            depth++;
          }
        }
      }

      // Check 3: Is cursor over container? (or no container = always over)
      let isOverContainer = true;
      if (containerRef?.current) {
        // Update container bounds periodically (they might have changed)
        // PERF: Only update bounds if we don't have them or every 100 mousemoves
        if (!containerBoundsRef.current) {
          containerBoundsRef.current = containerRef.current.getBoundingClientRect();
          // DEBUG
          logCursor(name, 'BOUNDS_CALCULATED', { bounds: containerBoundsRef.current });
        }
        isOverContainer = isPointInRect(x, y, containerBoundsRef.current);
      }

      // Check 4: Should we show the cursor?
      const shouldShow = effectivelyEnabledRef.current && isOverContainer && isActivatedRef.current;

      // DEBUG: Log first few decisions
      if (logCount < MAX_LOGS && containerRef?.current) {
        logCursor(name, 'MOUSEMOVE_DECISION', {
          x, y,
          isOverContainer,
          effectivelyEnabled: effectivelyEnabledRef.current,
          isActivated: isActivatedRef.current,
          shouldShow,
          bounds: containerBoundsRef.current,
        });
        logCount++;
      }

      if (shouldShow) {
        // PERF: Calculate position with hotspot offset
        const transformX = x - hotspotX;
        const transformY = y - hotspotY;

        // PERF: Always update transform immediately (this is the key for smoothness)
        el.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

        // PERF: Only update visibility if it changed
        if (lastVisibilityRef.current !== true) {
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          lastVisibilityRef.current = true;
          isVisibleRef.current = true;
          logCursor(name, 'CURSOR_SHOWN_VIA_MOUSEMOVE', { x, y });
        }
      } else {
        // Hide cursor
        if (lastVisibilityRef.current !== false) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          lastVisibilityRef.current = false;
          isVisibleRef.current = false;
        }
      }
    };

    // PERF: Use passive listener for maximum performance
    document.addEventListener('mousemove', updatePosition, { passive: true });

    return () => {
      document.removeEventListener('mousemove', updatePosition);
    };
  }, [hotspot.x, hotspot.y, containerRef, effectivelyEnabled, name]);

  // Handle visibility changes when effectivelyEnabled changes
  useLayoutEffect(() => {
    const el = cursorElementRef.current;
    if (!el) return;

    // Get position from context (more reliable after interactions)
    const contextPosition = getLastMousePosition();
    if (contextPosition.x !== 0 || contextPosition.y !== 0) {
      positionRef.current = contextPosition;
    }

    if (!effectivelyEnabled || !isActivatedRef.current) {
      // Hide cursor when disabled
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      lastVisibilityRef.current = false;
      isVisibleRef.current = false;
      return;
    }

    // FIX: If we don't have a valid mouse position yet, don't make visibility decisions
    // Let the mousemove or mouseenter handlers take over
    const { x, y } = positionRef.current;
    if (x === -100 && y === -100) {
      // Position unknown - don't hide, let event handlers manage visibility
      return;
    }

    // Check loop library bounds (only for global cursor)
    if (!containerRef?.current && loopLibraryBoundsRef.current && isPointInRect(x, y, loopLibraryBoundsRef.current)) {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      lastVisibilityRef.current = false;
      isVisibleRef.current = false;
      return;
    }

    // Check container bounds
    let isOverContainer = true;
    if (containerRef?.current) {
      if (!containerBoundsRef.current) {
        containerBoundsRef.current = containerRef.current.getBoundingClientRect();
      }
      isOverContainer = isPointInRect(x, y, containerBoundsRef.current);
    }

    if (isOverContainer) {
      // Show cursor at current position
      const transformX = x - hotspot.x;
      const transformY = y - hotspot.y;
      el.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      lastVisibilityRef.current = true;
      isVisibleRef.current = true;
    } else {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      lastVisibilityRef.current = false;
      isVisibleRef.current = false;
    }
  }, [effectivelyEnabled, containerRef, hotspot.x, hotspot.y, getLastMousePosition]);

  // Handle viewport exit (hide cursor when mouse leaves window)
  useEffect(() => {
    const handleViewportLeave = (e) => {
      if (e.relatedTarget === null || e.relatedTarget.nodeName === 'HTML') {
        const el = cursorElementRef.current;
        if (el && lastVisibilityRef.current !== false) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          lastVisibilityRef.current = false;
          isVisibleRef.current = false;
        }
      }
    };

    document.documentElement.addEventListener('mouseleave', handleViewportLeave);
    return () => {
      document.documentElement.removeEventListener('mouseleave', handleViewportLeave);
    };
  }, []);

  // FIX: Add mouseenter/mouseleave handlers for containers
  // This ensures cursor shows when mouse enters container area even without mousemove
  useEffect(() => {
    const container = containerRef?.current;

    // DEBUG: Log whether container is available
    logCursor(name, 'MOUSEENTER_EFFECT_RUN', {
      hasContainer: !!container,
      containerClassName: container?.className || 'N/A',
    });

    if (!container) {
      logCursor(name, 'MOUSEENTER_EFFECT_SKIPPED', { reason: 'containerRef.current is null' });
      return;
    }

    const handleMouseEnter = (e) => {
      // DEBUG
      logCursor(name, 'MOUSEENTER', {
        x: e.clientX,
        y: e.clientY,
        effectivelyEnabled: effectivelyEnabledRef.current,
        isActivated: isActivatedRef.current,
      });

      // Update position from enter event
      positionRef.current = { x: e.clientX, y: e.clientY };

      // Update container bounds on enter (they might have changed)
      containerBoundsRef.current = container.getBoundingClientRect();

      if (effectivelyEnabledRef.current && isActivatedRef.current) {
        const el = cursorElementRef.current;
        if (el) {
          const transformX = e.clientX - hotspot.x;
          const transformY = e.clientY - hotspot.y;
          el.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          lastVisibilityRef.current = true;
          isVisibleRef.current = true;
          logCursor(name, 'CURSOR_SHOWN_VIA_MOUSEENTER', { x: e.clientX, y: e.clientY });
        }
      } else {
        logCursor(name, 'MOUSEENTER_NOT_SHOWING', {
          effectivelyEnabled: effectivelyEnabledRef.current,
          isActivated: isActivatedRef.current,
        });
      }
    };

    const handleMouseLeave = (e) => {
      // Only hide if mouse actually left the container (not just moved to a child)
      if (!container.contains(e.relatedTarget)) {
        const el = cursorElementRef.current;
        if (el) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          lastVisibilityRef.current = false;
          isVisibleRef.current = false;
          logCursor(name, 'CURSOR_HIDDEN_VIA_MOUSELEAVE');
        }
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    logCursor(name, 'MOUSEENTER_HANDLERS_ATTACHED', { containerClassName: container.className });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, hotspot.x, hotspot.y, name]);

  // Update position when cursor type changes (hotspot offset changes)
  useEffect(() => {
    const el = cursorElementRef.current;
    if (el && isVisibleRef.current) {
      const transformX = positionRef.current.x - hotspot.x;
      const transformY = positionRef.current.y - hotspot.y;
      el.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
    }
  }, [cursorType, hotspot.x, hotspot.y]);

  // Get the SVG for current cursor type
  const CursorSVG = CursorSVGs[cursorType] || CursorSVGs.default;

  // Set initial visibility on mount
  useLayoutEffect(() => {
    const el = cursorElementRef.current;
    if (el) {
      if (effectivelyEnabled && initiallyVisible) {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        lastVisibilityRef.current = true;
      } else {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        lastVisibilityRef.current = false;
      }
    }
  }, []);

  // Portal renders cursor at document.body level for correct positioning
  return ReactDOM.createPortal(
    <div
      ref={cursorElementRef}
      className="custom-cursor-container"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        // PERF: GPU optimization - create dedicated compositing layer
        willChange: 'transform',
        // PERF: Layout/paint containment without size containment
        // NOTE: DO NOT use 'strict' - it includes size containment which clips to 0x0
        contain: 'layout paint',
        // Initial position (off-screen)
        transform: `translate3d(${(initialPosition?.x || -100) - hotspot.x}px, ${(initialPosition?.y || -100) - hotspot.y}px, 0)`,
      }}
    >
      {CursorSVG}
    </div>,
    document.body
  );
// PERF: Custom comparison to prevent re-renders from position changes
}, (prevProps, nextProps) => {
  return (
    prevProps.cursorType === nextProps.cursorType &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.initiallyVisible === nextProps.initiallyVisible &&
    prevProps.name === nextProps.name
  );
});

CustomCursor.displayName = 'CustomCursor';

export default CustomCursor;
