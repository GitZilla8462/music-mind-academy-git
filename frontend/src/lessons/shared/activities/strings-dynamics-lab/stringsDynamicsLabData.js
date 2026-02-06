// strings-dynamics-lab/stringsDynamicsLabData.js
// Data for Strings & Dynamics Lab game
//
// YouTube sources for string instrument audio:
// Violin: https://www.youtube.com/watch?v=o6auASx3rwI
// Viola: https://www.youtube.com/watch?v=TzeuigLkJD4
// Cello: https://www.youtube.com/watch?v=6JxOfNIEIrk
// Bass: https://www.youtube.com/watch?v=dvNRrakgATc

export const stringInstruments = [
  {
    id: 'violin',
    name: 'Violin',
    icon: '🎻',
    audioPath: '/lessons/listening-lab/lesson1/audio/violin.mp3',
    color: 'from-blue-500 to-blue-600',
    // Clips selected for consistent volume (~-18 to -20 dB)
    clips: [15, 20, 30, 45]
  },
  {
    id: 'viola',
    name: 'Viola',
    icon: '🎻',
    audioPath: '/lessons/listening-lab/lesson1/audio/viola.mp3',
    color: 'from-purple-500 to-purple-600',
    // Clips selected for consistent volume (~-18 to -20 dB)
    clips: [15, 20, 30, 35]
  },
  {
    id: 'cello',
    name: 'Cello',
    icon: '🎻',
    audioPath: '/lessons/listening-lab/lesson1/audio/cello.mp3',
    color: 'from-green-500 to-green-600',
    // Clips selected for consistent volume (~-18 to -20 dB)
    clips: [15, 20, 30, 35, 70, 75]
  },
  {
    id: 'bass',
    name: 'Double Bass',
    icon: '🎻',
    audioPath: '/lessons/listening-lab/lesson1/audio/bass.mp3',
    color: 'from-red-500 to-red-600',
    // Clips selected for consistent volume (~-18 to -20 dB)
    clips: [15, 25, 30, 35, 55]
  }
];

export const dynamics = [
  { id: 'pp', name: 'Pianissimo', meaning: 'Very Soft', volume: 0.15, color: 'from-blue-300 to-blue-400' },
  { id: 'p', name: 'Piano', meaning: 'Soft', volume: 0.25, color: 'from-blue-400 to-blue-500' },
  { id: 'mp', name: 'Mezzo Piano', meaning: 'Medium Soft', volume: 0.40, color: 'from-yellow-400 to-yellow-500' },
  { id: 'mf', name: 'Mezzo Forte', meaning: 'Medium Loud', volume: 0.55, color: 'from-orange-400 to-orange-500' },
  { id: 'f', name: 'Forte', meaning: 'Loud', volume: 0.75, color: 'from-red-400 to-red-500' },
  { id: 'ff', name: 'Fortissimo', meaning: 'Very Loud', volume: 0.95, color: 'from-red-500 to-red-600' }
];

export const scoring = {
  instrumentCorrect: 15,
  dynamicCorrect: 15,
  perfectRound: 20,  // Both correct
  wrong: 0,          // No penalty for wrong answers
  quick: 10,         // Guessed after 1-2 plays
  streakPer: 5,
  maxStreak: 20
};

export const calcStreakBonus = (streak) => streak < 2 ? 0 : Math.min(streak * scoring.streakPer, scoring.maxStreak);

export const getResultMessage = (instrumentCorrect, dynamicCorrect, streak) => {
  const both = instrumentCorrect && dynamicCorrect;
  if (both && streak >= 3) return { text: 'ON FIRE! 🔥', color: 'text-orange-400' };
  if (both) return { text: 'PERFECT! ⭐', color: 'text-yellow-400' };
  if (instrumentCorrect || dynamicCorrect) return { text: 'HALFWAY THERE!', color: 'text-green-400' };
  return { text: 'KEEP TRYING!', color: 'text-purple-400' };
};
