// Image picker modal — search free photos via backend proxy (Pexels API)
// or pick from Research Board. All requests go through musicmindacademy.com
// so schools don't need to whitelist any external domains.

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { getResearchBoard } from '../../research-board/researchBoardStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const searchPhotos = async (query, page = 1) => {
  const resp = await fetch(`${API_BASE}/api/images/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!resp.ok) return { photos: [], totalResults: 0 };
  return resp.json();
};

const ImagePickerModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const rb = getResearchBoard();
  const savedImages = rb.images || [];

  const handleSearch = async (p = 1) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const data = await searchPhotos(searchQuery, p);
      if (p === 1) {
        setResults(data.photos || []);
      } else {
        setResults(prev => [...prev, ...(data.photos || [])]);
      }
      setTotalResults(data.totalResults || 0);
      setPage(p);
    } catch {
      if (p === 1) setResults([]);
    }
    setSearching(false);
  };

  const handleSelect = (image) => {
    onSelect(image);
    onClose();
  };

  const canLoadMore = results.length < totalResults;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[75vh] rounded-xl overflow-hidden flex flex-col" style={{ background: '#141a24' }}>
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

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(1); }}
                placeholder="Search free photos... (e.g. concert, studio, guitar)"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-amber-500/40"
              />
            </div>
            <button
              onClick={() => handleSearch(1)}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40 transition-colors min-h-[36px]"
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Research Board images (always shown at top if they exist) */}
          {savedImages.length > 0 && !hasSearched && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">From Your Research Board</p>
              <div className="grid grid-cols-3 gap-2">
                {savedImages.map(img => (
                  <button
                    key={img.id}
                    onClick={() => handleSelect(img)}
                    className="aspect-[4/3] rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-400/50 transition-all"
                  >
                    <img src={img.thumbnailUrl || img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {hasSearched && results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">
                Free Photos ({totalResults.toLocaleString()} results)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {results.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => handleSelect({
                      url: photo.url,
                      thumbnailUrl: photo.thumbnail,
                      attribution: `${photo.photographer} / Pexels`,
                    })}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-400/50 transition-all"
                  >
                    <img src={photo.thumbnail} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/50 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.photographer}
                    </div>
                  </button>
                ))}
              </div>
              {canLoadMore && (
                <button
                  onClick={() => handleSearch(page + 1)}
                  disabled={searching}
                  className="w-full mt-3 py-2.5 rounded-lg bg-white/[0.06] text-white/50 text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  {searching ? 'Loading...' : 'Load More'}
                </button>
              )}
              <p className="text-center text-[10px] text-white/15 mt-3">
                Free photos from Pexels — no copyright, free for commercial use
              </p>
            </div>
          )}

          {hasSearched && results.length === 0 && !searching && (
            <p className="text-center text-sm text-white/30 py-8">
              No photos found. Try a different search term.
            </p>
          )}

          {!hasSearched && savedImages.length === 0 && (
            <p className="text-center text-sm text-white/30 py-8">
              Search for free photos — try "concert", "guitar", "studio", or "neon"
            </p>
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
