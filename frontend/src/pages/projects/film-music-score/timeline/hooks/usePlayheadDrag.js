// /timeline/hooks/usePlayheadDrag.js
import { useState, useEffect, useCallback } from 'react';

export const usePlayheadDrag = (timelineRef, pixelToTime, duration, onSeek) => {
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  const handlePlayheadMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, pixelToTime(x)));
    onSeek(newTime);
  };

  const handlePlayheadMouseMove = useCallback((e) => {
    if (!isDraggingPlayhead) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, pixelToTime(x)));
    
    requestAnimationFrame(() => {
      onSeek(newTime);
    });
  }, [isDraggingPlayhead, pixelToTime, duration, onSeek]);

  const handlePlayheadMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
  }, []);

  // Timeline click for seeking
  const handleTimelineClick = (e, draggedLoop) => {
    if (draggedLoop || isDraggingPlayhead) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = Math.max(0, Math.min(duration, pixelToTime(x)));
    onSeek(clickTime);
  };

  useEffect(() => {
    if (isDraggingPlayhead) {
      document.addEventListener('mousemove', handlePlayheadMouseMove);
      document.addEventListener('mouseup', handlePlayheadMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handlePlayheadMouseMove);
        document.removeEventListener('mouseup', handlePlayheadMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDraggingPlayhead, handlePlayheadMouseMove, handlePlayheadMouseUp]);

  return {
    isDraggingPlayhead,
    handlePlayheadMouseDown,
    handleTimelineClick
  };
};