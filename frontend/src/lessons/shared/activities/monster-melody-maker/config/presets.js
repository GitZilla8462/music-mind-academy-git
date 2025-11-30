/**
 * FILE: monster-melody-maker/config/presets.js
 * Pre-made melody patterns and monster presets with dance styles
 */

// === MELODY PATTERNS ===
// Each pattern is an 8x16 grid (8 rows = pitches, 16 columns = steps)
// Row 0 = C5 (highest), Row 7 = G3 (lowest)

const createEmptyPattern = () => 
  Array.from({ length: 8 }, () => Array(16).fill(false));

const createPatternFromNotes = (notes) => {
  const pattern = createEmptyPattern();
  notes.forEach(([row, col]) => {
    if (row >= 0 && row < 8 && col >= 0 && col < 16) {
      pattern[row][col] = true;
    }
  });
  return pattern;
};

export const MELODY_PRESETS = {
  ascending: {
    name: 'Climbing Up',
    emoji: '📈',
    description: 'Notes go from low to high',
    pattern: createPatternFromNotes([
      [7, 0], [6, 2], [5, 4], [4, 6], [3, 8], [2, 10], [1, 12], [0, 14]
    ]),
  },
  
  descending: {
    name: 'Falling Down',
    emoji: '📉',
    description: 'Notes go from high to low',
    pattern: createPatternFromNotes([
      [0, 0], [1, 2], [2, 4], [3, 6], [4, 8], [5, 10], [6, 12], [7, 14]
    ]),
  },
  
  wave: {
    name: 'Wave',
    emoji: '🌊',
    description: 'Notes go up and down like a wave',
    pattern: createPatternFromNotes([
      [4, 0], [3, 1], [2, 2], [1, 3], [0, 4], [1, 5], [2, 6], [3, 7],
      [4, 8], [5, 9], [6, 10], [7, 11], [6, 12], [5, 13], [4, 14], [3, 15]
    ]),
  },
  
  happy: {
    name: 'Happy',
    emoji: '😊',
    description: 'An upbeat happy melody',
    pattern: createPatternFromNotes([
      [0, 0], [2, 2], [0, 4], [3, 6], [1, 8], [0, 10], [2, 12], [0, 14],
      [4, 1], [4, 5], [5, 9], [4, 13]
    ]),
  },
  
  mystery: {
    name: 'Mystery',
    emoji: '🔮',
    description: 'A mysterious spooky melody',
    pattern: createPatternFromNotes([
      [5, 0], [7, 2], [4, 4], [6, 6], [3, 8], [7, 10], [5, 12], [6, 14],
      [2, 3], [1, 7], [2, 11], [3, 15]
    ]),
  },
  
  bounce: {
    name: 'Bounce',
    emoji: '⬆️',
    description: 'Bouncy up and down pattern',
    pattern: createPatternFromNotes([
      [0, 0], [4, 1], [0, 2], [4, 3], [0, 4], [4, 5], [0, 6], [4, 7],
      [0, 8], [4, 9], [0, 10], [4, 11], [0, 12], [4, 13], [0, 14], [4, 15]
    ]),
  },
  
  steps: {
    name: 'Steps',
    emoji: '🪜',
    description: 'Step by step pattern',
    pattern: createPatternFromNotes([
      [6, 0], [6, 1], [4, 2], [4, 3], [2, 4], [2, 5], [0, 6], [0, 7],
      [2, 8], [2, 9], [4, 10], [4, 11], [6, 12], [6, 13], [4, 14], [4, 15]
    ]),
  },
};

// === MONSTER PRESETS ===
export const MONSTER_PRESETS = {
  disco: {
    name: 'Disco Monster',
    config: {
      bodyShape: 'round',
      bodyColor: '#EC4899',
      eyeStyle: 'big',
      mouthStyle: 'happy',
      accessory: 'crown',
      pattern: 'stars',
      patternColor: '#feca5788',
      danceStyle: 'disco',
    },
    stageTheme: 'neon',
  },
  
  alien: {
    name: 'Space Alien',
    config: {
      bodyShape: 'blob',
      bodyColor: '#10B981',
      eyeStyle: 'cyclops',
      mouthStyle: 'surprised',
      accessory: 'antenna',
      pattern: 'spots',
      patternColor: '#00000044',
      danceStyle: 'robot',
    },
    stageTheme: 'space',
  },
  
  forest: {
    name: 'Forest Friend',
    config: {
      bodyShape: 'fuzzy',
      bodyColor: '#84CC16',
      eyeStyle: 'sleepy',
      mouthStyle: 'happy',
      accessory: 'horns',
      pattern: 'none',
      patternColor: '#ffffff33',
      danceStyle: 'wave',
    },
    stageTheme: 'forest',
  },
  
  ocean: {
    name: 'Sea Creature',
    config: {
      bodyShape: 'blob',
      bodyColor: '#06B6D4',
      eyeStyle: 'multiple',
      mouthStyle: 'tongue',
      accessory: 'none',
      pattern: 'spots',
      patternColor: '#ffffff66',
      danceStyle: 'wave',
    },
    stageTheme: 'ocean',
  },
  
  candy: {
    name: 'Candy Critter',
    config: {
      bodyShape: 'round',
      bodyColor: '#F43F5E',
      eyeStyle: 'big',
      mouthStyle: 'toothy',
      accessory: 'bow',
      pattern: 'hearts',
      patternColor: '#ff6b9d88',
      danceStyle: 'bounce',
    },
    stageTheme: 'candy',
  },
  
  hiphop: {
    name: 'Hip Hop Hero',
    config: {
      bodyShape: 'square',
      bodyColor: '#6366F1',
      eyeStyle: 'angry',
      mouthStyle: 'grumpy',
      accessory: 'hat',
      pattern: 'stripes',
      patternColor: '#ffffff33',
      danceStyle: 'hiphop',
    },
    stageTheme: 'neon',
  },
  
  silly: {
    name: 'Silly Goofball',
    config: {
      bodyShape: 'fuzzy',
      bodyColor: '#F97316',
      eyeStyle: 'multiple',
      mouthStyle: 'tongue',
      accessory: 'antenna',
      pattern: 'spots',
      patternColor: '#ffff0066',
      danceStyle: 'silly',
    },
    stageTheme: 'candy',
  },
};

// Export for backwards compatibility
export const PRESET_PATTERNS = MELODY_PRESETS;