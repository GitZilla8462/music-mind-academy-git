// File: /src/pages/projects/film-music-score/shared/soundEffectsData.js
// Sound effects configuration for Film Music Score project

// Sound effects metadata
export const soundEffects = [
  {
    id: 'sfx-electric-hit-1',
    name: 'Electric Hit 1',
    file: '/projects/film-music-score/soundEffects/Electric Hit 1.mp3',
    duration: 1.5,
    category: 'Impact',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.8,
    tags: ['electric', 'hit', 'impact', 'shock']
  },
  {
    id: 'sfx-electric-hit-2',
    name: 'Electric Hit 2',
    file: '/projects/film-music-score/soundEffects/Electric Hit 2.mp3',
    duration: 1.5,
    category: 'Impact',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.8,
    tags: ['electric', 'hit', 'impact', 'shock']
  },
  {
    id: 'sfx-electric-machine',
    name: 'Electric Machine',
    file: '/projects/film-music-score/soundEffects/Electric Machine.mp3',
    duration: 3,
    category: 'Ambient',
    type: 'soundEffect',
    color: '#3b82f6',
    volume: 0.7,
    tags: ['electric', 'machine', 'mechanical', 'ambient']
  },
  {
    id: 'sfx-electric-shock',
    name: 'Electric Shock',
    file: '/projects/film-music-score/soundEffects/Electric Shock.mp3',
    duration: 1,
    category: 'Impact',
    type: 'soundEffect',
    color: '#f59e0b',
    volume: 0.8,
    tags: ['electric', 'shock', 'zap', 'impact']
  },
  {
    id: 'sfx-machine-riser',
    name: 'Machine Riser',
    file: '/projects/film-music-score/soundEffects/Machine Riser.mp3',
    duration: 2,
    category: 'Transition',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['machine', 'riser', 'build', 'transition']
  },
  {
    id: 'sfx-riser-1',
    name: 'Riser 1',
    file: '/projects/film-music-score/soundEffects/Riser 1.mp3',
    duration: 2,
    category: 'Transition',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension']
  },
  {
    id: 'sfx-riser-2',
    name: 'Riser 2',
    file: '/projects/film-music-score/soundEffects/Riser 2.mp3',
    duration: 2,
    category: 'Transition',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension']
  },
  {
    id: 'sfx-riser-3',
    name: 'Riser 3',
    file: '/projects/film-music-score/soundEffects/Riser 3.mp3',
    duration: 2,
    category: 'Transition',
    type: 'soundEffect',
    color: '#8b5cf6',
    volume: 0.7,
    tags: ['riser', 'build', 'transition', 'tension']
  },
  {
    id: 'sfx-scary-woosh-1',
    name: 'Scary Woosh 1',
    file: '/projects/film-music-score/soundEffects/Scary Woosh 1.mp3',
    duration: 1.5,
    category: 'Transition',
    type: 'soundEffect',
    color: '#dc2626',
    volume: 0.75,
    tags: ['woosh', 'scary', 'transition', 'horror']
  },
  {
    id: 'sfx-scary-woosh-2',
    name: 'Scary Woosh 2',
    file: '/projects/film-music-score/soundEffects/Scary Woosh 2.mp3',
    duration: 1.5,
    category: 'Transition',
    type: 'soundEffect',
    color: '#dc2626',
    volume: 0.75,
    tags: ['woosh', 'scary', 'transition', 'horror']
  },
  {
    id: 'sfx-woosh-1',
    name: 'Woosh 1',
    file: '/projects/film-music-score/soundEffects/Woosh 1.mp3',
    duration: 1,
    category: 'Transition',
    type: 'soundEffect',
    color: '#06b6d4',
    volume: 0.75,
    tags: ['woosh', 'transition', 'movement', 'air']
  }
];

// Sound effect categories
export const soundEffectCategories = [
  { name: 'All', color: '#6b7280' },
  { name: 'Impact', color: '#f59e0b' },
  { name: 'Transition', color: '#8b5cf6' },
  { name: 'Ambient', color: '#3b82f6' }
];

// Get sound effects by category
export const getSoundEffectsByCategory = (category) => {
  if (category === 'All') return soundEffects;
  return soundEffects.filter(sfx => sfx.category === category);
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