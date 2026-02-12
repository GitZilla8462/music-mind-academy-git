// Tempo Detective Configuration
// Audio-based tempo identification game
// A clip plays at a specific tempo, students guess which tempo it is

// 5 tempo options (always shown with BPM)
export const TEMPO_OPTIONS = [
  { symbol: 'Largo', bpm: 50, color: '#93C5FD', emoji: '\u{1F40C}', meaning: 'Very Slow' },
  { symbol: 'Adagio', bpm: 72, color: '#60A5FA', emoji: '\u{1F422}', meaning: 'Slow, Relaxed' },
  { symbol: 'Andante', bpm: 92, color: '#FCD34D', emoji: '\u{1F6B6}', meaning: 'Walking Speed' },
  { symbol: 'Allegro', bpm: 138, color: '#FBBF24', emoji: '\u{1F3C3}', meaning: 'Fast, Lively' },
  { symbol: 'Presto', bpm: 184, color: '#EF4444', emoji: '\u26A1', meaning: 'Very Fast' },
];

// Audio clips with natural BPM (playbackRate = targetBpm / naturalBpm)
export const AUDIO_CLIPS = [
  { audio: '/audio/classical/dvorak-new-world-largo.mp3', naturalBpm: 50, startTime: 0, volume: 2.0, label: 'Dvo\u0159\u00e1k' },
  { audio: '/audio/classical/beethoven-moonlight-sonata-adagio.mp3', naturalBpm: 72, startTime: 4.5, volume: 2.0, label: 'Beethoven' },
  { audio: '/audio/classical/grieg-morning-mood.mp3', naturalBpm: 92, startTime: 0, volume: 0.7, label: 'Grieg' },
  { audio: '/audio/classical/brahms-hungarian-dance-5.mp3', naturalBpm: 138, startTime: 0, volume: 0.7, label: 'Brahms' },
];

export const CLIP_DURATION = 8; // seconds

export const SCORING = {
  correct: 10,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

export const TOTAL_QUESTIONS = 10;

// Shuffle helper
export const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Calculate speed bonus (same tiers as Layer Detective)
export const calculateSpeedBonus = (timeInMs) => {
  const seconds = timeInMs / 1000;
  if (seconds < 2) return 10;
  if (seconds < 4) return 8;
  if (seconds < 6) return 6;
  if (seconds < 8) return 4;
  if (seconds < 10) return 2;
  return 0;
};

// Generate questions: pair random clips with random target tempos
// Ensures variety - each tempo appears twice in 10 questions
export const generateQuestions = (count = 10) => {
  // Each tempo appears exactly twice
  const tempoPool = [...TEMPO_OPTIONS, ...TEMPO_OPTIONS];
  const shuffledTempos = shuffleArray(tempoPool).slice(0, count);

  return shuffledTempos.map((tempo, idx) => {
    // Pick a random clip for this question
    const clipIndex = Math.floor(Math.random() * AUDIO_CLIPS.length);
    const clip = AUDIO_CLIPS[clipIndex];
    const playbackRate = tempo.bpm / clip.naturalBpm;

    return {
      id: idx + 1,
      correctAnswer: tempo.symbol,
      correctBpm: tempo.bpm,
      clipIndex,
      playbackRate,
      clipAudio: clip.audio,
      clipStartTime: clip.startTime,
      clipVolume: clip.volume,
      clipLabel: clip.label,
    };
  });
};

// Get tempo info by symbol
export const getTempoBySymbol = (symbol) => {
  return TEMPO_OPTIONS.find(t => t.symbol === symbol) || null;
};

// Keep TEMPO_TERMS export for backward compatibility (TempoShowcase uses it indirectly)
export const TEMPO_TERMS = TEMPO_OPTIONS;
