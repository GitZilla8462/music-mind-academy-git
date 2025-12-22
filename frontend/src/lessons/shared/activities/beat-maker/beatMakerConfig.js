// File: /lessons/shared/activities/beat-maker/beatMakerConfig.js
// Configuration for Beat Maker activity - presets, instruments, settings

export const STEPS = 16;

// Drum instrument definitions
export const INSTRUMENTS = [
  {
    id: 'hihat',
    name: 'Hi-Hat',
    color: '#06b6d4', // cyan
    description: 'Metallic, ticking sound - creates momentum',
    role: 'Keeps the groove moving forward'
  },
  {
    id: 'snare',
    name: 'Snare',
    color: '#f97316', // orange
    description: 'Sharp, cracking sound - creates the backbeat',
    role: 'Usually on beats 2 and 4'
  },
  {
    id: 'kick',
    name: 'Kick',
    color: '#a855f7', // purple
    description: 'Low, deep foundation - the heartbeat',
    role: 'Usually on beats 1 and 3'
  }
];

// Preset beat patterns
export const PRESETS = {
  rock: {
    name: 'Rock',
    description: 'Classic rock beat with driving hi-hats',
    bpm: 120,
    pattern: [
      // Hi-hat: eighth notes
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      // Snare: beats 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Kick: beats 1 and 3 with variation
      [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false]
    ]
  },
  hiphop: {
    name: 'Hip-Hop',
    description: 'Boom-bap style with syncopated kick',
    bpm: 90,
    pattern: [
      // Hi-hat: eighth notes
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      // Snare: beats 2 and 4 with ghost note
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      // Kick: syncopated pattern
      [true, false, false, true, false, false, true, false, false, false, true, false, false, false, true, false]
    ]
  },
  electronic: {
    name: 'Electronic',
    description: 'Four-on-the-floor dance beat',
    bpm: 128,
    pattern: [
      // Hi-hat: sixteenth notes
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      // Snare: beats 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Kick: four on the floor
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
    ]
  },
  trap: {
    name: 'Trap',
    description: 'Hard-hitting trap beat with rolling hi-hats',
    bpm: 140,
    pattern: [
      // Hi-hat: rapid with variation
      [true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, false],
      // Snare: on beat 3 (half-time feel)
      [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      // Kick: 808 pattern
      [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, true]
    ]
  }
};

// Synth settings for each instrument
export const SYNTH_SETTINGS = {
  kick: {
    type: 'MembraneSynth',
    settings: {
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    },
    note: 'C1',
    duration: '8n'
  },
  snare: {
    type: 'NoiseSynth',
    settings: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
    },
    duration: '16n'
  },
  hihat: {
    type: 'MetalSynth',
    settings: {
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    },
    volume: -10,
    duration: '32n'
  }
};

// BPM range settings
export const BPM_SETTINGS = {
  min: 60,
  max: 180,
  default: 120,
  step: 5
};

// Storage key for saving beat patterns
export const STORAGE_KEY = 'beat-maker-grid';
export const BPM_STORAGE_KEY = 'beat-maker-bpm';
