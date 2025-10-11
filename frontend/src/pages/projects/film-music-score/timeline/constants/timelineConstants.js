// File: /src/pages/projects/film-music-score/timeline/constants/timelineConstants.js

export const TIMELINE_CONSTANTS = {
  TRACK_HEIGHT: 48, // REDUCED from 96 to 48 (50% reduction)
  VIDEO_TRACK_HEIGHT: 18,
  HEADER_HEIGHT: 32,
  NUM_TRACKS: 12,
  MARGIN_WIDTH: 200,
  MARKER_INTERVAL: 10,
  
  CATEGORY_COLORS: {
    'Orchestral': { bg: '#8b5cf6', accent: '#a855f7', text: '#ffffff' },
    'Percussion': { bg: '#ef4444', accent: '#f87171', text: '#ffffff' },
    'Strings': { bg: '#10b981', accent: '#34d399', text: '#ffffff' },
    'Brass': { bg: '#f59e0b', accent: '#fbbf24', text: '#000000' },
    'Woodwinds': { bg: '#3b82f6', accent: '#60a5fa', text: '#ffffff' },
    'Piano': { bg: '#6366f1', accent: '#8b5cf6', text: '#ffffff' },
    'Ambience': { bg: '#6b7280', accent: '#9ca3af', text: '#ffffff' },
    'Effects': { bg: '#06b6d4', accent: '#22d3ee', text: '#ffffff' },
    'Default': { bg: '#4b5563', accent: '#6b7280', text: '#ffffff' }
  },

  ZOOM_PRESETS: [
    { label: 'Fit', value: 0.2 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '100%', value: 1 },
    { label: '200%', value: 2 },
    { label: '400%', value: 4 }
  ]
};