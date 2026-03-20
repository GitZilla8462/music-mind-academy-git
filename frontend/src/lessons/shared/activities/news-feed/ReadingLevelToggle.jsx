// File: news-feed/ReadingLevelToggle.jsx
// Small reusable toggle for switching between Standard and Simplified reading levels.

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'mma-reading-level-preference';

const LEVELS = [
  { value: 'standard', label: 'Standard' },
  { value: 'simplified', label: 'Simplified' },
];

export function ReadingLevelToggle({ value, onChange }) {
  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'standard' || saved === 'simplified') && saved !== value) {
        onChange(saved);
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (level) => {
    if (level === value) return;
    onChange(level);
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch { /* ignore */ }
  };

  return (
    <div className="inline-flex rounded-full overflow-hidden border border-white/10">
      {LEVELS.map((lvl) => {
        const isActive = lvl.value === value;
        return (
          <button
            key={lvl.value}
            onClick={() => handleChange(lvl.value)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[#f0b429] text-[#1a2744] font-bold'
                : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
            }`}
          >
            {lvl.label}
          </button>
        );
      })}
    </div>
  );
}

export default ReadingLevelToggle;
