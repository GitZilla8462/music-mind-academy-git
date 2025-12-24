// Beat Escape Room Theme Configuration
// All themes now available with optimized JPG backgrounds

export const THEMES = {
  'space-station': {
    id: 'space-station',
    name: 'Space Station',
    description: 'Escape the spaceship!',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#ffffff',
      kick: '#06b6d4',
      snare: '#ffffff',
      hihat: '#3b82f6',
      background: '#0f172a',
    },
    font: {
      family: "'Orbitron', sans-serif",
      import: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap",
    },
    available: true,
  },
  'studio-vault': {
    id: 'studio-vault',
    name: 'Studio Vault',
    description: 'Break into the music vault!',
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#f0abfc',
      kick: '#ef4444',
      snare: '#f59e0b',
      hihat: '#22c55e',
      background: '#1e1b4b',
    },
    font: {
      family: "'Bebas Neue', sans-serif",
      import: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    },
    available: true,
  },
  'neon-arcade': {
    id: 'neon-arcade',
    name: 'Neon Arcade',
    description: 'Escape the Upside Down!',
    colors: {
      primary: '#ec4899',
      secondary: '#06b6d4',
      accent: '#facc15',
      kick: '#ec4899',
      snare: '#facc15',
      hihat: '#06b6d4',
      background: '#1a0a2e',
    },
    font: {
      family: "'VT323', monospace",
      import: "https://fonts.googleapis.com/css2?family=VT323&display=swap",
    },
    available: true,
  },
  'dungeon': {
    id: 'dungeon',
    name: 'Dungeon',
    description: 'Escape the castle!',
    colors: {
      primary: '#f59e0b',
      secondary: '#78716c',
      accent: '#dc2626',
      kick: '#dc2626',
      snare: '#f59e0b',
      hihat: '#ea580c',
      background: '#1c1917',
    },
    font: {
      family: "'Cinzel', serif",
      import: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap",
    },
    available: true,
  },
};

const ASSET_BASE_PATH = '/lessons/film-music-project/lesson4';
const THEME_PATH = `${ASSET_BASE_PATH}/themes`;

// ========================================
// SHARED BACKGROUNDS (pre-theme selection)
// ========================================

export const getSharedAssets = () => ({
  bgTitle: `${ASSET_BASE_PATH}/bg-title.jpg`,
  bgSelect: `${ASSET_BASE_PATH}/bg-select.jpg`,
});

// ========================================
// THEME-SPECIFIC ASSETS
// ========================================

// Get background for current room (progressive backgrounds)
export const getRoomBackground = (themeId, lockNumber, totalLocks) => {
  const basePath = `${THEME_PATH}/${themeId}`;

  // Determine which room based on lock progress
  let room;
  if (lockNumber <= 3) {
    room = 'room1';
  } else if (lockNumber <= 6) {
    room = 'room2';
  } else {
    room = 'room3';
  }

  return `${basePath}/bg-${room}.jpg`;
};

// Get escaped/celebration background
export const getEscapedBackground = (themeId) => {
  return `${THEME_PATH}/${themeId}/bg-escaped.jpg`;
};

// Get share/room created background
export const getShareBackground = (themeId) => {
  return `${THEME_PATH}/${themeId}/bg-share.jpg`;
};

// Get all theme assets
export const getThemeAssets = (themeId) => {
  const basePath = `${THEME_PATH}/${themeId}`;
  return {
    // Backgrounds (JPG for performance)
    bgRoom1: `${basePath}/bg-room1.jpg`,
    bgRoom2: `${basePath}/bg-room2.jpg`,
    bgRoom3: `${basePath}/bg-room3.jpg`,
    bgEscaped: `${basePath}/bg-escaped.jpg`,
    bgShare: `${basePath}/bg-share.jpg`,

    // UI elements (PNG for transparency)
    lockClosed: `${basePath}/lock-closed.png`,
    lockOpen: `${basePath}/lock-open.png`,
    cellKick: `${basePath}/cell-kick.png`,
    cellSnare: `${basePath}/cell-snare.png`,
    cellHihat: `${basePath}/cell-hihat.png`,
    cellEmpty: `${basePath}/cell-empty.png`,
    cellDisabled: `${basePath}/cell-disabled.png`,
    gridFrame: `${basePath}/grid-frame.png`,
    mascot: `${basePath}/mascot.png`,
    mascotCelebrate: `${basePath}/mascot-celebrate.png`,
    fxSuccess: `${basePath}/fx-success.png`,
  };
};

// Get only available themes
export const getAvailableThemes = () => {
  return Object.values(THEMES).filter(theme => theme.available);
};

// Get all themes (for showing "coming soon")
export const getAllThemes = () => {
  return Object.values(THEMES);
};

// Get default theme
export const getDefaultTheme = () => THEMES['space-station'];
