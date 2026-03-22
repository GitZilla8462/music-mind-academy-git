import React from 'react';
import { MapPin } from 'lucide-react';
import { GENRE_CONFIG } from './artistDatabase';

const ArtistCard = ({ artist, onClick, isSelected, isLocked }) => {
  const genreConfig = GENRE_CONFIG[artist.genre] || { color: '#6b7280', bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' };

  return (
    <button
      onClick={() => onClick(artist)}
      disabled={isLocked}
      className={`group w-full text-left rounded-xl overflow-hidden transition-all duration-200
        ${isLocked
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-white/20'
        }
        ${isSelected
          ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/20'
          : 'border border-white/[0.06]'
        }
        bg-white/[0.03]`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: genreConfig.bg }}
          >
            <span className="text-5xl opacity-30 select-none">{genreConfig.icon}</span>
          </div>
        )}

        {/* Genre badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90"
          style={{ backgroundColor: genreConfig.color + 'cc' }}
        >
          {artist.genre}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-black text-xs font-bold">★</span>
          </div>
        )}

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white/60 text-xs font-medium">Taken</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white/90 font-semibold text-sm leading-tight mb-1 group-hover:text-white transition-colors">
          {artist.name}
        </h3>
        <p className="text-white/40 text-[11px] mb-1.5">{artist.subgenre}</p>
        <div className="flex items-center gap-1 text-white/30 text-[11px]">
          <MapPin size={10} />
          <span>{artist.location}</span>
        </div>
      </div>
    </button>
  );
};

export default ArtistCard;
