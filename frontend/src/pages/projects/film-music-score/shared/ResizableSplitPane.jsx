// File: /src/pages/projects/film-music-score/shared/ResizableSplitPane.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal } from 'lucide-react';

const ResizableSplitPane = ({ 
  topContent, 
  bottomContent, 
  initialTopHeight = 250, // Smaller initial height
  minTopHeight = 150,
  minBottomHeight = 300
}) => {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);
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
      document.body.style.cursor = 'row-resize';
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

      {/* Resizable Divider */}
      <div
        className={`flex-shrink-0 bg-gray-700 border-y border-gray-600 flex items-center justify-center cursor-row-resize transition-colors ${
          isDragging ? 'bg-blue-600' : 'hover:bg-gray-600'
        }`}
        style={{ height: '8px', zIndex: 40 }}
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal 
          size={16} 
          className={`text-gray-400 ${isDragging ? 'text-white' : ''}`}
        />
      </div>

      {/* Bottom Pane - Timeline */}
      <div className="flex-1 overflow-hidden relative" style={{ minHeight: `${minBottomHeight}px` }}>
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizableSplitPane;