import React, { useState } from 'react';
import { ArrowLeft, Star, Sparkles } from 'lucide-react';
import { GENRE_CONFIG } from './artistDatabase';
import HeroBanner from './profile/HeroBanner';
import FeaturedTracks from './profile/FeaturedTracks';
import QuickFacts from './profile/QuickFacts';
import AboutSection from './profile/AboutSection';
import TheirSound from './profile/TheirSound';
import SimilarArtists from './profile/SimilarArtists';
import StickyPlayer from './profile/StickyPlayer';

const ArtistProfile = ({ artist, onBack, onSelect, isSelected, onStar, isStarred, onViewArtist }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const genreConfig = GENRE_CONFIG[artist.genre] || { color: '#6b7280', bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' };

  const handleListenClick = () => {
    setShowPlayer(true);
  };

  const handleTrackClick = (index) => {
    setCurrentTrackIndex(index);
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] pb-20">
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
      <HeroBanner
        artist={artist}
        genreConfig={genreConfig}
        onListenClick={handleListenClick}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Featured tracks */}
        <FeaturedTracks
          tracks={artist.tracks}
          artistName={artist.name}
          artistImage={artist.imageUrl}
          genreGradient={genreConfig.bg}
          onTrackClick={handleTrackClick}
          currentTrackIndex={currentTrackIndex}
          playerVisible={showPlayer}
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

      {/* Sticky bottom player */}
      <StickyPlayer artist={artist} visible={showPlayer} />
    </div>
  );
};

export default ArtistProfile;
