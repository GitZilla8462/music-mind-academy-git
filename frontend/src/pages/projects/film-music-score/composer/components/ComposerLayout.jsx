// File: /src/pages/projects/film-music-score/composer/components/ComposerLayout.jsx
// Main layout with resizable panels using ResizableSplitPane

import React from 'react';
import LoopLibrary from '../../shared/LoopLibrary';
import VideoPlayer from '../../shared/VideoPlayer';
import Timeline from '../../timeline/Timeline';
import TransportControls from '../../shared/TransportControls';
import NotesPanel from './NotesPanel';
import ResizableSplitPane from '../../shared/ResizableSplitPane';

const ComposerLayout = ({
  // State
  leftPanelWidth,
  topPanelHeight,
  tutorialMode,
  selectedVideo,
  selectedCategory,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  placedLoops,
  selectedLoop,
  trackStates,
  showNotesPanel,
  submissionNotes,
  isDemo,
  isPractice,
  
  // Callbacks
  onLoopLibraryClick,
  onVideoPlayerClick,
  onTrackHeaderClick,
  onZoomChange,
  setIsResizingLeft,
  setIsResizingTop,
  setSelectedCategory,
  handleLoopPreview,
  handleSeek,
  setMasterVolume,
  toggleMute,
  handleLoopDrop,
  handleLoopDelete,
  handleLoopSelect,
  handleLoopUpdate,
  onLoopResizeCallback,
  handleTrackStateChange,
  handlePlay,
  pause,
  handleStop,
  handleRestart,
  setSubmissionNotes,
  setHasUnsavedChanges,
  
  // Refs
  containerRef,
  
  // Tutorial/Lock features
  lockFeatures,
  highlightSelector
}) => {
  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex overflow-hidden min-h-0 pb-20"
    >
      {/* Left Panel - Loop Library */}
      <div 
        style={{ width: leftPanelWidth }} 
        className="bg-gray-800 border-r border-gray-700 flex flex-col"
        onClick={() => {
          if (lockFeatures.allowLoopLibraryClick !== false) {
            onLoopLibraryClick?.();
          }
        }}
      >
        <LoopLibrary
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onLoopPreview={handleLoopPreview}
          onLoopDragStart={() => {}}
          tutorialMode={tutorialMode}
          lockFeatures={lockFeatures}
        />
      </div>

      {/* Left Resizer */}
      {!tutorialMode && (
        <div
          className="w-px bg-gray-500 hover:bg-blue-400 cursor-col-resize transition-colors relative group"
          onMouseDown={() => setIsResizingLeft(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20" />
        </div>
      )}

      {/* Center Panel - Video and Timeline with ResizableSplitPane */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {tutorialMode ? (
          // Tutorial Mode - Fixed heights without resizing
          <>
            {/* Video Player */}
            <div className="flex-shrink-0" style={{ height: '300px' }}>
              <div 
                className="h-full p-4"
                onClick={() => {
                  if (onVideoPlayerClick) {
                    onVideoPlayerClick();
                  }
                }}
              >
                <div className="h-full">
                  <VideoPlayer
                    selectedVideo={selectedVideo}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    volume={volume}
                    isMuted={isMuted}
                    onSeek={handleSeek}
                    onVolumeChange={setMasterVolume}
                    onToggleMute={toggleMute}
                    maxHeight={268}
                    tutorialMode={tutorialMode}
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 min-h-0">
              <Timeline
                placedLoops={placedLoops}
                duration={selectedVideo.duration}
                currentTime={currentTime}
                onLoopDrop={handleLoopDrop}
                onLoopDelete={handleLoopDelete}
                onLoopSelect={handleLoopSelect}
                onLoopUpdate={handleLoopUpdate}
                onLoopResize={onLoopResizeCallback}
                onSeek={handleSeek}
                selectedLoop={selectedLoop}
                isPlaying={isPlaying}
                onTrackStateChange={handleTrackStateChange}
                onTrackHeaderClick={onTrackHeaderClick}
                onZoomChange={onZoomChange}
                tutorialMode={tutorialMode}
                lockFeatures={lockFeatures}
                highlightSelector={highlightSelector}
              />
            </div>
          </>
        ) : (
          // Normal Mode - ResizableSplitPane
          <ResizableSplitPane
            initialTopHeight={200}
            minTopHeight={100}
            minBottomHeight={300}
            topContent={
              // Video Player Section
              <div 
                className="h-full p-4"
                onClick={() => {
                  if (onVideoPlayerClick) {
                    onVideoPlayerClick();
                  }
                }}
              >
                <div className="h-full">
                  <VideoPlayer
                    selectedVideo={selectedVideo}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    volume={volume}
                    isMuted={isMuted}
                    onSeek={handleSeek}
                    onVolumeChange={setMasterVolume}
                    onToggleMute={toggleMute}
                    maxHeight={168}
                    tutorialMode={false}
                  />
                </div>
              </div>
            }
            bottomContent={
              // Timeline Section
              <div className="h-full">
                <Timeline
                  placedLoops={placedLoops}
                  duration={selectedVideo.duration}
                  currentTime={currentTime}
                  onLoopDrop={handleLoopDrop}
                  onLoopDelete={handleLoopDelete}
                  onLoopSelect={handleLoopSelect}
                  onLoopUpdate={handleLoopUpdate}
                  onLoopResize={onLoopResizeCallback}
                  onSeek={handleSeek}
                  selectedLoop={selectedLoop}
                  isPlaying={isPlaying}
                  onTrackStateChange={handleTrackStateChange}
                  onTrackHeaderClick={onTrackHeaderClick}
                  onZoomChange={onZoomChange}
                  tutorialMode={false}
                  lockFeatures={lockFeatures}
                  highlightSelector={highlightSelector}
                />
              </div>
            }
          />
        )}
      </div>

      {/* Right Panel - Notes (conditional) */}
      {showNotesPanel && !tutorialMode && !isDemo && !isPractice && (
        <NotesPanel
          submissionNotes={submissionNotes}
          setSubmissionNotes={setSubmissionNotes}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      )}

      {/* Fixed Transport Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800">
        <TransportControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={selectedVideo.duration}
          volume={volume}
          isMuted={isMuted}
          onPlay={handlePlay}
          onPause={pause}
          onStop={handleStop}
          onSeek={handleSeek}
          onVolumeChange={setMasterVolume}
          onToggleMute={toggleMute}
          onRestart={handleRestart}
          tutorialMode={tutorialMode}
          lockFeatures={lockFeatures}
        />
      </div>
    </div>
  );
};

export default ComposerLayout;