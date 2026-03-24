// Image picker modal — lets students pick images from Research Board or search Unsplash.

import React, { useState } from 'react';
import { X, Image as ImageIcon, Search, BookOpen } from 'lucide-react';
import { getResearchBoard } from '../../research-board/researchBoardStorage';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

const searchUnsplash = async (query) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('No Unsplash API key configured (VITE_UNSPLASH_ACCESS_KEY)');
    return [];
  }
  const resp = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&content_filter=high&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
  );
  const data = await resp.json();
  return (data.results || []).map(photo => ({
    url: photo.urls.regular,
    thumbnailUrl: photo.urls.small,
    attribution: `${photo.user.name} / Unsplash`,
    unsplashLink: photo.links.html,
  }));
};

const ImagePickerModal = ({ isOpen, onClose, onSelect }) => {
  const [tab, setTab] = useState('research'); // 'research' | 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const rb = getResearchBoard();
  const savedImages = rb.images || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchUnsplash(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleSelect = (image) => {
    onSelect(image);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[70vh] rounded-xl overflow-hidden flex flex-col" style={{ background: '#141a24' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-white/90">Choose Image</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/50 min-h-[36px] min-w-[36px] flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setTab('research')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'research' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <BookOpen size={13} /> Research Board ({savedImages.length})
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'search' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <Search size={13} /> Search Photos
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'research' && (
            <div>
              {savedImages.length === 0 ? (
                <p className="text-center text-sm text-white/30 py-8">
                  No images saved to Research Board yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {savedImages.map(img => (
                    <button
                      key={img.id}
                      onClick={() => handleSelect(img)}
                      className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-400/50 transition-all"
                    >
                      <img src={img.thumbnailUrl || img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'search' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="Search for photos..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-colors min-h-[36px]"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
              {!UNSPLASH_ACCESS_KEY ? (
                <p className="text-center text-sm text-white/30 py-8">
                  Image search not configured. Use Research Board images instead.
                </p>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {searchResults.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelect(img)}
                        className="group relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-400/50 transition-all"
                      >
                        <img src={img.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/50 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.attribution}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-white/20 mt-3">
                    Photos from Unsplash — free to use
                  </p>
                </>
              ) : searching ? (
                <p className="text-center text-sm text-white/30 py-8">Searching...</p>
              ) : (
                <p className="text-center text-sm text-white/30 py-8">
                  Search for free photos — try "concert", "guitar", or "studio"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Remove image option */}
        <div className="px-4 py-2.5 border-t border-white/[0.06]">
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Remove current image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;
