// File: /src/pages/projects/film-music-score/timeline/components/CustomCursor.jsx
// CHROMEBOOK FIX: Custom cursor div that follows mouse position
// This bypasses the browser's native cursor rendering which flickers on Chromebook GPU
// Only renders over the timeline area when native cursor is hidden

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

// Cursor SVG components - inline for no flicker during cursor type changes
const CursorSVGs = {
  default: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L11 5.5L7 7L5.5 11L1 1Z" fill="black" stroke="white" strokeWidth="1"/>
    </svg>
  ),
  
  grab: (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 8V4.5C6.5 3.67 7.17 3 8 3C8.83 3 9.5 3.67 9.5 4.5V8" stroke="black" strokeWidth="1.5" fill="white"/>
      <path d="M9.5 7V3C9.5 2.17 10.17 1.5 11 1.5C11.83 1.5 12.5 2.17 12.5 3V7" stroke="black" strokeWidth="1.5" fill="white"/>
      <path d="M12.5 7.5V4C12.5 3.17 13.17 2.5 14 2.5C14.83 2.5 15.5 3.17 15.5 4V12C15.5 16 13 19 10 19C7 19 4.5 16 4.5 12V9C4.5 8.17 5.17 7.5 6 7.5C6.83 7.5 7.5 8.17 7.5 9" stroke="black" strokeWidth="1.5" fill="white"/>
      <path d="M6.5 8V4.5C6.5 3.67 7.17 3 8 3C8.83 3 9.5 3.67 9.5 4.5V8" stroke="black" strokeWidth="1" fill="white"/>
    </svg>
  ),
  
  grabbing: (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 10V9C6.5 8.17 7.17 7.5 8 7.5C8.83 7.5 9.5 8.17 9.5 9V10" stroke="black" strokeWidth="1.5" fill="white"/>
      <path d="M9.5 10V8.5C9.5 7.67 10.17 7 11 7C11.83 7 12.5 7.67 12.5 8.5V10" stroke="black" strokeWidth="1.5" fill="white"/>
      <path d="M12.5 10V9C12.5 8.17 13.17 7.5 14 7.5C14.83 7.5 15.5 8.17 15.5 9V12C15.5 16 13 19 10 19C7 19 4.5 16 4.5 12V11C4.5 10.17 5.17 9.5 6 9.5C6.83 9.5 7.5 10.17 7.5 11" stroke="black" strokeWidth="1.5" fill="white"/>
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
  default: { x: 0, y: 0 },
  grab: { x: 10, y: 10 },
  grabbing: { x: 10, y: 10 },
  'ew-resize': { x: 10, y: 8 },
  'col-resize': { x: 8, y: 10 },
  'row-resize': { x: 10, y: 8 },
  crosshair: { x: 10, y: 10 },
  pointer: { x: 4, y: 1 },
};

const CustomCursor = ({
  cursorType = 'default',
  containerRef,  // Ref to the element this cursor should appear over
  enabled = true,
  initiallyVisible = false,  // CHROMEBOOK FIX: Start visible when parent knows we're hovering
  initialPosition = null  // CHROMEBOOK FIX: Initial mouse position from parent
}) => {
  const defaultPos = initialPosition || { x: -100, y: -100 };
  const [position, setPosition] = useState(defaultPos);
  const [isVisible, setIsVisible] = useState(initiallyVisible);
  const rafRef = useRef(null);
  const positionRef = useRef(defaultPos);

  useEffect(() => {
    if (!enabled) return;

    const updatePosition = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPosition({ ...positionRef.current });
          rafRef.current = null;
        });
      }
    };

    const handleMouseEnter = (e) => {
      // Check if entering the container
      if (containerRef?.current?.contains(e.target) || e.target === containerRef?.current) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = (e) => {
      // Check if leaving the container
      if (containerRef?.current && !containerRef.current.contains(e.relatedTarget)) {
        setIsVisible(false);
      }
    };

    const container = containerRef?.current;
    
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
      if (isOver) setIsVisible(true);
    }

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, containerRef]);

  if (!enabled || !isVisible) return null;

  const hotspot = HOTSPOTS[cursorType] || HOTSPOTS.default;
  const CursorSVG = CursorSVGs[cursorType] || CursorSVGs.default;

  // Use Portal to render outside any zoomed/transformed parent containers
  // This ensures position: fixed works correctly with screen coordinates
  return ReactDOM.createPortal(
    <div
      className="custom-cursor-container"
      style={{
        position: 'fixed',
        left: position.x - hotspot.x,
        top: position.y - hotspot.y,
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {CursorSVG}
    </div>,
    document.body
  );
};

export default CustomCursor;