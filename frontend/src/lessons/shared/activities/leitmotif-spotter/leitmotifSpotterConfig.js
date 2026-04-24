// Leitmotif Spotter Configuration
// Students identify leitmotifs by guessing: Major/Minor, Instrument Family, Register (Low/Mid/High)
// Teacher plays pre-recorded motifs, students answer on their devices

// Instrument families — will show "Brass - Trumpet" etc. once detail is set
export const INSTRUMENT_FAMILIES = [
  { id: 'strings', label: 'Strings', emoji: '🎻', color: '#10B981' },
  { id: 'woodwind', label: 'Woodwind', emoji: '🎶', color: '#F59E0B' },
  { id: 'brass', label: 'Brass', emoji: '🎺', color: '#EF4444' },
  { id: 'piano', label: 'Piano', emoji: '🎹', color: '#3B82F6' },
];

export const MODES = [
  { id: 'major', label: 'Major', description: 'Bright, happy', color: '#FBBF24' },
  { id: 'minor', label: 'Minor', description: 'Dark, serious', color: '#8B5CF6' },
];

export const REGISTERS = [
  { id: 'low', label: 'Low', description: 'Deep sound', color: '#7C3AED' },
  { id: 'mid', label: 'Mid', description: 'Middle range', color: '#F59E0B' },
  { id: 'high', label: 'High', description: 'Bright, soaring', color: '#3B82F6' },
];

export const CHARACTER_TYPES = [
  { id: 'hero', label: 'Hero', emoji: '🦸', color: '#3B82F6' },
  { id: 'villain', label: 'Villain', emoji: '🦹', color: '#EF4444' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#EC4899' },
  { id: 'sneaky', label: 'Sneaky', emoji: '🕵️', color: '#6B7280' },
];

// Rounds — 9 motifs hosted on R2
export const ROUNDS = [
  {
    id: 1,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/hero-brass-frenchhorn-major-high.wav',
    title: 'Mystery Motif #1',
    correctCharacter: 'hero',
    correctMode: 'major',
    correctInstrument: 'brass',
    instrumentDetail: 'French Horn',
    correctRegister: 'high',
  },
  {
    id: 2,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/hero-piano-piano-major-medium.wav',
    title: 'Mystery Motif #2',
    correctCharacter: 'hero',
    correctMode: 'major',
    correctInstrument: 'piano',
    instrumentDetail: 'Piano',
    correctRegister: 'mid',
  },
  {
    id: 3,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/hero-woodwind-bassoon-major-medium.wav',
    title: 'Mystery Motif #3',
    correctCharacter: 'hero',
    correctMode: 'major',
    correctInstrument: 'woodwind',
    instrumentDetail: 'Bassoon',
    correctRegister: 'mid',
  },
  {
    id: 4,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/romantic-strings-violin-major-high.wav',
    title: 'Mystery Motif #4',
    correctCharacter: 'romantic',
    correctMode: 'major',
    correctInstrument: 'strings',
    instrumentDetail: 'Violin',
    correctRegister: 'high',
  },
  {
    id: 5,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/romantic-woodwinds-flute-major-high.wav',
    title: 'Mystery Motif #5',
    correctCharacter: 'romantic',
    correctMode: 'major',
    correctInstrument: 'woodwind',
    instrumentDetail: 'Flute',
    correctRegister: 'high',
  },
  {
    id: 6,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/sneaky-woodwind-clarinet-minor-medium.wav',
    title: 'Mystery Motif #6',
    correctCharacter: 'sneaky',
    correctMode: 'minor',
    correctInstrument: 'woodwind',
    instrumentDetail: 'Clarinet',
    correctRegister: 'mid',
  },
  {
    id: 7,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/sneaky-woodwind-oboe-minor-medium.wav',
    title: 'Mystery Motif #7',
    correctCharacter: 'sneaky',
    correctMode: 'minor',
    correctInstrument: 'woodwind',
    instrumentDetail: 'Oboe',
    correctRegister: 'mid',
  },
  {
    id: 8,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/villain-piano-piano-minor-low.wav',
    title: 'Mystery Motif #8',
    correctCharacter: 'villain',
    correctMode: 'minor',
    correctInstrument: 'piano',
    instrumentDetail: 'Piano',
    correctRegister: 'low',
  },
  {
    id: 9,
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/villain-strings-bass-minor-low.wav',
    title: 'Mystery Motif #9',
    correctCharacter: 'villain',
    correctMode: 'minor',
    correctInstrument: 'strings',
    instrumentDetail: 'Bass',
    correctRegister: 'low',
  },
];

export const TOTAL_ROUNDS = ROUNDS.length;

// Scoring: 10 points per correct category, max 40 per round
// Speed bonus of 5 if all 4 correct and answered within 5 seconds
export const SCORING = {
  perCategory: 10,
  speedBonus: 5,
  speedThreshold: 5000,
};

// Shuffle helper
export const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Format instrument display: "Brass - Trumpet" or just "Brass"
export const formatInstrument = (familyId, detail) => {
  const family = INSTRUMENT_FAMILIES.find(f => f.id === familyId);
  if (!family) return familyId;
  if (detail) return `${family.label} - ${detail}`;
  return family.label;
};
