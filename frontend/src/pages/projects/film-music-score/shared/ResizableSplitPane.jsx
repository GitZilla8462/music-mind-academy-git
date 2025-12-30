// File: /src/pages/projects/film-music-score/shared/ResizableSplitPane.jsx
// CHROMEBOOK FIX: Uses data-cursor attribute for global cursor detection

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal } from 'lucide-react';

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
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

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
      // Set body cursor for non-Chromebook (Chromebook uses global CustomCursor)
      if (!isChromebook) {
        document.body.style.cursor = 'row-resize';
      }
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

      {/* Invisible overlay for mouse events */}
      {/* data-cursor tells global CustomCursor what cursor type to show on Chromebook */}
      <div
        className="absolute left-0 right-0"
        data-cursor="row-resize"
        style={{
          top: `${topHeight}px`,
          height: '16px', // Larger hit area for easier grabbing
          marginTop: '-4px', // Center over the visual divider
          zIndex: 41,
          // Hide native cursor on Chromebook (global CustomCursor shows instead)
          // Show row-resize on non-Chromebook
          cursor: isChromebook ? 'none' : 'row-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => {
          console.log('🎯 Grab bar mouseEnter:', {
            isChromebook,
            clientX: e.clientX,
            clientY: e.clientY
          });
          setIsHovering(true);
        }}
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
