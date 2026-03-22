// MiniPlayer — Spotify-style bottom playback bar.
// Three-section layout: Left (track info) | Center (controls + progress) | Right (volume)
// Full-width, no max-width constraint.

import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MiniPlayer = ({
  currentTrack,
  isPlaying,
  progress,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  volume: externalVolume,
  imageUrl,
  genreConfig,
  artistName,
  onArtistClick,
}) => {
  const [localVolume, setLocalVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef(null);

  const volume = externalVolume ?? localVolume;

  if (!currentTrack) return null;

  // Calculate seek fraction from a pointer event
  const getFraction = (e) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  // Start scrubbing (mousedown/touchstart on progress bar)
  const handleScrubStart = (e) => {
    e.preventDefault();
    setIsScrubbing(true);
    onSeek(getFraction(e));

    const handleMove = (ev) => {
      ev.preventDefault();
      onSeek(getFraction(ev));
    };
    const handleEnd = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalVolume(val);
    setMuted(val === 0);
    if (onVolumeChange) onVolumeChange(val);
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    const val = newMuted ? 0 : (localVolume > 0 ? localVolume : 0.8);
    if (!newMuted) setLocalVolume(val);
    if (onVolumeChange) onVolumeChange(newMuted ? 0 : val);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Player bar */}
      <div className="bg-[#0f1419]/98 backdrop-blur-md border-t border-white/[0.06]">
        {/* Progress bar — full width, draggable scrub */}
        <div
          ref={progressBarRef}
          className="w-full h-3 flex items-center cursor-pointer group"
          onMouseDown={handleScrubStart}
          onTouchStart={handleScrubStart}
          style={{ touchAction: 'none' }}
        >
          <div className="w-full h-1 bg-white/[0.08] relative group-hover:h-1.5 transition-all">
            <div
              className={`h-full bg-amber-400 relative ${isScrubbing ? '' : 'transition-[width] duration-75'}`}
              style={{ width: `${progress * 100}%` }}
            >
              {/* Scrub dot — always visible when scrubbing, hover otherwise */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${
                isScrubbing ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
              }`} />
            </div>
          </div>
        </div>

        {/* Three-section layout */}
        <div className="flex items-center px-4 py-1.5">

          {/* ── Left: Track info ── */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onArtistClick}
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: genreConfig?.bg || 'linear-gradient(135deg, #374151, #1f2937)' }}
                />
              )}
            </button>
            <button onClick={onArtistClick} className="min-w-0 text-left">
              <p className="text-white/90 text-sm font-medium truncate max-w-[200px]">{currentTrack.title}</p>
              <p className="text-white/40 text-[11px] truncate max-w-[200px]">
                {artistName || 'Unknown Artist'}
              </p>
            </button>
          </div>

          {/* ── Center: Controls ── */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={onPrev}
                className="p-1.5 text-white/40 hover:text-white/80 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={onTogglePlay}
                className="p-2 bg-white rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-white/90 hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <Pause size={16} className="text-black" fill="black" />
                ) : (
                  <Play size={16} className="text-black ml-0.5" fill="black" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-1.5 text-white/40 hover:text-white/80 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <SkipForward size={16} />
              </button>
            </div>
            {/* Time display */}
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* ── Right: Volume ── */}
          <div className="flex items-center justify-end gap-2 flex-1">
            <button
              onClick={toggleMute}
              className="p-1.5 text-white/40 hover:text-white/80 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 appearance-none bg-white/[0.15] rounded-full cursor-pointer accent-amber-400
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
