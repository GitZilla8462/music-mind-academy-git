import React from 'react';
import { Play, Pause, Music } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Animated bars that pulse when a track is playing
const PlayingBars = () => (
  <div className="flex items-end gap-[2px] h-3 w-3">
    <span className="w-[3px] bg-amber-400 rounded-full animate-[barPulse_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
    <span className="w-[3px] bg-amber-400 rounded-full animate-[barPulse_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
    <span className="w-[3px] bg-amber-400 rounded-full animate-[barPulse_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
  </div>
);

const TrackList = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onPlay,
  onPause,
  albumTitle,
  genreColor = '#fbbf24',
  license,
  artistName,
}) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Album header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Music size={14} className="text-white/40" />
        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
          {albumTitle ? <>Album: <span className="text-white/70">{albumTitle}</span></> : 'Tracks'}
        </span>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        {tracks.map((track, index) => {
          const isActive = currentTrackIndex === index;
          const isThisPlaying = isActive && isPlaying;
          const hasAudio = !!track.audioUrl;

          return (
            <button
              key={track.title || index}
              onClick={() => {
                if (!hasAudio) return;
                if (isThisPlaying) {
                  onPause();
                } else {
                  onPlay(index);
                }
              }}
              disabled={!hasAudio}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[48px] transition-colors text-left ${
                index > 0 ? 'border-t border-white/[0.04]' : ''
              } ${
                hasAudio
                  ? isActive
                    ? 'bg-white/[0.08] hover:bg-white/[0.10]'
                    : 'hover:bg-white/[0.06]'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Track number or playing indicator */}
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {isThisPlaying ? (
                  <PlayingBars />
                ) : isActive ? (
                  <Pause size={14} style={{ color: genreColor }} />
                ) : hasAudio ? (
                  <span className="text-white/30 text-sm group-hover:hidden">{index + 1}</span>
                ) : (
                  <span className="text-white/20 text-sm">{index + 1}</span>
                )}
              </div>

              {/* Track title */}
              <span className={`flex-1 text-sm truncate ${
                isActive ? 'font-semibold' : ''
              }`} style={{ color: isActive ? genreColor : 'rgba(255,255,255,0.8)' }}>
                {track.title}
              </span>

              {/* Play icon on hover (for tracks with audio) */}
              {hasAudio && !isActive && (
                <Play size={14} className="text-white/20 flex-shrink-0" />
              )}

              {/* Duration */}
              {track.duration && (
                <span className="text-white/30 text-xs flex-shrink-0 ml-1">{track.duration}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Attribution */}
      {license && license !== 'CC0' && (
        <p className="text-white/20 text-[11px] mt-2 px-1">
          Music by {artistName} · Source: Free Music Archive · License: {license}
        </p>
      )}

      {/* Inline CSS for the bar animation */}
      <style>{`
        @keyframes barPulse {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default TrackList;
