import React from 'react';
import { MapPin, Play } from 'lucide-react';

const HeroBanner = ({ artist, genreConfig, onListenClick }) => {
  const hasImage = !!artist.imageUrl;

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.5/1] overflow-hidden">
      {/* Background */}
      {hasImage ? (
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: genreConfig?.bg || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 flex items-end justify-between gap-4">
        {/* Left: artist info */}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{artist.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {artist.location && (
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <MapPin size={14} />
                <span>{artist.location}</span>
              </div>
            )}
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: genreConfig?.color || '#6b7280' }}
            >
              {artist.genre}
            </span>
            {artist.moods?.slice(0, 3).map(mood => (
              <span
                key={mood}
                className="px-2.5 py-0.5 rounded-full text-[10px] text-white/60 bg-white/[0.15]"
              >
                {mood}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Listen Now button */}
        <button
          onClick={onListenClick}
          className="flex-shrink-0 flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors min-h-[44px]"
        >
          <Play size={18} fill="currentColor" />
          <span className="text-sm">Listen Now</span>
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
