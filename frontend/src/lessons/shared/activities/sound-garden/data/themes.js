// File: themes.js
// Theme configurations for Sound Garden
// Each theme determines the visual style of bloomed notes

export const themes = {
  garden: {
    id: 'garden',
    name: 'Garden',
    emoji: '🌸',
    description: 'Flowers bloom from each note',
    gradient: 'from-green-900 via-emerald-900 to-teal-900',
    bgColor: '#064e3b',
    accentColor: '#10b981',
    highlightColor: '#34d399',
    bloomEmojis: ['🌸', '🌺', '🌷', '🌻', '🌹', '💮', '🌼', '🏵️', '💐', '🪻', '🌱', '🍀'],
    animation: 'sway',
    noteColor: '#86efac', // Light green for notes
    activeNoteColor: '#fef08a', // Yellow glow when playing
  },
  cosmos: {
    id: 'cosmos',
    name: 'Cosmos',
    emoji: '✨',
    description: 'Stars twinkle from each note',
    gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    bgColor: '#1e1b4b',
    accentColor: '#8b5cf6',
    highlightColor: '#a78bfa',
    bloomEmojis: ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🪐', '💎', '🔮', '⚡', '🌠', '✴️'],
    animation: 'twinkle',
    noteColor: '#c4b5fd', // Light purple for notes
    activeNoteColor: '#fef08a',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Bubbles rise from each note',
    gradient: 'from-cyan-900 via-blue-900 to-indigo-900',
    bgColor: '#164e63',
    accentColor: '#06b6d4',
    highlightColor: '#22d3ee',
    bloomEmojis: ['🫧', '💧', '🐚', '🦋', '💎', '🔮', '🐠', '🐙', '🪸', '🌊', '🐬', '🦈'],
    animation: 'drift',
    noteColor: '#a5f3fc', // Light cyan for notes
    activeNoteColor: '#fef08a',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    description: 'Flames flicker from each note',
    gradient: 'from-orange-900 via-red-900 to-slate-900',
    bgColor: '#7c2d12',
    accentColor: '#f97316',
    highlightColor: '#fb923c',
    bloomEmojis: ['🔥', '✴️', '💥', '⚡', '☄️', '🌋', '💛', '🧡', '❤️', '🎇', '🎆', '💢'],
    animation: 'flicker',
    noteColor: '#fed7aa', // Light orange for notes
    activeNoteColor: '#fef08a',
  },
};

// Get random bloom emoji for a theme
export function getRandomBloom(themeId) {
  const theme = themes[themeId];
  if (!theme) return '🌸';
  const emojis = theme.bloomEmojis;
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Brush colors available in all themes
export const brushColors = [
  { id: 'red', name: 'Red', hex: '#ef4444' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308' },
  { id: 'lime', name: 'Lime', hex: '#84cc16' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'purple', name: 'Purple', hex: '#a855f7' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'gray', name: 'Gray', hex: '#9ca3af' },
  { id: 'black', name: 'Black', hex: '#1f2937' },
];

// Brush sizes
export const brushSizes = [
  { id: 'tiny', name: 'Tiny', size: 2 },
  { id: 'small', name: 'Small', size: 5 },
  { id: 'medium', name: 'Medium', size: 10 },
  { id: 'large', name: 'Large', size: 18 },
  { id: 'chunky', name: 'Chunky', size: 30 },
];

// Brush styles
export const brushStyles = [
  { id: 'solid', name: 'Solid', description: 'Smooth solid line' },
  { id: 'marker', name: 'Marker', description: 'Semi-transparent highlighter' },
  { id: 'spray', name: 'Spray', description: 'Spray paint effect' },
  { id: 'glow', name: 'Glow', description: 'Glowing neon line' },
  { id: 'dotted', name: 'Dotted', description: 'Dotted line pattern' },
  { id: 'rainbow', name: 'Rainbow', description: 'Color-shifting rainbow' },
];

// Sticker categories
export const stickerCategories = {
  nature: {
    name: 'Nature',
    emoji: '🌿',
    stickers: ['🌸', '🌺', '🌷', '🌻', '🌹', '🍀', '🌿', '🍃', '🌲', '🌵', '🪷', '🌾'],
  },
  space: {
    name: 'Space',
    emoji: '🌟',
    stickers: ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🪐', '🌈', '☁️', '❄️', '🌠', '💥'],
  },
  ocean: {
    name: 'Ocean',
    emoji: '🌊',
    stickers: ['🌊', '🐚', '🦋', '💎', '🫧', '💧', '🐠', '🦑', '🐙', '🪸', '🐬', '🦈'],
  },
  fire: {
    name: 'Fire',
    emoji: '🔥',
    stickers: ['🔥', '✴️', '💥', '⚡', '☄️', '💛', '🧡', '❤️', '🎇', '🎆', '🌋', '💢'],
  },
  music: {
    name: 'Music',
    emoji: '🎵',
    stickers: ['🎵', '🎶', '🎼', '🎹', '🎸', '🎺', '🥁', '🎻', '🎷', '🪗', '🎤', '🔔'],
  },
  feelings: {
    name: 'Feelings',
    emoji: '💖',
    stickers: ['💖', '💜', '💙', '💚', '😊', '🥰', '😎', '🤩', '😌', '🎭', '💕', '✌️'],
  },
  shapes: {
    name: 'Shapes',
    emoji: '⬤',
    stickers: ['⬤', '◆', '▲', '■', '★', '♦', '●', '◉', '◎', '✦', '❋', '✿'],
  },
};

export default {
  themes,
  getRandomBloom,
  brushColors,
  brushSizes,
  brushStyles,
  stickerCategories,
};