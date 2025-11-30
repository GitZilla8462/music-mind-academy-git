// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderAudio.js
// Audio data, mood configs, and audio generation helpers for Epic Wildlife game

// ============ ALL LOOPS BY MOOD AND INSTRUMENT ============
// Constraint: No two of the same instrument type in one section
export const LOOPS_BY_MOOD = {
  Heroic: {
    Bass: ['/projects/film-music-score/loops/Heroic Bass 1.mp3'],
    Brass: ['/projects/film-music-score/loops/Heroic Brass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Heroic Drums 1.mp3', '/projects/film-music-score/loops/Heroic Drums 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Heroic Strings 1.mp3', '/projects/film-music-score/loops/Heroic Strings 2.mp3', '/projects/film-music-score/loops/Heroic Strings 3.mp3'],
    Synth: ['/projects/film-music-score/loops/Heroic Synth 1.mp3', '/projects/film-music-score/loops/Heroic Synth 2.mp3'],
    Vocals: ['/projects/film-music-score/loops/Heroic Vocals.mp3']
  },
  Scary: {
    Bass: ['/projects/film-music-score/loops/Scary Bass 1.mp3', '/projects/film-music-score/loops/Scary Bass 2.mp3', '/projects/film-music-score/loops/Scary Bass 3.mp3'],
    Brass: ['/projects/film-music-score/loops/Scary Brass 1.mp3'],
    Percussion: ['/projects/film-music-score/loops/Scary Percussion 1.mp3', '/projects/film-music-score/loops/Scary Percussion 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Scary Strings 1.mp3', '/projects/film-music-score/loops/Scary Strings 2.mp3', '/projects/film-music-score/loops/Scary Strings 3.mp3', '/projects/film-music-score/loops/Scary Strings 4.mp3'],
    Synth: ['/projects/film-music-score/loops/Scary Synth 1.mp3', '/projects/film-music-score/loops/Scary Synth 2.mp3', '/projects/film-music-score/loops/Scary Synth 3.mp3', '/projects/film-music-score/loops/Scary Synth 4.mp3']
  },
  Mysterious: {
    Bass: ['/projects/film-music-score/loops/Mysterious Bass 1.mp3', '/projects/film-music-score/loops/Mysterious Bass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Mysterious  Drums 2.mp3'],
    Guitar: ['/projects/film-music-score/loops/Mysterious Guitar.mp3'],
    Strings: ['/projects/film-music-score/loops/Mysterious Strings.mp3', '/projects/film-music-score/loops/Mysterious Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Mysterious Synth 1.mp3', '/projects/film-music-score/loops/Mysterious Synth 2.mp3', '/projects/film-music-score/loops/Mysterious  Synth 3.mp3']
  },
  Upbeat: {
    Bells: ['/projects/film-music-score/loops/Upbeat Bells 1.mp3'],
    Brass: ['/projects/film-music-score/loops/Upbeat Brass 1.mp3', '/projects/film-music-score/loops/Upbeat Brass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Upbeat Drums 1.mp3', '/projects/film-music-score/loops/Upbeat Drums 2.mp3'],
    Guitar: ['/projects/film-music-score/loops/Upbeat Guitar 1.mp3'],
    Keys: ['/projects/film-music-score/loops/Upbeat Keys 1.mp3', '/projects/film-music-score/loops/Upbeat Keys 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Upbeat Strings 1.mp3', '/projects/film-music-score/loops/Upbeat Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Upbeat Synth 1.mp3']
  },
  Hype: {
    Bass: ['/projects/film-music-score/loops/Hype Bass 1.wav', '/projects/film-music-score/loops/Hype Bass 2.wav'],
    Drums: ['/projects/film-music-score/loops/Hype Drums 1.wav', '/projects/film-music-score/loops/Hype Drums 2.wav'],
    Guitar: ['/projects/film-music-score/loops/Hype Guitar 1.wav', '/projects/film-music-score/loops/Hype Guitar 2.wav'],
    Keys: ['/projects/film-music-score/loops/Hype Keys 1.wav'],
    Synth: ['/projects/film-music-score/loops/Hype Synth 1.wav', '/projects/film-music-score/loops/Hype Synth 2.wav'],
    SynthLead: ['/projects/film-music-score/loops/Hype Synth Lead 1.wav', '/projects/film-music-score/loops/Hype Synth Lead 2.wav', '/projects/film-music-score/loops/Hype Synth Lead 3.wav']
  }
};

export const MOOD_INFO = {
  Heroic: { emoji: '⚔️', color: '#F59E0B' },
  Scary: { emoji: '👻', color: '#EF4444' },
  Mysterious: { emoji: '🔮', color: '#8B5CF6' },
  Upbeat: { emoji: '🎉', color: '#10B981' },
  Hype: { emoji: '🔥', color: '#EC4899' }
};

export const SECTION_INFO = {
  intro: { label: 'INTRO', color: '#8B5CF6', emoji: '🎬' },
  a: { label: 'A', color: '#3B82F6', emoji: '🎵' },
  aPrime: { label: "A'", color: '#F59E0B', emoji: '🎶' },
  outro: { label: 'OUTRO', color: '#10B981', emoji: '🏁' }
};

// Song structure (order sections play during listening phase)
export const SONG_STRUCTURE = [
  { position: 0, section: 'intro', label: 'INTRO' },
  { position: 1, section: 'a', label: 'A' },
  { position: 2, section: 'aPrime', label: "A'" },
  { position: 3, section: 'a', label: 'A' },
  { position: 4, section: 'outro', label: 'OUTRO' }
];

export const SECTION_DURATION = 8000;

// ============ HELPER: Generate random section audio respecting instrument constraints ============
export const generateSectionAudio = (mood, layerCount) => {
  const moodLoops = LOOPS_BY_MOOD[mood];
  if (!moodLoops) return [];
  
  const instruments = Object.keys(moodLoops);
  const selectedLoops = [];
  const usedInstruments = new Set();
  
  // Shuffle instruments for variety
  const shuffledInstruments = [...instruments].sort(() => Math.random() - 0.5);
  
  for (const instrument of shuffledInstruments) {
    if (selectedLoops.length >= layerCount) break;
    if (usedInstruments.has(instrument)) continue;
    
    const loops = moodLoops[instrument];
    const randomLoop = loops[Math.floor(Math.random() * loops.length)];
    selectedLoops.push(randomLoop);
    usedInstruments.add(instrument);
  }
  
  return selectedLoops;
};

// ============ HELPER: Generate full song structure for a mood ============
export const generateSongStructure = (mood) => {
  // INTRO: 2 layers, A: 3 layers, A': 4 layers, OUTRO: 1 layer
  return {
    intro: generateSectionAudio(mood, 2),
    a: generateSectionAudio(mood, 3),
    aPrime: generateSectionAudio(mood, 4),
    outro: generateSectionAudio(mood, 1)
  };
};

// ============ HELPER: Shuffle array ============
export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============ HELPER: Pick random mood ============
export const getRandomMood = () => {
  const moods = Object.keys(LOOPS_BY_MOOD);
  return moods[Math.floor(Math.random() * moods.length)];
};