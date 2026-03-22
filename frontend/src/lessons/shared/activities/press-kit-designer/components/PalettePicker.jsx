// Palette picker — 6 color swatches + genre default.

import React from 'react';
import { Check } from 'lucide-react';
import { getAllPalettes } from '../palettes';

const PalettePicker = ({ currentPalette, genre, onSelect }) => {
  const palettes = getAllPalettes(genre);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 mr-1">Colors</span>
      {palettes.map(p => {
        const isActive = currentPalette === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.label}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center transition-all
              ${isActive ? 'ring-2 ring-white/60 scale-110' : 'ring-1 ring-white/10 hover:ring-white/30'}
            `}
            style={{ background: p.accent }}
          >
            {isActive && <Check size={12} className="text-white drop-shadow" />}
          </button>
        );
      })}
    </div>
  );
};

export default PalettePicker;
