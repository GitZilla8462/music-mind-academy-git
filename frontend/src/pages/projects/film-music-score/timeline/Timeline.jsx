// Updated Timeline.jsx - Pass trackStates to parent, handle track header clicks, AND pass onLoopResizeCallback
import React, { useRef, useEffect } from 'react';
import TimelineHeader from './TimelineHeader';
import TimelineContent from './TimelineContent';
import TimelineScrollbar from './TimelineScrollbar';
import TimelineStatusBar from './TimelineStatusBar';
import { useTimelineState } from './hooks/useTimelineState';
import { useTimelineScroll } from './hooks/useTimelineScroll';
import { usePlayheadDrag } from './hooks/usePlayheadDrag';

const Timeline = ({
  placedLoops,
  duration,
  currentTime,
  onLoopDrop,
  onLoopDelete,
  onLoopSelect,
  onLoopUpdate,
  onLoopResizeCallback,  // ADDED: Callback for loop resize
  onSeek,
  selectedLoop,
  isPlaying,
  onTrackStateChange,
  onTrackHeaderClick,
  onZoomChange,
  tutorialMode = false,
  lockFeatures = {},
  highlightSelector,
  showTimelineLabel = false,  // NEW PROP
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
        />
      </div>

      {/* Fixed Scrollbar */}
      <div className="fixed bottom-20 z-50" style={{ left: '320px', right: '0' }}>
        <TimelineScrollbar
          timelineScrollRef={timelineScrollRef}
          timelineWidth={timelineWidth}
          duration={duration}
          currentTime={currentTime}
        />
      </div>
    </>
  );
};

export default Timeline;