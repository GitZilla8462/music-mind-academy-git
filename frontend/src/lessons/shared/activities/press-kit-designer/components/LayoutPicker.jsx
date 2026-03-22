// Layout picker — shows 3 layout thumbnails for the current slide type.

import React from 'react';
import { getSlideConfig } from '../slideConfigs';

const LayoutPicker = ({ slideNumber, currentLayout, onSelect }) => {
  const cfg = getSlideConfig(slideNumber);
  if (!cfg) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 mr-1">Layout</span>
      {cfg.layouts.map(layout => {
        const isActive = currentLayout === layout.id;
        return (
          <button
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            title={layout.desc}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px]
              ${isActive
                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70'
              }
            `}
          >
            {layout.label}
          </button>
        );
      })}
    </div>
  );
};

export default LayoutPicker;
