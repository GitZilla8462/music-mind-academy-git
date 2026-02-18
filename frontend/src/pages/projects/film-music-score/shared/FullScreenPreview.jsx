// FullScreenPreview.jsx - Full screen presentation mode
// Shows video on top, loop blocks below, transport controls at bottom

import React, { useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const FullScreenPreview = ({
  isOpen,
  onClose,
  placedLoops,
  selectedVideo,
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onRestart,
  volume,
  onVolumeChange
}) => {
  const videoRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get video URL
  const videoUrl = selectedVideo?.src ||
                   selectedVideo?.videoPath ||
                   selectedVideo?.url ||
                   selectedVideo?.path ||
                   selectedVideo?.videoUrl ||
                   selectedVideo?.file;

  // Sync video playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    if (isPlaying) {
      video.play().catch(err => console.error('Video play error:', err));
    } else {
      video.pause();
    }
  }, [isPlaying, isOpen]);

  // Sync video time when paused (for seeking)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen || isPlaying) return;

    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isPlaying, isOpen]);

  // Calculate playhead position as percentage
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time as M:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline click to seek
  const handleTimelineClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const newTime = percent * duration;
    onSeek(newTime);
  }, [duration, onSeek]);

  // Skip forward/backward by 5 seconds
  const handleSkipBack = useCallback(() => {
    const newTime = Math.max(0, currentTime - 5);
    onSeek(newTime);
  }, [currentTime, onSeek]);

  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 5);
    onSeek(newTime);
  }, [currentTime, duration, onSeek]);

  // Get unique track indices and sort them
  const trackIndices = [...new Set(placedLoops.map(loop => loop.trackIndex))].sort((a, b) => a - b);

  // Determine total tracks (at least show used tracks, max 8)
  const totalTracks = Math.max(4, Math.max(...trackIndices) + 1, 8);
  const trackHeight = 36;
  const trackLabelWidth = 64;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
        title="Close (Esc)"
      >
        <X size={22} />
      </button>

      {/* Top: Video */}
      <div className="flex-shrink-0 bg-black flex items-center justify-center" style={{ height: '45%' }}>
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain"
            playsInline
            preload="auto"
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <div className="text-gray-500 text-center">
            <Play size={48} className="mx-auto mb-2 opacity-50" />
            <p>No video selected</p>
          </div>
        )}
      </div>

      {/* Middle: Loop track lanes */}
      <div className="flex-1 bg-gray-900 border-t border-gray-700 flex flex-col overflow-hidden">
        {/* Timeline header (thin divider) */}
        <div className="h-1 bg-gray-800 border-b border-gray-700 flex-shrink-0" />

        {/* Track rows + loop blocks */}
        <div className="flex-1 relative overflow-hidden">
          {/* Track row backgrounds */}
          {Array.from({ length: totalTracks }).map((_, i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 border-b border-gray-800 flex ${
                i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
              }`}
              style={{ top: i * trackHeight, height: trackHeight }}
            >
              <div
                className="flex-shrink-0 flex items-center px-2 border-r border-gray-700 bg-gray-800/30"
                style={{ width: trackLabelWidth }}
              >
                <span className="text-[10px] text-gray-500 truncate">Track {i + 1}</span>
              </div>
            </div>
          ))}

          {/* Loop blocks */}
          {placedLoops.map((loop) => {
            const leftPercent = (loop.startTime / duration) * 100;
            const widthPercent = ((loop.endTime - loop.startTime) / duration) * 100;
            // Scale percentages to account for track label width
            const trackAreaPercent = (1 - trackLabelWidth / window.innerWidth) * 100;

            return (
              <div
                key={loop.id}
                className="absolute rounded overflow-hidden"
                style={{
                  left: `calc(${trackLabelWidth}px + ${leftPercent * trackAreaPercent / 100}%)`,
                  width: `${widthPercent * trackAreaPercent / 100}%`,
                  top: loop.trackIndex * trackHeight + 3,
                  height: trackHeight - 6,
                  backgroundColor: loop.color || '#3b82f6',
                  opacity: 0.9
                }}
              >
                <div className="px-1.5 py-0.5 text-[10px] text-white truncate font-medium">
                  {loop.name}
                </div>
              </div>
            );
          })}

          {/* Playhead — no transition for smooth rAF-driven movement */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `calc(${trackLabelWidth}px + ${playheadPercent * (1 - trackLabelWidth / window.innerWidth)}%)`, willChange: 'left' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom: Transport controls */}
      <div className="flex-shrink-0 h-14 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-3 px-6">
        <button onClick={onRestart} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Restart">
          <RotateCcw size={16} />
        </button>
        <button onClick={handleSkipBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Back 5 seconds">
          <SkipBack size={16} />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>
        <button onClick={handleSkipForward} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors" title="Forward 5 seconds">
          <SkipForward size={16} />
        </button>

        {/* Timeline scrubber */}
        <div
          className="flex-1 max-w-md mx-3 h-2 bg-gray-700 rounded cursor-pointer relative"
          onClick={handleTimelineClick}
        >
          <div
            className="h-full bg-blue-600 rounded"
            style={{ width: `${playheadPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2 ml-2">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume ?? 0.7}
            onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            title={`Volume: ${Math.round((volume ?? 0.7) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default FullScreenPreview;
