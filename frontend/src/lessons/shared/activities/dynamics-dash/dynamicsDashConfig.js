// Dynamics Dash Configuration
// 9 questions based on Vivaldi's Spring (first 2 minutes)
// Each question is a 6-second excerpt where students identify the dynamic level

export const AUDIO_PATH = '/lessons/film-music-project/lesson2/mp3/Classicals.de-Vivaldi-The-Four-Seasons-01-John-Harrison-with-the-Wichita-State-University-Chamber-Players-Spring-Mvt-1-Allegro.mp3';

// Dynamic levels with colors matching the lesson
export const DYNAMICS = [
  { symbol: 'pp', name: 'pianissimo', meaning: 'Very soft', color: '#93C5FD' },
  { symbol: 'p', name: 'piano', meaning: 'Soft', color: '#60A5FA' },
  { symbol: 'mp', name: 'mezzo piano', meaning: 'Medium soft', color: '#FCD34D' },
  { symbol: 'mf', name: 'mezzo forte', meaning: 'Medium loud', color: '#FBBF24' },
  { symbol: 'f', name: 'forte', meaning: 'Loud', color: '#F87171' },
  { symbol: 'ff', name: 'fortissimo', meaning: 'Very loud', color: '#EF4444' }
];

// Gradual dynamics (crescendo/decrescendo)
export const GRADUAL_DYNAMICS = [
  { symbol: 'crescendo', name: 'Crescendo', meaning: 'Getting louder', color: '#4ADE80' },
  { symbol: 'decrescendo', name: 'Decrescendo', meaning: 'Getting softer', color: '#F87171' }
];

// 9 Questions from Spring
// Timestamps are in seconds
// questionType: 'level' for pp/p/mp/mf/f/ff, 'gradual' for crescendo/decrescendo
export const QUESTIONS = [
  {
    id: 1,
    startTime: 0,
    endTime: 8,
    correctAnswer: 'f',
    questionType: 'level',
    description: 'Opening theme'
  },
  {
    id: 2,
    startTime: 8,
    endTime: 15,
    correctAnswer: 'p',
    questionType: 'level',
    description: 'Bird songs'
  },
  {
    id: 3,
    startTime: 26,
    endTime: 31,
    correctAnswer: 'p',
    questionType: 'level',
    description: 'Murmuring brook'
  },
  {
    id: 4,
    startTime: 36,
    endTime: 42,
    correctAnswer: 'mf',
    questionType: 'level',
    description: 'Building tension'
  },
  {
    id: 5,
    startTime: 71,
    endTime: 77,
    correctAnswer: 'ff',
    questionType: 'level',
    description: 'Thunder/Lightning'
  },
  {
    id: 6,
    startTime: 78,
    endTime: 86,
    correctAnswer: 'p',
    questionType: 'level',
    description: 'Calm after storm'
  },
  {
    id: 7,
    startTime: 127,
    endTime: 137,
    correctAnswer: 'f',
    questionType: 'level',
    description: 'Final theme'
  },
  {
    id: 8,
    startTime: 64,
    endTime: 69,
    correctAnswer: 'decrescendo',
    questionType: 'gradual',
    description: 'Fading before storm'
  },
  {
    id: 9,
    startTime: 131,
    endTime: 137,
    correctAnswer: 'crescendo',
    questionType: 'gradual',
    description: 'Building to finale'
  }
];

// Scoring (same as Layer Detective)
export const calculateSpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 2) return 10;
  if (seconds < 4) return 8;
  if (seconds < 6) return 6;
  if (seconds < 8) return 4;
  if (seconds < 10) return 2;
  return 0;
};

export const BASE_POINTS = 10;
export const TOTAL_QUESTIONS = 9;

// Playback volume for each dynamic level (0.0 - 1.0)
// Artificially scaled to exaggerate differences for teaching
export const DYNAMIC_VOLUMES = {
  'pp': 0.22,
  'p':  0.32,
  'mp': 0.48,
  'mf': 0.65,
  'f':  0.85,
  'ff': 1.0,
};

// Helper: get volume for a dynamic symbol
export const getVolumeForDynamic = (symbol) => DYNAMIC_VOLUMES[symbol] ?? 0.7;
