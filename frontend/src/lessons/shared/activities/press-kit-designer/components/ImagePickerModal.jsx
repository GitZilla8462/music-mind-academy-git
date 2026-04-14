// Image picker modal — curated categories of free-to-use photos.
// No API calls, no search bar, no content safety risk.
// Photos hosted on R2 (media.musicmindacademy.com) or local public/.

import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

// Base URL — uses R2 in production, local in dev
const IMAGE_BASE = '/images/press-kit';

const ImagePickerModal = ({ isOpen, onClose, onSelect }) => {
  const [manifest, setManifest] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Load manifest on first open
  useEffect(() => {
    if (!isOpen || manifest) return;
    fetch(`${IMAGE_BASE}/manifest.json`)
      .then(r => r.json())
      .then(data => {
        setManifest(data);
        const firstKey = Object.keys(data)[0];
        if (firstKey) setActiveCategory(firstKey);
      })
      .catch(() => setManifest({}));
  }, [isOpen, manifest]);

  if (!isOpen) return null;

  const categories = manifest ? Object.entries(manifest) : [];
  const activeImages = activeCategory && manifest?.[activeCategory]?.images || [];

  const handleSelect = (image) => {
    onSelect(image);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col" style={{ background: '#141a24' }}>
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

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-white/[0.06]">
          {categories.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === key
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {!manifest && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-white/30" />
            </div>
          )}

          {activeCategory && activeImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {activeImages.map(img => (
                <button
                  key={img.id}
                  onClick={() => handleSelect({
                    url: `${IMAGE_BASE}/${activeCategory}/${img.file}`,
                    thumbnailUrl: `${IMAGE_BASE}/${activeCategory}/${img.thumb}`,
                    attribution: `${img.photographer} / Pexels`,
                  })}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-400/50 transition-all"
                >
                  <img
                    src={`${IMAGE_BASE}/${activeCategory}/${img.thumb}`}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/50 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.photographer}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeCategory && activeImages.length === 0 && manifest && (
            <p className="text-center text-sm text-white/30 py-8">No images in this category</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06]">
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Remove current image
          </button>
          <span className="text-[10px] text-white/15">Free photos · No copyright</span>
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;
