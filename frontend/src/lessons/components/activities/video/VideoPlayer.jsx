// File: /src/lessons/components/activities/video/VideoPlayer.jsx
// Fully Responsive Video Player - FIXED Controls Always Visible

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
  const [screenSize, setScreenSize] = useState('desktop');

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else if (width < 1440) setScreenSize('small-desktop');
      else if (width < 1920) setScreenSize('medium-desktop');
      else setScreenSize('large-desktop');
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasStartedPlaying = false;
    let controlsTimeout;

    const handleLoadedMetadata = () => {
      console.log('✅ Video loaded, duration:', video.duration);
      setIsLoaded(true);
      setDuration(video.duration);
    };

    const handleError = (e) => {
      console.error('❌ Video error:', e);
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
        video.currentTime = watchedTime;
      }
    };

    const handleSeeking = () => {
      if (!allowSeeking && hasStartedPlaying && video.currentTime > watchedTime + 1) {
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
      if (!allowSeeking && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
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

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleProgressClick = (e) => {
    if (!allowSeeking) {
      return;
    }
    
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  // Get responsive sizing
  const getSizing = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          controlsHeight: '130px',
          padding: { top: '0.75rem', bottom: '0.75rem', side: '0.5rem' },
          progressHeight: '6px',
          iconSize: 24,
          buttonPadding: '0.625rem',
          textSize: 'text-xs',
          volumeWidth: 'w-16'
        };
      case 'tablet':
        return {
          controlsHeight: '140px',
          padding: { top: '0.75rem', bottom: '1rem', side: '1rem' },
          progressHeight: '5px',
          iconSize: 22,
          buttonPadding: '0.5rem',
          textSize: 'text-sm',
          volumeWidth: 'w-20'
        };
      case 'small-desktop':
        return {
          controlsHeight: '85px',
          padding: { top: '0.375rem', bottom: '0.375rem', side: '0.75rem' },
          progressHeight: '3px',
          iconSize: 18,
          buttonPadding: '0.375rem',
          textSize: 'text-xs',
          volumeWidth: 'w-16'
        };
      case 'medium-desktop':
        return {
          controlsHeight: '90px',
          padding: { top: '0.375rem', bottom: '0.375rem', side: '0.75rem' },
          progressHeight: '3px',
          iconSize: 18,
          buttonPadding: '0.375rem',
          textSize: 'text-xs',
          volumeWidth: 'w-20'
        };
      default: // large-desktop
        return {
          controlsHeight: '160px',
          padding: { top: '1rem', bottom: '1.5rem', side: '1rem' },
          progressHeight: '4px',
          iconSize: 22,
          buttonPadding: '0.625rem',
          textSize: 'text-sm',
          volumeWidth: 'w-24'
        };
    }
  };

  const sizing = getSizing();

  if (error) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <Play size={48} className="mx-auto mb-4 opacity-50" />
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
      className="h-full w-full bg-black relative flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => allowSeeking && setShowControls(false)}
    >
      <style>{`
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
      `}</style>

      {/* Video Container - Flexbox fills remaining space */}
      <div 
        className="relative flex items-center justify-center bg-black overflow-hidden"
        style={{ 
          minHeight: 0,
          flex: '1 1 0',
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
          onTouchEnd={handleVideoClick}
          style={{
            outline: 'none',
            maxHeight: '100%',
            maxWidth: '100%'
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Title */}
        {title && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm backdrop-blur-sm z-30">
            {title}
          </div>
        )}

        {/* Loading State */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-white text-center p-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Loading video...</p>
            </div>
          </div>
        )}

        {/* No Skip Notice */}
        {showNotice && !allowSeeking && isLoaded && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm backdrop-blur-sm z-30">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="whitespace-nowrap">Cannot skip ahead</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Relative positioning, flex-shrink-0 to stay at bottom */}
      {isLoaded && (
        <div 
          className="flex-shrink-0 bg-black border-t border-gray-800"
          style={{
            paddingTop: sizing.padding.top,
            paddingBottom: sizing.padding.bottom,
            paddingLeft: sizing.padding.side,
            paddingRight: sizing.padding.side,
            height: sizing.controlsHeight,
            maxHeight: sizing.controlsHeight,
            overflow: 'visible'
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-1">
              <div 
                className={`rounded-full overflow-hidden ${
                  allowSeeking ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  height: sizing.progressHeight,
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
              <div className="hidden lg:flex justify-between text-xs text-gray-400 mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 active:bg-gray-600"
                  style={{ padding: sizing.buttonPadding }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={sizing.iconSize} />
                  ) : (
                    <Play size={sizing.iconSize} />
                  )}
                </button>

                {/* Volume Controls */}
                <div className="flex items-center bg-gray-800 rounded-lg gap-1 px-1.5 py-1">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={sizing.iconSize - 2} />
                    ) : (
                      <Volume2 size={sizing.iconSize - 2} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={`volume-slider ${sizing.volumeWidth}`}
                    style={{ 
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                    }}
                    aria-label="Volume"
                  />
                </div>

                {/* Time Display */}
                <span className={`text-white bg-gray-800 rounded-lg whitespace-nowrap px-1.5 py-1 ${sizing.textSize} hidden lg:block`}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-1">
                {/* Dev Skip Button - Left of Progress */}
                {process.env.NODE_ENV === 'development' && screenSize !== 'mobile' && (
                  <button
                    onClick={() => {
                      if (onComplete) onComplete();
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors font-medium"
                    title="Development only - skip to next activity"
                  >
                    Skip
                  </button>
                )}

                {/* Progress Percentage */}
                <div className={`text-white bg-gray-800 rounded-lg px-1.5 py-1 ${sizing.textSize}`}>
                  <span className="hidden sm:inline">Progress: </span>
                  <span className="font-semibold text-blue-400">
                    {Math.round((watchedTime / duration) * 100)}%
                  </span>
                </div>

                {/* Fullscreen Button */}
                {allowFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 p-1.5"
                    aria-label="Fullscreen"
                  >
                    <Maximize size={sizing.iconSize - 2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;