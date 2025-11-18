// /timeline/hooks/useTimelineState.js - FIXED: Now properly uses MARGIN_WIDTH to show full video
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

  // FIXED: Timeline width calculation now uses proper MARGIN_WIDTH constant
  const timelineWidth = useMemo(() => {
    // Calculate base scale so that 50% zoom shows full duration + margin
    const pixelsPerSecond = 24; // Base pixels per second
    const contentWidth = duration * pixelsPerSecond * localZoom;
    const minWidth = 800; // Minimum width for usability
    
    // FIXED: Use MARGIN_WIDTH constant (200) to ensure full video is visible
    const totalWidth = Math.max(minWidth, contentWidth) + TIMELINE_CONSTANTS.MARGIN_WIDTH;
    
    console.log('📏 Timeline Width Calculation:', {
      duration: duration.toFixed(2),
      localZoom,
      pixelsPerSecond,
      contentWidth: contentWidth.toFixed(2),
      marginWidth: TIMELINE_CONSTANTS.MARGIN_WIDTH,
      totalWidth: totalWidth.toFixed(2)
    });
    
    return totalWidth;
  }, [duration, localZoom]);

  // FIXED: Time to pixel conversion using proper margins
  const timeToPixel = useMemo(() => (time) => {
    // Use half the margin width as left padding for visual balance
    const leftMargin = TIMELINE_CONSTANTS.MARGIN_WIDTH / 2;
    const contentAreaWidth = timelineWidth - TIMELINE_CONSTANTS.MARGIN_WIDTH;
    
    // Convert time to pixel position within the content area
    const pixelInContent = (time / duration) * contentAreaWidth;
    
    // Add left margin offset to get absolute position
    return pixelInContent + leftMargin;
  }, [duration, timelineWidth]);
  
  // FIXED: Pixel to time conversion using proper margins
  const pixelToTime = useMemo(() => (pixel) => {
    // Use half the margin width as left padding
    const leftMargin = TIMELINE_CONSTANTS.MARGIN_WIDTH / 2;
    const contentAreaWidth = timelineWidth - TIMELINE_CONSTANTS.MARGIN_WIDTH;
    
    // Remove margin offset to get position within content area
    const pixelInContent = pixel - leftMargin;
    
    // Convert pixel position to time
    const time = (pixelInContent / contentAreaWidth) * duration;
    
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