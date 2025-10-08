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
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Play size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-4">Video Not Available</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <p className="text-gray-400 mb-6 text-sm">Path: {src}</p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors"
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
      className={`h-full bg-black relative ${isFullscreen ? 'w-screen h-screen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => allowSeeking && setShowControls(false)}
    >
      <style>{`
        video::-webkit-media-controls {
          display: none !important;
        }
        video::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
        video::-webkit-media-controls-timeline {
          display: none !important;
        }
        video::-webkit-media-controls-current-time-display {
          display: none !important;
        }
        video::-webkit-media-controls-time-remaining-display {
          display: none !important;
        }
        video::-webkit-media-controls-seek-back-button {
          display: none !important;
        }
        video::-webkit-media-controls-seek-forward-button {
          display: none !important;
        }
        video::-webkit-media-controls-rewind-button {
          display: none !important;
        }
        video::-webkit-media-controls-return-to-realtime-button {
          display: none !important;
        }
        video::-webkit-media-controls-toggle-closed-captions-button {
          display: none !important;
        }
        video::-moz-media-controls {
          display: none !important;
        }
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
        
        /* Volume slider styling */
        input[type="range"].volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
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
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          margin-top: -5px;
        }
        
        input[type="range"].volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
        
        input[type="range"].volume-slider:focus {
          outline: none;
        }
      `}</style>

      <div className={`w-full h-full relative flex items-center justify-center ${isFullscreen ? 'bg-black' : ''}`}>
        <video
          ref={videoRef}
          className="object-contain"
          disablePictureInPicture
          playsInline
          preload="metadata"
          onClick={handleVideoClick}
          style={{
            pointerEvents: 'auto',
            outline: 'none',
            maxWidth: isFullscreen ? '85vw' : '100%',
            maxHeight: isFullscreen ? '65vh' : '100%',
            width: 'auto',
            height: isFullscreen ? 'auto' : '100%'
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay to prevent seeking - only covers video area, not controls */}
        {!allowSeeking && (
          <div
            ref={overlayRef}
            className="absolute top-0 left-0 right-0 pointer-events-auto"
            style={{
              backgroundColor: 'transparent',
              zIndex: 10,
              bottom: isFullscreen ? '180px' : '150px'
            }}
            onClick={handleVideoClick}
            onMouseDown={handleOverlayInteraction}
            onMouseUp={handleOverlayInteraction}
            onTouchStart={handleOverlayInteraction}
            onTouchEnd={handleOverlayInteraction}
            onDragStart={handleOverlayInteraction}
          />
        )}

        {/* Controls - Always visible and functional */}
        {isLoaded && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent px-6 py-4"
            style={{ 
              zIndex: 50,
              paddingBottom: isFullscreen ? '1rem' : '1rem'
            }}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className={`h-1 bg-gray-600 rounded-full overflow-hidden ${
                  allowSeeking ? 'cursor-pointer' : 'cursor-default'
                }`}
                onClick={allowSeeking ? handleProgressClick : undefined}
              >
                <div 
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ 
                    width: `${(watchedTime / duration) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-4 flex-wrap">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors p-2 bg-black/50 rounded"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors bg-black/50 rounded p-1"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider w-20"
                    style={{ 
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                    }}
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4 flex-wrap">
                {/* Dev Skip Button */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      if (onComplete) onComplete();
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors whitespace-nowrap"
                    title="Development only - skip to next activity"
                  >
                    Dev Skip
                  </button>
                )}

                {/* Progress Percentage */}
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                  Progress: {Math.round((watchedTime / duration) * 100)}%
                </div>

                {/* Fullscreen Button */}
                {allowFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors p-2 bg-black/50 rounded"
                  >
                    <Maximize size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Skip Notice */}
        {showNotice && !allowSeeking && isLoaded && (
          <div 
            className="absolute left-4 bg-black/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm z-40"
            style={{
              bottom: isFullscreen ? '140px' : '8.5rem'
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Cannot skip ahead - Watch completely to continue</span>
            </div>
          </div>
        )}
        
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 bg-black/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm z-40">
            {title}
          </div>
        )}

        {/* Loading State */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;