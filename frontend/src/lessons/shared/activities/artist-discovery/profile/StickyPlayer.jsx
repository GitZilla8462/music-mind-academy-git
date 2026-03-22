import React from 'react';
import { ChevronDown, Music } from 'lucide-react';
import BandcampEmbed from '../BandcampEmbed';
import { GENRE_CONFIG } from '../artistDatabase';

const StickyPlayer = ({ artist, visible, onClose }) => {
  const [expanded, setExpanded] = React.useState(false);
  const genreConfig = GENRE_CONFIG[artist?.genre] || {};

  if (!visible) return null;

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Player bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0f1419] border-t border-white/[0.1] transition-all duration-300 ${
          expanded ? 'rounded-t-2xl shadow-2xl shadow-black/50' : ''
        }`}
      >
        {/* Mini bar — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center h-16 px-4 gap-3 max-w-4xl mx-auto"
        >
          {/* Album art */}
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
            {artist?.imageUrl ? (
              <img src={artist.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: genreConfig.bg || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
              >
                <Music size={16} className="text-white/30" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white/90 text-sm font-medium truncate">{artist?.name}</p>
            <p className="text-white/40 text-xs truncate">{artist?.albumTitle}</p>
          </div>

          {/* Expand/collapse hint */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-white/30 text-xs">
              {expanded ? 'Tap to minimize' : 'Tap to play'}
            </span>
            <ChevronDown
              size={16}
              className={`text-white/30 transition-transform duration-200 ${expanded ? 'rotate-0' : 'rotate-180'}`}
            />
          </div>
        </button>

        {/* Expanded player — full Bandcamp embed with tracklist */}
        {expanded && (
          <div className="px-4 pb-4 max-w-4xl mx-auto">
            <div className="rounded-xl overflow-hidden">
              <BandcampEmbed albumId={artist?.embedAlbumId} size="large" tracklist={true} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StickyPlayer;
