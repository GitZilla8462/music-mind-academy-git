// File: image-library/ImageLibrary.jsx
// Searchable image panel pulling free-to-use images from Wikimedia Commons.
// Can be used standalone or embedded inside a lesson activity.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, ExternalLink, Check, Image as ImageIcon } from 'lucide-react';
import { addImage } from '../research-board/researchBoardStorage';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

// ---------------------------------------------------------------------------
// Wikimedia Commons helpers
// ---------------------------------------------------------------------------

async function searchCommons(query, limit = 12) {
  // Step 1: search for files
  const searchUrl = new URL(COMMONS_API);
  searchUrl.search = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    format: 'json',
    srlimit: String(limit),
    origin: '*',
  });

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const searchResults = searchData?.query?.search || [];
  if (searchResults.length === 0) return [];

  // Step 2: get image info for each result
  const results = [];

  for (const result of searchResults) {
    try {
      const infoUrl = new URL(COMMONS_API);
      infoUrl.search = new URLSearchParams({
        action: 'query',
        titles: result.title,
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|mime',
        format: 'json',
        origin: '*',
      });

      const infoRes = await fetch(infoUrl);
      const infoData = await infoRes.json();
      const pages = infoData?.query?.pages;
      if (!pages) continue;

      const page = Object.values(pages)[0];
      const imageInfo = page?.imageinfo?.[0];
      if (!imageInfo?.url) continue;

      const mime = imageInfo.mime || '';
      if (!mime.startsWith('image/')) continue;

      const meta = imageInfo.extmetadata || {};
      const artist = (meta.Artist?.value || 'Unknown').replace(/<[^>]*>/g, '');
      const license = meta.LicenseShortName?.value || 'Unknown license';
      const description =
        (meta.ImageDescription?.value || result.title).replace(/<[^>]*>/g, '');

      // Wikimedia thumbnail pattern
      const thumbUrl =
        imageInfo.url.replace('/commons/', '/commons/thumb/') +
        '/400px-' +
        result.title.replace('File:', '');

      results.push({
        url: imageInfo.url,
        thumbnailUrl: thumbUrl,
        title: description.substring(0, 120),
        artist,
        license,
        attribution: `${artist}, ${license}`,
      });
    } catch {
      continue;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white/10 rounded-lg aspect-[4/3]" />
          <div className="mt-2 h-3 bg-white/10 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview modal
// ---------------------------------------------------------------------------

function PreviewModal({ image, onClose, onImageSelect }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    addImage({
      url: image.url,
      thumbnailUrl: image.thumbnailUrl || image.url,
      attribution: image.attribution,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSelect = () => {
    if (onImageSelect) {
      onImageSelect({
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        attribution: image.attribution,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a2233] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="p-4">
          <img
            src={image.url}
            alt={image.title}
            className="w-full max-h-[50vh] object-contain rounded-lg bg-black/30"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="px-4 pb-2">
          <p className="text-white text-sm font-medium leading-snug mb-1">
            {image.title}
          </p>
          <p className="text-white/50 text-xs">{image.attribution}</p>
        </div>

        {/* License badge */}
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1 text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full border border-green-700/40">
            <Check size={12} /> Free to use (CC)
          </span>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              saved
                ? 'bg-green-700 text-white cursor-default'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-900'
            }`}
          >
            {saved ? 'Saved \u2713' : 'Save to Research Board'}
          </button>

          {onImageSelect && (
            <button
              onClick={handleSelect}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Select Image
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ImageLibrary = ({ onImageSelect, embedded = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [preview, setPreview] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search
  const doSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const imgs = await searchCommons(trimmed);
      setResults(imgs);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleQuickSave = (img, e) => {
    e.stopPropagation();
    addImage({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl || img.url,
      attribution: img.attribution,
    });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const content = (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for an artist or topic..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {loading && <SkeletonGrid />}

        {/* Empty state — no search yet */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <ImageIcon size={48} className="text-white/30 mb-3" />
            <p className="text-white/60 text-sm max-w-xs">
              Search for an artist, instrument, or music topic to find images
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <Search size={48} className="text-white/30 mb-3" />
            <p className="text-white/60 text-sm max-w-xs">
              No images found for &ldquo;{query}&rdquo;. Try a different search
              term.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {results.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                onClick={() => setPreview(img)}
                className="group text-left bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-amber-500/40 transition-all hover:scale-[1.02]"
              >
                <div className="aspect-[4/3] bg-black/20 overflow-hidden">
                  <img
                    src={img.thumbnailUrl}
                    alt={img.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fall back to full-size URL if thumb fails
                      if (e.target.src !== img.url) {
                        e.target.src = img.url;
                      }
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-white/50 text-[11px] leading-tight line-clamp-2">
                    {img.attribution}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toastVisible && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          Saved to Research Board!
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          image={preview}
          onClose={() => setPreview(null)}
          onImageSelect={onImageSelect}
        />
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="relative h-full bg-[#0f1a2e] text-white">{content}</div>
    );
  }

  return (
    <div className="relative h-screen bg-[#0f1a2e] text-white">{content}</div>
  );
};

export default ImageLibrary;
