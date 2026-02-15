// File: /lessons/shared/activities/listening-journey/CharacterSelector.jsx
// Character picker — sprite-based characters

import React from 'react';
import { CHARACTER_OPTIONS } from './journeyDefaults';

const PREVIEW_SIZE = 32;

const SpritePreview = ({ char }) => {
  const strip = char.sprites.idle || char.sprites.walk;
  const fs = char.frameSize || 32;
  const previewScale = PREVIEW_SIZE / fs;
  return (
    <div
      style={{
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        backgroundImage: `url(${strip.src})`,
        backgroundSize: `${strip.frames * fs * previewScale}px ${PREVIEW_SIZE}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0px 0px',
        imageRendering: 'pixelated',
      }}
    />
  );
};

const CharacterSelector = ({ selectedId, onSelect }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {CHARACTER_OPTIONS.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.type === 'none' ? null : char)}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            (char.type === 'none' ? !selectedId : selectedId === char.id)
              ? 'bg-white/20 ring-2 ring-white scale-105'
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          {char.sprites ? (
            <SpritePreview char={char} />
          ) : (
            <div style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }} className="flex items-center justify-center text-white/30 text-lg">✕</div>
          )}
          <span className="text-[10px] text-white/70 mt-1">{char.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CharacterSelector;
