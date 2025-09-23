// /timeline/hooks/useTimelineState.js - UPDATED with 50% default zoom
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

  // Better timeline width calculation - Base scale for 50% = Fit view
  const timelineWidth = useMemo(() => {
    // Calculate base scale so that 50% zoom shows full duration + margin
    // If we want 50% to show the full video with margin, work backwards:
    // At 50% zoom, we want timeline width to be roughly the container width
    const pixelsPerSecond = 24; // Adjusted so 50% zoom shows full video nicely
    const contentWidth = duration * pixelsPerSecond * localZoom;
    const minWidth = 800; // Reduced minimum for better fit calculations
    
    return Math.max(minWidth, contentWidth) + 50; // REDUCED: From MARGIN_WIDTH (200) to 50
  }, [duration, localZoom]);

  // More accurate time to pixel conversion with reduced left margin
  const timeToPixel = useMemo(() => (time) => {
    // The actual content area (excluding margin)
    const contentAreaWidth = timelineWidth - 50; // REDUCED: From MARGIN_WIDTH to 50
    
    // Convert time to pixel position within the content area
    const pixelInContent = (time / duration) * contentAreaWidth;
    
    // Add small margin offset to get absolute position
    return pixelInContent + 25; // REDUCED: From MARGIN_WIDTH to 25 for minimal left spacing
  }, [duration, timelineWidth]);
  
  // More accurate pixel to time conversion with reduced left margin
  const pixelToTime = useMemo(() => (pixel) => {
    // Remove margin offset to get position within content area
    const pixelInContent = pixel - 25; // REDUCED: From MARGIN_WIDTH to 25
    const contentAreaWidth = timelineWidth - 50; // REDUCED: From MARGIN_WIDTH to 50
    
    // Convert pixel position to time
    const time = (pixelInContent / contentAreaWidth) * duration;
    
    return Math.max(0, Math.min(duration, time));
  }, [timelineWidth, duration]);

  const updateTrackState = (trackId, updates) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: { ...prev[trackId], ...updates }
    }));
  };

  const handleZoomChange = (newZoom) => {
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