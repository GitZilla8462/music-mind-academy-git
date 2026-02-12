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

// Pre-trimmed 8-second clips (4 per song, 5 songs = 20 clips)
// Each song's naturalBpm matches one tempo category — clips always play at natural speed
export const AUDIO_CLIPS = [
  // Dvořák — New World Symphony, Largo (~50 BPM)
  { audio: '/audio/classical/dvorak-largo-1.mp3', naturalBpm: 50, startTime: 0, volume: 2.0, label: 'Dvořák' },
  { audio: '/audio/classical/dvorak-largo-2.mp3', naturalBpm: 50, startTime: 0, volume: 2.0, label: 'Dvořák' },
  { audio: '/audio/classical/dvorak-largo-3.mp3', naturalBpm: 50, startTime: 0, volume: 2.0, label: 'Dvořák' },
  { audio: '/audio/classical/dvorak-largo-4.mp3', naturalBpm: 50, startTime: 0, volume: 2.0, label: 'Dvořák' },

  // Beethoven — Moonlight Sonata, 1st mvt (~72 BPM)
  { audio: '/audio/classical/beethoven-moonlight-1.mp3', naturalBpm: 72, startTime: 0, volume: 2.0, label: 'Beethoven' },
  { audio: '/audio/classical/beethoven-moonlight-2.mp3', naturalBpm: 72, startTime: 0, volume: 2.0, label: 'Beethoven' },
  { audio: '/audio/classical/beethoven-moonlight-3.mp3', naturalBpm: 72, startTime: 0, volume: 2.0, label: 'Beethoven' },
  { audio: '/audio/classical/beethoven-moonlight-4.mp3', naturalBpm: 72, startTime: 0, volume: 2.0, label: 'Beethoven' },

  // Grieg — Morning Mood (~92 BPM)
  { audio: '/audio/classical/grieg-morning-1.mp3', naturalBpm: 92, startTime: 0, volume: 0.7, label: 'Grieg' },
  { audio: '/audio/classical/grieg-morning-2.mp3', naturalBpm: 92, startTime: 0, volume: 0.7, label: 'Grieg' },
  { audio: '/audio/classical/grieg-morning-3.mp3', naturalBpm: 92, startTime: 0, volume: 0.7, label: 'Grieg' },
  { audio: '/audio/classical/grieg-morning-4.mp3', naturalBpm: 92, startTime: 0, volume: 0.7, label: 'Grieg' },

  // Brahms — Hungarian Dance No. 5 (~138 BPM, A-section clips)
  { audio: '/audio/classical/brahms-hungarian-1.mp3', naturalBpm: 138, startTime: 0, volume: 0.7, label: 'Brahms' },
  { audio: '/audio/classical/brahms-hungarian-2.mp3', naturalBpm: 138, startTime: 0, volume: 0.7, label: 'Brahms' },
  { audio: '/audio/classical/brahms-hungarian-3.mp3', naturalBpm: 138, startTime: 0, volume: 0.7, label: 'Brahms' },
  { audio: '/audio/classical/brahms-hungarian-4.mp3', naturalBpm: 138, startTime: 0, volume: 0.7, label: 'Brahms' },

  // Vivaldi — Summer Presto (~184 BPM)
  { audio: '/audio/classical/vivaldi-summer-presto-1.mp3', naturalBpm: 184, startTime: 0, volume: 0.7, label: 'Vivaldi' },
  { audio: '/audio/classical/vivaldi-summer-presto-2.mp3', naturalBpm: 184, startTime: 0, volume: 0.7, label: 'Vivaldi' },
  { audio: '/audio/classical/vivaldi-summer-presto-3.mp3', naturalBpm: 184, startTime: 0, volume: 0.7, label: 'Vivaldi' },
  { audio: '/audio/classical/vivaldi-summer-presto-4.mp3', naturalBpm: 184, startTime: 0, volume: 0.7, label: 'Vivaldi' },
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

// Generate questions: each tempo appears twice, clips match their natural tempo
// No playbackRate adjustment — each clip plays at its real speed
// Cycles through all 4 clips per tempo before repeating any
export const generateQuestions = (count = 10) => {
  // Each tempo appears exactly twice
  const tempoPool = [...TEMPO_OPTIONS, ...TEMPO_OPTIONS];
  const shuffledTempos = shuffleArray(tempoPool).slice(0, count);

  // Pre-shuffle clips for each tempo so we cycle through all 4 before repeating
  const clipQueues = {};
  TEMPO_OPTIONS.forEach(t => {
    clipQueues[t.bpm] = shuffleArray(
      AUDIO_CLIPS.map((clip, i) => ({ clip, index: i })).filter(({ clip }) => clip.naturalBpm === t.bpm)
    );
  });

  return shuffledTempos.map((tempo, idx) => {
    const queue = clipQueues[tempo.bpm];
    // Take the next clip; if we've used all 4, reshuffle and start over
    if (queue.length === 0) {
      clipQueues[tempo.bpm] = shuffleArray(
        AUDIO_CLIPS.map((clip, i) => ({ clip, index: i })).filter(({ clip }) => clip.naturalBpm === tempo.bpm)
      );
      queue.push(...clipQueues[tempo.bpm]);
    }
    const pick = queue.shift();

    return {
      id: idx + 1,
      correctAnswer: tempo.symbol,
      correctBpm: tempo.bpm,
      clipIndex: pick.index,
      playbackRate: 1.0,
      clipAudio: pick.clip.audio,
      clipStartTime: pick.clip.startTime,
      clipVolume: pick.clip.volume,
      clipLabel: pick.clip.label,
    };
  });
};

// Get tempo info by symbol
export const getTempoBySymbol = (symbol) => {
  return TEMPO_OPTIONS.find(t => t.symbol === symbol) || null;
};

// Keep TEMPO_TERMS export for backward compatibility (TempoShowcase uses it indirectly)
export const TEMPO_TERMS = TEMPO_OPTIONS;
