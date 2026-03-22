import React from 'react';
import { ChevronDown, ChevronUp, Music } from 'lucide-react';
import BandcampEmbed from '../BandcampEmbed';
import { GENRE_CONFIG } from '../artistDatabase';

const StickyPlayer = ({ artist, visible }) => {
  const [minimized, setMinimized] = React.useState(false);
  const genreConfig = GENRE_CONFIG[artist?.genre] || {};

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      {!minimized && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMinimized(true)}
        />
      )}

      {/* Player panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1419] border-t border-white/[0.1] rounded-t-2xl shadow-2xl shadow-black/50">
        {/* Handle bar — tap to minimize/expand */}
        <button
          onClick={() => setMinimized(!minimized)}
          className="w-full flex items-center h-14 px-4 gap-3"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            {artist?.imageUrl ? (
              <img src={artist.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: genreConfig.bg || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
              >
                <Music size={14} className="text-white/30" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-white/90 text-sm font-medium truncate">
              {minimized ? 'Tap to open player' : artist?.albumTitle || 'Now Playing'}
            </p>
            <p className="text-white/40 text-xs truncate">{artist?.name}</p>
          </div>

          {minimized ? (
            <ChevronUp size={18} className="text-white/30 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-white/30 flex-shrink-0" />
          )}
        </button>

        {/* Full Bandcamp player — shown by default, hidden when minimized */}
        {!minimized && (
          <div className="px-4 pb-4">
            <div className="rounded-xl overflow-hidden">
              <BandcampEmbed albumId={artist?.embedAlbumId} size="large" tracklist={true} />
            </div>
            <p className="text-white/20 text-[11px] text-center mt-2">
              Press play above to listen · Powered by Bandcamp
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default StickyPlayer;
