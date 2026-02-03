// File: /lessons/shared/activities/string-detective/stringDetectiveConfig.js
// Configuration for String Detective game - Lesson 1: Strings & Dynamics
// Students identify string instruments and their dynamic levels
//
// ========================================
// AUDIO CREDITS (CC BY License)
// ========================================
// Philharmonia Orchestra Sound Sample Library
// https://philharmonia.co.uk/resources/sound-samples/
// Free to use in commercial work
// ========================================

// String instruments with metadata
export const STRING_INSTRUMENTS = [
  {
    id: 'violin',
    name: 'Violin',
    description: 'Highest string instrument, bright and singing',
    color: '#3B82F6', // blue
    icon: '🎻',
    range: 'high',
    facts: [
      'The violin is the smallest string instrument',
      'It plays the highest notes in the string family',
      'Violins often play the melody in orchestras'
    ]
  },
  {
    id: 'viola',
    name: 'Viola',
    description: 'Slightly larger than violin, warmer and darker tone',
    color: '#8B5CF6', // purple
    icon: '🎻',
    range: 'medium-high',
    facts: [
      'The viola is slightly larger than a violin',
      'It has a warmer, darker sound than the violin',
      'Violas often play harmony parts'
    ]
  },
  {
    id: 'cello',
    name: 'Cello',
    description: 'Large string instrument, rich and warm',
    color: '#10B981', // emerald
    icon: '🎻',
    range: 'medium-low',
    facts: [
      'The cello is played sitting down, held between the knees',
      'It has a rich, warm tone similar to a human voice',
      'Cellists can play both melody and bass lines'
    ]
  },
  {
    id: 'bass',
    name: 'Double Bass',
    description: 'Largest string instrument, deep and powerful',
    color: '#EF4444', // red
    icon: '🎸',
    range: 'low',
    facts: [
      'The double bass is the largest string instrument',
      'It provides the foundation for the orchestra',
      'Players either stand or sit on a tall stool to play it'
    ]
  }
];

// Dynamic levels - simplified for middle school
export const DYNAMIC_LEVELS = [
  {
    id: 'soft',
    name: 'Soft',
    symbols: ['pp', 'p'],
    fullNames: ['pianissimo', 'piano'],
    description: 'Quiet and gentle',
    color: '#93C5FD', // light blue
    intensity: 1
  },
  {
    id: 'medium',
    name: 'Medium',
    symbols: ['mp', 'mf'],
    fullNames: ['mezzo piano', 'mezzo forte'],
    description: 'Moderate volume',
    color: '#FCD34D', // yellow
    intensity: 2
  },
  {
    id: 'loud',
    name: 'Loud',
    symbols: ['f', 'ff'],
    fullNames: ['forte', 'fortissimo'],
    description: 'Strong and powerful',
    color: '#F87171', // red
    intensity: 3
  }
];

// Full dynamic markings for vocabulary teaching
export const FULL_DYNAMICS = [
  { symbol: 'pp', name: 'pianissimo', meaning: 'Very soft', level: 1 },
  { symbol: 'p', name: 'piano', meaning: 'Soft', level: 2 },
  { symbol: 'mp', name: 'mezzo piano', meaning: 'Medium soft', level: 3 },
  { symbol: 'mf', name: 'mezzo forte', meaning: 'Medium loud', level: 4 },
  { symbol: 'f', name: 'forte', meaning: 'Loud', level: 5 },
  { symbol: 'ff', name: 'fortissimo', meaning: 'Very loud', level: 6 }
];

// Audio file paths - using Philharmonia samples
// Format: /audio/orchestra-samples/strings/{instrument}/{instrument}-{dynamic}.mp3
const getAudioPath = (instrument, dynamic) => {
  return `/audio/orchestra-samples/strings/${instrument}/${instrument}-${dynamic}.mp3`;
};

// Generate questions for the game
// Each question has an instrument playing at a specific dynamic level
export const generateQuestions = () => {
  const questions = [];
  let id = 1;

  // Create questions for each instrument at each dynamic level
  // This gives us 4 instruments x 3 dynamics = 12 base questions
  // We'll add variations to get to 16 questions

  const dynamics = ['soft', 'medium', 'loud'];
  const instruments = ['violin', 'viola', 'cello', 'bass'];

  // First pass: one question per instrument/dynamic combo
  instruments.forEach(instrument => {
    dynamics.forEach(dynamic => {
      questions.push({
        id: id++,
        instrumentId: instrument,
        dynamicId: dynamic,
        audioFile: getAudioPath(instrument, dynamic),
        // For variety, we'll mark some as "tricky" (similar sounding instruments)
        difficulty: (instrument === 'violin' && dynamic === 'soft') ||
                   (instrument === 'viola' && dynamic === 'soft') ? 'tricky' : 'normal'
      });
    });
  });

  // Add 4 more "bonus" questions focusing on tricky distinctions
  // Violin vs Viola comparisons
  questions.push({
    id: id++,
    instrumentId: 'violin',
    dynamicId: 'medium',
    audioFile: getAudioPath('violin', 'medium'),
    difficulty: 'tricky',
    hint: 'Listen for the brightness of the tone'
  });

  questions.push({
    id: id++,
    instrumentId: 'viola',
    dynamicId: 'medium',
    audioFile: getAudioPath('viola', 'medium'),
    difficulty: 'tricky',
    hint: 'Listen for the warmer, darker quality'
  });

  // Cello vs Bass comparisons
  questions.push({
    id: id++,
    instrumentId: 'cello',
    dynamicId: 'loud',
    audioFile: getAudioPath('cello', 'loud'),
    difficulty: 'tricky',
    hint: 'Can you hear the singing quality?'
  });

  questions.push({
    id: id++,
    instrumentId: 'bass',
    dynamicId: 'loud',
    audioFile: getAudioPath('bass', 'loud'),
    difficulty: 'tricky',
    hint: 'Listen for the deep rumble'
  });

  return questions;
};

// Pre-generated questions array (shuffled at game start)
export const ALL_QUESTIONS = generateQuestions();

// Scoring configuration
export const SCORING = {
  // Points for each correct answer
  instrumentCorrect: 10,
  dynamicCorrect: 5,
  bothCorrect: 20, // Bonus for getting both right

  // Speed bonuses (milliseconds thresholds)
  speedBonuses: [
    { maxTime: 2000, bonus: 10 },  // Under 2 seconds
    { maxTime: 4000, bonus: 8 },   // Under 4 seconds
    { maxTime: 6000, bonus: 6 },   // Under 6 seconds
    { maxTime: 8000, bonus: 4 },   // Under 8 seconds
    { maxTime: 10000, bonus: 2 }   // Under 10 seconds
  ]
};

// Calculate speed bonus based on time
export const calculateSpeedBonus = (timeInMs) => {
  for (const tier of SCORING.speedBonuses) {
    if (timeInMs < tier.maxTime) {
      return tier.bonus;
    }
  }
  return 0;
};

// Game configuration
export const GAME_CONFIG = {
  totalQuestions: 16,
  questionTimeLimit: 30000, // 30 seconds per question max
  showHintsAfter: 15000, // Show hint after 15 seconds if available
};

// Helper to get instrument by ID
export const getInstrumentById = (id) => {
  return STRING_INSTRUMENTS.find(i => i.id === id);
};

// Helper to get dynamic by ID
export const getDynamicById = (id) => {
  return DYNAMIC_LEVELS.find(d => d.id === id);
};

export default {
  STRING_INSTRUMENTS,
  DYNAMIC_LEVELS,
  FULL_DYNAMICS,
  ALL_QUESTIONS,
  SCORING,
  GAME_CONFIG,
  calculateSpeedBonus,
  getInstrumentById,
  getDynamicById,
  generateQuestions
};
