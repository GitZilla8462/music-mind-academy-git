// File: /src/pages/projects/film-music-score/timeline/TimelineHeader.jsx
// FIXED: Removed loop count/zoom text, centered transport controls over video area
// FIXED: Added playersReady prop to disable play button while audio loads

import React from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, RotateCcw, Loader2 } from 'lucide-react';

const TimelineHeader = ({ 
  placedLoops, 
  localZoom, 
  onZoomChange, 
  duration, 
  showTimelineLabel = false,
  // Transport control props
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onRestart,
  currentTime,
  onSeek,
  // NEW: Track if audio players are ready
  playersReady = true
}) => {
  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    onSeek(newTime);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div className="bg-gray-800 px-3 py-1 border-b border-gray-700 flex-shrink-0">
      <div className="flex items-center justify-center relative">
        {/* Left spacer - takes up same width as track headers (154px) */}
        <div className="flex-shrink-0" style={{ width: '154px' }}></div>

        {/* Center - Transport Controls (centered in remaining space) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-1 bg-gray-700/50 rounded px-1 py-0.5">
            <button
              onClick={onRestart}
              className="p-1 rounded transition-colors text-gray-400 hover:text-white hover:bg-gray-600"
              title="Restart"
            >
              <RotateCcw size={14} />
            </button>
            
            <button
              onClick={skipBackward}
              className="p-1 rounded transition-colors text-gray-400 hover:text-white hover:bg-gray-600"
              title="Skip back 10s"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!playersReady && !isPlaying}
              className={`p-1.5 rounded transition-colors ${
                !playersReady && !isPlaying
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isPlaying
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={!playersReady && !isPlaying ? "Loading audio..." : isPlaying ? "Pause" : "Play"}
            >
              {!playersReady && !isPlaying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>

            <button
              onClick={onStop}
              className="p-1 rounded transition-colors text-gray-400 hover:text-white hover:bg-gray-600"
              title="Stop"
            >
              <Square size={14} />
            </button>

            <button
              onClick={skipForward}
              className="p-1 rounded transition-colors text-gray-400 hover:text-white hover:bg-gray-600"
              title="Skip forward 10s"
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* Right side - Zoom slider with hash marks */}
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1 flex-shrink-0">
          <span className="text-xs text-gray-400">Zoom:</span>
          <div className="relative flex items-center">
            {/* Zoom slider */}
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.25"
              value={localZoom > 2.0 ? 2.0 : localZoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((Math.min(localZoom, 2.0) - 0.25) / (2.0 - 0.25)) * 100}%, #4b5563 ${((Math.min(localZoom, 2.0) - 0.25) / (2.0 - 0.25)) * 100}%, #4b5563 100%)`
              }}
              title={`Zoom: ${Math.round(localZoom * 100)}%`}
            />
            {/* Hash marks below slider */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-0.5">
              <div className="w-px h-1 bg-gray-500" title="25%"></div>
              <div className="w-px h-1 bg-gray-500" title="50%"></div>
              <div className="w-px h-1 bg-gray-500" title="100%"></div>
              <div className="w-px h-1 bg-gray-500" title="200%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineHeader;