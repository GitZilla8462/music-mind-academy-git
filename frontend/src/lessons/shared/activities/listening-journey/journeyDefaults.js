// Default journey sections for Hungarian Dance No. 5 by Brahms

export const AUDIO_PATH = '/audio/classical/brahms-hungarian-dance-5.mp3';
export const TOTAL_DURATION = 173; // seconds (~2:53)

// Default sections — Hungarian Dance No. 5 has dramatic tempo changes
// Form: A (fast) - B (slow) - A (fast) - B (slow) - A (fast) - Coda
export const DEFAULT_SECTIONS = [
  {
    id: 1,
    label: 'A',
    sectionLabel: 'Fiery Opening',
    startTime: 0,
    endTime: 29,
    color: '#3B82F6',
    sky: 'golden-hour',
    scene: 'dark-forest',
    ground: 'pavement',
    tempo: 'presto',
    dynamics: 'ff',
    articulation: 'marcato'
  },
  {
    id: 2,
    label: 'B',
    sectionLabel: 'Gentle & Slow',
    startTime: 29,
    endTime: 58,
    color: '#EF4444',
    sky: 'clear-day',
    scene: 'blue-forest',
    ground: 'water',
    tempo: 'adagio',
    dynamics: 'p',
    articulation: 'legato'
  },
  {
    id: 3,
    label: 'A',
    sectionLabel: 'Fast Returns',
    startTime: 58,
    endTime: 87,
    color: '#3B82F6',
    sky: 'stormy',
    scene: 'dark-forest',
    ground: 'pavement',
    tempo: 'presto',
    dynamics: 'f',
    articulation: 'staccato'
  },
  {
    id: 4,
    label: 'B',
    sectionLabel: 'Slow Again',
    startTime: 87,
    endTime: 116,
    color: '#EF4444',
    sky: 'sunrise',
    scene: 'blue-forest',
    ground: 'water',
    tempo: 'adagio',
    dynamics: 'mp',
    articulation: 'legato'
  },
  {
    id: 5,
    label: 'A',
    sectionLabel: 'Wild Finish',
    startTime: 116,
    endTime: 148,
    color: '#3B82F6',
    sky: 'cosmic',
    scene: 'dark-forest',
    ground: 'pavement',
    tempo: 'presto',
    dynamics: 'ff',
    articulation: 'marcato'
  },
  {
    id: 6,
    label: 'Coda',
    sectionLabel: 'Grand Ending',
    startTime: 148,
    endTime: 173,
    color: '#F59E0B',
    sky: 'night',
    scene: 'blue-forest',
    ground: 'water',
    tempo: 'presto',
    dynamics: 'ff',
    articulation: 'marcato'
  }
];

// Auto-mapping scene → default sky
export const SCENE_SKY_MAP = {
  'blue-forest': 'night',
  'mountain-peak': 'clear-day',
  'winter': 'clear-day',
  'winter-night': 'night',
  'iceberg': 'clear-day',
  'night-mountain': 'night',
  'dark-forest': 'golden-hour',
  'autumn-forest': 'golden-hour',
  'city': 'clear-day',
  'plain-white': 'clear-day',
  'plain-black': 'night',
};

// Section color palette (cycles through)
export const SECTION_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

// Character options (null entry = no sprite)
export const CHARACTER_OPTIONS = [
  { id: 'none', name: 'None', type: 'none' },
  { id: 'dog', name: 'Dog', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/dog/idle.png', frames: 4 },
    walk: { src: '/images/characters/dog/walk.png', frames: 6 },
    run: { src: '/images/characters/dog/run.png', frames: 6 },
  }},
  { id: 'cat', name: 'Cat', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/cat/idle.png', frames: 4 },
    walk: { src: '/images/characters/cat/walk.png', frames: 6 },
    run: { src: '/images/characters/cat/run.png', frames: 6 },
  }},
  { id: 'dog2', name: 'Dog 2', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/dog2/idle.png', frames: 4 },
    walk: { src: '/images/characters/dog2/walk.png', frames: 6 },
    run: { src: '/images/characters/dog2/run.png', frames: 6 },
  }},
  { id: 'cat2', name: 'Cat 2', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/cat2/idle.png', frames: 4 },
    walk: { src: '/images/characters/cat2/walk.png', frames: 6 },
    run: { src: '/images/characters/cat2/run.png', frames: 6 },
  }},
  { id: 'dude-monster', name: 'Dude', type: 'sprite', frameSize: 32, sprites: {
    idle: { src: '/images/characters/dude-monster/idle.png', frames: 4 },
    walk: { src: '/images/characters/dude-monster/walk.png', frames: 6 },
    run: { src: '/images/characters/dude-monster/run.png', frames: 6 },
  }},
];
