// File: /src/pages/projects/film-music-score/timeline/TimelineHeader.jsx
// UPDATED: Added transport controls (play/pause/stop/skip) on left side of zoom controls

import React, { useMemo } from 'react';
import { Activity, Play, Pause, Square, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

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
  onSeek
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
      <div className="flex items-center relative">
        {/* Left side - Loop count and zoom info */}
        <div className="flex items-center space-x-3">
          {!showTimelineLabel && (
            <>
              <h3 className="text-white font-semibold text-sm">Timeline</h3>
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                <Activity size={12} />
                <span>{placedLoops.length} loops</span>
                <span>•</span>
                <span>Zoom: {Math.round(localZoom * 100)}%</span>
              </div>
            </>
          )}
          {showTimelineLabel && (
            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              <Activity size={12} />
              <span>{placedLoops.length} loops</span>
              <span>•</span>
              <span>Zoom: {Math.round(localZoom * 100)}%</span>
            </div>
          )}
        </div>

        {/* Center - Transport Controls (positioned to align with video area) */}
        <div className="absolute left-[63%] transform -translate-x-1/2 flex items-center space-x-1 bg-gray-700/50 rounded px-1 py-0.5">
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
            className={`p-1.5 rounded transition-colors ${
              isPlaying
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
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

        {/* Right side - Zoom slider with hash marks */}
        <div className="ml-auto flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1">
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