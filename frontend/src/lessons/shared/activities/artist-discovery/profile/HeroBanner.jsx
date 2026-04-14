import React from 'react';
import { MapPin } from 'lucide-react';

const HeroBanner = ({ artist, genreConfig }) => {
  const hasImage = !!artist.imageUrl;

  return (
    <div className="relative w-full" style={{ height: '140px' }}>
      {/* Background */}
      {hasImage ? (
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
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
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 leading-tight">{artist.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {artist.location && (
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <MapPin size={12} />
              <span>{artist.location}</span>
            </div>
          )}
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: genreConfig?.color || '#6b7280' }}
          >
            Genre: {artist.genre}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
