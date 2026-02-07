// Tempo Charades Configuration
// Teacher-led class game: volunteer acts out tempo, class guesses

// 7 tempo terms (5 markings + 2 changes)
export const TEMPO_TERMS = [
  { symbol: 'Largo', name: 'Largo', meaning: 'Very Slow', color: '#93C5FD', emoji: '\u{1F40C}', hint: 'Move like you are walking through deep snow or thick mud' },
  { symbol: 'Adagio', name: 'Adagio', meaning: 'Slow, Relaxed', color: '#60A5FA', emoji: '\u{1F422}', hint: 'Move like you are taking a peaceful, lazy stroll' },
  { symbol: 'Andante', name: 'Andante', meaning: 'Walking Speed', color: '#FCD34D', emoji: '\u{1F6B6}', hint: 'Walk at a normal, comfortable pace' },
  { symbol: 'Allegro', name: 'Allegro', meaning: 'Fast, Lively', color: '#FBBF24', emoji: '\u{1F3C3}', hint: 'Move like you are late for class and jogging down the hallway' },
  { symbol: 'Presto', name: 'Presto', meaning: 'Very Fast', color: '#EF4444', emoji: '\u26A1', hint: 'Move as fast as you can \u2014 like a race!' },
  { symbol: 'accel.', name: 'Accelerando', meaning: 'Getting Faster', color: '#4ADE80', emoji: '\u{1F680}', hint: 'Start slow and gradually speed up your movements' },
  { symbol: 'rit.', name: 'Ritardando', meaning: 'Getting Slower', color: '#F87171', emoji: '\u{1F6D1}', hint: 'Start fast and gradually slow down to a stop' },
];

// 10 rounds for the class game
export const QUESTIONS = [
  { id: 1, correctAnswer: 'Andante', hint: 'Walk at a normal, comfortable pace' },
  { id: 2, correctAnswer: 'Presto', hint: 'Move as fast as you can \u2014 like a race!' },
  { id: 3, correctAnswer: 'Largo', hint: 'Move like you are walking through deep snow' },
  { id: 4, correctAnswer: 'Allegro', hint: 'Move like you are jogging to catch the bus' },
  { id: 5, correctAnswer: 'accel.', hint: 'Start slow and gradually speed up' },
  { id: 6, correctAnswer: 'Adagio', hint: 'Move like you are taking a peaceful stroll' },
  { id: 7, correctAnswer: 'rit.', hint: 'Start fast and gradually slow down to a stop' },
  { id: 8, correctAnswer: 'Presto', hint: 'Sprint in place as fast as you can!' },
  { id: 9, correctAnswer: 'Largo', hint: 'Move in ultra slow motion' },
  { id: 10, correctAnswer: 'Allegro', hint: 'Dance around quickly and energetically' },
];

export const SCORING = {
  correct: 10,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

export const TOTAL_QUESTIONS = 10;

// Shuffle helper
export const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Calculate speed bonus
export const calculateSpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 2) return 10;
  if (seconds < 4) return 8;
  if (seconds < 6) return 6;
  if (seconds < 8) return 4;
  if (seconds < 10) return 2;
  return 0;
};
