// Leitmotif Spotter Configuration
// Students identify leitmotifs by guessing: Major/Minor, Instrument Family, Register (Low/Mid/High)
// Teacher plays pre-recorded motifs, students answer on their devices

// Instrument families — will show "Brass - Trumpet" etc. once detail is set
export const INSTRUMENT_FAMILIES = [
  { id: 'piano', label: 'Piano', emoji: '🎹', color: '#3B82F6' },
  { id: 'strings', label: 'Strings', emoji: '🎻', color: '#10B981' },
  { id: 'woodwind', label: 'Woodwind', emoji: '🎶', color: '#F59E0B' },
  { id: 'brass', label: 'Brass', emoji: '🎺', color: '#EF4444' },
];

export const MODES = [
  { id: 'major', label: 'Major', description: 'Bright, happy', color: '#FBBF24' },
  { id: 'minor', label: 'Minor', description: 'Dark, sad', color: '#8B5CF6' },
];

export const REGISTERS = [
  { id: 'low', label: 'Low', description: 'Deep sound', color: '#7C3AED' },
  { id: 'mid', label: 'Mid', description: 'Middle range', color: '#F59E0B' },
  { id: 'high', label: 'High', description: 'Bright, soaring', color: '#3B82F6' },
];

// Rounds — teacher will upload audio later
// instrumentDetail: set to e.g. "Trumpet" when uploading, display becomes "Brass - Trumpet"
export const ROUNDS = [
  {
    id: 1,
    audioPath: '/audio/leitmotifs/round1.mp3',
    title: 'Mystery Motif #1',
    correctMode: 'major',
    correctInstrument: 'brass',
    instrumentDetail: null,
    correctRegister: 'high',
  },
  {
    id: 2,
    audioPath: '/audio/leitmotifs/round2.mp3',
    title: 'Mystery Motif #2',
    correctMode: 'minor',
    correctInstrument: 'strings',
    instrumentDetail: null,
    correctRegister: 'low',
  },
  {
    id: 3,
    audioPath: '/audio/leitmotifs/round3.mp3',
    title: 'Mystery Motif #3',
    correctMode: 'major',
    correctInstrument: 'woodwind',
    instrumentDetail: null,
    correctRegister: 'high',
  },
  {
    id: 4,
    audioPath: '/audio/leitmotifs/round4.mp3',
    title: 'Mystery Motif #4',
    correctMode: 'minor',
    correctInstrument: 'piano',
    instrumentDetail: null,
    correctRegister: 'mid',
  },
  {
    id: 5,
    audioPath: '/audio/leitmotifs/round5.mp3',
    title: 'Mystery Motif #5',
    correctMode: 'major',
    correctInstrument: 'strings',
    instrumentDetail: null,
    correctRegister: 'mid',
  },
  {
    id: 6,
    audioPath: '/audio/leitmotifs/round6.mp3',
    title: 'Mystery Motif #6',
    correctMode: 'minor',
    correctInstrument: 'brass',
    instrumentDetail: null,
    correctRegister: 'low',
  },
];

export const TOTAL_ROUNDS = ROUNDS.length;

// Scoring: 10 points per correct category, max 30 per round
// Speed bonus of 5 if all 3 correct and answered within 5 seconds
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
