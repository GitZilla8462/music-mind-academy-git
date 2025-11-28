// File: /src/lessons/shared/activities/layer-lab/trackConfig.js
// Track definitions, instruments, and sound configurations

// ============================================================================
// MUSICAL SCALES
// ============================================================================

export const SCALES = {
  major: {
    name: 'Major',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    mood: 'Happy, bright'
  },
  minor: {
    name: 'Minor',
    notes: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
    mood: 'Sad, dramatic'
  },
  pentatonic: {
    name: 'Pentatonic',
    notes: ['C', 'D', 'E', 'G', 'A'],
    mood: 'Simple, universal'
  },
  blues: {
    name: 'Blues',
    notes: ['C', 'Eb', 'F', 'Gb', 'G', 'Bb'],
    mood: 'Soulful, expressive'
  },
  dorian: {
    name: 'Dorian',
    notes: ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
    mood: 'Jazzy, mysterious'
  }
};

// ============================================================================
// CHORD PROGRESSIONS
// ============================================================================

export const CHORD_PROGRESSIONS = {
  pop: {
    name: 'Pop (I-V-vi-IV)',
    description: 'Used in thousands of pop songs!',
    chords: [
      { root: 0, type: 'major', name: 'C' },
      { root: 4, type: 'major', name: 'G' },
      { root: 5, type: 'minor', name: 'Am' },
      { root: 3, type: 'major', name: 'F' }
    ],
    icon: '🎤'
  },
  epic: {
    name: 'Epic (i-VII-VI-VII)',
    description: 'Cinematic and powerful',
    chords: [
      { root: 0, type: 'minor', name: 'Cm' },
      { root: 6, type: 'major', name: 'Bb' },
      { root: 5, type: 'major', name: 'Ab' },
      { root: 6, type: 'major', name: 'Bb' }
    ],
    icon: '🎬'
  },
  blues: {
    name: '12-Bar Blues',
    description: 'Classic blues feel',
    chords: [
      { root: 0, type: 'major', name: 'C' },
      { root: 0, type: 'major', name: 'C' },
      { root: 3, type: 'major', name: 'F' },
      { root: 0, type: 'major', name: 'C' }
    ],
    icon: '🎷'
  },
  fifties: {
    name: '50s (I-vi-IV-V)',
    description: 'Doo-wop and oldies',
    chords: [
      { root: 0, type: 'major', name: 'C' },
      { root: 5, type: 'minor', name: 'Am' },
      { root: 3, type: 'major', name: 'F' },
      { root: 4, type: 'major', name: 'G' }
    ],
    icon: '🕺'
  },
  sad: {
    name: 'Emotional (vi-IV-I-V)',
    description: 'Melancholic and touching',
    chords: [
      { root: 5, type: 'minor', name: 'Am' },
      { root: 3, type: 'major', name: 'F' },
      { root: 0, type: 'major', name: 'C' },
      { root: 4, type: 'major', name: 'G' }
    ],
    icon: '😢'
  },
  mysterious: {
    name: 'Mysterious (i-VI-III-VII)',
    description: 'Dark and intriguing',
    chords: [
      { root: 0, type: 'minor', name: 'Am' },
      { root: 3, type: 'major', name: 'F' },
      { root: 0, type: 'major', name: 'C' },
      { root: 4, type: 'major', name: 'E' }
    ],
    icon: '🌙'
  }
};

// ============================================================================
// STYLE PRESETS
// ============================================================================

export const STYLE_PRESETS = {
  cinematic: {
    name: 'Cinematic',
    icon: '🎬',
    description: 'Epic movie soundtrack feel',
    bpm: 80,
    scale: 'minor',
    progression: 'epic',
    sounds: {
      melody: 'strings',
      harmony: 'pad',
      rhythm: 'cinematic',
      bass: 'orchestral'
    }
  },
  pop: {
    name: 'Pop',
    icon: '🎤',
    description: 'Catchy and upbeat',
    bpm: 120,
    scale: 'major',
    progression: 'pop',
    sounds: {
      melody: 'bells',
      harmony: 'synth',
      rhythm: 'electronic',
      bass: 'synth'
    }
  },
  chill: {
    name: 'Chill',
    icon: '😌',
    description: 'Relaxed lofi vibes',
    bpm: 75,
    scale: 'pentatonic',
    progression: 'fifties',
    sounds: {
      melody: 'musicbox',
      harmony: 'pad',
      rhythm: 'lofi',
      bass: 'soft'
    }
  },
  hype: {
    name: 'Hype',
    icon: '🔥',
    description: 'High energy EDM',
    bpm: 140,
    scale: 'minor',
    progression: 'epic',
    sounds: {
      melody: 'lead',
      harmony: 'supersaw',
      rhythm: 'edm',
      bass: 'wobble'
    }
  },
  retro: {
    name: 'Retro',
    icon: '👾',
    description: '8-bit video game style',
    bpm: 130,
    scale: 'major',
    progression: 'pop',
    sounds: {
      melody: 'chiptune',
      harmony: 'square',
      rhythm: 'retro',
      bass: 'chiptune'
    }
  },
  jazz: {
    name: 'Jazz',
    icon: '🎷',
    description: 'Smooth and sophisticated',
    bpm: 95,
    scale: 'dorian',
    progression: 'blues',
    sounds: {
      melody: 'vibes',
      harmony: 'piano',
      rhythm: 'jazz',
      bass: 'upright'
    }
  },
  spooky: {
    name: 'Spooky',
    icon: '👻',
    description: 'Eerie and mysterious',
    bpm: 70,
    scale: 'minor',
    progression: 'mysterious',
    sounds: {
      melody: 'theremin',
      harmony: 'darkpad',
      rhythm: 'minimal',
      bass: 'deep'
    }
  },
  tropical: {
    name: 'Tropical',
    icon: '🌴',
    description: 'Beach party vibes',
    bpm: 110,
    scale: 'major',
    progression: 'pop',
    sounds: {
      melody: 'marimba',
      harmony: 'pluck',
      rhythm: 'tropical',
      bass: 'island'
    }
  }
};

// ============================================================================
// INSTRUMENT SOUNDS
// ============================================================================

export const INSTRUMENT_SOUNDS = {
  melody: {
    bells: { name: 'Bells', icon: '🔔', type: 'triangle', attack: 0.01, decay: 0.3, sustain: 0.1, release: 1.5 },
    marimba: { name: 'Marimba', icon: '🎵', type: 'sine', attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.5 },
    strings: { name: 'Strings', icon: '🎻', type: 'sawtooth', attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.8 },
    flute: { name: 'Flute', icon: '🎶', type: 'sine', attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.3 },
    musicbox: { name: 'Music Box', icon: '🎁', type: 'triangle', attack: 0.001, decay: 0.4, sustain: 0.05, release: 2 },
    lead: { name: 'Synth Lead', icon: '⚡', type: 'sawtooth', attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    chiptune: { name: 'Chiptune', icon: '👾', type: 'square', attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.1 },
    vibes: { name: 'Vibraphone', icon: '✨', type: 'sine', attack: 0.01, decay: 0.8, sustain: 0.2, release: 1.5 },
    theremin: { name: 'Theremin', icon: '👻', type: 'sine', attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.5 }
  },
  harmony: {
    pad: { name: 'Soft Pad', icon: '☁️', type: 'sine', attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.5 },
    synth: { name: 'Synth', icon: '🎹', type: 'sawtooth', attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.5 },
    strings: { name: 'Strings', icon: '🎻', type: 'sawtooth', attack: 0.2, decay: 0.3, sustain: 0.7, release: 1 },
    organ: { name: 'Organ', icon: '⛪', type: 'sine', attack: 0.01, decay: 0.1, sustain: 1, release: 0.3 },
    supersaw: { name: 'Supersaw', icon: '🔊', type: 'sawtooth', attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.4 },
    square: { name: 'Square Wave', icon: '⬜', type: 'square', attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    piano: { name: 'Piano', icon: '🎹', type: 'triangle', attack: 0.01, decay: 0.5, sustain: 0.3, release: 1 },
    pluck: { name: 'Pluck', icon: '🪕', type: 'triangle', attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 },
    darkpad: { name: 'Dark Pad', icon: '🌑', type: 'sawtooth', attack: 0.5, decay: 0.3, sustain: 0.6, release: 2 }
  },
  bass: {
    synth: { name: 'Synth Bass', icon: '🎸', type: 'sawtooth', attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    soft: { name: 'Soft Bass', icon: '🎵', type: 'sine', attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.5 },
    orchestral: { name: 'Orchestral', icon: '🎻', type: 'sawtooth', attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.8 },
    wobble: { name: 'Wobble', icon: '〰️', type: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
    chiptune: { name: 'Chiptune', icon: '👾', type: 'square', attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.1 },
    upright: { name: 'Upright', icon: '🎸', type: 'triangle', attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.6 },
    deep: { name: 'Deep Sub', icon: '📢', type: 'sine', attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 },
    island: { name: 'Island Bass', icon: '🌴', type: 'triangle', attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.4 }
  }
};

// ============================================================================
// DRUM KITS
// ============================================================================

export const DRUM_KITS = {
  acoustic: {
    name: 'Acoustic',
    icon: '🥁',
    sounds: {
      kick: { freq: 60, decay: 0.5 },
      snare: { noise: 'white', decay: 0.2 },
      hihat: { freq: 300, decay: 0.08 },
      tom: { freq: 100, decay: 0.3 }
    }
  },
  electronic: {
    name: 'Electronic',
    icon: '🎛️',
    sounds: {
      kick: { freq: 50, decay: 0.4 },
      snare: { noise: 'pink', decay: 0.15 },
      hihat: { freq: 400, decay: 0.05 },
      tom: { freq: 80, decay: 0.25 }
    }
  },
  lofi: {
    name: 'Lo-Fi',
    icon: '📻',
    sounds: {
      kick: { freq: 55, decay: 0.3 },
      snare: { noise: 'brown', decay: 0.25 },
      hihat: { freq: 250, decay: 0.1 },
      tom: { freq: 90, decay: 0.35 }
    }
  },
  edm: {
    name: 'EDM',
    icon: '💿',
    sounds: {
      kick: { freq: 45, decay: 0.6 },
      snare: { noise: 'white', decay: 0.1 },
      hihat: { freq: 500, decay: 0.03 },
      tom: { freq: 70, decay: 0.2 }
    }
  },
  retro: {
    name: 'Retro 8-bit',
    icon: '👾',
    sounds: {
      kick: { freq: 80, decay: 0.2 },
      snare: { noise: 'white', decay: 0.08 },
      hihat: { freq: 600, decay: 0.02 },
      tom: { freq: 120, decay: 0.15 }
    }
  },
  jazz: {
    name: 'Jazz Brush',
    icon: '🎷',
    sounds: {
      kick: { freq: 65, decay: 0.4 },
      snare: { noise: 'brown', decay: 0.3 },
      hihat: { freq: 280, decay: 0.12 },
      tom: { freq: 95, decay: 0.4 }
    }
  },
  cinematic: {
    name: 'Cinematic',
    icon: '🎬',
    sounds: {
      kick: { freq: 40, decay: 0.8 },
      snare: { noise: 'white', decay: 0.35 },
      hihat: { freq: 350, decay: 0.06 },
      tom: { freq: 60, decay: 0.5 }
    }
  },
  tropical: {
    name: 'Tropical',
    icon: '🌴',
    sounds: {
      kick: { freq: 70, decay: 0.35 },
      snare: { noise: 'pink', decay: 0.2 },
      hihat: { freq: 450, decay: 0.04 },
      tom: { freq: 110, decay: 0.25 }
    }
  },
  minimal: {
    name: 'Minimal',
    icon: '⚪',
    sounds: {
      kick: { freq: 50, decay: 0.3 },
      snare: { noise: 'white', decay: 0.1 },
      hihat: { freq: 400, decay: 0.02 },
      tom: { freq: 85, decay: 0.2 }
    }
  }
};

// ============================================================================
// TRACK TYPES
// ============================================================================

export const TRACK_TYPES = [
  {
    id: 'melody',
    name: 'Melody',
    icon: '✨',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.15)',
    description: 'The main tune that stands out',
    octave: 5,
    rows: 5,
    defaultSound: 'bells',
    defaultEnabled: true
  },
  {
    id: 'harmony',
    name: 'Harmony',
    icon: '🎵',
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.15)',
    description: 'Supporting chords and notes',
    octave: 4,
    rows: 5,
    defaultSound: 'pad',
    defaultEnabled: true
  },
  {
    id: 'rhythm',
    name: 'Rhythm',
    icon: '🥁',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.15)',
    description: 'Drums and percussion',
    octave: 0,
    rows: 4,
    drumLabels: ['Hi-Hat', 'Snare', 'Kick', 'Tom'],
    defaultKit: 'acoustic',
    defaultEnabled: true
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: '🎸',
    color: '#9B59B6',
    bgColor: 'rgba(155, 89, 182, 0.15)',
    description: 'Low notes that anchor the music',
    octave: 2,
    rows: 5,
    defaultSound: 'synth',
    defaultEnabled: true
  },
  {
    id: 'melody2',
    name: 'Melody 2',
    icon: '🌟',
    color: '#FF9800',
    bgColor: 'rgba(255, 152, 0, 0.15)',
    description: 'Counter-melody or second voice',
    octave: 5,
    rows: 5,
    defaultSound: 'flute',
    defaultEnabled: false
  },
  {
    id: 'harmony2',
    name: 'Harmony 2',
    icon: '🎶',
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.15)',
    description: 'Extra harmonic layer',
    octave: 4,
    rows: 5,
    defaultSound: 'strings',
    defaultEnabled: false
  },
  {
    id: 'percussion',
    name: 'Percussion',
    icon: '🪘',
    color: '#E91E63',
    bgColor: 'rgba(233, 30, 99, 0.15)',
    description: 'Extra rhythmic elements',
    octave: 0,
    rows: 4,
    drumLabels: ['Shaker', 'Clap', 'Cowbell', 'Conga'],
    defaultKit: 'acoustic',
    defaultEnabled: false
  },
  {
    id: 'bass2',
    name: 'Sub Bass',
    icon: '📢',
    color: '#795548',
    bgColor: 'rgba(121, 85, 72, 0.15)',
    description: 'Deep low-end rumble',
    octave: 1,
    rows: 5,
    defaultSound: 'deep',
    defaultEnabled: false
  }
];

// Grid configuration
export const GRID_COLS = 16;
export const BEATS_PER_MEASURE = 4;
export const DEFAULT_BPM = 100;
export const MIN_BPM = 60;
export const MAX_BPM = 160;