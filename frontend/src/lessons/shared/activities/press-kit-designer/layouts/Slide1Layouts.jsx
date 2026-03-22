// Slide 1: Meet the Artist — 3 layout components
// Props: { fields, palette, image }
//   fields: { artistName, genre, location, hookLine }
//   palette: { bg, accent, text, muted }
//   image: { url, thumbnailUrl, attribution } | null

import React from 'react';
import { MapPin } from 'lucide-react';

// Layout A: Full-bleed hero image with gradient overlay and text at bottom
export function HeroOverlay({ fields, palette, image }) {
  const { artistName, genre, location, hookLine } = fields;
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: palette.bg }}>
      {image?.url ? (
        <img src={image.url} alt={artistName || 'Artist'} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${palette.accent}33 0%, ${palette.bg} 100%)` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          {genre && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: palette.accent + '33', color: palette.accent }}>
              {genre}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#fff' }}>
          {artistName || 'Artist Name'}
        </h1>
        {location && (
          <div className="flex items-center gap-1.5 mb-3 text-white/70 text-sm">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        )}
        {hookLine && (
          <p className="text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
            {hookLine}
          </p>
        )}
      </div>
    </div>
  );
}

// Layout B: Image left 40%, text right 60%
export function ImageLeft({ fields, palette, image }) {
  const { artistName, genre, location, hookLine } = fields;
  return (
    <div className="flex w-full h-full overflow-hidden rounded-lg" style={{ background: palette.bg }}>
      <div className="w-[40%] relative flex-shrink-0">
        {image?.url ? (
          <img src={image.url} alt={artistName || 'Artist'} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(180deg, ${palette.accent}44 0%, ${palette.bg} 100%)` }} />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-8">
        {genre && (
          <span className="self-start px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3" style={{ background: palette.accent + '22', color: palette.accent }}>
            {genre}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: palette.text }}>
          {artistName || 'Artist Name'}
        </h1>
        {location && (
          <div className="flex items-center gap-1.5 mb-4 text-sm" style={{ color: palette.muted }}>
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        )}
        {hookLine && (
          <p className="text-base leading-relaxed" style={{ color: palette.text + 'cc' }}>
            {hookLine}
          </p>
        )}
      </div>
    </div>
  );
}

// Layout C: Centered with circular/rounded image
export function Centered({ fields, palette, image }) {
  const { artistName, genre, location, hookLine } = fields;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-5 ring-2" style={{ ringColor: palette.accent + '44' }}>
        {image?.url ? (
          <img src={image.url} alt={artistName || 'Artist'} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${palette.accent}55 0%, ${palette.bg} 100%)` }} />
        )}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center" style={{ color: palette.text }}>
        {artistName || 'Artist Name'}
      </h1>
      {genre && (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ background: palette.accent + '22', color: palette.accent }}>
          {genre}
        </span>
      )}
      {location && (
        <div className="flex items-center gap-1.5 mb-4 text-sm" style={{ color: palette.muted }}>
          <MapPin size={14} />
          <span>{location}</span>
        </div>
      )}
      {hookLine && (
        <p className="text-base text-center max-w-md leading-relaxed" style={{ color: palette.text + 'cc' }}>
          {hookLine}
        </p>
      )}
    </div>
  );
}

const SLIDE_1_LAYOUTS = {
  'hero-overlay': HeroOverlay,
  'image-left': ImageLeft,
  'centered': Centered,
};

export default SLIDE_1_LAYOUTS;
