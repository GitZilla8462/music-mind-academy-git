// File: /src/pages/projects/film-music-score/timeline/TimelineContent.jsx
// REFACTORED: Uses InteractionOverlay for all mouse events
// Visual elements have pointer-events: none
// This eliminates cursor flickering on Chromebooks

import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import TimeMarkers from './components/TimeMarkers';
import VideoTrackHeader from './components/VideoTrackHeader';
import TrackHeader from './components/TrackHeader';
import LoopBlock from './components/LoopBlock';
import Playhead from './components/Playhead';
import TimelineGrid from './components/TimelineGrid';
import InteractionOverlay from './components/InteractionOverlay';
import { TIMELINE_CONSTANTS } from './constants/timelineConstants';

const TimelineContent = forwardRef(({
  placedLoops,
  duration,
  currentTime,
  trackStates,
  timelineWidth,
  timeToPixel,
  pixelToTime,
  isDraggingPlayhead,
  setIsDraggingPlayhead,
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
  // Selection box props
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Time ruler scrubbing state
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Handle time ruler scrubbing (click/drag to seek)
  const handleTimeRulerMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Left click only

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = timeHeaderRef?.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const time = pixelToTime(x);
    const constrainedTime = Math.max(0, Math.min(duration, time));

    setIsScrubbing(true);
    setIsDraggingPlayhead(true);
    onSeek?.(constrainedTime);
  }, [pixelToTime, duration, onSeek, setIsDraggingPlayhead, timeHeaderRef]);

  const handleTimeRulerMouseMove = useCallback((e) => {
    if (!isScrubbing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = timeHeaderRef?.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const time = pixelToTime(x);
    const constrainedTime = Math.max(0, Math.min(duration, time));

    onSeek?.(constrainedTime);
  }, [isScrubbing, pixelToTime, duration, onSeek, timeHeaderRef]);

  const handleTimeRulerMouseUp = useCallback(() => {
    setIsScrubbing(false);
    setIsDraggingPlayhead(false);
  }, [setIsDraggingPlayhead]);

  // Global mouse up listener for scrubbing (in case mouse leaves the header)
  useEffect(() => {
    if (isScrubbing) {
      const handleGlobalMouseUp = () => {
        setIsScrubbing(false);
        setIsDraggingPlayhead(false);
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isScrubbing, setIsDraggingPlayhead]);

  // ============================================================================
  // SELECTION BOX HANDLERS (delegated from overlay)
  // ============================================================================
  
  const handleSelectionStartFromOverlay = useCallback((startPos) => {
    if (handleSelectionStart) {
      // Create a synthetic event-like object
      handleSelectionStart({
        clientX: startPos.x,
        clientY: startPos.y,
        preventDefault: () => {},
        stopPropagation: () => {}
      });
    }
  }, [handleSelectionStart]);

  const handleSelectionUpdate = useCallback((box) => {
    // Calculate which loops are in the selection box
    if (!box || !placedLoops) return;
    
    const selected = new Set();
    
    placedLoops.forEach(loop => {
      const loopLeft = timeToPixel(loop.startTime);
      const loopRight = timeToPixel(loop.endTime);
      const loopTop = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT);
      const loopBottom = loopTop + TIMELINE_CONSTANTS.TRACK_HEIGHT;
      
      const boxLeft = Math.min(box.startX, box.currentX);
      const boxRight = Math.max(box.startX, box.currentX);
      const boxTop = Math.min(box.startY, box.currentY);
      const boxBottom = Math.max(box.startY, box.currentY);
      
      // Check intersection
      if (loopRight >= boxLeft && loopLeft <= boxRight &&
          loopBottom >= boxTop && loopTop <= boxBottom) {
        selected.add(loop.id);
      }
    });
    
    setSelectedLoopIds?.(selected);
  }, [placedLoops, timeToPixel, setSelectedLoopIds]);

  const handleSelectionEnd = useCallback(() => {
    // Selection box handled, nothing to do here
  }, []);

  // ============================================================================
  // CONTEXT MENU HANDLER
  // ============================================================================
  
  const handleContextMenu = useCallback((e, loop) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      loop
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteFromContextMenu = useCallback(() => {
    if (contextMenu?.loop) {
      // Handle multi-selection delete
      if (selectedLoopIds?.has(contextMenu.loop.id) && selectedLoopIds.size > 1) {
        selectedLoopIds.forEach(id => onLoopDelete(id));
        setSelectedLoopIds?.(new Set());
      } else {
        onLoopDelete(contextMenu.loop.id);
      }
    }
    closeContextMenu();
  }, [contextMenu, selectedLoopIds, onLoopDelete, setSelectedLoopIds, closeContextMenu]);

  // Close context menu on click outside
  React.useEffect(() => {
    if (contextMenu) {
      const handleClick = () => closeContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu, closeContextMenu]);

  // ============================================================================
  // LOOP UPDATE HANDLER (with multi-select support)
  // ============================================================================
  
  const handleLoopUpdateWithMulti = useCallback((loopId, updates) => {
    // If this loop is part of multi-selection, move all selected loops
    if (selectedLoopIds?.has(loopId) && selectedLoopIds.size > 1 && updates.trackIndex !== undefined) {
      const targetLoop = placedLoops.find(l => l.id === loopId);
      if (!targetLoop) {
        onLoopUpdate(loopId, updates);
        return;
      }
      
      const trackDelta = updates.trackIndex - targetLoop.trackIndex;
      const timeDelta = updates.startTime - targetLoop.startTime;
      
      selectedLoopIds.forEach(id => {
        const loop = placedLoops.find(l => l.id === id);
        if (loop) {
          const newTrack = Math.max(0, Math.min(TIMELINE_CONSTANTS.NUM_TRACKS - 1, loop.trackIndex + trackDelta));
          const newStart = Math.max(0, loop.startTime + timeDelta);
          const loopDuration = loop.endTime - loop.startTime;
          
          onLoopUpdate(id, {
            trackIndex: newTrack,
            startTime: newStart,
            endTime: newStart + loopDuration
          });
        }
      });
    } else {
      onLoopUpdate(loopId, updates);
    }
  }, [selectedLoopIds, placedLoops, onLoopUpdate]);

  // ============================================================================
  // SELECTION BOX STYLE
  // ============================================================================
  
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-1 min-h-0 relative">
      {/* Fixed time header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex">
        {/* Spacer matching track headers width */}
        <div 
          className="bg-gray-800 border-r border-gray-600" 
          style={{ width: '154px', height: TIMELINE_CONSTANTS.HEADER_HEIGHT }} 
        />
        
        <div
          ref={timeHeaderRef}
          className="flex-1 overflow-x-hidden bg-gray-800 border-b border-gray-700"
          style={{ height: TIMELINE_CONSTANTS.HEADER_HEIGHT, cursor: isScrubbing ? 'col-resize' : 'pointer' }}
          onScroll={onTimeHeaderScroll}
          onMouseDown={handleTimeRulerMouseDown}
          onMouseMove={handleTimeRulerMouseMove}
          onMouseUp={handleTimeRulerMouseUp}
        >
          <div
            className="relative bg-gray-800"
            style={{ width: timelineWidth, height: TIMELINE_CONSTANTS.HEADER_HEIGHT, cursor: 'inherit' }}
          >
            <TimeMarkers 
              duration={duration} 
              timeToPixel={timeToPixel} 
              showTimelineLabel={showTimelineLabel}
            />
            
            {/* Playhead in header - visual only */}
            <Playhead
              currentTime={currentTime}
              timeToPixel={timeToPixel}
              isDraggingPlayhead={isDraggingPlayhead}
              onPlayheadMouseDown={() => {}} // No-op, handled by overlay
              isInHeader={true}
            />
          </div>
        </div>
      </div>

      {/* Track headers - with hidden scrollbar */}
      <div 
        ref={headerScrollRef}
        className="bg-gray-800 border-r border-gray-600 overflow-y-scroll overflow-x-hidden z-20 scrollbar-hidden"
        onScroll={onHeaderScroll}
        style={{ 
          width: '154px',
          maxHeight: '576px',
          minHeight: 0,
          paddingTop: TIMELINE_CONSTANTS.HEADER_HEIGHT,
          paddingBottom: '20px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
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
          data-timeline-scroll="true"
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
            data-timeline-content="true"
            style={{
              width: timelineWidth,
              height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + TIMELINE_CONSTANTS.NUM_TRACKS * TIMELINE_CONSTANTS.TRACK_HEIGHT,
              minWidth: timelineWidth,
              position: 'relative'
            }}
          >
            {/* ============================================================ */}
            {/* VISUAL LAYER - All pointer-events: none */}
            {/* ============================================================ */}
            
            {/* Timeline Grid Lines */}
            <TimelineGrid 
              duration={duration} 
              timeToPixel={timeToPixel} 
            />

            {/* Video track */}
            <div
              className="absolute left-0 right-0 border-b border-gray-700 bg-gray-700"
              style={{
                top: 0,
                height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT,
                pointerEvents: 'none'
              }}
            >
              <div
                className="absolute bg-blue-600 rounded opacity-80 flex items-center justify-center"
                style={{
                  left: '8px',
                  top: '4px',
                  width: Math.max(0, timeToPixel(duration) - 16),
                  height: `${TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT - 8}px`,
                  pointerEvents: 'none'
                }}
              >
                <span className="text-white text-xs font-medium pointer-events-none">
                  Video ({Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')})
                </span>
              </div>
              
              <div 
                className="absolute left-2 text-xs text-gray-300 font-medium pointer-events-none" 
                style={{ top: '2px' }}
              >
                V
              </div>
            </div>

            {/* Audio track backgrounds */}
            {Array.from({ length: TIMELINE_CONSTANTS.NUM_TRACKS }, (_, i) => (
              <div
                key={i}
                data-track-row={i}
                className={`absolute left-0 right-0 border-b border-gray-700 transition-colors ${
                  i % 2 === 0 ? 'bg-gray-850' : 'bg-gray-900'
                } ${
                  hoveredTrack === i ? 'bg-blue-900/20' : ''
                } ${
                  trackStates[`track-${i}`]?.muted ? 'opacity-50' : ''
                }`}
                style={{
                  top: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + i * TIMELINE_CONSTANTS.TRACK_HEIGHT,
                  height: TIMELINE_CONSTANTS.TRACK_HEIGHT,
                  pointerEvents: 'none'
                }}
              >
                <div className="absolute left-2 top-1 text-xs text-gray-500 font-medium pointer-events-none">
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Main playhead - visual only */}
            <Playhead
              currentTime={currentTime}
              timeToPixel={timeToPixel}
              isDraggingPlayhead={isDraggingPlayhead}
              onPlayheadMouseDown={() => {}} // No-op, handled by overlay
              isInHeader={false}
            />

            {/* Loop blocks - visual only, no event handlers */}
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
                  isMultiSelected={selectedLoopIds?.has(loop.id)}
                />
              ))}

            {/* Selection box visual */}
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
                <div className="flex items-center justify-center h-full text-blue-400 font-medium text-sm pointer-events-none">
                  Drop loop here
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* INTERACTION OVERLAY - Handles ALL mouse events */}
            {/* ============================================================ */}
            
            <InteractionOverlay
              // Data
              placedLoops={placedLoops}
              duration={duration}
              currentTime={currentTime}
              trackStates={trackStates}
              selectedLoop={selectedLoop}
              selectedLoopIds={selectedLoopIds}
              
              // Conversion functions
              timeToPixel={timeToPixel}
              pixelToTime={pixelToTime}
              
              // Refs
              timelineRef={timelineRef}
              timelineScrollRef={timelineScrollRef}
              
              // Loop handlers
              onLoopSelect={onLoopSelect}
              onLoopUpdate={handleLoopUpdateWithMulti}
              onLoopDelete={onLoopDelete}
              onLoopDrop={onLoopDrop}
              onLoopResize={onLoopResizeCallback}
              
              // Playhead handlers
              onSeek={onSeek}
              onPlayheadDragStart={() => setIsDraggingPlayhead?.(true)}
              onPlayheadDragEnd={() => setIsDraggingPlayhead?.(false)}
              
              // Selection handlers
              onSelectionStart={handleSelectionStartFromOverlay}
              onSelectionUpdate={handleSelectionUpdate}
              onSelectionEnd={handleSelectionEnd}
              
              // State
              isDraggingPlayhead={isDraggingPlayhead}
              setIsDraggingPlayhead={setIsDraggingPlayhead}
              
              // Context menu
              onContextMenu={handleContextMenu}
              
              // Lock features
              lockFeatures={lockFeatures}
              
              // Drag & drop from library
              hoveredTrack={hoveredTrack}
              setHoveredTrack={setHoveredTrack}
            />
          </div>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-1 z-[9999]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            minWidth: '140px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDeleteFromContextMenu}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>
              {selectedLoopIds?.size > 1 ? `Delete ${selectedLoopIds.size} loops` : 'Delete Loop'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
});

TimelineContent.displayName = 'TimelineContent';

export default TimelineContent;// force rebuild Sat Dec 13 14:52:38 EST 2025