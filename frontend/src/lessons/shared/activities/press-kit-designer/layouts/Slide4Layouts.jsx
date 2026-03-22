// Slide 4: Listen — 3 layout components
// Props: { fields, palette, image }
//   fields: { trackTitle, albumTitle, whatToListenFor }

import React from 'react';
import { Play, Disc3, Headphones } from 'lucide-react';

function PlayerPlaceholder({ palette, trackTitle, albumTitle }) {
  return (
    <div
      className="rounded-lg p-4 flex items-center gap-4"
      style={{ background: palette.accent + '15', border: `1px dashed ${palette.accent}44` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: palette.accent + '33' }}
      >
        <Play size={20} style={{ color: palette.accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: palette.text }}>
          {trackTitle || 'Track Title'}
        </p>
        <p className="text-xs truncate" style={{ color: palette.muted }}>
          {albumTitle || 'Album Title'}
        </p>
      </div>
      <Headphones size={16} style={{ color: palette.muted }} />
    </div>
  );
}

// Layout A: Player centered with info above and below
export function PlayerCenter({ fields, palette }) {
  const { trackTitle, albumTitle, whatToListenFor } = fields;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <Disc3 size={28} className="mb-3 opacity-40" style={{ color: palette.accent }} />
      <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center" style={{ color: palette.text }}>
        {trackTitle || 'Track Title'}
      </h2>
      <p className="text-sm mb-6" style={{ color: palette.muted }}>{albumTitle || 'Album Title'}</p>
      <div className="w-full max-w-md mb-6">
        <PlayerPlaceholder palette={palette} trackTitle={trackTitle} albumTitle={albumTitle} />
      </div>
      {whatToListenFor && (
        <div className="max-w-md text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: palette.muted }}>What to Listen For</p>
          <p className="text-sm leading-relaxed" style={{ color: palette.text + 'cc' }}>
            {whatToListenFor}
          </p>
        </div>
      )}
    </div>
  );
}

// Layout B: Album art left, track info + player right
export function AlbumArtLeft({ fields, palette, image }) {
  const { trackTitle, albumTitle, whatToListenFor } = fields;
  return (
    <div className="flex w-full h-full overflow-hidden rounded-lg" style={{ background: palette.bg }}>
      <div className="w-[40%] relative flex-shrink-0">
        {image?.url ? (
          <img src={image.url} alt={albumTitle || 'Album'} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${palette.accent}33 0%, ${palette.bg} 100%)` }}>
            <Disc3 size={64} className="opacity-20" style={{ color: palette.accent }} />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: palette.muted }}>Featured Track</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: palette.text }}>
          {trackTitle || 'Track Title'}
        </h2>
        <p className="text-sm mb-5" style={{ color: palette.muted }}>{albumTitle || 'Album Title'}</p>
        <div className="mb-5">
          <PlayerPlaceholder palette={palette} trackTitle={trackTitle} albumTitle={albumTitle} />
        </div>
        {whatToListenFor && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: palette.muted }}>What to Listen For</p>
            <p className="text-sm leading-relaxed" style={{ color: palette.text + 'cc' }}>
              {whatToListenFor}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Layout C: Minimal — track title large, player below
export function Minimal({ fields, palette }) {
  const { trackTitle, albumTitle, whatToListenFor } = fields;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 rounded-lg" style={{ background: palette.bg }}>
      <p className="text-[10px] uppercase tracking-wider font-bold mb-4" style={{ color: palette.accent }}>Listen</p>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-center" style={{ color: palette.text }}>
        {trackTitle || 'Track Title'}
      </h2>
      <p className="text-sm mb-8" style={{ color: palette.muted }}>{albumTitle || 'Album Title'}</p>
      <div className="w-full max-w-sm mb-6">
        <PlayerPlaceholder palette={palette} trackTitle={trackTitle} albumTitle={albumTitle} />
      </div>
      {whatToListenFor && (
        <p className="text-sm italic text-center max-w-md leading-relaxed" style={{ color: palette.text + 'aa' }}>
          "{whatToListenFor}"
        </p>
      )}
    </div>
  );
}

const SLIDE_4_LAYOUTS = {
  'player-center': PlayerCenter,
  'album-art-left': AlbumArtLeft,
  'minimal': Minimal,
};

export default SLIDE_4_LAYOUTS;
