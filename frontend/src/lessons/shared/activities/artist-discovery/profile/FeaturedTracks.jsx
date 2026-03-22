import React, { useState } from 'react';
import { ChevronDown, ListMusic } from 'lucide-react';

const FeaturedTracks = ({ tracks, artistName }) => {
  const [expanded, setExpanded] = useState(false);

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 min-h-[48px] hover:bg-white/[0.06] transition-colors"
      >
        <span className="text-white/70 text-sm font-medium flex items-center gap-2">
          <ListMusic size={16} className="text-white/40" />
          All Tracks ({tracks.length})
        </span>
        <ChevronDown
          size={18}
          className={`text-white/40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-1 bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          {tracks.map((track, index) => (
            <div
              key={track.title || index}
              className={`flex items-center gap-3 px-4 py-3 ${
                index > 0 ? 'border-t border-white/[0.04]' : ''
              }`}
            >
              <span className="w-6 text-white/30 text-sm text-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-white/80 text-sm truncate">
                {track.title}
              </span>
              {track.duration && (
                <span className="text-white/30 text-xs flex-shrink-0">{track.duration}</span>
              )}
            </div>
          ))}
          <div className="px-4 py-2 border-t border-white/[0.04]">
            <p className="text-white/20 text-[11px] text-center">
              Use ◄ ► on the player above to skip between tracks
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedTracks;
