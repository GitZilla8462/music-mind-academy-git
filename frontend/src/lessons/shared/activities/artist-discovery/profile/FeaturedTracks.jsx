import React from 'react';
import { Play, Headphones } from 'lucide-react';

const FeaturedTracks = ({ tracks, artistName, artistImage, genreGradient, onTrackClick, currentTrackIndex, playerVisible }) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold">
          Featured Tracks
        </h2>
        {!playerVisible && (
          <button
            onClick={() => onTrackClick?.(0)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            <Headphones size={12} />
            <span>Open Player</span>
          </button>
        )}
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {tracks.map((track, index) => {
          const isActive = currentTrackIndex === index;

          return (
            <button
              key={track.title || index}
              onClick={() => onTrackClick?.(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left min-h-[52px] ${
                isActive
                  ? 'bg-white/[0.06]'
                  : 'hover:bg-white/[0.03]'
              } ${index > 0 ? 'border-t border-white/[0.04]' : ''}`}
            >
              {/* Play button / track number */}
              <span className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors">
                {isActive ? (
                  <span className="inline-flex items-end gap-[2px] h-3">
                    <span className="w-[3px] h-2 bg-white/70 rounded-sm animate-pulse" />
                    <span className="w-[3px] h-3 bg-white/70 rounded-sm animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-[3px] h-[7px] bg-white/70 rounded-sm animate-pulse" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <Play size={14} className="text-white/60 ml-0.5" />
                )}
              </span>

              {/* Album art thumbnail */}
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                {artistImage ? (
                  <img src={artistImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: genreGradient || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
                  />
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}>
                  {track.title}
                </span>
                <span className="block text-[11px] text-white/30 truncate">{artistName}</span>
              </div>

              {/* Duration */}
              {track.duration && (
                <span className="text-white/25 text-xs flex-shrink-0">{track.duration}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      {!playerVisible && (
        <p className="text-white/20 text-xs mt-2 text-center">
          Tap any track to open the music player
        </p>
      )}
    </div>
  );
};

export default FeaturedTracks;
