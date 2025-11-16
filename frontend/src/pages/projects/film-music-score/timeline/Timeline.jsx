// Updated Timeline.jsx - Added selection box for multi-select functionality
import React, { useRef, useEffect, useState, useCallback } from 'react';
import TimelineHeader from './TimelineHeader';
import TimelineContent from './TimelineContent';
import TimelineScrollbar from './TimelineScrollbar';
import TimelineStatusBar from './TimelineStatusBar';
import { useTimelineState } from './hooks/useTimelineState';
import { useTimelineScroll } from './hooks/useTimelineScroll';
import { usePlayheadDrag } from './hooks/usePlayheadDrag';
import { useSelectionBox } from './hooks/useSelectionBox';

const Timeline = ({
  placedLoops,
  duration,
  currentTime,
  onLoopDrop,
  onLoopDelete,
  onLoopSelect,
  onLoopUpdate,
  onLoopResizeCallback,
  onSeek,
  selectedLoop,
  isPlaying,
  onTrackStateChange,
  onTrackHeaderClick,
  onZoomChange,
  tutorialMode = false,
  lockFeatures = {},
  highlightSelector,
  showTimelineLabel = false,
  // Transport controls
  onPlay,
  onPause,
  onStop,
  onRestart
}) => {
  // Refs for timeline elements
  const timelineRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const headerScrollRef = useRef(null);
  const timeHeaderRef = useRef(null);

  // Multi-selection state
  const [multiSelectedLoops, setMultiSelectedLoops] = useState([]);

  // Custom hooks for state management
  const {
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
  } = useTimelineState(duration);

  // Selection box hook
  const {
    selectionBox,
    selectedLoopIds,
    setSelectedLoopIds,
    handleSelectionStart,
    isSelectingBox
  } = useSelectionBox(
    timelineRef,
    timelineScrollRef,
    placedLoops,
    (loopIds) => {
      setMultiSelectedLoops(loopIds);
    },
    isPlaying
  );

  // Notify parent whenever track states change
  useEffect(() => {
    if (onTrackStateChange) {
      onTrackStateChange(trackStates);
    }
  }, [trackStates, onTrackStateChange]);

  // Custom hooks for scroll synchronization
  const {
    handleTimelineScroll,
    handleHeaderScroll,
    handleTimeHeaderScroll
  } = useTimelineScroll(timelineScrollRef, headerScrollRef, timeHeaderRef);

  // Custom hook for playhead dragging
  const {
    isDraggingPlayhead,
    handlePlayheadMouseDown,
    handleTimelineClick
  } = usePlayheadDrag(timelineRef, pixelToTime, duration, onSeek);

  // Wrap zoom change to notify parent
  const handleZoomChangeWithCallback = (newZoom) => {
    const oldZoom = localZoom;
    handleZoomChange(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom, oldZoom);
    }
  };

  // Handle multi-delete with Delete/Backspace key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLoopIds.size > 0) {
        e.preventDefault();
        
        // Delete all selected loops
        selectedLoopIds.forEach(loopId => {
          onLoopDelete(loopId);
        });
        
        // Clear selection
        setSelectedLoopIds(new Set());
        setMultiSelectedLoops([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLoopIds, onLoopDelete, setSelectedLoopIds]);

  return (
    <>
      {/* Timeline Container */}
      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col" style={{ paddingBottom: '60px' }}>
        {/* Timeline Header */}
        <TimelineHeader 
          placedLoops={placedLoops}
          localZoom={localZoom}
          onZoomChange={handleZoomChangeWithCallback}
          duration={duration}
          showTimelineLabel={showTimelineLabel}
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onRestart={onRestart}
          currentTime={currentTime}
          onSeek={onSeek}
        />
        
        {/* Timeline Content */}
        <TimelineContent
          ref={{
            timelineRef,
            timelineScrollRef,
            headerScrollRef,
            timeHeaderRef
          }}
          placedLoops={placedLoops}
          duration={duration}
          currentTime={currentTime}
          trackStates={trackStates}
          timelineWidth={timelineWidth}
          timeToPixel={timeToPixel}
          pixelToTime={pixelToTime}
          isDraggingPlayhead={isDraggingPlayhead}
          draggedLoop={draggedLoop}
          setDraggedLoop={setDraggedLoop}
          dragOffset={dragOffset}
          setDragOffset={setDragOffset}
          hoveredTrack={hoveredTrack}
          setHoveredTrack={setHoveredTrack}
          onLoopDrop={onLoopDrop}
          onLoopDelete={onLoopDelete}
          onLoopSelect={onLoopSelect}
          onLoopUpdate={onLoopUpdate}
          onLoopResizeCallback={onLoopResizeCallback}
          onSeek={onSeek}
          onPlayheadMouseDown={handlePlayheadMouseDown}
          onTimelineScroll={handleTimelineScroll}
          onHeaderScroll={handleHeaderScroll}
          onTimeHeaderScroll={handleTimeHeaderScroll}
          updateTrackState={updateTrackState}
          selectedLoop={selectedLoop}
          localZoom={localZoom}
          isPlaying={isPlaying}
          onTrackHeaderClick={onTrackHeaderClick}
          tutorialMode={tutorialMode}
          lockFeatures={lockFeatures}
          highlightSelector={highlightSelector}
          showTimelineLabel={showTimelineLabel}
          selectionBox={selectionBox}
          selectedLoopIds={selectedLoopIds}
          setSelectedLoopIds={setSelectedLoopIds}
          handleSelectionStart={handleSelectionStart}
          isSelectingBox={isSelectingBox}
        />
      </div>

      {/* Fixed Scrollbar */}
      <div className="fixed bottom-0 z-50" style={{ left: '320px', right: '0' }}>
        <TimelineScrollbar
          timelineScrollRef={timelineScrollRef}
          timelineWidth={timelineWidth}
          duration={duration}
          currentTime={currentTime}
        />
      </div>
      
      {/* Help text */}
      <div className="fixed bottom-6 left-6 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg z-40">
        💡 <strong>Tip:</strong> Click and drag on empty timeline to select multiple loops • Press Delete to remove • Drag playhead to seek
      </div>
    </>
  );
};

export default Timeline;