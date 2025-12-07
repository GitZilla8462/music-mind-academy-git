// File: /timeline/hooks/useSelectionBox.js
// Hook for handling selection box (drag to select multiple loops)
// FIXED: Improved loop intersection detection and visual feedback

import { useState, useCallback, useEffect, useRef } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

export const useSelectionBox = (
  timelineRef,
  timelineScrollRef,
  placedLoops,
  onMultiSelect,
  isPlaying
) => {
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedLoopIds, setSelectedLoopIds] = useState(new Set());
  const selectionStartRef = useRef(null);
  const isDraggingSelectionRef = useRef(false);

  // Start selection box on mouse down in empty timeline area
  const handleSelectionStart = useCallback((e) => {
    // Don't start selection if playing or right-click
    if (isPlaying || e.button !== 0) return;
    
    const target = e.target;
    if (target.closest('.loop-block') || 
        target.closest('[data-playhead]') ||
        target.tagName === 'BUTTON') {
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const scrollTop = timelineScrollRef.current?.scrollTop || 0;
    
    const startX = e.clientX - rect.left + scrollLeft;
    const startY = e.clientY - rect.top + scrollTop;

    selectionStartRef.current = { x: startX, y: startY };
    isDraggingSelectionRef.current = true;
    
    // Clear previous selection if not holding Shift/Cmd
    if (!e.shiftKey && !e.metaKey) {
      setSelectedLoopIds(new Set());
    }

    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });

    e.preventDefault();
    e.stopPropagation();
  }, [timelineRef, timelineScrollRef, isPlaying]);

  // Update selection box during drag
  const handleSelectionMove = useCallback((e) => {
    if (!isDraggingSelectionRef.current || !selectionStartRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current?.scrollLeft || 0;
    const scrollTop = timelineScrollRef.current?.scrollTop || 0;
    
    const currentX = e.clientX - rect.left + scrollLeft;
    const currentY = e.clientY - rect.top + scrollTop;

    setSelectionBox({
      startX: selectionStartRef.current.x,
      startY: selectionStartRef.current.y,
      currentX,
      currentY
    });

    // Find loops within selection box
    const boxLeft = Math.min(selectionStartRef.current.x, currentX);
    const boxRight = Math.max(selectionStartRef.current.x, currentX);
    const boxTop = Math.min(selectionStartRef.current.y, currentY);
    const boxBottom = Math.max(selectionStartRef.current.y, currentY);

    // Only select if box is reasonably sized (prevents accidental selections from clicks)
    const boxWidth = boxRight - boxLeft;
    const boxHeight = boxBottom - boxTop;
    
    if (boxWidth < 5 && boxHeight < 5) return;

    const selectedIds = new Set();
    placedLoops.forEach(loop => {
      const loopTop = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + 
                      (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
      const loopBottom = loopTop + TIMELINE_CONSTANTS.TRACK_HEIGHT;
      
      if (loopTop < boxBottom && loopBottom > boxTop) {
        selectedIds.add(loop.id);
      }
    });

    setSelectedLoopIds(selectedIds);
  }, [timelineRef, timelineScrollRef, placedLoops]);

  // Finish selection
  const handleSelectionEnd = useCallback(() => {
    if (isDraggingSelectionRef.current) {
      isDraggingSelectionRef.current = false;
      
      // Notify parent component of selected loops
      if (onMultiSelect && selectedLoopIds.size > 0) {
        onMultiSelect(Array.from(selectedLoopIds));
      }
      
      // Keep the selection but hide the box
      setSelectionBox(null);
      selectionStartRef.current = null;
    }
  }, [selectedLoopIds, onMultiSelect]);

  // Clear selection on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLoopIds(new Set());
        setSelectionBox(null);
        if (onMultiSelect) {
          onMultiSelect([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMultiSelect]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isDraggingSelectionRef.current) {
      document.addEventListener('mousemove', handleSelectionMove);
      document.addEventListener('mouseup', handleSelectionEnd);
      
      document.body.style.cursor = 'crosshair';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleSelectionMove);
        document.removeEventListener('mouseup', handleSelectionEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [handleSelectionMove, handleSelectionEnd]);

  return {
    selectionBox,
    selectedLoopIds,
    setSelectedLoopIds,
    handleSelectionStart,
    isSelectingBox: isDraggingSelectionRef.current
  };
};