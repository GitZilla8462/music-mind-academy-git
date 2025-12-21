// /timeline/hooks/useTimelineState.js - FIXED: Removed left margin gap
import { useState, useEffect, useMemo } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

// Calculate zoom level to show a target duration in the viewport
const calculateDefaultZoom = (videoDuration) => {
  // Target: show ~2:15 (135 seconds) of timeline in viewport
  const TARGET_VISIBLE_SECONDS = 135;

  // Estimate available timeline width (viewport - loop drawer - margins)
  // Chromebook: 1366px - 280px drawer - 154px track headers - 50px margins ≈ 880px
  // Desktop: wider, but we'll use Chromebook as baseline
  const ESTIMATED_TIMELINE_WIDTH = typeof window !== 'undefined'
    ? Math.max(600, window.innerWidth - 484) // 280 drawer + 154 headers + 50 margins
    : 880;

  const PIXELS_PER_SECOND = 24;

  // Calculate zoom needed to fit target seconds in viewport
  // contentWidth = duration * pixelsPerSecond * zoom
  // We want: ESTIMATED_TIMELINE_WIDTH = TARGET_VISIBLE_SECONDS * PIXELS_PER_SECOND * zoom
  // So: zoom = ESTIMATED_TIMELINE_WIDTH / (TARGET_VISIBLE_SECONDS * PIXELS_PER_SECOND)
  const idealZoom = ESTIMATED_TIMELINE_WIDTH / (TARGET_VISIBLE_SECONDS * PIXELS_PER_SECOND);

  // Clamp to slider range (0.25 to 0.75)
  return Math.max(0.25, Math.min(0.75, idealZoom));
};

export const useTimelineState = (duration) => {
  const [trackStates, setTrackStates] = useState({});
  const [localZoom, setLocalZoom] = useState(() => calculateDefaultZoom(duration));
  const [draggedLoop, setDraggedLoop] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [hasInitializedZoom, setHasInitializedZoom] = useState(false);

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

  // Recalculate default zoom when component mounts (has access to window)
  useEffect(() => {
    if (!hasInitializedZoom && typeof window !== 'undefined') {
      const newZoom = calculateDefaultZoom(duration);
      setLocalZoom(newZoom);
      setHasInitializedZoom(true);
      console.log(`🔍 Default zoom calculated: ${Math.round(newZoom * 100)}% for viewport ${window.innerWidth}px`);
    }
  }, [duration, hasInitializedZoom]);

  // Timeline width calculation - uses right margin + small left padding
  const timelineWidth = useMemo(() => {
    const pixelsPerSecond = 24;
    const contentWidth = duration * pixelsPerSecond * localZoom;
    const minWidth = 800;
    const totalWidth = Math.max(minWidth, contentWidth) + TIMELINE_CONSTANTS.MARGIN_WIDTH;
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