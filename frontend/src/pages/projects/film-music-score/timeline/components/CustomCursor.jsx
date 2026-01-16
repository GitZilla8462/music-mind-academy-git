// File: /src/pages/projects/film-music-score/timeline/components/CustomCursor.jsx
// CHROMEBOOK FIX: Custom cursor div that follows mouse position
// This bypasses the browser's native cursor rendering which flickers on Chromebook GPU
//
// PERFORMANCE OPTIMIZED:
// - Uses direct DOM manipulation instead of React state for position updates
// - Zero React re-renders during mouse movement = no lag
// - Only re-renders when cursor TYPE changes (grab, resize, etc.)
//
// UNIFIED CURSOR SYSTEM:
// - Integrates with CursorContext to disable during HTML5 drag operations
//
// NOTE: There is a known bug where cursor disappears after dropdown selection on Chromebook.
// See CHROMEBOOK_CURSOR_BUG_NOTES.md for investigation details.

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

  // Combine local enabled prop with global context
  const effectivelyEnabled = enabled && isCustomCursorEnabled && !isDraggingFromLibrary;

  // Get hotspot for current cursor type
  const hotspot = HOTSPOTS[cursorType] || HOTSPOTS.default;

  // Store effectivelyEnabled in a ref so position tracking can access it without re-subscribing
  const effectivelyEnabledRef = useRef(effectivelyEnabled);
  effectivelyEnabledRef.current = effectivelyEnabled;

  // EFFECT 1: ALWAYS track mouse position - never disabled
  // This ensures positionRef is accurate when cursor is re-enabled after dropdown/drag
  // CHROMEBOOK FIX: Also hides cursor when over loop-library (which has native cursor)
  // CHROMEBOOK FIX: Global cursor hides when over elements with data-cursor-handled="true"
  useEffect(() => {
    const updatePosition = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      if (!cursorElementRef.current) return;

      // CHROMEBOOK FIX: Check if mouse is over the loop library area
      // The loop library shows native cursor, so we must hide custom cursor there
      // IMPORTANT: Skip this check for synthetic events (isTrusted=false) because
      // native dropdown interactions don't update mouse position, so coordinates are stale
      const loopLibrary = document.querySelector('.loop-library');
      let isOverLoopLibrary = false;
      if (loopLibrary && e.isTrusted !== false) {
        const rect = loopLibrary.getBoundingClientRect();
        isOverLoopLibrary = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        if (isOverLoopLibrary) {
          // Hide custom cursor when over loop library (native cursor shows there)
          cursorElementRef.current.style.visibility = 'hidden';
          cursorElementRef.current.style.opacity = '0';
          isVisibleRef.current = false;
          return;
        }
      }

      // CHROMEBOOK FIX: If this is a global cursor (no containerRef), hide when over
      // elements that have their own cursor handler (data-cursor-handled="true")
      // This prevents two custom cursors showing simultaneously
      if (!containerRef?.current && e.isTrusted !== false) {
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        if (elementUnderCursor) {
          let el = elementUnderCursor;
          while (el && el !== document.body) {
            if (el.dataset?.cursorHandled === 'true') {
              // Another component handles cursor here - hide global cursor
              cursorElementRef.current.style.visibility = 'hidden';
              cursorElementRef.current.style.opacity = '0';
              isVisibleRef.current = false;
              return;
            }
            el = el.parentElement;
          }
        }
      }

      // Check if we should show the cursor (enabled and over timeline container)
      const container = containerRef?.current;
      let isOverContainer = true; // Default to true if no container
      if (container) {
        const rect = container.getBoundingClientRect();
        isOverContainer = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
      }

      // CHROMEBOOK FIX: Use effectivelyEnabled directly instead of ref to avoid race conditions
      // The effect now re-subscribes when effectivelyEnabled changes
      if (effectivelyEnabled && isOverContainer) {
        const el = cursorElementRef.current;
        const x = e.clientX - hotspot.x;
        const y = e.clientY - hotspot.y;

        // CHROMEBOOK FIX: Force repaint when transitioning from hidden to visible
        // Using double RAF to ensure Chrome compositor processes the change
        if (!isVisibleRef.current) {
          el.style.display = 'none';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!cursorElementRef.current) return;
              el.style.setProperty('display', 'block', 'important');
              el.style.setProperty('visibility', 'visible', 'important');
              el.style.setProperty('opacity', '1', 'important');
              el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
          });
        } else {
          // Already visible, just update position (no RAF needed)
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('display', 'block', 'important');
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        isVisibleRef.current = true;
      } else {
        // Hide cursor when not over container
        cursorElementRef.current.style.setProperty('visibility', 'hidden', 'important');
        cursorElementRef.current.style.setProperty('opacity', '0', 'important');
        isVisibleRef.current = false;
      }
    };

    // Use passive listener for maximum performance
    document.addEventListener('mousemove', updatePosition, { passive: true });

    return () => {
      document.removeEventListener('mousemove', updatePosition);
    };
  }, [hotspot.x, hotspot.y, containerRef, effectivelyEnabled, name]);

  // EFFECT 2: Handle visibility and container enter/leave
  // CHROMEBOOK FIX: Use useLayoutEffect so visibility is set BEFORE browser paints
  // This prevents the flicker where inline style (hidden) shows briefly before DOM manipulation
  useLayoutEffect(() => {
    const container = containerRef?.current;

    // CHROMEBOOK FIX: Get accurate mouse position from context
    // This is more reliable than positionRef which might be stale after dropdown interactions
    const contextPosition = getLastMousePosition();
    if (contextPosition.x !== 0 || contextPosition.y !== 0) {
      // Update our local position ref with context position
      positionRef.current = contextPosition;
    }

    // Helper to check if mouse is over container
    const isMouseOverContainer = () => {
      if (!container) return true; // No container = always visible
      const rect = container.getBoundingClientRect();
      return (
        positionRef.current.x >= rect.left &&
        positionRef.current.x <= rect.right &&
        positionRef.current.y >= rect.top &&
        positionRef.current.y <= rect.bottom
      );
    };

    // CHROMEBOOK FIX: Check if mouse is over loop library (which uses native cursor)
    const isMouseOverLoopLibrary = () => {
      const loopLibrary = document.querySelector('.loop-library');
      if (!loopLibrary) return false;
      const rect = loopLibrary.getBoundingClientRect();
      return (
        positionRef.current.x >= rect.left &&
        positionRef.current.x <= rect.right &&
        positionRef.current.y >= rect.top &&
        positionRef.current.y <= rect.bottom
      );
    };

    // CHROMEBOOK FIX: Check if mouse is over an element with data-cursor-handled="true"
    // Global cursor should hide when another component handles its own cursor
    const isMouseOverCursorHandledElement = () => {
      if (containerRef?.current) return false; // Only applies to global cursor
      const elementUnderCursor = document.elementFromPoint(
        positionRef.current.x,
        positionRef.current.y
      );
      if (!elementUnderCursor) return false;
      let el = elementUnderCursor;
      while (el && el !== document.body) {
        if (el.dataset?.cursorHandled === 'true') {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    // Helper to show/hide cursor
    // CHROMEBOOK FIX: Use setProperty with 'important' to override any CSS
    // CHROMEBOOK FIX: Force browser repaint to fix Chrome compositor bug
    // After dropdown closes, Chrome may not repaint fixed-position Portal elements
    // Using DOUBLE requestAnimationFrame to ensure two complete frame cycles
    const showCursor = () => {
      if (cursorElementRef.current) {
        const el = cursorElementRef.current;
        const x = positionRef.current.x - hotspot.x;
        const y = positionRef.current.y - hotspot.y;

        // Double RAF ensures Chrome compositor processes the visibility change
        // First RAF: hide element and schedule second RAF
        // Second RAF: show element after browser has processed the hidden state
        el.style.display = 'none';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cursorElementRef.current) return;
            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('opacity', '1', 'important');
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          });
        });
      }
    };

    const hideCursor = () => {
      if (cursorElementRef.current) {
        cursorElementRef.current.style.setProperty('visibility', 'hidden', 'important');
        cursorElementRef.current.style.setProperty('opacity', '0', 'important');
      }
    };

    if (!effectivelyEnabled) {
      // Hide cursor when disabled
      hideCursor();
      return;
    }

    // CHROMEBOOK FIX: Don't show custom cursor if mouse is over loop library
    // The loop library uses native cursor, so showing custom cursor there causes "two cursors"
    // Also don't show global cursor if over an element that handles its own cursor
    if (isMouseOverLoopLibrary() || isMouseOverCursorHandledElement()) {
      isVisibleRef.current = false;
      hideCursor();
      // Don't return early - still need to set up event listeners
    } else if (isMouseOverContainer()) {
      // Cursor is enabled and mouse is over container (or no container) - show it
      isVisibleRef.current = true;
      showCursor();
    } else {
      isVisibleRef.current = false;
      hideCursor();
    }

    const handleMouseEnter = (e) => {
      if (container?.contains(e.target) || e.target === container) {
        isVisibleRef.current = true;
        if (effectivelyEnabledRef.current) {
          showCursor();
        }
      }
    };

    const handleMouseLeave = (e) => {
      if (container && !container.contains(e.relatedTarget)) {
        isVisibleRef.current = false;
        hideCursor();
      }
    };

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    } else {
      // No container = check if NOT over loop library or cursor-handled element, then show
      if (!isMouseOverLoopLibrary() && !isMouseOverCursorHandledElement()) {
        isVisibleRef.current = true;
        showCursor();
      }
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [effectivelyEnabled, containerRef, hotspot.x, hotspot.y, getLastMousePosition, name]);

  // Update hotspot when cursor type changes
  useEffect(() => {
    if (cursorElementRef.current && isVisibleRef.current) {
      const x = positionRef.current.x - hotspot.x;
      const y = positionRef.current.y - hotspot.y;
      cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, [cursorType, hotspot.x, hotspot.y]);

  // CHROMEBOOK FIX: Always render the cursor element to avoid mount/unmount delays
  // Use visibility to hide instead of returning null
  const CursorSVG = CursorSVGs[cursorType] || CursorSVGs.default;

  // CHROMEBOOK FIX: useLayoutEffect to set initial visibility BEFORE paint
  // This ensures visibility is set correctly before user sees anything
  // We do this via ref callback + useLayoutEffect, NOT inline styles
  // because inline styles get reset on every render and conflict with DOM manipulation
  useLayoutEffect(() => {
    if (cursorElementRef.current) {
      // Set initial visibility based on current state
      if (effectivelyEnabled && initiallyVisible) {
        cursorElementRef.current.style.visibility = 'visible';
        cursorElementRef.current.style.opacity = '1';
      } else {
        cursorElementRef.current.style.visibility = 'hidden';
        cursorElementRef.current.style.opacity = '0';
      }
    }
  }, []); // Only run once on mount

  // Portal renders cursor at document.body level for correct positioning
  // CHROMEBOOK FIX: NO inline visibility/opacity styles - only set via DOM manipulation
  // This prevents React re-renders from resetting our visibility changes
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
        // PERFORMANCE FIX: GPU optimization hints
        willChange: 'transform',  // Hints browser to create compositing layer
        contain: 'layout style',  // Isolates this element's reflows from rest of DOM
        // Initial position (off-screen)
        transform: `translate3d(${(initialPosition?.x || -100) - hotspot.x}px, ${(initialPosition?.y || -100) - hotspot.y}px, 0)`,
      }}
    >
      {CursorSVG}
    </div>,
    document.body
  );
// PERFORMANCE FIX: Custom comparison to prevent re-renders from position changes
// Position updates are handled via direct DOM manipulation, not React props
}, (prevProps, nextProps) => {
  // Return true if props are equal (should NOT re-render)
  // Only re-render if cursorType, enabled, or initiallyVisible changes
  // Ignore initialPosition changes - position is tracked via refs and DOM manipulation
  return (
    prevProps.cursorType === nextProps.cursorType &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.initiallyVisible === nextProps.initiallyVisible &&
    prevProps.name === nextProps.name
    // Intentionally NOT comparing initialPosition or containerRef
  );
});

CustomCursor.displayName = 'CustomCursor';

export default CustomCursor;
