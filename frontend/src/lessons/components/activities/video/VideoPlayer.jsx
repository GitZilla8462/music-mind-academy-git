// File: /src/lessons/components/activities/video/VideoPlayer.jsx
// Fully Responsive Video Player for All Devices

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

const VideoPlayer = ({ 
  src = "/lessons/film-music-project/lesson1/Lesson1introvideo.mp4",
  onComplete,
  title = '',
  allowFullscreen = false,
  showNotice = true,
  allowSeeking = false
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [watchedTime, setWatchedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/touch devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasStartedPlaying = false;
    let controlsTimeout;

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
      setDuration(video.duration);
    };

    const handleError = (e) => {
      console.error('Video error:', e);
      setError('Video failed to load');
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      
      if (!hasStartedPlaying && current > 0) {
        hasStartedPlaying = true;
      }
      
      if (!video.seeking && current > watchedTime) {
        setWatchedTime(current);
      }
      
      if (!allowSeeking && hasStartedPlaying && current > watchedTime + 1) {
        console.log('Skip ahead detected - resetting to watched time');
        video.currentTime = watchedTime;
      }
    };

    const handleSeeking = () => {
      if (!allowSeeking && hasStartedPlaying && video.currentTime > watchedTime + 1) {
        console.log('Seeking prevented');
        video.currentTime = watchedTime;
      }
    };

    const handleSeeked = () => {
      if (!allowSeeking && hasStartedPlaying && video.currentTime > watchedTime + 1) {
        video.currentTime = watchedTime;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (allowSeeking) {
        controlsTimeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      clearTimeout(controlsTimeout);
      setShowControls(true);
    };

    const handleEnded = () => {
      if (onComplete) {
        onComplete();
      }
    };

    const handleKeyDown = (e) => {
      if (e.target === video || video.contains(e.target)) {
        if (!allowSeeking && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      clearTimeout(controlsTimeout);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [watchedTime, isPlaying, onComplete, allowSeeking]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = false;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      video.muted = false;
      setIsMuted(false);
    } else {
      video.volume = 0;
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container || !allowFullscreen) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.() || 
      container.webkitRequestFullscreen?.() || 
      container.mozRequestFullScreen?.();
    } else {
      document.exitFullscreen?.() || 
      document.webkitExitFullscreen?.() || 
      document.mozCancelFullScreen?.();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = (e) => {
    if (!allowSeeking) {
      e.preventDefault();
      e.stopPropagation();
    }
    togglePlay();
  };

  const handleOverlayInteraction = (e) => {
    if (!allowSeeking) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleProgressClick = (e) => {
    if (!allowSeeking) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  if (error) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <Play size={48} className="mx-auto mb-4 opacity-50 sm:w-16 sm:h-16" />
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Video Not Available</h3>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-gray-400 mb-6 text-xs sm:text-sm break-all">Path: {src}</p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Continue to Next Activity
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => allowSeeking && setShowControls(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%'
      }}
    >
      <style>{`
        /* Hide native video controls */
        video::-webkit-media-controls,
        video::-webkit-media-controls-start-playback-button,
        video::-webkit-media-controls-timeline,
        video::-webkit-media-controls-current-time-display,
        video::-webkit-media-controls-time-remaining-display,
        video::-webkit-media-controls-seek-back-button,
        video::-webkit-media-controls-seek-forward-button,
        video::-webkit-media-controls-rewind-button,
        video::-webkit-media-controls-return-to-realtime-button,
        video::-webkit-media-controls-toggle-closed-captions-button,
        video::-moz-media-controls,
        video::-ms-media-controls {
          display: none !important;
        }
        
        video {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Volume slider styling - responsive */
        input[type="range"].volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          height: 20px;
        }
        
        input[type="range"].volume-slider::-webkit-slider-track {
          height: 4px;
          border-radius: 9999px;
        }
        
        input[type="range"].volume-slider::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: #4b5563;
        }
        
        input[type="range"].volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          margin-top: -6px;
        }
        
        @media (max-width: 640px) {
          input[type="range"].volume-slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
            margin-top: -8px;
          }
        }
        
        input[type="range"].volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"].volume-slider:focus {
          outline: none;
        }

        /* Responsive control heights */
        @media (max-width: 640px) {
          .video-controls-container {
            min-height: 140px !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .video-controls-container {
            min-height: 160px !important;
          }
        }
        
        @media (min-width: 1025px) {
          .video-controls-container {
            min-height: 180px !important;
          }
        }
      `}</style>

      {/* Video Container - Responsive height calculation */}
      <div 
        className="relative flex items-center justify-center bg-black overflow-hidden"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          // Responsive heights for different screens
          height: isMobile 
            ? 'calc(100% - 140px)' // Mobile: 140px for controls
            : window.innerWidth < 1024
            ? 'calc(100% - 160px)' // Tablet: 160px for controls
            : 'calc(100% - 180px)', // Desktop: 180px for controls
          maxHeight: '100%'
        }}
      >
        <video
          ref={videoRef}
          className="object-contain w-full h-full"
          disablePictureInPicture
          playsInline
          preload="metadata"
          onClick={handleVideoClick}
          style={{
            pointerEvents: 'auto',
            outline: 'none'
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay to prevent seeking */}
        {!allowSeeking && (
          <div
            ref={overlayRef}
            className="absolute inset-0 pointer-events-auto"
            style={{
              backgroundColor: 'transparent',
              zIndex: 10
            }}
            onClick={handleVideoClick}
            onMouseDown={handleOverlayInteraction}
            onMouseUp={handleOverlayInteraction}
            onTouchStart={handleOverlayInteraction}
            onTouchEnd={handleOverlayInteraction}
            onDragStart={handleOverlayInteraction}
          />
        )}

        {/* Title - Responsive sizing */}
        {title && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm backdrop-blur-sm z-40">
            {title}
          </div>
        )}

        {/* Loading State */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
            <div className="text-white text-center p-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Loading video...</p>
            </div>
          </div>
        )}

        {/* No Skip Notice - Responsive positioning */}
        {showNotice && !allowSeeking && isLoaded && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm backdrop-blur-sm z-40">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="whitespace-nowrap">Cannot skip ahead</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Fully Responsive */}
      {isLoaded && (
        <div 
          className="video-controls-container fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50"
          style={{
            paddingTop: isMobile ? '0.75rem' : '1rem',
            paddingBottom: isMobile ? '0.75rem' : '1.5rem',
            paddingLeft: isMobile ? '0.5rem' : '1rem',
            paddingRight: isMobile ? '0.5rem' : '1rem'
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Progress Bar - Touch-friendly on mobile */}
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div 
                className={`rounded-full overflow-hidden ${
                  allowSeeking ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  height: isMobile ? '6px' : '4px',
                  backgroundColor: '#374151'
                }}
                onClick={allowSeeking ? handleProgressClick : undefined}
              >
                <div 
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ 
                    width: `${(watchedTime / duration) * 100}%`
                  }}
                />
              </div>
              {/* Time display - Hide on very small screens */}
              <div className="hidden xs:flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons - Responsive Layout */}
            <div className="space-y-2 sm:space-y-3">
              {/* Row 1: Main Controls */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Play/Pause Button - Larger on mobile */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-blue-400 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 active:bg-gray-600"
                    style={{
                      padding: isMobile ? '0.75rem' : '0.625rem'
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={isMobile ? 28 : 24} />
                    ) : (
                      <Play size={isMobile ? 28 : 24} />
                    )}
                  </button>

                  {/* Volume Controls - Simplified on mobile */}
                  <div className={`flex items-center bg-gray-800 rounded-lg ${
                    isMobile ? 'gap-1.5 px-2 py-2' : 'gap-2 px-3 py-2'
                  }`}>
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={isMobile ? 22 : 20} />
                      ) : (
                        <Volume2 size={isMobile ? 22 : 20} />
                      )}
                    </button>
                    {/* Hide volume slider on very small screens */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className={`volume-slider ${isMobile ? 'w-16 sm:w-20' : 'w-20'}`}
                      style={{ 
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>

                  {/* Time Display - Responsive text */}
                  <span className={`text-white bg-gray-800 rounded-lg whitespace-nowrap ${
                    isMobile 
                      ? 'text-xs px-2 py-1.5 hidden xs:block' 
                      : 'text-sm px-3 py-2'
                  }`}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Progress Percentage - Responsive */}
                  <div className={`text-white bg-gray-800 rounded-lg ${
                    isMobile 
                      ? 'text-xs px-2 py-1.5' 
                      : 'text-sm px-3 py-2'
                  }`}>
                    <span className={isMobile ? 'hidden xs:inline' : ''}>Progress: </span>
                    <span className="font-semibold text-blue-400">
                      {Math.round((watchedTime / duration) * 100)}%
                    </span>
                  </div>

                  {/* Fullscreen Button */}
                  {allowFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className={`text-white hover:text-blue-400 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 ${
                        isMobile ? 'p-2.5' : 'p-2.5'
                      }`}
                    >
                      <Maximize size={isMobile ? 22 : 20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Dev Tools - Only show on desktop in development */}
              {process.env.NODE_ENV === 'development' && !isMobile && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (onComplete) onComplete();
                    }}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
                    title="Development only - skip to next activity"
                  >
                    Dev Skip
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;