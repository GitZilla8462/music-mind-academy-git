// File: /src/lessons/shared/activities/guess-that-instrument/guessThatInstrumentConfig.js
// Configuration for Guess That Instrument game
// Three difficulty levels, 9 rounds each

// Instrument data with audio paths
export const INSTRUMENTS = {
  // Strings
  violin: { id: 'violin', name: 'Violin', family: 'strings', audioFile: '/audio/orchestra-samples/strings/violin.mp3' },
  viola: { id: 'viola', name: 'Viola', family: 'strings', audioFile: '/audio/orchestra-samples/strings/viola.mp3' },
  cello: { id: 'cello', name: 'Cello', family: 'strings', audioFile: '/audio/orchestra-samples/strings/cello.mp3' },
  bass: { id: 'bass', name: 'Double Bass', family: 'strings', audioFile: '/audio/orchestra-samples/strings/bass.mp3' },

  // Woodwinds
  flute: { id: 'flute', name: 'Flute', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/flute.mp3' },
  clarinet: { id: 'clarinet', name: 'Clarinet', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/clarinet.mp3' },
  oboe: { id: 'oboe', name: 'Oboe', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/oboe.mp3' },
  bassoon: { id: 'bassoon', name: 'Bassoon', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/bassoon.mp3' },

  // Brass
  trumpet: { id: 'trumpet', name: 'Trumpet', family: 'brass', audioFile: '/audio/orchestra-samples/brass/trumpet.mp3' },
  frenchHorn: { id: 'frenchHorn', name: 'French Horn', family: 'brass', audioFile: '/audio/orchestra-samples/brass/french-horn.mp3' },
  trombone: { id: 'trombone', name: 'Trombone', family: 'brass', audioFile: '/audio/orchestra-samples/brass/trombone.mp3' },
  tuba: { id: 'tuba', name: 'Tuba', family: 'brass', audioFile: '/audio/orchestra-samples/brass/tuba.mp3' },

  // Percussion
  timpani: { id: 'timpani', name: 'Timpani', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/timpani.mp3' },
  snareDrum: { id: 'snareDrum', name: 'Snare Drum', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/snare-drum.mp3' },
  xylophone: { id: 'xylophone', name: 'Xylophone', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/xylophone.mp3' },
  triangle: { id: 'triangle', name: 'Triangle', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/triangle.mp3' },
  cymbals: { id: 'cymbals', name: 'Cymbals', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/cymbals.mp3' }
};

// Family display data
export const FAMILIES = {
  strings: { id: 'strings', name: 'Strings', color: '#3B82F6' },
  woodwinds: { id: 'woodwinds', name: 'Woodwinds', color: '#10B981' },
  brass: { id: 'brass', name: 'Brass', color: '#EF4444' },
  percussion: { id: 'percussion', name: 'Percussion', color: '#F59E0B' }
};

// Level 1: Identify Families (Easy)
// All 9 rounds ask "Which family is this?" with 4 choices every round
export const LEVEL_1_QUESTIONS = [
  { id: 1, instrumentId: 'violin', correctAnswer: 'strings', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 2, instrumentId: 'trumpet', correctAnswer: 'brass', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 3, instrumentId: 'timpani', correctAnswer: 'percussion', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 4, instrumentId: 'flute', correctAnswer: 'woodwinds', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 5, instrumentId: 'cello', correctAnswer: 'strings', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 6, instrumentId: 'snareDrum', correctAnswer: 'percussion', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 7, instrumentId: 'clarinet', correctAnswer: 'woodwinds', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 8, instrumentId: 'frenchHorn', correctAnswer: 'brass', choices: ['strings', 'woodwinds', 'brass', 'percussion'] },
  { id: 9, instrumentId: 'bass', correctAnswer: 'strings', choices: ['strings', 'woodwinds', 'brass', 'percussion'] }
];

// Level 2: Identify Distinct Instruments (Medium)
// Choices are instruments that sound very different from each other
export const LEVEL_2_QUESTIONS = [
  { id: 1, instrumentId: 'flute', correctAnswer: 'flute', choices: ['violin', 'tuba', 'flute', 'snareDrum'] },
  { id: 2, instrumentId: 'trumpet', correctAnswer: 'trumpet', choices: ['trumpet', 'cello', 'oboe', 'timpani'] },
  { id: 3, instrumentId: 'xylophone', correctAnswer: 'xylophone', choices: ['xylophone', 'frenchHorn', 'violin', 'bassoon'] },
  { id: 4, instrumentId: 'tuba', correctAnswer: 'tuba', choices: ['tuba', 'flute', 'snareDrum', 'cello'] },
  { id: 5, instrumentId: 'violin', correctAnswer: 'violin', choices: ['clarinet', 'timpani', 'trumpet', 'violin'] },
  { id: 6, instrumentId: 'trombone', correctAnswer: 'trombone', choices: ['oboe', 'snareDrum', 'trombone', 'flute'] },
  { id: 7, instrumentId: 'cello', correctAnswer: 'cello', choices: ['snareDrum', 'bassoon', 'trumpet', 'cello'] },
  { id: 8, instrumentId: 'clarinet', correctAnswer: 'clarinet', choices: ['triangle', 'violin', 'clarinet', 'tuba'] },
  { id: 9, instrumentId: 'oboe', correctAnswer: 'oboe', choices: ['frenchHorn', 'flute', 'timpani', 'oboe'] }
];

// Level 3: Identify Similar Instruments (Hard)
// Choices are instruments within the same family
export const LEVEL_3_QUESTIONS = [
  { id: 1, instrumentId: 'violin', correctAnswer: 'violin', choices: ['violin', 'viola', 'cello', 'bass'] },
  { id: 2, instrumentId: 'oboe', correctAnswer: 'oboe', choices: ['flute', 'clarinet', 'oboe', 'bassoon'] },
  { id: 3, instrumentId: 'frenchHorn', correctAnswer: 'frenchHorn', choices: ['trumpet', 'frenchHorn', 'trombone', 'tuba'] },
  { id: 4, instrumentId: 'cello', correctAnswer: 'cello', choices: ['violin', 'viola', 'cello', 'bass'] },
  { id: 5, instrumentId: 'clarinet', correctAnswer: 'clarinet', choices: ['flute', 'clarinet', 'oboe', 'bassoon'] },
  { id: 6, instrumentId: 'trombone', correctAnswer: 'trombone', choices: ['trumpet', 'frenchHorn', 'trombone', 'tuba'] },
  { id: 7, instrumentId: 'viola', correctAnswer: 'viola', choices: ['violin', 'viola', 'cello', 'bass'] },
  { id: 8, instrumentId: 'bassoon', correctAnswer: 'bassoon', choices: ['flute', 'clarinet', 'oboe', 'bassoon'] },
  { id: 9, instrumentId: 'tuba', correctAnswer: 'tuba', choices: ['trumpet', 'frenchHorn', 'trombone', 'tuba'] }
];

// Get questions for a specific level
export const getQuestionsForLevel = (level) => {
  switch (level) {
    case 1:
      return LEVEL_1_QUESTIONS;
    case 2:
      return LEVEL_2_QUESTIONS;
    case 3:
      return LEVEL_3_QUESTIONS;
    default:
      return LEVEL_1_QUESTIONS;
  }
};

// Shuffle array helper
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Answer explanations for each instrument
export const INSTRUMENT_EXPLANATIONS = {
  violin: "The violin has a bright, singing quality - it's the highest-pitched string instrument.",
  viola: "The viola sounds warmer and deeper than the violin - it's the alto voice of the strings.",
  cello: "The cello has a rich, warm, deep sound - it's the tenor/baritone of the string family.",
  bass: "The double bass has the lowest, deepest sound in the string section.",
  flute: "The flute has a bright, airy, breathy sound - like blowing across a bottle.",
  clarinet: "The clarinet has a warm, woody, smooth tone - very versatile from low to high.",
  oboe: "The oboe has a distinctive nasal, reedy sound - often used for tuning the orchestra.",
  bassoon: "The bassoon has a deep, buzzy, sometimes comical tone - the bass of the woodwinds.",
  trumpet: "The trumpet has a bright, brilliant, piercing sound - often used for fanfares.",
  frenchHorn: "The French horn has a warm, mellow, noble sound - round and lyrical.",
  trombone: "The trombone has a bold, brassy sound - it can slide between notes.",
  tuba: "The tuba has the deepest, richest brass sound - it provides the bass foundation.",
  timpani: "Timpani (kettle drums) produce a deep, resonant boom - they can be tuned to specific pitches.",
  snareDrum: "The snare drum has a sharp, crackling sound from the metal wires underneath.",
  xylophone: "The xylophone has a bright, wooden, bell-like tone from its wooden bars.",
  triangle: "The triangle has a bright, shimmering, high-pitched ring.",
  cymbals: "Cymbals produce a loud crash or sustained shimmer depending on how they're played."
};

// Level descriptions
export const LEVEL_INFO = {
  1: {
    name: 'Level 1: Families',
    difficulty: 'Easy',
    description: 'Identify which instrument family you hear',
    color: '#10B981'
  },
  2: {
    name: 'Level 2: Instruments',
    difficulty: 'Medium',
    description: 'Identify specific instruments that sound very different',
    color: '#F59E0B'
  },
  3: {
    name: 'Level 3: Expert',
    difficulty: 'Hard',
    description: 'Identify instruments that sound similar (same family)',
    color: '#EF4444'
  }
};
