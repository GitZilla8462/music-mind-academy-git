import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Maximize2 } from 'lucide-react';

const VideoPlayer = ({ 
  selectedVideo, 
  isPlaying, 
  currentTime, 
  volume, 
  isMuted, 
  onSeek, 
  onVolumeChange, 
  onToggleMute,
  onTogglePlayPause, // Added missing prop
  maxHeight = 300
}) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const lastSeekTime = useRef(0);

  // Calculate video height based on available space
  const videoHeight = Math.min(maxHeight - 80, 400);

  // Enhanced video sync with live scrubbing support
  useEffect(() => {
    if (!videoRef.current || !videoLoaded) return;

    const video = videoRef.current;
    const timeDifference = Math.abs(video.currentTime - currentTime);
    
    // Always sync video time when currentTime changes (including during scrubbing)
    if (timeDifference > 0.1) {
      video.currentTime = currentTime;
      lastSeekTime.current = Date.now();
    }
    
    // Handle playback state
    if (isPlaying && video.paused) {
      // Small delay after seeking to prevent audio/video desync
      const timeSinceSeek = Date.now() - lastSeekTime.current;
      if (timeSinceSeek > 100) {
        video.play().catch(console.error);
      } else {
        // Retry play after a short delay
        setTimeout(() => {
          if (isPlaying && video.paused) {
            video.play().catch(console.error);
          }
        }, 150 - timeSinceSeek);
      }
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, currentTime, videoLoaded]);

  // Handle video events
  const handleVideoLoadedMetadata = () => {
    setVideoLoaded(true);
    // Set initial time when video loads
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || isPlaying || isScrubbing) return;
    
    // Only sync if user manually sought in the video (not during playback or scrubbing)
    const videoTime = videoRef.current.currentTime;
    const timeDifference = Math.abs(videoTime - currentTime);
    
    if (timeDifference > 0.5) {
      onSeek(videoTime);
    }
  };

  // Enhanced video seeking with better precision
  const handleVideoSeek = (e) => {
    // Don't seek if clicking on overlay controls
    if (e.target !== videoRef.current) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const rect = video.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progress * video.duration;
    
    if (!isNaN(newTime) && newTime >= 0) {
      onSeek(newTime);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progress * selectedVideo.duration;
    
    if (!isNaN(newTime) && newTime >= 0) {
      onSeek(newTime);
    }
  };

  // Detect when external scrubbing starts/ends (from timeline)
  useEffect(() => {
    const checkScrubbing = () => {
      const now = Date.now();
      const timeSinceLastSeek = now - lastSeekTime.current;
      
      // Consider it scrubbing if we've had recent seeks
      setIsScrubbing(timeSinceLastSeek < 200);
    };

    const interval = setInterval(checkScrubbing, 50);
    return () => clearInterval(interval);
  }, []);

  // Prevent video from playing during scrubbing
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    if (isScrubbing && !video.paused) {
      video.pause();
    }
  }, [isScrubbing]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle play/pause button click
  const handlePlayPauseClick = (e) => {
    e.stopPropagation();
    if (onTogglePlayPause) {
      onTogglePlayPause();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!selectedVideo) {
    return (
      <div 
        className="bg-gray-800 flex items-center justify-center border border-gray-700 rounded"
        style={{ height: videoHeight }}
      >
        <div className="text-center text-gray-400">
          <Play size={48} className="mx-auto mb-2 opacity-50" />
          <p>No video selected</p>
          <p className="text-sm">Select a video to start composing</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-800 rounded border border-gray-700 overflow-hidden flex flex-col"
      style={{ height: maxHeight }}
    >
      {/* Video Container */}
      <div className="relative bg-black flex-1" style={{ height: videoHeight }}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={selectedVideo.videoPath}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onTimeUpdate={handleVideoTimeUpdate}
          onClick={handleVideoSeek}
          muted={false}
          preload="metadata"
          style={{ maxHeight: videoHeight }}
        />

        {/* Scrubbing indicator */}
        {isScrubbing && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            Scrubbing
          </div>
        )}

        {/* Video Overlay Controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-all"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Controls Panel - Volume Controls Removed */}
      <div className="p-3 bg-gray-700 border-t border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-white text-sm">{selectedVideo.title}</h3>
            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
              {selectedVideo.mood}
            </span>
            {isScrubbing && (
              <span className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded animate-pulse">
                Live Scrubbing
              </span>
            )}
          </div>
        </div>

        {selectedVideo.description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{selectedVideo.description}</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;