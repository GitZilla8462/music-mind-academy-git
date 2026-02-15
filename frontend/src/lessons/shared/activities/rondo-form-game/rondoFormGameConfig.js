// Rondo Form Game Configuration
// 3-round game: Arrange the Form → Name That Section → Full Puzzle
// Uses Mouret Rondeau section data from sectionSpotterConfig

import { MOURET_RONDEAU_SECTIONS, MOURET_SECTION_OPTIONS, MOURET_AUDIO_PATH } from '../section-spotter/sectionSpotterConfig';

// ========================================
// PIECE DATA
// ========================================
export const PIECE = {
  title: 'Rondeau for 2 Trumpets, Organ & Timpani',
  shortTitle: 'Fanfare-Rondeau',
  composer: 'Jean-Joseph Mouret',
  year: 1729,
  form: 'ABACADA',
  audioPath: MOURET_AUDIO_PATH,
  totalDuration: 120 // ~2:00
};

// Section data for guided listening (enriched with instruments/dynamics/tempo)
export const GUIDED_SECTIONS = [
  {
    id: 1, section: 'A', label: 'Fanfare',
    startTime: 0, endTime: 17,
    color: '#3B82F6',
    instruments: 'Trumpets, Organ, Timpani',
    dynamics: 'Forte (loud)',
    tempo: 'Allegro (fast)',
    description: 'Grand brass fanfare — bold and regal'
  },
  {
    id: 2, section: 'B', label: 'Episode 1',
    startTime: 17, endTime: 33,
    color: '#EF4444',
    instruments: 'Strings, Oboes',
    dynamics: 'Piano (soft)',
    tempo: 'Allegro (fast)',
    description: 'Lighter texture — strings and oboes take over'
  },
  {
    id: 3, section: 'A', label: 'Fanfare Returns',
    startTime: 33, endTime: 50,
    color: '#3B82F6',
    instruments: 'Trumpets, Organ, Timpani',
    dynamics: 'Forte (loud)',
    tempo: 'Allegro (fast)',
    description: 'The brass fanfare comes back'
  },
  {
    id: 4, section: 'C', label: 'Episode 2',
    startTime: 50, endTime: 68,
    color: '#10B981',
    instruments: 'Strings, Oboes',
    dynamics: 'Mezzo-piano (medium soft)',
    tempo: 'Allegro (fast)',
    description: 'New contrasting material'
  },
  {
    id: 5, section: 'A', label: 'Fanfare Again',
    startTime: 68, endTime: 85,
    color: '#3B82F6',
    instruments: 'Trumpets, Organ, Timpani',
    dynamics: 'Forte (loud)',
    tempo: 'Allegro (fast)',
    description: 'The fanfare returns once more'
  },
  {
    id: 6, section: 'D', label: 'Episode 3',
    startTime: 85, endTime: 102,
    color: '#F59E0B',
    instruments: 'Strings, Oboes',
    dynamics: 'Mezzo-piano (medium soft)',
    tempo: 'Allegro (fast)',
    description: 'The last contrasting episode'
  },
  {
    id: 7, section: 'A', label: 'Final Fanfare',
    startTime: 102, endTime: 120,
    color: '#3B82F6',
    instruments: 'Trumpets, Organ, Timpani',
    dynamics: 'Fortissimo (very loud)',
    tempo: 'Allegro (fast)',
    description: 'Triumphant close — the fanfare one last time'
  }
];

export const CORRECT_FORM = ['A', 'B', 'A', 'C', 'A', 'D', 'A'];

export const SECTION_OPTIONS = MOURET_SECTION_OPTIONS;

export const SECTIONS_DATA = MOURET_RONDEAU_SECTIONS;

// ========================================
// SCORING
// ========================================
export const SCORING = {
  // Round 1: Arrange the form
  round1Perfect: 70,       // 10 per correct position (7 positions)
  round1PerPosition: 10,
  round1SpeedBonus: 30,    // Max speed bonus

  // Round 2: Name that section (per question, teacher-paced)
  round2Correct: 10,
  round2SpeedMax: 5,

  // Round 3: Full puzzle
  round3PerPosition: 10,
  round3Perfect: 70,
  round3SpeedBonus: 30
};

// Round 1 speed bonus (based on total seconds to arrange)
export const calculateRound1SpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 5) return 30;
  if (seconds < 10) return 25;
  if (seconds < 15) return 20;
  if (seconds < 20) return 15;
  if (seconds < 30) return 10;
  if (seconds < 45) return 5;
  return 0;
};

// Round 2 speed bonus (per question, same as Section Spotter)
export const calculateRound2SpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 2) return 5;
  if (seconds < 4) return 4;
  if (seconds < 6) return 3;
  if (seconds < 8) return 2;
  if (seconds < 10) return 1;
  return 0;
};

// Round 3 speed bonus (same as round 1)
export const calculateRound3SpeedBonus = calculateRound1SpeedBonus;

// Shuffle an array (Fisher-Yates)
export const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
