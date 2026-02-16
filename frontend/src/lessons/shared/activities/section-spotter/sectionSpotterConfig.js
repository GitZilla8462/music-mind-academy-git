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

// Mountain King uses A and B (A returns as A')
export const MOUNTAIN_KING_SECTION_OPTIONS = [
  { label: 'A', color: '#3B82F6', emoji: '🔵', description: 'Sneaky Theme', bgClass: 'from-blue-500 to-blue-600' },
  { label: 'B', color: '#EF4444', emoji: '🔴', description: 'Building Energy', bgClass: 'from-red-500 to-red-600' },
];

// Mountain King section timestamps (Lesson 3 — Ternary ABA)
// NOTE: Timestamps are approximate for a ~2:30 recording.
export const MOUNTAIN_KING_SECTIONS = [
  { id: 1, section: 'A', startTime: 0, endTime: 59, label: 'Sneaky Start', description: 'Pizzicato strings and bassoons — quiet and mysterious' },
  { id: 2, section: 'B', startTime: 59, endTime: 101, label: 'Building Energy', description: 'Brass enters, tempo increases, theme goes up a 5th' },
  { id: 3, section: 'A', startTime: 101, endTime: 150, label: 'Explosive Return', description: 'Full orchestra, tremolo strings, ff dynamics, accelerando to presto' },
];

// ========================================
// AUDIO PATHS
// ========================================
export const AUDIO_PATH = '/audio/classical/beethoven-fur-elise.mp3';
export const MOURET_AUDIO_PATH = '/audio/classical/mouret-rondeau.mp3';
export const MOUNTAIN_KING_AUDIO_PATH = '/audio/classical/grieg-mountain-king.mp3';

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
  },
  'mountain-king': {
    sections: MOUNTAIN_KING_SECTIONS,
    sectionOptions: MOUNTAIN_KING_SECTION_OPTIONS,
    audioPath: MOUNTAIN_KING_AUDIO_PATH,
    title: 'In the Hall of the Mountain King',
    composer: 'Grieg',
    form: 'ABA',
    volume: 0.3
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

// ========================================
// Q&A MODE — Mountain King Section Spotter
// Listen to each section, then answer questions about dynamics, instruments, tempo
// ========================================

export const QA_SCORING = {
  correct: 100,
  maxSpeedBonus: 50,
  speedWindow: 5000, // 5 seconds
};

export const calculateQASpeedBonus = (answerTimeMs, questionStartMs) => {
  if (!answerTimeMs || !questionStartMs) return 0;
  const elapsed = answerTimeMs - questionStartMs;
  if (elapsed <= 0 || elapsed > QA_SCORING.speedWindow) return 0;
  const ratio = 1 - (elapsed / QA_SCORING.speedWindow);
  return Math.round(QA_SCORING.maxSpeedBonus * ratio);
};

// 3 rounds (A, B, A'), 3 questions each
export const MOUNTAIN_KING_QUESTIONS = [
  // Round 0 — Section A (0:00-0:59)
  [
    {
      id: 'a1',
      category: 'Dynamics',
      categoryEmoji: '\uD83D\uDCE2',
      categoryColor: '#EF4444',
      question: 'What DYNAMICS do you hear in Section A?',
      options: [
        { id: 'pp', label: 'pp (pianissimo)' },
        { id: 'p', label: 'p (piano)' },
        { id: 'mf', label: 'mf (mezzo-forte)' },
        { id: 'f', label: 'f (forte)' },
        { id: 'ff', label: 'ff (fortissimo)' },
      ],
      correctAnswer: 'pp',
      correctLabel: 'pp (pianissimo) \u2014 very soft and quiet',
      explanation: 'Section A starts very softly \u2014 pianissimo!'
    },
    {
      id: 'a2',
      category: 'Instruments',
      categoryEmoji: '\uD83C\uDFBB',
      categoryColor: '#8B5CF6',
      question: 'What INSTRUMENT FAMILY is playing the melody?',
      options: [
        { id: 'strings', label: 'Strings' },
        { id: 'woodwinds', label: 'Woodwinds' },
        { id: 'brass', label: 'Brass' },
        { id: 'percussion', label: 'Percussion' },
      ],
      correctAnswer: 'strings',
      correctLabel: 'Strings \u2014 playing pizzicato (plucking!)',
      explanation: 'The strings are plucking the sneaky melody!'
    },
    {
      id: 'a3',
      category: 'Tempo',
      categoryEmoji: '\u23F1\uFE0F',
      categoryColor: '#3B82F6',
      question: 'What TEMPO do you hear?',
      options: [
        { id: 'largo', label: 'Largo' },
        { id: 'adagio', label: 'Adagio' },
        { id: 'andante', label: 'Andante' },
        { id: 'allegro', label: 'Allegro' },
        { id: 'presto', label: 'Presto' },
      ],
      correctAnswer: 'andante',
      correctLabel: 'Andante \u2014 a walking pace',
      explanation: 'The tempo is andante \u2014 like a slow, sneaky walk!'
    },
  ],
  // Round 1 — Section B (0:59-1:44)
  [
    {
      id: 'b1',
      category: 'Dynamics',
      categoryEmoji: '\uD83D\uDCE2',
      categoryColor: '#EF4444',
      question: 'How did the DYNAMICS change from Section A?',
      options: [
        { id: 'softer', label: 'Softer' },
        { id: 'same', label: 'About the Same' },
        { id: 'louder', label: 'Louder' },
      ],
      correctAnswer: 'louder',
      correctLabel: 'Louder! mf (mezzo-forte)',
      explanation: 'The music got louder \u2014 mezzo-forte!'
    },
    {
      id: 'b2',
      category: 'Instruments',
      categoryEmoji: '\uD83C\uDFBA',
      categoryColor: '#F59E0B',
      question: 'What NEW instrument family enters in Section B?',
      options: [
        { id: 'strings', label: 'Strings' },
        { id: 'woodwinds', label: 'Woodwinds' },
        { id: 'brass', label: 'Brass' },
        { id: 'percussion', label: 'Percussion' },
      ],
      correctAnswer: 'brass',
      correctLabel: 'Brass! Trumpets, horns, trombones join in',
      explanation: 'The brass family enters with power!'
    },
    {
      id: 'b3',
      category: 'Tempo',
      categoryEmoji: '\u23F1\uFE0F',
      categoryColor: '#3B82F6',
      question: 'How did the TEMPO change from Section A?',
      options: [
        { id: 'slower', label: 'Slower' },
        { id: 'same', label: 'About the Same' },
        { id: 'faster', label: 'Faster' },
      ],
      correctAnswer: 'faster',
      correctLabel: 'Faster! Moderato \u2014 moderate speed',
      explanation: 'The tempo sped up to moderato!'
    },
  ],
  // Round 2 — Section A' (1:44-2:30)
  [
    {
      id: 'c1',
      category: 'Form',
      categoryEmoji: '\uD83D\uDD24',
      categoryColor: '#10B981',
      question: 'Is this Section A or Section B?',
      options: [
        { id: 'a', label: 'Section A' },
        { id: 'b', label: 'Section B' },
        { id: 'new', label: 'New Section' },
      ],
      correctAnswer: 'a',
      correctLabel: 'Section A returns! Same melody \u2014 but now ff!',
      explanation: 'The A melody comes back \u2014 that\'s ternary form (ABA)!'
    },
    {
      id: 'c2',
      category: 'Instruments',
      categoryEmoji: '\uD83E\uDD41',
      categoryColor: '#F59E0B',
      question: 'What do you hear now?',
      options: [
        { id: 'just-strings', label: 'Just Strings' },
        { id: 'strings-brass', label: 'Strings + Brass' },
        { id: 'full-orchestra', label: 'Full Orchestra' },
      ],
      correctAnswer: 'full-orchestra',
      correctLabel: 'Full Orchestra \u2014 all four families!',
      explanation: 'Everyone is playing \u2014 strings, winds, brass, AND percussion!'
    },
    {
      id: 'c3',
      category: 'Tempo',
      categoryEmoji: '\u23F1\uFE0F',
      categoryColor: '#3B82F6',
      question: 'How fast is this section?',
      options: [
        { id: 'andante', label: 'Andante' },
        { id: 'moderato', label: 'Moderato' },
        { id: 'presto', label: 'Presto' },
      ],
      correctAnswer: 'presto',
      correctLabel: 'Presto \u2014 very fast!',
      explanation: 'The finale races to presto \u2014 the fastest tempo!'
    },
  ],
];
