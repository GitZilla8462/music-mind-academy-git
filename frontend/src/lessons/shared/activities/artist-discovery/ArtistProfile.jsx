import React from 'react';
import { ArrowLeft, Star, Sparkles, Headphones } from 'lucide-react';
import { GENRE_CONFIG } from './artistDatabase';
import BandcampEmbed from './BandcampEmbed';
import HeroBanner from './profile/HeroBanner';
import FeaturedTracks from './profile/FeaturedTracks';
import QuickFacts from './profile/QuickFacts';
import AboutSection from './profile/AboutSection';
import TheirSound from './profile/TheirSound';
import SimilarArtists from './profile/SimilarArtists';

const ArtistProfile = ({ artist, onBack, onSelect, isSelected, onStar, isStarred, onViewArtist }) => {
  const genreConfig = GENRE_CONFIG[artist.genre] || { color: '#6b7280', bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0f1419]/95 backdrop-blur-sm border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 font-medium text-sm truncate">{artist.name}</p>
          </div>
          <button
            onClick={() => onStar?.(artist.id)}
            className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isStarred ? 'text-amber-400' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Hero banner */}
      <HeroBanner artist={artist} genreConfig={genreConfig} />

      {/* Inline music player — right below hero, impossible to miss */}
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4">
          {/* Album info + player bar */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
            {/* Album art + info row */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                {artist.imageUrl ? (
                  <img src={artist.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: genreConfig.bg }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-semibold truncate">{artist.albumTitle || 'Featured Album'}</p>
                <p className="text-white/40 text-xs truncate">{artist.name} · {artist.tracks?.length || 0} tracks</p>
              </div>
            </div>
            {/* Bandcamp player — large embed with album art + always-visible controls */}
            <div className="border-t border-white/[0.06] overflow-hidden" style={{ height: '200px' }}>
              <iframe
                style={{ border: 0, width: '100%', height: '470px' }}
                src={`https://bandcamp.com/EmbeddedPlayer/album=${artist.embedAlbumId}/size=large/bgcol=0f1419/linkcol=4db8ff/tracklist=false/transparent=true/`}
                title="Bandcamp Player"
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Track list */}
        <FeaturedTracks
          tracks={artist.tracks}
          artistName={artist.name}
        />

        {/* Quick facts */}
        <QuickFacts artist={artist} />

        {/* About */}
        <AboutSection artist={artist} />

        {/* Why they stand out */}
        {artist.whyInteresting && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} />
              Why They Stand Out
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed">{artist.whyInteresting}</p>
          </div>
        )}

        {/* Their sound */}
        <TheirSound artist={artist} />

        {/* Similar artists */}
        <SimilarArtists artistId={artist.id} onViewArtist={onViewArtist} />

        {/* Select artist button */}
        <button
          onClick={() => onSelect?.(artist.id)}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] mb-6 ${
            isSelected
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-white/10 text-white hover:bg-white/15'
          }`}
        >
          {isSelected ? '\u2605 This Is Your Artist' : 'Select This Artist'}
        </button>
      </div>
    </div>
  );
};

export default ArtistProfile;
