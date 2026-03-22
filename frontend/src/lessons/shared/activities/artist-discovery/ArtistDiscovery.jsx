import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import ArtistCard from './ArtistCard';
import ArtistProfile from './ArtistProfile';
import { ARTIST_DATABASE, GENRE_CONFIG, ALL_GENRES, getArtistsByGenre, getArtistById } from './artistDatabase';

// ─── Storage helpers ────────────────────────────────────────────
const STORAGE_KEY = 'mma-artist-discovery';

function loadDiscoveryState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { starred: [], selected: null };
  } catch {
    return { starred: [], selected: null };
  }
}

function saveDiscoveryState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Main Discovery Browse Page ─────────────────────────────────
const ArtistDiscovery = ({ onComplete, isSessionMode, lockedArtists = [] }) => {
  const [state, setState] = useState(loadDiscoveryState);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingArtist, setViewingArtist] = useState(null);

  const save = useCallback((newState) => {
    setState(newState);
    saveDiscoveryState(newState);
  }, []);

  const handleStar = useCallback((artistId) => {
    setState(prev => {
      const starred = prev.starred.includes(artistId)
        ? prev.starred.filter(id => id !== artistId)
        : [...prev.starred, artistId];
      const next = { ...prev, starred };
      saveDiscoveryState(next);
      return next;
    });
  }, []);

  const handleSelect = useCallback((artistId) => {
    setState(prev => {
      const selected = prev.selected === artistId ? null : artistId;
      const next = { ...prev, selected };
      saveDiscoveryState(next);
      return next;
    });
  }, []);

  // Filter artists
  let filtered = activeGenre === 'All' ? ARTIST_DATABASE : getArtistsByGenre(activeGenre);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.genre.toLowerCase().includes(q) ||
      a.subgenre.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.tags?.some(t => t.includes(q))
    );
  }

  // Show artist profile
  if (viewingArtist) {
    const artist = getArtistById(viewingArtist);
    if (artist) {
      return (
        <ArtistProfile
          artist={artist}
          onBack={() => setViewingArtist(null)}
          onSelect={handleSelect}
          isSelected={state.selected === artist.id}
          onStar={handleStar}
          isStarred={state.starred.includes(artist.id)}
          onViewArtist={(id) => setViewingArtist(id)}
        />
      );
    }
  }

  return (
    <div className="h-screen bg-[#0f1419] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-1">Artist Discovery</h1>
          <p className="text-white/40 text-sm mb-4">Scout emerging artists across every genre. Find the next big thing.</p>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists, genres, locations..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Genre tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveGenre('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeGenre === 'All'
                  ? 'bg-white/15 text-white'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              All ({ARTIST_DATABASE.length})
            </button>
            {ALL_GENRES.map(genre => {
              const count = getArtistsByGenre(genre).length;
              const config = GENRE_CONFIG[genre];
              return (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeGenre === genre
                      ? 'text-white'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                  style={activeGenre === genre ? { backgroundColor: config.color + '33', color: config.color } : {}}
                >
                  {genre} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Artist grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm">No artists found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(artist => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={(a) => setViewingArtist(a.id)}
                  isSelected={state.selected === artist.id}
                  isLocked={lockedArtists.includes(artist.id) && state.selected !== artist.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — shows selected artist */}
      {state.selected && (
        <div className="flex-shrink-0 border-t border-white/[0.08] bg-[#0f1419]/95 backdrop-blur-sm px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={getArtistById(state.selected)?.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{getArtistById(state.selected)?.name}</p>
                <p className="text-amber-400/70 text-[11px]">Your artist</p>
              </div>
            </div>
            <button
              onClick={() => setViewingArtist(state.selected)}
              className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-400/20 transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDiscovery;
