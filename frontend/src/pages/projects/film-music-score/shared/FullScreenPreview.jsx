// FullScreenPreview.jsx - Full screen presentation mode
// Shows loop blocks on left, video on right, simple transport controls at bottom

import React, { useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

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
  onRestart
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

  // Get unique track indices and sort them
  const trackIndices = [...new Set(placedLoops.map(loop => loop.trackIndex))].sort((a, b) => a - b);

  // Determine total tracks (at least show used tracks, max 8)
  const totalTracks = Math.max(4, Math.max(...trackIndices) + 1, 8);
  const trackHeight = 32; // Height of each track row in pixels

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      {/* Main content - loops left, video right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Loop blocks (35%) */}
        <div className="w-[35%] bg-gray-900 flex flex-col border-r border-gray-700">
          {/* Timeline header with time markers */}
          <div className="h-6 bg-gray-800 border-b border-gray-700 flex items-center px-2">
            <span className="text-xs text-gray-500">0:00</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
          </div>

          {/* Loop blocks area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Track rows background */}
            {Array.from({ length: totalTracks }).map((_, i) => (
              <div
                key={i}
                className={`absolute left-0 right-0 border-b border-gray-800 ${
                  i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
                }`}
                style={{
                  top: i * trackHeight,
                  height: trackHeight
                }}
              />
            ))}

            {/* Loop blocks */}
            {placedLoops.map((loop) => {
              const leftPercent = (loop.startTime / duration) * 100;
              const widthPercent = ((loop.endTime - loop.startTime) / duration) * 100;

              return (
                <div
                  key={loop.id}
                  className="absolute rounded overflow-hidden"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    top: loop.trackIndex * trackHeight + 2,
                    height: trackHeight - 4,
                    backgroundColor: loop.color || '#3b82f6',
                    opacity: 0.9
                  }}
                >
                  <div className="px-1 py-0.5 text-[10px] text-white truncate font-medium">
                    {loop.name}
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>

          {/* Mini scrubber */}
          <div
            className="h-8 bg-gray-800 border-t border-gray-700 cursor-pointer relative"
            onClick={handleTimelineClick}
          >
            <div className="absolute inset-2 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-100"
                style={{ width: `${playheadPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right side - Video (65%) */}
        <div className="w-[65%] bg-black flex items-center justify-center p-4">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="max-h-full max-w-full object-contain"
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
      </div>

      {/* Bottom transport controls */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4 px-4">
        <button
          onClick={onRestart}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
          title="Restart"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-4 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        <div className="text-white font-mono text-lg ml-4">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPreview;
