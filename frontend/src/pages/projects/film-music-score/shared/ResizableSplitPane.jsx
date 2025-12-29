// File: /src/pages/projects/film-music-score/shared/ResizableSplitPane.jsx
// CHROMEBOOK FIX: Custom cursor integration to prevent flicker on grab bar

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal } from 'lucide-react';
import CustomCursor from '../timeline/components/CustomCursor.jsx';

// Detect Chromebook/ChromeOS for custom cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

const ResizableSplitPane = ({
  topContent,
  bottomContent,
  initialTopHeight = 250, // Smaller initial height
  minTopHeight = 150,
  minBottomHeight = 300
}) => {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // CHROMEBOOK FIX: Track cursor type for CustomCursor
  const [cursorType, setCursorType] = useState('default');

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = topHeight;
  }, [topHeight]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    
    // Calculate new height based on mouse movement
    const deltaY = e.clientY - dragStartY.current;
    const newTopHeight = dragStartHeight.current + deltaY;
    
    // Apply constraints
    const maxTopHeight = containerHeight - minBottomHeight;
    const constrainedHeight = Math.max(
      minTopHeight,
      Math.min(maxTopHeight, newTopHeight)
    );
    
    setTopHeight(constrainedHeight);
  }, [isDragging, minTopHeight, minBottomHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // CHROMEBOOK FIX: Only set body cursor on non-Chromebook (Chromebook uses CustomCursor)
      if (!isChromebook) {
        document.body.style.cursor = 'row-resize';
      }
      document.body.style.userSelect = 'none';
      setCursorType('row-resize');

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setCursorType('default');
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update cursor type when hovering
  useEffect(() => {
    if (!isDragging) {
      setCursorType(isHovering ? 'row-resize' : 'default');
    }
  }, [isHovering, isDragging]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full relative">
      {/* Top Pane - Video */}
      <div 
        className="flex-shrink-0 overflow-hidden relative"
        style={{ height: `${topHeight}px` }}
      >
        {topContent}
      </div>

      {/* Resizable Divider - Visual element with pointer-events: none */}
      <div
        className={`flex-shrink-0 bg-gray-700 border-y border-gray-600 flex items-center justify-center transition-colors ${
          isDragging ? 'bg-blue-600' : isHovering ? 'bg-gray-600' : ''
        }`}
        style={{ height: '8px', zIndex: 40, pointerEvents: 'none' }}
      >
        <GripHorizontal
          size={16}
          className={`text-gray-400 ${isDragging ? 'text-white' : ''}`}
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* CHROMEBOOK FIX: CustomCursor for Chromebook to prevent flicker */}
      {isChromebook && (isHovering || isDragging) && (
        <CustomCursor
          cursorType={cursorType}
          containerRef={overlayRef}
          enabled={true}
        />
      )}

      {/* Invisible overlay for mouse events - prevents cursor flicker on Chromebook */}
      <div
        ref={overlayRef}
        className="absolute left-0 right-0"
        style={{
          top: `${topHeight}px`,
          height: '16px', // Larger hit area for easier grabbing
          marginTop: '-4px', // Center over the visual divider
          zIndex: 41,
          // CHROMEBOOK FIX: Hide native cursor on Chromebook, use CustomCursor instead
          cursor: isChromebook ? 'none' : 'row-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />

      {/* Bottom Pane - Timeline */}
      <div className="flex-1 overflow-hidden relative" style={{ minHeight: `${minBottomHeight}px` }}>
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizableSplitPane;