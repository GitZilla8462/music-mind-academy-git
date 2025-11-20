// /timeline/hooks/useTimelineState.js - FIXED: Removed left margin gap
import { useState, useEffect, useMemo } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

export const useTimelineState = (duration) => {
  const [trackStates, setTrackStates] = useState({});
  const [localZoom, setLocalZoom] = useState(0.5); // Default to 50%
  const [draggedLoop, setDraggedLoop] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTrack, setHoveredTrack] = useState(null);

  // Initialize track states
  useEffect(() => {
    const initialStates = {};
    for (let i = 0; i < TIMELINE_CONSTANTS.NUM_TRACKS; i++) {
      initialStates[`track-${i}`] = {
        volume: 0.7,
        muted: false,
        solo: false,
        armed: false,
        visible: true,
        locked: false,
        name: `Track ${i + 1}`,
        color: '#3b82f6'
      };
    }
    setTrackStates(initialStates);
  }, []);

  // FIXED: Timeline width calculation - uses right margin + small left padding
  const timelineWidth = useMemo(() => {
    const pixelsPerSecond = 24; // Base pixels per second
    const contentWidth = duration * pixelsPerSecond * localZoom;
    const minWidth = 800; // Minimum width for usability
    
    // Use MARGIN_WIDTH for RIGHT padding + small left padding is added in timeToPixel
    const totalWidth = Math.max(minWidth, contentWidth) + TIMELINE_CONSTANTS.MARGIN_WIDTH;
    
    console.log('📏 Timeline Width Calculation:', {
      duration: duration.toFixed(2),
      localZoom,
      pixelsPerSecond,
      contentWidth: contentWidth.toFixed(2),
      rightMargin: TIMELINE_CONSTANTS.MARGIN_WIDTH,
      leftPadding: 16,
      totalWidth: totalWidth.toFixed(2)
    });
    
    return totalWidth;
  }, [duration, localZoom]);

  // FIXED: Time to pixel conversion - 16px left padding for visual breathing room
  const timeToPixel = useMemo(() => (time) => {
    // Comfortable left padding for visual clarity (16px)
    const LEFT_PADDING = 16;
    const contentAreaWidth = timelineWidth - TIMELINE_CONSTANTS.MARGIN_WIDTH - LEFT_PADDING;
    
    // Convert time to pixel position
    const pixelPosition = (time / duration) * contentAreaWidth;
    
    // Add padding offset
    return pixelPosition + LEFT_PADDING;
  }, [duration, timelineWidth]);
  
  // FIXED: Pixel to time conversion - Account for 16px left padding
  const pixelToTime = useMemo(() => (pixel) => {
    // Left padding matches timeToPixel
    const LEFT_PADDING = 16;
    const contentAreaWidth = timelineWidth - TIMELINE_CONSTANTS.MARGIN_WIDTH - LEFT_PADDING;
    
    // Remove padding offset before converting
    const adjustedPixel = pixel - LEFT_PADDING;
    
    // Convert pixel position to time
    const time = (adjustedPixel / contentAreaWidth) * duration;
    
    // Clamp to valid time range
    return Math.max(0, Math.min(duration, time));
  }, [timelineWidth, duration]);

  const updateTrackState = (trackId, updates) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: { ...prev[trackId], ...updates }
    }));
  };

  const handleZoomChange = (newZoom) => {
    console.log('🔍 Zoom changed to:', newZoom);
    setLocalZoom(newZoom);
  };

  return {
    trackStates,
    localZoom,
    timelineWidth,
    timeToPixel,
    pixelToTime,
    draggedLoop,
    setDraggedLoop,
    dragOffset,
    setDragOffset,
    hoveredTrack,
    setHoveredTrack,
    updateTrackState,
    handleZoomChange
  };
};