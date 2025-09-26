// /timeline/TimelineScrollbar.jsx - Clean version without debug text
import React, { useState, useEffect } from 'react';

const TimelineScrollbar = ({ timelineScrollRef, timelineWidth, duration, currentTime }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Force re-render when scroll position changes
  useEffect(() => {
    const handleScrollUpdate = () => {
      if (timelineScrollRef.current) {
        setScrollPosition(timelineScrollRef.current.scrollLeft);
      }
    };

    const scrollElement = timelineScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScrollUpdate);
      return () => scrollElement.removeEventListener('scroll', handleScrollUpdate);
    }
  }, [timelineScrollRef]);

  // Calculate scrollbar dimensions with fallbacks
  const containerWidth = timelineScrollRef.current?.clientWidth || 1000;
  const contentWidth = timelineWidth;
  const scrollRatio = containerWidth / contentWidth;
  const scrollbarWidth = Math.max(40, scrollRatio * containerWidth);
  const maxScrollLeft = Math.max(0, contentWidth - containerWidth);
  const currentScrollLeft = scrollPosition;
  const thumbPosition = maxScrollLeft > 0 ? (currentScrollLeft / maxScrollLeft) * (containerWidth - scrollbarWidth) : 0;

  const handleScrollbarMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart(e.clientX - thumbPosition);
  };

  const handleScrollbarClick = (e) => {
    if (isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newThumbPosition = Math.max(0, Math.min(containerWidth - scrollbarWidth, clickX - scrollbarWidth / 2));
    const scrollRatio = maxScrollLeft > 0 ? newThumbPosition / (containerWidth - scrollbarWidth) : 0;
    const newScrollLeft = scrollRatio * maxScrollLeft;
    
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newThumbPosition = Math.max(0, Math.min(containerWidth - scrollbarWidth, e.clientX - dragStart));
      const scrollRatio = maxScrollLeft > 0 ? newThumbPosition / (containerWidth - scrollbarWidth) : 0;
      const newScrollLeft = scrollRatio * maxScrollLeft;
      
      if (timelineScrollRef.current) {
        timelineScrollRef.current.scrollLeft = newScrollLeft;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, containerWidth, scrollbarWidth, maxScrollLeft]);

  // Show scrollbar if content is significantly wider than container
  if (scrollRatio >= 0.95) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gray-700 border-t border-gray-600 z-20">
      {/* Scrollbar track */}
      <div 
        className="relative h-full cursor-pointer bg-gray-600"
        onClick={handleScrollbarClick}
      >
        {/* Scrollbar thumb */}
        <div
          className={`absolute top-1 bottom-1 bg-blue-400 rounded cursor-grab transition-colors ${
            isDragging ? 'bg-blue-300' : 'hover:bg-blue-300'
          }`}
          style={{
            left: `${thumbPosition}px`,
            width: `${Math.max(20, scrollbarWidth)}px`
          }}
          onMouseDown={handleScrollbarMouseDown}
        />
        
        {/* Timeline position indicators removed */}
      </div>
      
      {/* Scrollbar labels */}
      <div className="absolute -top-5 left-0 right-0 flex justify-end text-xs text-gray-300 pointer-events-none">
        <span>
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default TimelineScrollbar;