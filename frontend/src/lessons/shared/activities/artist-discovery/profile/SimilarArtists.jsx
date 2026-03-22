import React from 'react';
import { GENRE_CONFIG, getArtistById } from '../artistDatabase';

const SimilarArtists = ({ artistId, onViewArtist }) => {
  // Get the current artist and resolve similar artists
  const artist = getArtistById(artistId);
  const similarIds = artist?.similarArtists || [];

  const similarArtists = similarIds
    .map(id => getArtistById(id))
    .filter(Boolean);

  if (similarArtists.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">
        You Might Also Like
      </h2>
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        {similarArtists.map(similar => {
          const genreConfig = GENRE_CONFIG[similar.genre] || { color: '#6b7280', bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' };

          return (
            <button
              key={similar.id}
              onClick={() => onViewArtist?.(similar.id)}
              className="w-32 flex-shrink-0 text-left group min-h-[44px]"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-1.5">
                {similar.imageUrl ? (
                  <img
                    src={similar.imageUrl}
                    alt={similar.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: genreConfig.bg }}
                  >
                    <span className="text-3xl opacity-30">{genreConfig.icon}</span>
                  </div>
                )}
              </div>
              <p className="text-white/70 text-xs font-medium truncate group-hover:text-white transition-colors">
                {similar.name}
              </p>
              <p className="text-white/30 text-[10px]">{similar.genre}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarArtists;
