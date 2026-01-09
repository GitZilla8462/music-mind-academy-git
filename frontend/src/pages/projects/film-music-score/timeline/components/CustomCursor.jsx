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

import React, { useEffect, useRef, memo } from 'react';
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
}) => {
  // UNIFIED CURSOR: Get global cursor state
  const { isCustomCursorEnabled, isDraggingFromLibrary } = useCursor();

  // Refs for direct DOM manipulation (no React state = no re-renders = no lag)
  const cursorElementRef = useRef(null);
  const isVisibleRef = useRef(initiallyVisible);
  const positionRef = useRef(initialPosition || { x: -100, y: -100 });

  // Combine local enabled prop with global context
  const effectivelyEnabled = enabled && isCustomCursorEnabled && !isDraggingFromLibrary;

  // Get hotspot for current cursor type
  const hotspot = HOTSPOTS[cursorType] || HOTSPOTS.default;

  useEffect(() => {
    if (!effectivelyEnabled) {
      // Hide cursor when disabled
      if (cursorElementRef.current) {
        cursorElementRef.current.style.display = 'none';
      }
      return;
    }

    // Show cursor when enabled
    if (cursorElementRef.current) {
      cursorElementRef.current.style.display = isVisibleRef.current ? 'block' : 'none';
    }

    // PERFORMANCE: Direct DOM manipulation - bypasses React entirely
    // This runs at native browser speed with zero overhead
    const updatePosition = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      // Direct DOM update - no React, no state, no re-render
      if (cursorElementRef.current && isVisibleRef.current) {
        const x = e.clientX - hotspot.x;
        const y = e.clientY - hotspot.y;
        cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const handleMouseEnter = (e) => {
      if (containerRef?.current?.contains(e.target) || e.target === containerRef?.current) {
        isVisibleRef.current = true;
        if (cursorElementRef.current) {
          cursorElementRef.current.style.display = 'block';
          // Update position immediately on enter
          const x = positionRef.current.x - hotspot.x;
          const y = positionRef.current.y - hotspot.y;
          cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      }
    };

    const handleMouseLeave = (e) => {
      if (containerRef?.current && !containerRef.current.contains(e.relatedTarget)) {
        isVisibleRef.current = false;
        if (cursorElementRef.current) {
          cursorElementRef.current.style.display = 'none';
        }
      }
    };

    const container = containerRef?.current;

    // Use passive listener for maximum performance
    document.addEventListener('mousemove', updatePosition, { passive: true });

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      // Check if mouse is already over container
      const rect = container.getBoundingClientRect();
      const isOver = (
        positionRef.current.x >= rect.left &&
        positionRef.current.x <= rect.right &&
        positionRef.current.y >= rect.top &&
        positionRef.current.y <= rect.bottom
      );
      if (isOver) {
        isVisibleRef.current = true;
        if (cursorElementRef.current) {
          cursorElementRef.current.style.display = 'block';
        }
      }
    } else {
      // No container = always visible (global cursor mode)
      isVisibleRef.current = true;
      if (cursorElementRef.current) {
        cursorElementRef.current.style.display = 'block';
      }
    }

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [effectivelyEnabled, containerRef, hotspot.x, hotspot.y]);

  // Update hotspot when cursor type changes
  useEffect(() => {
    if (cursorElementRef.current && isVisibleRef.current) {
      const x = positionRef.current.x - hotspot.x;
      const y = positionRef.current.y - hotspot.y;
      cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, [cursorType, hotspot.x, hotspot.y]);

  // Don't render anything if disabled
  if (!effectivelyEnabled) {
    return null;
  }

  const CursorSVG = CursorSVGs[cursorType] || CursorSVGs.default;

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
        display: initiallyVisible ? 'block' : 'none',
        // Initial position
        transform: `translate3d(${(initialPosition?.x || -100) - hotspot.x}px, ${(initialPosition?.y || -100) - hotspot.y}px, 0)`,
        // GPU acceleration hints
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {CursorSVG}
    </div>,
    document.body
  );
});

CustomCursor.displayName = 'CustomCursor';

export default CustomCursor;
