// File: /src/pages/projects/film-music-score/shared/soundEffectsData.js
// Sound effects configuration for Film Music Score project
// ✅ UPDATED: Reorganized into 3 categories (City, Nature, SFX)

// Category colors
export const SFX_CATEGORY_COLORS = {
  'City': '#f59e0b',      // Amber
  'Nature': '#10b981',    // Emerald  
  'SFX': '#8b5cf6'        // Purple
};

// Sound effect categories for dropdown
export const soundEffectCategories = [
  { name: 'All', color: '#6b7280', emoji: '🎵' },
  { name: 'City', color: '#f59e0b', emoji: '🏙️' },
  { name: 'Nature', color: '#10b981', emoji: '🌿' },
  { name: 'SFX', color: '#8b5cf6', emoji: '🎬' }
];

// Sound effects metadata
export const soundEffects = [
  // ========================================
  // CITY (5 files) 🏙️
  // ========================================
  {
    id: 'sfx-city-1',
    name: 'Big City Ambience 1',
    file: '/projects/film-music-score/soundEffects/bigcity1.mp3',
    duration: 10,
    category: 'City',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.7,
    tags: ['city', 'urban', 'ambient', 'traffic'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-city-2',
    name: 'Big City Ambience 2',
    file: '/projects/film-music-score/soundEffects/bigcity2.mp3',
    duration: 10,
    category: 'City',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.7,
    tags: ['city', 'urban', 'ambient', 'traffic'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-city-3',
    name: 'Big City Ambience 3',
    file: '/projects/film-music-score/soundEffects/bigcity3.mp3',
    duration: 10,
    category: 'City',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.7,
    tags: ['city', 'urban', 'ambient', 'traffic'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-city-4',
    name: 'Big City Ambience 4',
    file: '/projects/film-music-score/soundEffects/bigcity4.mp3',
    duration: 10,
    category: 'City',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.7,
    tags: ['city', 'urban', 'ambient', 'traffic'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-city-5',
    name: 'Big City Ambience 5',
    file: '/projects/film-music-score/soundEffects/bigcity5.mp3',
    duration: 10,
    category: 'City',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.7,
    tags: ['city', 'urban', 'ambient', 'traffic'],
    loaded: true,
    accessible: true
  },

  // ========================================
  // NATURE (11 files) 🌿
  // ========================================
  // Forest
  {
    id: 'sfx-forest-1',
    name: 'Forest Ambience 1',
    file: '/projects/film-music-score/soundEffects/Forest1.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['forest', 'nature', 'birds', 'trees'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-forest-2',
    name: 'Forest Ambience 2',
    file: '/projects/film-music-score/soundEffects/Forest2.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['forest', 'nature', 'birds', 'trees'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-forest-3',
    name: 'Forest Ambience 3',
    file: '/projects/film-music-score/soundEffects/Forest3.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['forest', 'nature', 'birds', 'trees'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-forest-4',
    name: 'Forest Ambience 4',
    file: '/projects/film-music-score/soundEffects/Forest4.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['forest', 'nature', 'birds', 'trees'],
    loaded: true,
    accessible: true
  },
  // Savanna
  {
    id: 'sfx-savanna-1',
    name: 'Savanna Ambience 1',
    file: '/projects/film-music-score/soundEffects/Savanna1.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['savanna', 'africa', 'wildlife', 'plains'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-savanna-2',
    name: 'Savanna Ambience 2',
    file: '/projects/film-music-score/soundEffects/Savanna2.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['savanna', 'africa', 'wildlife', 'plains'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-savanna-3',
    name: 'Savanna Ambience 3',
    file: '/projects/film-music-score/soundEffects/Savanna3.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['savanna', 'africa', 'wildlife', 'plains'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-savanna-4',
    name: 'Savanna Ambience 4',
    file: '/projects/film-music-score/soundEffects/Savanna4.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['savanna', 'africa', 'wildlife', 'plains'],
    loaded: true,
    accessible: true
  },
  // Underwater
  {
    id: 'sfx-underwater-1',
    name: 'Underwater Ambience 1',
    file: '/projects/film-music-score/soundEffects/Underwater1.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['underwater', 'ocean', 'water', 'bubbles'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-underwater-2',
    name: 'Underwater Ambience 2',
    file: '/projects/film-music-score/soundEffects/Underwater2.mp3',
    duration: 2.6,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['underwater', 'ocean', 'water', 'bubbles'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-underwater-3',
    name: 'Underwater Ambience 3',
    file: '/projects/film-music-score/soundEffects/Underwater3.mp3',
    duration: 12,
    category: 'Nature',
    type: 'soundEffect',
    color: '#10b981',
    volume: 0.7,
    tags: ['underwater', 'ocean', 'water', 'bubbles'],
    loaded: true,
    accessible: true
  },

  // ========================================
  // SFX (12 files) 🎬
  // ========================================
  // Risers
  {
    id: 'sfx-riser-1',
    name: 'Riser 1',
    file: '/projects/film-music-score/soundEffects/Riser 1.mp3',
    duration: 12.02,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-riser-2',
    name: 'Riser 2',
    file: '/projects/film-music-score/soundEffects/Riser 2.mp3',
    duration: 4.49,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-riser-3',
    name: 'Riser 3',
    file: '/projects/film-music-score/soundEffects/Riser 3.mp3',
    duration: 12.12,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-machine-riser',
    name: 'Machine Riser',
    file: '/projects/film-music-score/soundEffects/Machine Riser.mp3',
    duration: 10.03,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['machine', 'riser', 'build', 'transition'],
    loaded: true,
    accessible: true
  },
  // Wooshes
  {
    id: 'sfx-woosh-1',
    name: 'Woosh 1',
    file: '/projects/film-music-score/soundEffects/Woosh 1.mp3',
    duration: 5.54,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.75,
    tags: ['woosh', 'transition', 'movement', 'air'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-scary-woosh-1',
    name: 'Scary Woosh 1',
    file: '/projects/film-music-score/soundEffects/Scary Woosh 1.mp3',
    duration: 13.04,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.75,
    tags: ['woosh', 'scary', 'transition', 'horror'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-scary-woosh-2',
    name: 'Scary Woosh 2',
    file: '/projects/film-music-score/soundEffects/Scary Woosh 2.mp3',
    duration: 9.64,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.75,
    tags: ['woosh', 'scary', 'transition', 'horror'],
    loaded: true,
    accessible: true
  },
  // Electric
  {
    id: 'sfx-electric-hit-1',
    name: 'Electric Hit 1',
    file: '/projects/film-music-score/soundEffects/Electric Hit 1.mp3',
    duration: 1.65,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.8,
    tags: ['electric', 'hit', 'impact', 'shock'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-electric-hit-2',
    name: 'Electric Hit 2',
    file: '/projects/film-music-score/soundEffects/Electric Hit 2.mp3',
    duration: 5.54,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.8,
    tags: ['electric', 'hit', 'impact', 'shock'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-electric-machine',
    name: 'Electric Machine',
    file: '/projects/film-music-score/soundEffects/Electric Machine.mp3',
    duration: 10.48,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['electric', 'machine', 'mechanical', 'ambient'],
    loaded: true,
    accessible: true
  },
  {
    id: 'sfx-electric-shock',
    name: 'Electric Shock',
    file: '/projects/film-music-score/soundEffects/Electric Shock.mp3',
    duration: 3.19,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.8,
    tags: ['electric', 'shock', 'zap', 'impact'],
    loaded: true,
    accessible: true
  },
  // Other
  {
    id: 'sfx-helicopter',
    name: 'Helicopter',
    file: '/projects/film-music-score/soundEffects/helicopter.mp3',
    duration: 10,
    category: 'SFX',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['helicopter', 'vehicle', 'flying', 'action'],
    loaded: true,
    accessible: true
  }
];

// Get sound effects by category
export const getSoundEffectsByCategory = (category) => {
  if (category === 'All') return soundEffects;
  return soundEffects.filter(sfx => sfx.category === category);
};

// Get count by category
export const getSoundEffectCounts = () => {
  return {
    City: soundEffects.filter(s => s.category === 'City').length,
    Nature: soundEffects.filter(s => s.category === 'Nature').length,
    SFX: soundEffects.filter(s => s.category === 'SFX').length,
    Total: soundEffects.length
  };
};

// Test if sound effect file is accessible
export const testSoundEffectFile = async (path) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(false);
    }, 5000);

    audio.addEventListener('canplaythrough', () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(true);
    });

    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(false);
    });

    audio.src = path;
  });
};