// File: /src/pages/projects/film-music-score/composer/components/ComposerLayout.jsx
// Main layout with resizable panels using ResizableSplitPane
// UPDATED: Split video area into left (assignment panel) and right (video player)
// UPDATED: Timeline label moved inline with time markers
// UPDATED: Added assignment panel support for tutorial mode
// UPDATED: Added playersReady prop to disable play button while audio loads
// UPDATED: Added Beat Maker panel support with creator menu

import React from 'react';
import LoopLibrary from '../../shared/LoopLibrary';
import VideoPlayer from '../../shared/VideoPlayer';
import Timeline from '../../timeline/Timeline';
import TransportControls from '../../shared/TransportControls';
import NotesPanel from './NotesPanel';
import ResizableSplitPane from '../../shared/ResizableSplitPane';
import CreatorPanel from '../../shared/CreatorPanel';
import FloatingBeatMaker from '../../shared/FloatingBeatMaker';
import FloatingMelodyMaker from '../../shared/FloatingMelodyMaker';

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
  restrictToCategory,
  lockedMood,
  showSoundEffects,
  currentlyPlayingPreview,
  assignmentPanelContent,  // NEW PROP
  playersReady,  // NEW: Track if audio players are ready
  
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
  highlightSelector,

  // Creator tools (Beat Maker, Melody Maker)
  showCreatorTools = false,
  creatorMenuOpen = false,
  setCreatorMenuOpen,
  beatMakerOpen = false,
  setBeatMakerOpen,
  melodyMakerOpen = false,
  setMelodyMakerOpen,
  customLoops = [],
  onAddCustomLoop,
  onAddMelodyLoop,
  onDeleteCustomLoop
}) => {
  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex overflow-hidden min-h-0"
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
          restrictToCategory={restrictToCategory}
          lockedMood={lockedMood}
          showSoundEffects={showSoundEffects}
          currentlyPlayingLoopId={currentlyPlayingPreview}
          highlighted={highlightSelector === '.loop-library'}
          customLoops={customLoops}
          onDeleteCustomLoop={onDeleteCustomLoop}
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
          // Tutorial Mode - Resizable split with taller default for challenge sidebar
          <ResizableSplitPane
            initialTopHeight={500}
            minTopHeight={200}
            minBottomHeight={300}
            topContent={
              // Video Player Area - Split into assignment panel + video
              <div className="h-full flex">
                {/* Assignment Panel - Only show if content provided */}
                {assignmentPanelContent && (
                  <div className="w-80 border-r border-gray-700 flex-shrink-0">
                    {assignmentPanelContent}
                  </div>
                )}
                
                {/* Video Player Section - Takes remaining space */}
                <div 
                  className="flex-1 p-4"
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
                      onSeek={handleSeek}
                      onPlay={handlePlay}
                      onPause={pause}
                    highlighted={highlightSelector === '.video-player-container'} />
                  </div>
                </div>
              </div>
            }
            bottomContent={
              // Timeline Section
              <div className="h-full">
                <Timeline
                  placedLoops={placedLoops}
                  duration={selectedVideo?.duration || 60}
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
                  onPlay={handlePlay}
                  onPause={pause}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  playersReady={playersReady}
                />
              </div>
            }
          />
        ) : (
          // Normal Mode - ResizableSplitPane with video area
          <ResizableSplitPane
            initialTopHeight={280}
            minTopHeight={100}
            minBottomHeight={300}
            topContent={
              // Creator Panel (left) + Video Player (right)
              <div className="h-full flex">
                {/* Assignment Panel - Only show if content provided */}
                {assignmentPanelContent && (
                  <div className="w-80 border-r border-gray-700 flex-shrink-0">
                    {assignmentPanelContent}
                  </div>
                )}

                {/* Creator Panel - Fixed on left of video area */}
                {showCreatorTools && (
                  <CreatorPanel
                    onOpenBeatMaker={() => setBeatMakerOpen(true)}
                    onOpenMelodyMaker={() => setMelodyMakerOpen(true)}
                    onOpenRecordAudio={() => {}}
                    activeTool={beatMakerOpen ? 'beat-maker' : melodyMakerOpen ? 'melody-maker' : null}
                  />
                )}

                {/* Video Player Section - Takes remaining space */}
                <div
                  className="flex-1 p-4 relative"
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
                      onSeek={handleSeek}
                      onPlay={handlePlay}
                      onPause={pause}
                      highlighted={highlightSelector === '.video-player-container'}
                    />
                  </div>
                </div>
              </div>
            }
            bottomContent={
              // Timeline Section
              <div className="h-full">
                <Timeline
                  placedLoops={placedLoops}
                  duration={selectedVideo?.duration || 60}
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
                  showTimelineLabel={true}
                  onPlay={handlePlay}
                  onPause={pause}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  playersReady={playersReady}
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

      {/* Floating Beat Maker Modal */}
      <FloatingBeatMaker
        isOpen={beatMakerOpen}
        onClose={() => setBeatMakerOpen(false)}
        onAddToProject={onAddCustomLoop}
        customLoopCount={customLoops.filter(l => l.type === 'custom-beat').length}
      />

      {/* Floating Melody Maker Modal */}
      <FloatingMelodyMaker
        isOpen={melodyMakerOpen}
        onClose={() => setMelodyMakerOpen(false)}
        onAddToProject={onAddMelodyLoop}
        customLoopCount={customLoops.filter(l => l.type === 'custom-melody').length}
      />
    </div>
  );
};

export default ComposerLayout;