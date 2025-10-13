// File: /src/pages/projects/film-music-score/shared/VideoPlayer.jsx

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = ({
  videoUrl,           // For backward compatibility
  selectedVideo,      // Accept the full video object
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onVideoReady,
  duration
}) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Extract video URL from either prop format - check multiple possible property names
  const actualVideoUrl = videoUrl || 
                        selectedVideo?.src || 
                        selectedVideo?.videoPath ||  // ← THIS IS THE ONE!
                        selectedVideo?.url || 
                        selectedVideo?.path || 
                        selectedVideo?.videoUrl || 
                        selectedVideo?.file;

  // Debug logging
  useEffect(() => {
    console.log('🎬 VideoPlayer Debug:', {
      hasVideoUrl: !!videoUrl,
      hasSelectedVideo: !!selectedVideo,
      selectedVideoObject: selectedVideo,  // Log the entire object
      selectedVideoSrc: selectedVideo?.src,
      selectedVideoPath: selectedVideo?.videoPath,  // ← Check this one!
      selectedVideoUrl: selectedVideo?.url,
      actualVideoUrl,
      isVideoLoaded
    });
  }, [videoUrl, selectedVideo, actualVideoUrl, isVideoLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded, duration:', video.duration);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(err => console.error('Play error:', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleVideoClick = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  // Check if we have a valid video URL
  if (!actualVideoUrl) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center relative">
        {/* Video Playback Area Label - Top Left */}
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
    <div className="h-full w-full bg-black relative flex items-center justify-center">
      {/* Video Playback Area Label - Top Left */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium z-10">
        Video Playback Area
        {selectedVideo?.title && (
          <span className="ml-2 text-gray-300">- {selectedVideo.title}</span>
        )}
      </div>

      <video
        ref={videoRef}
        src={actualVideoUrl}
        className="max-h-full max-w-full object-contain cursor-pointer"
        onClick={handleVideoClick}
        style={{ width: 'auto', height: 'auto' }}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && isVideoLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 hover:bg-black/70 transition-colors">
            <Play size={48} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;