// File: /src/pages/projects/film-music-score/timeline/TimelineContent.jsx
// FIXED: Video bar now displays the FULL duration without cutting off the ending
// The video bar width is now calculated correctly to match the actual video duration

import React, { forwardRef, useCallback } from 'react';
import TimeMarkers from './components/TimeMarkers';
import VideoTrackHeader from './components/VideoTrackHeader';
import TrackHeader from './components/TrackHeader';
import LoopBlock from './components/LoopBlock';
import Playhead from './components/Playhead';
import TimelineGrid from './components/TimelineGrid';
import { TIMELINE_CONSTANTS } from './constants/timelineConstants';
import { useLoopDrag } from './hooks/useLoopDrag';

const TimelineContent = forwardRef(({
  placedLoops,
  duration,
  currentTime,
  trackStates,
  timelineWidth,
  timeToPixel,
  pixelToTime,
  isDraggingPlayhead,
  draggedLoop,
  setDraggedLoop,
  dragOffset,
  setDragOffset,
  hoveredTrack,
  setHoveredTrack,
  onLoopDrop,
  onLoopDelete,
  onLoopSelect,
  onLoopUpdate,
  onLoopResizeCallback,
  onSeek,
  onPlayheadMouseDown,
  onTimelineScroll,
  onHeaderScroll,
  onTimeHeaderScroll,
  updateTrackState,
  selectedLoop,
  localZoom,
  isPlaying,
  onTrackHeaderClick,
  tutorialMode = false,
  lockFeatures = {},
  highlightSelector,
  showTimelineLabel = false,
  // NEW: Selection box props
  selectionBox,
  selectedLoopIds,
  setSelectedLoopIds,
  handleSelectionStart,
  isSelectingBox
}, {
  timelineRef,
  timelineScrollRef,
  headerScrollRef,
  timeHeaderRef
}) => {

  // FIXED: Pass placedLoops and selectedLoopIds for multi-select dragging
  const { handleLoopMouseDown } = useLoopDrag(
    timelineRef,
    timelineScrollRef,
    draggedLoop,
    setDraggedLoop,
    dragOffset,
    setDragOffset,
    pixelToTime,
    timeToPixel,
    duration,
    localZoom,
    onLoopUpdate,
    onLoopSelect,
    placedLoops,
    selectedLoopIds  // NEW: Pass selected loop IDs for multi-select drag
  );

  // Wrap onLoopSelect to maintain multi-selection when clicking a multi-selected loop
  const handleLoopSelectWithMulti = useCallback((loopId) => {
    // If this loop is already in the multi-selection, don't clear it
    if (selectedLoopIds?.has(loopId) && selectedLoopIds.size > 1) {
      // Don't call onLoopSelect - keep the multi-selection intact
      return;
    }
    // Otherwise, use normal single selection
    onLoopSelect(loopId);
  }, [selectedLoopIds, onLoopSelect]);

  // Wrap onLoopDelete to handle multi-selection
  const handleLoopDeleteWithMulti = useCallback((loopId) => {
    // If this loop is part of a multi-selection, delete all selected loops
    if (selectedLoopIds?.has(loopId) && selectedLoopIds.size > 1) {
      selectedLoopIds.forEach(id => onLoopDelete(id));
      // Clear the multi-selection after deleting
      if (setSelectedLoopIds) {
        setSelectedLoopIds(new Set());
      }
    } else {
      // Otherwise just delete this one loop
      onLoopDelete(loopId);
    }
  }, [selectedLoopIds, onLoopDelete]);

  // Drag and drop handling
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    const trackIndex = Math.floor(y / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    setHoveredTrack(trackIndex >= 0 && trackIndex < TIMELINE_CONSTANTS.NUM_TRACKS ? trackIndex : null);
  };

  const handleDragLeave = () => {
    setHoveredTrack(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT;
    
    const trackIndex = Math.floor(y / TIMELINE_CONSTANTS.TRACK_HEIGHT);
    const startTime = pixelToTime(x);
    
    if (trackIndex >= 0 && trackIndex < TIMELINE_CONSTANTS.NUM_TRACKS && startTime >= 0) {
      try {
        const loopData = JSON.parse(e.dataTransfer.getData('application/json'));
        onLoopDrop(loopData, trackIndex, startTime);
      } catch (error) {
        console.error('Error parsing dropped loop data:', error);
      }
    }
    setHoveredTrack(null);
  }, [pixelToTime, onLoopDrop, setHoveredTrack]);

  // Timeline mouse down - start selection box
  const handleTimelineMouseDown = (e) => {
    // Don't interfere with playhead dragging or loop dragging
    if (isDraggingPlayhead || draggedLoop) return;
    
    // Check if clicking on interactive elements
    const target = e.target;
    if (target.closest('.loop-block') || 
        target.closest('[data-playhead]') ||
        target.tagName === 'BUTTON') {
      return;
    }
    
    // Let selection box handle it
    if (handleSelectionStart) {
      handleSelectionStart(e);
    }
  };

  // Calculate selection box dimensions for rendering
  const getSelectionBoxStyle = () => {
    if (!selectionBox) return null;

    const left = Math.min(selectionBox.startX, selectionBox.currentX);
    const top = Math.min(selectionBox.startY, selectionBox.currentY);
    const width = Math.abs(selectionBox.currentX - selectionBox.startX);
    const height = Math.abs(selectionBox.currentY - selectionBox.startY);

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '2px solid #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none',
      zIndex: 9999,
      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)',
      borderRadius: '2px'
    };
  };

  return (
    <div className="flex flex-1 min-h-0 relative">
      {/* Fixed time header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex">
        <div className="w-48 bg-gray-800 border-r border-gray-700" style={{ height: TIMELINE_CONSTANTS.HEADER_HEIGHT }} />
        
        <div 
          ref={timeHeaderRef}
          className="flex-1 overflow-x-hidden bg-gray-800 border-b border-gray-700"
          style={{ height: TIMELINE_CONSTANTS.HEADER_HEIGHT }}
          onScroll={onTimeHeaderScroll}
        >
          <div
            className="relative bg-gray-800"
            style={{ width: timelineWidth, height: TIMELINE_CONSTANTS.HEADER_HEIGHT }}
          >
            <TimeMarkers 
              duration={duration} 
              timeToPixel={timeToPixel} 
              showTimelineLabel={showTimelineLabel}
            />
            
            <Playhead
              currentTime={currentTime}
              timeToPixel={timeToPixel}
              isDraggingPlayhead={isDraggingPlayhead}
              onPlayheadMouseDown={onPlayheadMouseDown}
              isInHeader={true}
            />
          </div>
        </div>
      </div>

      {/* Track headers */}
      <div 
        ref={headerScrollRef}
        className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto overflow-x-hidden z-20"
        onScroll={onHeaderScroll}
        style={{ 
          maxHeight: '576px',
          minHeight: 0,
          paddingTop: TIMELINE_CONSTANTS.HEADER_HEIGHT
        }}
      >
        <div style={{ height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + TIMELINE_CONSTANTS.NUM_TRACKS * TIMELINE_CONSTANTS.TRACK_HEIGHT }}>
          <VideoTrackHeader />
          {Array.from({ length: TIMELINE_CONSTANTS.NUM_TRACKS }, (_, i) => (
            <TrackHeader 
              key={i} 
              trackIndex={i}
              trackStates={trackStates}
              updateTrackState={updateTrackState}
              placedLoops={placedLoops}
              hoveredTrack={hoveredTrack}
              onTrackHeaderClick={onTrackHeaderClick}
              tutorialMode={tutorialMode}
            />
          ))}
        </div>
      </div>

      {/* Timeline content with scrollbar */}
      <div className="flex-1 relative">
        <div 
          ref={timelineScrollRef}
          className="absolute inset-0"
          onScroll={onTimelineScroll}
          style={{ 
            paddingTop: TIMELINE_CONSTANTS.HEADER_HEIGHT,
            paddingBottom: '20px',
            overflow: 'auto'
          }}
        >
          <div
            ref={timelineRef}
            className="relative bg-gray-900"
            style={{ 
              width: timelineWidth, 
              height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + TIMELINE_CONSTANTS.NUM_TRACKS * TIMELINE_CONSTANTS.TRACK_HEIGHT,
              minWidth: timelineWidth,
              position: 'relative'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseDown={handleTimelineMouseDown}
          >
            {/* Timeline Grid Lines */}
            <TimelineGrid 
              duration={duration} 
              timeToPixel={timeToPixel} 
            />

            {/* Video track - FIXED: Now displays the FULL video duration! */}
            <div
              className="absolute left-0 right-0 border-b border-gray-700 bg-gray-700"
              style={{
                top: 0,
                height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT
              }}
            >
              {/* FIXED: Removed the "- 10" that was cutting off the video */}
              {/* The video bar now extends the full duration */}
              <div
                className="absolute bg-blue-600 rounded opacity-80 flex items-center justify-center"
                style={{
                  left: '8px',  // Small left margin for visual clarity
                  top: '4px',
                  width: Math.max(0, timeToPixel(duration) - 16),  // Full duration minus margins
                  height: `${TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT - 8}px`
                }}
              >
                <span className="text-white text-xs font-medium">
                  Video ({Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')})
                </span>
              </div>
              
              <div className="absolute left-2 text-xs text-gray-300 font-medium" style={{ top: '2px' }}>
                V
              </div>
            </div>

            {/* Audio track backgrounds */}
            {Array.from({ length: TIMELINE_CONSTANTS.NUM_TRACKS }, (_, i) => (
              <div
                key={i}
                className={`absolute left-0 right-0 border-b border-gray-700 transition-colors ${
                  i % 2 === 0 ? 'bg-gray-850' : 'bg-gray-900'
                } ${
                  hoveredTrack === i ? 'bg-blue-900/20' : ''
                } ${
                  trackStates[`track-${i}`]?.muted ? 'opacity-50' : ''
                }`}
                style={{
                  top: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + i * TIMELINE_CONSTANTS.TRACK_HEIGHT,
                  height: TIMELINE_CONSTANTS.TRACK_HEIGHT
                }}
              >
                <div className="absolute left-2 top-1 text-xs text-gray-500 font-medium">
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Main playhead */}
            <Playhead
              currentTime={currentTime}
              timeToPixel={timeToPixel}
              isDraggingPlayhead={isDraggingPlayhead}
              onPlayheadMouseDown={onPlayheadMouseDown}
              isInHeader={false}
            />

            {/* Loops - FIXED: Added videoDuration prop + multi-select highlighting */}
            {placedLoops
              .filter(loop => trackStates[`track-${loop.trackIndex}`]?.visible !== false)
              .map((loop) => (
                <LoopBlock 
                  key={loop.id} 
                  loop={loop}
                  timeToPixel={timeToPixel}
                  trackStates={trackStates}
                  selectedLoop={selectedLoop}
                  draggedLoop={draggedLoop}
                  videoDuration={duration}
                  onLoopMouseDown={handleLoopMouseDown}
                  onLoopSelect={handleLoopSelectWithMulti}
                  onLoopUpdate={onLoopUpdate}
                  onLoopResize={onLoopResizeCallback}
                  onLoopDelete={handleLoopDeleteWithMulti}
                  isMultiSelected={selectedLoopIds?.has(loop.id)}
                />
              ))}

            {/* Selection box overlay */}
            {selectionBox && (
              <div style={getSelectionBoxStyle()}>
                {selectedLoopIds?.size > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-md shadow-lg text-sm font-semibold">
                      {selectedLoopIds.size} loop{selectedLoopIds.size !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Drop zone indicators */}
            {hoveredTrack !== null && (
              <div
                className="absolute left-0 right-0 border-2 border-dashed border-blue-400 bg-blue-400/10 pointer-events-none animate-pulse"
                style={{
                  top: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + hoveredTrack * TIMELINE_CONSTANTS.TRACK_HEIGHT,
                  height: TIMELINE_CONSTANTS.TRACK_HEIGHT
                }}
              >
                <div className="flex items-center justify-center h-full text-blue-400 font-medium text-sm">
                  Drop loop here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TimelineContent.displayName = 'TimelineContent';

export default TimelineContent;