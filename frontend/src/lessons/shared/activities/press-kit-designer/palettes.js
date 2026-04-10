// Color palettes for the Press Kit Designer.
// Each palette defines bg, accent, text, and muted colors used by SlideRenderer.

import { GENRE_CONFIG } from '../artist-discovery/artistDatabase';

const PALETTES = {
  midnight: { id: 'midnight', label: 'Midnight',  bg: '#101c36', accent: '#3b82f6', text: '#f1f5f9', muted: '#64748b' },
  sunset:   { id: 'sunset',   label: 'Sunset',    bg: '#2a1c10', accent: '#f97316', text: '#fef3c7', muted: '#a8a29e' },
  arctic:   { id: 'arctic',   label: 'Arctic',    bg: '#0c1e30', accent: '#06b6d4', text: '#ecfeff', muted: '#67e8f9' },
  neon:     { id: 'neon',     label: 'Neon',      bg: '#12061e', accent: '#a855f7', text: '#faf5ff', muted: '#c084fc' },
  earth:    { id: 'earth',    label: 'Earth',     bg: '#1e1c10', accent: '#84cc16', text: '#fefce8', muted: '#a3e635' },
  coral:    { id: 'coral',    label: 'Coral',     bg: '#24101c', accent: '#f43f5e', text: '#fff1f2', muted: '#fb7185' },
};

/**
 * Build a palette from a genre string using GENRE_CONFIG.
 * Falls back to midnight if genre is unknown.
 */
function buildGenrePalette(genre) {
  const cfg = GENRE_CONFIG[genre];
  if (!cfg) return { ...PALETTES.midnight, id: 'genre', label: 'Genre' };
  return {
    id: 'genre',
    label: 'Genre',
    bg: '#0f1419',
    accent: cfg.color,
    text: '#f1f5f9',
    muted: cfg.color + 'aa', // slightly transparent version
  };
}

/**
 * Get the resolved palette object for a slide.
 * @param {string} paletteId - 'genre' or one of the preset IDs
 * @param {string} genre - artist's genre (only used when paletteId === 'genre')
 */
function getPalette(paletteId, genre) {
  if (paletteId === 'genre') return buildGenrePalette(genre);
  return PALETTES[paletteId] || PALETTES.midnight;
}

/**
 * Return all palettes as an array, with genre first.
 */
function getAllPalettes(genre) {
  return [buildGenrePalette(genre), ...Object.values(PALETTES)];
}

export { PALETTES, buildGenrePalette, getPalette, getAllPalettes };
