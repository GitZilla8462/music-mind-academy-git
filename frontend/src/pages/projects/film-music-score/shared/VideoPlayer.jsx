// File: /src/pages/projects/film-music-score/shared/VideoPlayer.jsx
// OPTIMIZED FOR CHROMEBOOK PERFORMANCE - COMPLETE FILE

import React, { useRef, useEffect, useState } from 'react';
import { Play } from 'lucide-react';

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
  duration
}) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const syncIntervalRef = useRef(null);

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
      isVideoLoaded
    });
  }, [videoUrl, selectedVideo, actualVideoUrl, isVideoLoaded]);

  // Load video metadata
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

  // Control playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(err => console.error('Play error:', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // CHROMEBOOK OPTIMIZATION: Sync video to audio clock
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }
    
    // Sync video to external audio clock every 200ms
    syncIntervalRef.current = setInterval(() => {
      if (window.Tone && window.Tone.Transport) {
        const audioTime = window.Tone.Transport.seconds;
        const videoTime = video.currentTime;
        const drift = Math.abs(audioTime - videoTime);
        
        // If drift exceeds 150ms, resync
        if (drift > 0.15) {
          console.log(`🔄 Resyncing video: drift ${(drift * 1000).toFixed(0)}ms`);
          video.currentTime = audioTime;
        }
      }
    }, 200);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  // Sync to currentTime prop
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
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium z-10">
        Video Playback Area
        {selectedVideo?.title && (
          <span className="ml-2 text-gray-300">- {selectedVideo.title}</span>
        )}
      </div>

      {/* CHROMEBOOK OPTIMIZATION: preload="auto" and playsInline */}
      <video
        ref={videoRef}
        src={actualVideoUrl}
        className="max-h-full max-w-full object-contain cursor-pointer"
        onClick={handleVideoClick}
        preload="auto"
        playsInline
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