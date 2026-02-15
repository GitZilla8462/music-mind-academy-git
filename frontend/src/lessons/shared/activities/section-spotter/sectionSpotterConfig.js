// Section Spotter Configuration
// Form identification game — supports multiple pieces
// Students identify sections (A, B, C, D) as they play sequentially

// ========================================
// SECTION OPTIONS (answer buttons)
// ========================================

// Fur Elise uses A, B, C
export const SECTION_OPTIONS = [
  { label: 'A', color: '#3B82F6', emoji: '🔵', description: 'Main Theme', bgClass: 'from-blue-500 to-blue-600' },
  { label: 'B', color: '#EF4444', emoji: '🔴', description: 'Bright Contrast', bgClass: 'from-red-500 to-red-600' },
  { label: 'C', color: '#10B981', emoji: '🟢', description: 'Dramatic Storm', bgClass: 'from-emerald-500 to-emerald-600' },
];

// Mouret Rondeau uses A, B, C, D
export const MOURET_SECTION_OPTIONS = [
  { label: 'A', color: '#3B82F6', emoji: '🔵', description: 'Brass Fanfare', bgClass: 'from-blue-500 to-blue-600' },
  { label: 'B', color: '#EF4444', emoji: '🔴', description: 'Episode 1', bgClass: 'from-red-500 to-red-600' },
  { label: 'C', color: '#10B981', emoji: '🟢', description: 'Episode 2', bgClass: 'from-emerald-500 to-emerald-600' },
  { label: 'D', color: '#F59E0B', emoji: '🟡', description: 'Episode 3', bgClass: 'from-yellow-500 to-amber-600' },
];

// ========================================
// PIECE-SPECIFIC SECTION DATA
// ========================================

// Fur Elise section timestamps (Lesson 4)
export const FUR_ELISE_SECTIONS = [
  { id: 1, section: 'A', startTime: 0, endTime: 25, label: 'Opening Theme', description: 'The famous gentle, descending melody' },
  { id: 2, section: 'A', startTime: 25, endTime: 50, label: 'Theme Repeats', description: 'The A melody plays again' },
  { id: 3, section: 'B', startTime: 50, endTime: 83, label: 'Bright Contrast', description: 'Cheerful section in C major' },
  { id: 4, section: 'A', startTime: 83, endTime: 108, label: 'Theme Returns', description: 'The familiar melody comes back' },
  { id: 5, section: 'C', startTime: 108, endTime: 150, label: 'The Storm', description: 'Intense, dramatic arpeggios' },
  { id: 6, section: 'A', startTime: 150, endTime: 175, label: 'Final Return', description: 'The melody one last time' },
];

// Mouret Rondeau section timestamps (Lesson 3)
// NOTE: Timestamps are approximate for a ~2:00 recording.
// Verify and fine-tune against the specific recording used.
export const MOURET_RONDEAU_SECTIONS = [
  { id: 1, section: 'A', startTime: 0, endTime: 17, label: 'Fanfare', description: 'Grand brass fanfare — trumpets and timpani' },
  { id: 2, section: 'B', startTime: 17, endTime: 33, label: 'Episode 1', description: 'Lighter — strings and oboes take over' },
  { id: 3, section: 'A', startTime: 33, endTime: 50, label: 'Fanfare Returns', description: 'The brass fanfare comes back' },
  { id: 4, section: 'C', startTime: 50, endTime: 68, label: 'Episode 2', description: 'New contrasting material' },
  { id: 5, section: 'A', startTime: 68, endTime: 85, label: 'Fanfare Again', description: 'The fanfare returns once more' },
  { id: 6, section: 'D', startTime: 85, endTime: 102, label: 'Episode 3', description: 'The last contrasting episode' },
  { id: 7, section: 'A', startTime: 102, endTime: 120, label: 'Final Fanfare', description: 'Triumphant close' },
];

// ========================================
// AUDIO PATHS
// ========================================
export const AUDIO_PATH = '/audio/classical/beethoven-fur-elise.mp3';
export const MOURET_AUDIO_PATH = '/audio/classical/mouret-rondeau.mp3';

// ========================================
// PIECE CONFIGS — use getPieceConfig(pieceId) to get the right data
// ========================================
export const PIECE_CONFIGS = {
  'fur-elise': {
    sections: FUR_ELISE_SECTIONS,
    sectionOptions: SECTION_OPTIONS,
    audioPath: AUDIO_PATH,
    title: 'Fur Elise',
    composer: 'Beethoven',
    form: 'ABACA'
  },
  'mouret-rondeau': {
    sections: MOURET_RONDEAU_SECTIONS,
    sectionOptions: MOURET_SECTION_OPTIONS,
    audioPath: MOURET_AUDIO_PATH,
    title: 'Fanfare-Rondeau',
    composer: 'Mouret',
    form: 'ABACADA'
  }
};

export const getPieceConfig = (pieceId = 'fur-elise') => {
  return PIECE_CONFIGS[pieceId] || PIECE_CONFIGS['fur-elise'];
};

// ========================================
// SCORING
// ========================================
export const SCORING = {
  correct: 10,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

// Calculate speed bonus (same tiers as Tempo Detective)
export const calculateSpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 2) return 5;
  if (seconds < 4) return 4;
  if (seconds < 6) return 3;
  if (seconds < 8) return 2;
  if (seconds < 10) return 1;
  return 0;
};

// Generate questions from the section data (in chronological order, NOT shuffled)
export const generateQuestions = (sections = FUR_ELISE_SECTIONS) => {
  return sections.map((section, idx) => ({
    id: idx + 1,
    correctAnswer: section.section,
    startTime: section.startTime,
    endTime: section.endTime,
    duration: section.endTime - section.startTime,
    label: section.label,
    description: section.description
  }));
};

// Get section info by label (searches both option sets)
export const getSectionByLabel = (label, sectionOptions = SECTION_OPTIONS) => {
  return sectionOptions.find(s => s.label === label) || null;
};
