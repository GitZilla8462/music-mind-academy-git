// File: AudioPlayer.jsx
// Audio player component with play/pause, progress bar, and time display

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { totalDuration, MEASURE_DURATION } from '../data/bachCelloSuiteNotes';

const AudioPlayer = forwardRef(({ 
  audioSrc,
  onTimeUpdate,
  onPlayStateChange,
  maxDuration = totalDuration, // Limit to 16 bars
  theme,
}, ref) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    seek: (time) => { if (audioRef.current) audioRef.current.currentTime = time; },
    getCurrentTime: () => audioRef.current?.currentTime || 0,
    isPlaying: () => isPlaying,
    getAudioElement: () => audioRef.current, // Direct access for smooth playhead
  }));

  // Handle time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      
      // Stop at max duration (16 bars)
      if (time >= maxDuration) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        if (onPlayStateChange) onPlayStateChange(false);
      }
      
      if (onTimeUpdate) onTimeUpdate(time);
    };

    const handleLoadedMetadata = () => {
      setDuration(Math.min(audio.duration, maxDuration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      if (onPlayStateChange) onPlayStateChange(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onPlayStateChange, maxDuration]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Reset if at end
      if (audio.currentTime >= maxDuration) {
        audio.currentTime = 0;
      }
      audio.play();
    }
  }, [isPlaying, maxDuration]);

  // Handle progress bar click
  const handleProgressClick = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * Math.min(duration, maxDuration);
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, maxDuration]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current measure (1-16)
  const currentMeasure = Math.floor(currentTime / MEASURE_DURATION) + 1;

  // Progress percentage
  const progress = duration > 0 ? (currentTime / Math.min(duration, maxDuration)) * 100 : 0;

  return (
    <div className="audio-player bg-gray-900/80 backdrop-blur rounded-xl p-4 flex items-center gap-4">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
      >
        {isPlaying ? (
          <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress Section */}
      <div className="flex-1">
        {/* Progress Bar */}
        <div 
          className="h-3 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full rounded-full transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between mt-1 text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-purple-400 font-medium">Measure {Math.min(currentMeasure, 16)} / 16</span>
          <span>{formatTime(Math.min(duration, maxDuration))}</span>
        </div>
      </div>

      {/* Playback Status */}
      <div className="text-right min-w-[60px]">
        <div className={`text-xs font-medium ${isPlaying ? 'text-green-400' : 'text-gray-500'}`}>
          {isPlaying ? '▶ Playing' : '⏸ Paused'}
        </div>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;