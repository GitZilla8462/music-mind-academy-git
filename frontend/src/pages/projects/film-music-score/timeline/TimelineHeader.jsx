// File: /src/pages/projects/film-music-score/timeline/TimelineHeader.jsx
// FIXED: Removed loop count/zoom text, centered transport controls over video area
// FIXED: Added playersReady prop to disable play button while audio loads
// FIXED: Added debouncing to prevent double-click from toggling play/pause twice

import React, { useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

// Debounce time for play/pause toggle (prevents double-click issues)
const PLAY_PAUSE_DEBOUNCE_MS = 300;

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
  // Debounce ref for play/pause to prevent double-click issues
  const lastPlayPauseClickRef = useRef(0);

  const skipBackward = () => {
    if (!playersReady) return;
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
  };

  const skipForward = () => {
    if (!playersReady) return;
    const newTime = Math.min(duration, currentTime + 10);
    onSeek(newTime);
  };

  const handlePlayPause = useCallback(() => {
    // Debounce: prevent rapid double-clicks from toggling twice
    const now = Date.now();
    if (now - lastPlayPauseClickRef.current < PLAY_PAUSE_DEBOUNCE_MS) {
      console.log('⏸️ Play/pause debounced - ignoring rapid click');
      return;
    }
    lastPlayPauseClickRef.current = now;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [isPlaying, onPlay, onPause]);

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
              disabled={!playersReady}
              className={`p-2 rounded transition-colors ${
                playersReady
                  ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title="Restart"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={skipBackward}
              disabled={!playersReady}
              className={`p-2 rounded transition-colors ${
                playersReady
                  ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title={playersReady ? "Skip back 10s" : "Loading audio..."}
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!playersReady}
              className={`p-2 rounded transition-colors ${
                !playersReady
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isPlaying
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={!playersReady ? "Loading audio..." : isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </button>

            <button
              onClick={onStop}
              disabled={!playersReady}
              className={`p-2 rounded transition-colors ${
                playersReady
                  ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title="Stop"
            >
              <Square size={16} />
            </button>

            <button
              onClick={skipForward}
              disabled={!playersReady}
              className={`p-2 rounded transition-colors ${
                playersReady
                  ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title={playersReady ? "Skip forward 10s" : "Loading audio..."}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        {/* Right side - Zoom slider (gradual, centered at 100%) */}
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1 flex-shrink-0">
          <span className="text-xs text-gray-400">−</span>
          <div className="relative flex items-center">
            {/* Zoom slider - gradual, 0.25 to 0.75 with 0.5 in middle */}
            <input
              type="range"
              min="0.25"
              max="0.75"
              step="0.01"
              value={Math.max(0.25, Math.min(0.75, localZoom))}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
              title={`Zoom: ${Math.round(localZoom * 100)}%`}
            />
            {/* Center mark at 50% (default) */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-px h-1.5 bg-gray-400" title="50%"></div>
            </div>
          </div>
          <span className="text-xs text-gray-400">+</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineHeader;