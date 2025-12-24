// Beat Escape Room Configuration
// Constraints, storage, and sound utilities

import * as Tone from 'tone';

// ========================================
// GRID CONSTRAINTS
// ========================================

export const GRID_CONSTRAINTS = {
  kick: [0, 2],       // Only beats 1 and 3 (indices 0, 2)
  snare: [1, 3],      // Only beats 2 and 4 (indices 1, 3)
  hihat: [0, 1, 2, 3] // All beats allowed
};

export const canClickCell = (instrument, beatIndex) => {
  return GRID_CONSTRAINTS[instrument].includes(beatIndex);
};

// ========================================
// INSTRUMENT DEFINITIONS
// ========================================

export const INSTRUMENTS = [
  {
    id: 'kick',
    name: 'Kick',
    color: '#ef4444',      // Red
    allowedBeats: [0, 2],
  },
  {
    id: 'snare',
    name: 'Snare',
    color: '#f59e0b',      // Orange
    allowedBeats: [1, 3],
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    color: '#22c55e',      // Green
    allowedBeats: [0, 1, 2, 3],
  }
];

// ========================================
// MODE CONFIGURATIONS
// ========================================

export const MODES = {
  solo: {
    id: 'solo',
    label: 'Solo',
    icon: '🧑',
    totalLocks: 6,
    perPerson: 6,
    description: 'Create all 6 locks yourself',
    players: 1
  },
  partner: {
    id: 'partner',
    label: 'Partner',
    icon: '🧑‍🤝‍🧑',
    totalLocks: 6,
    perPerson: 3,
    description: '3 locks each',
    players: 2
  },
  trio: {
    id: 'trio',
    label: 'Trio',
    icon: '👥',
    totalLocks: 9,
    perPerson: 3,
    description: '3 locks each',
    players: 3
  }
};

export const getLockAssignments = (mode, playerIndex = 0) => {
  switch (mode) {
    case 'solo':
      return [1, 2, 3, 4, 5, 6];
    case 'partner':
      return playerIndex === 0
        ? [1, 3, 5]  // Player A: odd locks
        : [2, 4, 6]; // Player B: even locks
    case 'trio':
      return playerIndex === 0
        ? [1, 4, 7]
        : playerIndex === 1
          ? [2, 5, 8]
          : [3, 6, 9];
    default:
      return [1, 2, 3, 4, 5, 6];
  }
};

// ========================================
// PATTERN UTILITIES
// ========================================

export const createEmptyPattern = () => ({
  kick: [false, false, false, false],
  snare: [false, false, false, false],
  hihat: [false, false, false, false]
});

export const patternsMatch = (pattern1, pattern2) => {
  return INSTRUMENTS.every(inst =>
    pattern1[inst.id].every((val, i) => val === pattern2[inst.id][i])
  );
};

export const countActiveNotes = (pattern) => {
  return Object.values(pattern).flat().filter(Boolean).length;
};

export const validatePattern = (pattern, minNotes = 3) => {
  return countActiveNotes(pattern) >= minNotes;
};

// ========================================
// STORAGE & SHARE CODES
// ========================================

const STORAGE_KEY = 'beat-escape-rooms';

export const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const saveRoom = (roomData) => {
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const shareCode = generateShareCode();

  rooms[shareCode] = {
    ...roomData,
    shareCode,
    createdAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  return shareCode;
};

export const loadRoom = (shareCode) => {
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return rooms[shareCode.toUpperCase()] || null;
};

export const getAllRooms = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
};

// ========================================
// AUDIO - DRUM SYNTHS
// ========================================

let kickSynth = null;
let snareSynth = null;
let hihatSynth = null;
let initialized = false;

export const initDrumSynths = async () => {
  if (initialized) return;

  await Tone.start();

  kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  }).toDestination();

  snareSynth = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
  }).toDestination();

  hihatSynth = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    volume: -10
  }).toDestination();

  initialized = true;
};

export const playDrum = async (instrument) => {
  if (!initialized) await initDrumSynths();

  switch (instrument) {
    case 'kick':
      kickSynth?.triggerAttackRelease('C1', '8n');
      break;
    case 'snare':
      snareSynth?.triggerAttackRelease('8n');
      break;
    case 'hihat':
      hihatSynth?.triggerAttackRelease('C4', '16n');
      break;
  }
};

export const playPattern = async (pattern, bpm = 100) => {
  if (!initialized) await initDrumSynths();

  const interval = (60 / bpm) * 1000; // ms per beat

  for (let beat = 0; beat < 4; beat++) {
    setTimeout(() => {
      if (pattern.kick[beat]) playDrum('kick');
      if (pattern.snare[beat]) playDrum('snare');
      if (pattern.hihat[beat]) playDrum('hihat');
    }, beat * interval);
  }

  // Return promise that resolves when pattern is done
  return new Promise(resolve => setTimeout(resolve, 4 * interval));
};

export const disposeSynths = () => {
  try {
    kickSynth?.dispose();
    snareSynth?.dispose();
    hihatSynth?.dispose();
  } catch (e) { /* ignore */ }
  kickSynth = null;
  snareSynth = null;
  hihatSynth = null;
  initialized = false;
};

// ========================================
// UI SOUNDS
// ========================================

let uiSynth = null;

const initUISynth = async () => {
  if (!uiSynth) {
    await Tone.start();
    uiSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.3 }
    }).toDestination();
    uiSynth.volume.value = -12;
  }
};

export const sounds = {
  click: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('C5', '32n');
  },

  wrongGuess: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('E3', '8n');
    setTimeout(() => uiSynth?.triggerAttackRelease('C3', '8n'), 150);
  },

  unlock: async () => {
    await initUISynth();
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((note, i) => {
      setTimeout(() => uiSynth?.triggerAttackRelease(note, '16n'), i * 100);
    });
  },

  hint: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('G4', '8n');
  },

  escape: async () => {
    await initUISynth();
    const notes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
    notes.forEach((note, i) => {
      setTimeout(() => uiSynth?.triggerAttackRelease(note, '8n'), i * 100);
    });
  }
};
