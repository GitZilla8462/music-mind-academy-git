// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderAudio.js
// Audio data, mood configs, and audio generation helpers for Epic Wildlife game

// ============ ALL LOOPS BY MOOD AND INSTRUMENT ============
// Constraint: No two of the same instrument type in one section
export const LOOPS_BY_MOOD = {
  Heroic: {
    Bells: ['/projects/film-music-score/loops/Heroic Bells 1.m4a', '/projects/film-music-score/loops/Heroic Bells 2.m4a'],
    Brass: ['/projects/film-music-score/loops/Heroic Brass 1.m4a', '/projects/film-music-score/loops/Heroic Brass 2.m4a'],
    Drums: ['/projects/film-music-score/loops/Heroic Drums 1.m4a', '/projects/film-music-score/loops/Heroic Drums 2.m4a', '/projects/film-music-score/loops/Heroic Drums 3.m4a', '/projects/film-music-score/loops/Heroic Drums 4.m4a'],
    Guitar: ['/projects/film-music-score/loops/Heroic Guitar 1.m4a', '/projects/film-music-score/loops/Heroic Guitar 2.m4a'],
    Marimba: ['/projects/film-music-score/loops/Heroic Marimba.m4a'],
    Piano: ['/projects/film-music-score/loops/Heroic Piano 1.m4a'],
    Strings: ['/projects/film-music-score/loops/Heroic Strings 1.m4a', '/projects/film-music-score/loops/Heroic Strings 2.m4a', '/projects/film-music-score/loops/Heroic Strings 3.m4a', '/projects/film-music-score/loops/Heroic Strings 4.m4a'],
    Vibraphone: ['/projects/film-music-score/loops/Heroic Vibraphone.m4a'],
    Vocals: ['/projects/film-music-score/loops/Heroic Vocals 1.m4a', '/projects/film-music-score/loops/Heroic Vocals 2.m4a']
  },
  Scary: {
    Bass: ['/projects/film-music-score/loops/Scary Bass 1.mp3', '/projects/film-music-score/loops/Scary Bass 2.mp3', '/projects/film-music-score/loops/Scary Bass 3.mp3'],
    Brass: ['/projects/film-music-score/loops/Scary Brass 1.mp3'],
    Percussion: ['/projects/film-music-score/loops/Scary Percussion 1.mp3', '/projects/film-music-score/loops/Scary Percussion 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Scary Strings 1.mp3', '/projects/film-music-score/loops/Scary Strings 2.mp3', '/projects/film-music-score/loops/Scary Strings 3.mp3', '/projects/film-music-score/loops/Scary Strings 4.mp3'],
    Synth: ['/projects/film-music-score/loops/Scary Synth 1.mp3', '/projects/film-music-score/loops/Scary Synth 2.mp3', '/projects/film-music-score/loops/Scary Synth 3.mp3', '/projects/film-music-score/loops/Scary Synth 4.mp3']
  },
  Mysterious: {
    Bass: ['/projects/film-music-score/loops/Mysterious Bass 1.m4a', '/projects/film-music-score/loops/Mysterious Bass 2.m4a'],
    Brass: ['/projects/film-music-score/loops/Mysterious Brass 1.m4a'],
    Drums: ['/projects/film-music-score/loops/Mysterious Drums 1.m4a', '/projects/film-music-score/loops/Mysterious Drums 2.m4a', '/projects/film-music-score/loops/Mysterious Drums 3.m4a'],
    Glockenspiel: ['/projects/film-music-score/loops/Mysterious Glockenspiel.m4a'],
    Guitar: ['/projects/film-music-score/loops/Mysterious Guitar 1.m4a'],
    Keys: ['/projects/film-music-score/loops/Mysterious Keys 1.m4a', '/projects/film-music-score/loops/Mysterious Keys 2.m4a', '/projects/film-music-score/loops/Mysterious Keys 3.m4a'],
    Strings: ['/projects/film-music-score/loops/Mysterious Strings 1.m4a', '/projects/film-music-score/loops/Mysterious Strings 2.m4a', '/projects/film-music-score/loops/Mysterious Strings 3.m4a'],
    Synth: ['/projects/film-music-score/loops/Mysterious Synth 1.m4a', '/projects/film-music-score/loops/Mysterious Synth 2.m4a', '/projects/film-music-score/loops/Mysterious Synth 3.m4a', '/projects/film-music-score/loops/Mysterious Synth 4.m4a']
  },
  Upbeat: {
    Bells: ['/projects/film-music-score/loops/Upbeat Bells.mp3'],
    Clarinet: ['/projects/film-music-score/loops/Upbeat Clarinet.mp3'],
    Drums: ['/projects/film-music-score/loops/Upbeat Drums 1.mp3', '/projects/film-music-score/loops/Upbeat Drums 2.mp3'],
    Guitar: ['/projects/film-music-score/loops/Upbeat Electric Guitar.mp3'],
    Bass: ['/projects/film-music-score/loops/Upbeat Electric Bass.mp3', '/projects/film-music-score/loops/Upbeat String Bass.mp3'],
    Piano: ['/projects/film-music-score/loops/Upbeat Piano.mp3'],
    Strings: ['/projects/film-music-score/loops/Upbeat Strings.mp3']
  },
  Hype: {
    Bass: ['/projects/film-music-score/loops/Hype Bass 1.m4a', '/projects/film-music-score/loops/Hype Bass 2.m4a'],
    Bells: ['/projects/film-music-score/loops/Hype Bells 1.m4a', '/projects/film-music-score/loops/Hype Bells 2.m4a', '/projects/film-music-score/loops/Hype Bells 3.m4a'],
    Drums: ['/projects/film-music-score/loops/Hype Drums 1.m4a', '/projects/film-music-score/loops/Hype Drums 2.m4a', '/projects/film-music-score/loops/Hype Drums 3.m4a'],
    Guitar: ['/projects/film-music-score/loops/Hype Guitar 1.m4a', '/projects/film-music-score/loops/Hype Guitar 2.m4a'],
    Lead: ['/projects/film-music-score/loops/Hype Lead 1.m4a', '/projects/film-music-score/loops/Hype Lead 2.m4a', '/projects/film-music-score/loops/Hype Lead 3.m4a'],
    Piano: ['/projects/film-music-score/loops/Hype Piano 1.m4a'],
    Strings: ['/projects/film-music-score/loops/Hype Strings 1.m4a', '/projects/film-music-score/loops/Hype Strings 2.m4a', '/projects/film-music-score/loops/Hype Strings 3.m4a', '/projects/film-music-score/loops/Hype Strings 4.m4a'],
    Synth: ['/projects/film-music-score/loops/Hype Synth 1.m4a', '/projects/film-music-score/loops/Hype Synth 2.m4a', '/projects/film-music-score/loops/Hype Synth 3.m4a']
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
  intro: { label: 'INTRO', layers: 2, color: '#8B5CF6', emoji: '🎬' },
  a: { label: 'A', layers: 3, color: '#3B82F6', emoji: '🎵' },
  aPrime: { label: "A'", layers: 4, color: '#F59E0B', emoji: '🎶' },
  outro: { label: 'OUTRO', layers: 1, color: '#10B981', emoji: '🏁' }
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

// ============ FIXED SONG STRUCTURE ============
// Using specific Heroic loops for consistent playback
const FIXED_LOOPS = {
  drums: '/projects/film-music-score/loops/Heroic Drums 1.m4a',
  strings: '/projects/film-music-score/loops/Heroic Strings 1.m4a',
  piano: '/projects/film-music-score/loops/Heroic Piano 1.m4a',
  brass: '/projects/film-music-score/loops/Heroic Brass 2.m4a'
};

// Fixed section structure with exact loops
export const FIXED_SECTION_AUDIO = {
  intro: [FIXED_LOOPS.drums, FIXED_LOOPS.strings],
  a: [FIXED_LOOPS.drums, FIXED_LOOPS.strings, FIXED_LOOPS.piano],
  aPrime: [FIXED_LOOPS.drums, FIXED_LOOPS.strings, FIXED_LOOPS.piano, FIXED_LOOPS.brass],
  outro: [FIXED_LOOPS.drums]
};

// Display names for each section's loops
export const SECTION_LOOP_NAMES = {
  intro: ['Heroic Drums 1', 'Heroic Strings 1'],
  a: ['Heroic Drums 1', 'Heroic Strings 1', 'Heroic Piano 1'],
  aPrime: ['Heroic Drums 1', 'Heroic Strings 1', 'Heroic Piano 1', 'Heroic Brass 2'],
  outro: ['Heroic Drums 1']
};

// ============ HELPER: Generate full song structure ============
// Now returns fixed structure instead of random
export const generateSongStructure = (mood) => {
  console.log('🎵 Using fixed Heroic song structure');
  console.log('🎵 INTRO layers:', FIXED_SECTION_AUDIO.intro);
  console.log('🎵 A layers:', FIXED_SECTION_AUDIO.a);
  console.log('🎵 A\' layers:', FIXED_SECTION_AUDIO.aPrime);
  console.log('🎵 OUTRO layers:', FIXED_SECTION_AUDIO.outro);

  return FIXED_SECTION_AUDIO;
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
// Limited to Upbeat and Heroic for clearer audio distinction
export const getRandomMood = () => {
  const moods = ['Upbeat', 'Heroic'];
  return moods[Math.floor(Math.random() * moods.length)];
};