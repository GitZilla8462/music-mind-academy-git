// File: /src/pages/projects/film-music-score/shared/VideoPlayer.jsx
// OPTIMIZED FOR CHROMEBOOK PERFORMANCE - SYNC DISABLED
// UPDATED: Added tutorial highlight support
// FIXED: Wrapped in React.memo to prevent cursor flickering during playback
// CHROMEBOOK FIX: Stable cursor to prevent flickering
// FIXED: Added debouncing to prevent double-click issues

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play } from 'lucide-react';

// Debounce time for play/pause toggle (prevents double-click issues)
const PLAY_PAUSE_DEBOUNCE_MS = 300;

const VideoPlayer = ({
  videoUrl,
  selectedVideo,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onVideoReady,
  duration,
  highlighted = false  // NEW: Highlight for tutorial
}) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const lastClickRef = useRef(0);

  // Extract video URL from either prop format
  const actualVideoUrl = videoUrl || 
                        selectedVideo?.src || 
                        selectedVideo?.videoPath ||
                        selectedVideo?.url || 
                        selectedVideo?.path || 
                        selectedVideo?.videoUrl || 
                        selectedVideo?.file;

  // Debug logging
  useEffect(() => {
    console.log('🎬 VideoPlayer Debug:', {
      hasVideoUrl: !!videoUrl,
      hasSelectedVideo: !!selectedVideo,
      selectedVideoObject: selectedVideo,
      actualVideoUrl,
      isVideoLoaded,
      highlighted
    });
  }, [videoUrl, selectedVideo, actualVideoUrl, isVideoLoaded, highlighted]);

  // Load video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log('[OK] Video loaded, duration:', video.duration);
      setIsVideoLoaded(true);
      if (onVideoReady) {
        onVideoReady(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate, onVideoReady]);

  // Control playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('🎬 VideoPlayer playback control: isPlaying=' + isPlaying + ', videoSrc=' + video.src?.substring(0, 50));

    if (isPlaying) {
      video.play()
        .then(() => {
          console.log('✅ Video play() succeeded, video.paused=' + video.paused + ', video.currentTime=' + video.currentTime);
          // Check again after a short delay
          setTimeout(() => {
            console.log('🎬 Video state after 100ms: paused=' + video.paused + ', currentTime=' + video.currentTime);
          }, 100);
        })
        .catch(err => console.error('❌ Video play() error:', err));
    } else {
      console.log('⏸️ VideoPlayer: pausing video');
      video.pause();
    }
  }, [isPlaying]);

  // CHROMEBOOK FIX: Aggressive 200ms resync DISABLED
  // The constant resyncing was causing lag and choppy playback on Chromebooks
  // Let the browser handle sync naturally - baseline H.264 is light enough
  // If sync issues occur, increase threshold to 500ms instead of removing entirely

  // Sync to currentTime prop only when paused (for manual seeking)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return; // Only sync when paused

    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  const handleVideoClick = useCallback(() => {
    // Debounce: prevent rapid double-clicks from toggling twice
    const now = Date.now();
    if (now - lastClickRef.current < PLAY_PAUSE_DEBOUNCE_MS) {
      console.log('⏸️ VideoPlayer click debounced - ignoring rapid click');
      return;
    }
    lastClickRef.current = now;

    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  // Check if we have a valid video URL
  if (!actualVideoUrl) {
    return (
      <div 
        className={`h-full w-full bg-black flex items-center justify-center relative ${highlighted ? 'tutorial-highlight' : ''}`}
        // CHROMEBOOK FIX: Force stable cursor
        style={{ cursor: 'default' }}
      >
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium z-10">
          Video Playback Area
        </div>
        
        <div className="text-center text-gray-400">
          <Play size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No video selected</p>
          <p className="text-sm mt-2">Select a video from the library to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-full w-full bg-black relative flex items-center justify-center video-player-container ${highlighted ? 'tutorial-highlight' : ''}`}
      onClick={handleVideoClick}
      // CHROMEBOOK FIX: Force stable cursor with GPU acceleration
      // Using !important-equivalent inline style with all cursor-related properties
      style={{ 
        cursor: 'pointer',
        // GPU acceleration to prevent cursor flicker
        willChange: 'auto',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        isolation: 'isolate',
        // Force compositing layer
        contain: 'layout style paint'
      }}
    >
      <div 
        className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium z-10"
        // CHROMEBOOK FIX: Prevent label from interfering with cursor
        style={{ pointerEvents: 'none' }}
      >
        Video Playback Area
        {selectedVideo?.title && (
          <span className="ml-2 text-gray-300">- {selectedVideo.title}</span>
        )}
      </div>

      {/* CHROMEBOOK OPTIMIZATION: preload="auto" and playsInline */}
      {/* CURSOR FIX: pointer-events-none so container handles all clicks consistently */}
      <video
        ref={videoRef}
        src={actualVideoUrl}
        className="max-h-full max-w-full object-contain"
        preload="auto"
        playsInline
        style={{ 
          width: 'auto', 
          height: 'auto',
          pointerEvents: 'none',
          cursor: 'inherit'
        }}
      />
    </div>
  );
};

// PERFORMANCE FIX: Prevent re-renders during playback
// currentTime updates many times per second, but VideoPlayer doesn't need it while playing
// (the video element handles its own time internally)
export default React.memo(VideoPlayer, (prevProps, nextProps) => {
  // If playing, ignore currentTime changes (video handles its own time)
  if (prevProps.isPlaying && nextProps.isPlaying) {
    // Compare all props EXCEPT currentTime - return true means "don't re-render"
    return (
      prevProps.videoUrl === nextProps.videoUrl &&
      prevProps.selectedVideo === nextProps.selectedVideo &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.duration === nextProps.duration &&
      prevProps.highlighted === nextProps.highlighted &&
      prevProps.onTimeUpdate === nextProps.onTimeUpdate &&
      prevProps.onPlay === nextProps.onPlay &&
      prevProps.onPause === nextProps.onPause &&
      prevProps.onSeek === nextProps.onSeek &&
      prevProps.onVideoReady === nextProps.onVideoReady
    );
  }
  // When paused or play state changes, do normal comparison (re-render needed)
  return false; // false means "re-render"
});