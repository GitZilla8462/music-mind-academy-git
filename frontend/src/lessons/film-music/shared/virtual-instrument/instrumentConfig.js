// instrumentConfig.js
// Sound configurations for the Film Music virtual instrument
// 8 PolySynth instruments + keyboard mapping + drum pad definitions

// ========================================
// KEYBOARD NOTE MAPPING
// ========================================
// Two octaves: C4-C5 (white) + sharps (black)
// Matches Lesson 1 Motif Builder mapping (A=C4 through K=C5)
export const KEYBOARD_NOTES = [
  { note: 'C4', key: 'a', label: 'C', isBlack: false },
  { note: 'C#4', key: 'w', label: 'C#', isBlack: true },
  { note: 'D4', key: 's', label: 'D', isBlack: false },
  { note: 'D#4', key: 'e', label: 'D#', isBlack: true },
  { note: 'E4', key: 'd', label: 'E', isBlack: false },
  { note: 'F4', key: 'f', label: 'F', isBlack: false },
  { note: 'F#4', key: 't', label: 'F#', isBlack: true },
  { note: 'G4', key: 'g', label: 'G', isBlack: false },
  { note: 'G#4', key: 'y', label: 'G#', isBlack: true },
  { note: 'A4', key: 'h', label: 'A', isBlack: false },
  { note: 'A#4', key: 'u', label: 'A#', isBlack: true },
  { note: 'B4', key: 'j', label: 'B', isBlack: false },
  { note: 'C5', key: 'k', label: 'C', isBlack: false },
];

// Reverse lookup: computer key → note
export const KEY_TO_NOTE = {};
KEYBOARD_NOTES.forEach(n => { KEY_TO_NOTE[n.key] = n.note; });

// ========================================
// SAMPLE BASE URL
// ========================================
// For local dev: samples served from public/samples/ by Vite
// For production: upload samples/ folder to R2 and change this URL
const SAMPLE_BASE = '/samples';

// ========================================
// INSTRUMENT SOUND PACKS
// ========================================
// Each instrument has:
//   - config: PolySynth fallback (used for offline rendering + when samples aren't loaded)
//   - samples: Tone.Sampler URLs (real instrument sounds for live playback)
//   - useSampler: whether to use Sampler (true) or PolySynth (false)
export const INSTRUMENTS = {
  piano: {
    id: 'piano',
    name: 'Piano',
    icon: 'Piano',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { A3: 'A3.mp3', C4: 'C4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/piano/`,
    },
    config: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
    }
  },
  brass: {
    id: 'brass',
    name: 'Brass',
    icon: 'Volume2',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { A1: 'A1.mp3', C2: 'C2.mp3', A3: 'A3.mp3', C4: 'C4.mp3' },
      baseUrl: `${SAMPLE_BASE}/brass/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.4 }
    }
  },
  woodwind: {
    id: 'woodwind',
    name: 'Flute',
    icon: 'Wind',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3', A5: 'A5.mp3', C6: 'C6.mp3' },
      baseUrl: `${SAMPLE_BASE}/woodwind/`,
    },
    config: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.15, decay: 0.4, sustain: 0.5, release: 0.6 }
    }
  },
  synthPad: {
    id: 'synthPad',
    name: 'Synth Pad',
    icon: 'Layers',
    trackTarget: 'harmony',
    useSampler: false, // Synth pad sounds better synthesized
    config: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.5, decay: 0.8, sustain: 0.9, release: 1.5 }
    }
  },
  plucked: {
    id: 'plucked',
    name: 'Guitar',
    icon: 'Guitar',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { A2: 'A2.mp3', E3: 'E3.mp3', A3: 'A3.mp3', A4: 'A4.mp3' },
      baseUrl: `${SAMPLE_BASE}/plucked/`,
    },
    config: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.05, release: 0.4 }
    }
  },
  // ========================================
  // ORCHESTRAL INSTRUMENTS (Philharmonia Orchestra samples)
  // ========================================
  trumpet: {
    id: 'trumpet',
    name: 'Trumpet',
    icon: 'Volume2',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3', A5: 'A5.mp3' },
      baseUrl: `${SAMPLE_BASE}/trumpet/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.4 }
    }
  },
  trombone: {
    id: 'trombone',
    name: 'Trombone',
    icon: 'Volume2',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { E2: 'E2.mp3', E3: 'E3.mp3', A3: 'A3.mp3', C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/trombone/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.6, release: 0.5 }
    }
  },
  tuba: {
    id: 'tuba',
    name: 'Tuba',
    icon: 'Volume2',
    trackTarget: 'bass',
    useSampler: true,
    samples: {
      urls: { C2: 'C2.mp3', E2: 'E2.mp3', A2: 'A2.mp3', C3: 'C3.mp3', A3: 'A3.mp3' },
      baseUrl: `${SAMPLE_BASE}/tuba/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.6 }
    }
  },
  clarinet: {
    id: 'clarinet',
    name: 'Clarinet',
    icon: 'Wind',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3', A5: 'A5.mp3', C6: 'C6.mp3' },
      baseUrl: `${SAMPLE_BASE}/clarinet/`,
    },
    config: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.5 }
    }
  },
  oboe: {
    id: 'oboe',
    name: 'Oboe',
    icon: 'Wind',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3', A5: 'A5.mp3', C6: 'C6.mp3' },
      baseUrl: `${SAMPLE_BASE}/oboe/`,
    },
    config: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.12, decay: 0.3, sustain: 0.5, release: 0.5 }
    }
  },
  bassoon: {
    id: 'bassoon',
    name: 'Bassoon',
    icon: 'Wind',
    trackTarget: 'motif',
    useSampler: true,
    samples: {
      urls: { A2: 'A2.mp3', C3: 'C3.mp3', G3: 'G3.mp3', A3: 'A3.mp3', C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/bassoon/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.6 }
    }
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    icon: 'Music',
    trackTarget: 'motif',
    useSampler: true,
    samplerAttack: 0.1,
    samples: {
      urls: { A3: 'A3.mp3', C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3', A5: 'A5.mp3', C6: 'C6.mp3' },
      baseUrl: `${SAMPLE_BASE}/violin/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.4, sustain: 0.8, release: 0.8 }
    }
  },
  cello: {
    id: 'cello',
    name: 'Cello',
    icon: 'Music',
    trackTarget: 'motif',
    useSampler: true,
    samplerAttack: 0.12,
    samples: {
      urls: { A2: 'A2.mp3', C3: 'C3.mp3', E3: 'E3.mp3', A3: 'A3.mp3', C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3' },
      baseUrl: `${SAMPLE_BASE}/cello/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.25, decay: 0.5, sustain: 0.8, release: 1.0 }
    }
  },
  doubleBass: {
    id: 'doubleBass',
    name: 'Double Bass',
    icon: 'Music',
    trackTarget: 'bass',
    useSampler: true,
    samplerAttack: 0.1,
    samples: {
      urls: { C2: 'C2.mp3', E2: 'E2.mp3', A2: 'A2.mp3', C3: 'C3.mp3', E3: 'E3.mp3', A3: 'A3.mp3' },
      baseUrl: `${SAMPLE_BASE}/double-bass/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.5, sustain: 0.7, release: 0.8 }
    }
  }
};

export const INSTRUMENT_LIST = Object.values(INSTRUMENTS);

// ========================================
// DRUM PAD DEFINITIONS
// ========================================
// 9 pads in a 3x3 grid, mapped to number keys 1-9
export const DRUM_PADS = [
  {
    id: 'kick',
    name: 'Kick',
    key: '1',
    color: '#EF4444',
    synthType: 'membrane',
    config: { pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } }
  },
  {
    id: 'snare',
    name: 'Snare',
    key: '2',
    color: '#F59E0B',
    synthType: 'noise',
    config: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } }
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    key: '3',
    color: '#10B981',
    synthType: 'metal',
    config: { frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10 }
  },
  {
    id: 'clap',
    name: 'Clap',
    key: '4',
    color: '#8B5CF6',
    synthType: 'noise',
    config: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.15 } }
  },
  {
    id: 'openhat',
    name: 'Open Hat',
    key: '5',
    color: '#06B6D4',
    synthType: 'metal',
    config: { frequency: 180, envelope: { attack: 0.001, decay: 0.3, release: 0.1 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -8 }
  },
  {
    id: 'tom-low',
    name: 'Low Tom',
    key: '6',
    color: '#EC4899',
    synthType: 'membrane',
    config: { pitchDecay: 0.08, octaves: 3, envelope: { attack: 0.002, decay: 0.5, sustain: 0.02, release: 0.8 } }
  },
  {
    id: 'tom-mid',
    name: 'Mid Tom',
    key: '7',
    color: '#F97316',
    synthType: 'membrane',
    config: { pitchDecay: 0.06, octaves: 3.5, envelope: { attack: 0.002, decay: 0.4, sustain: 0.02, release: 0.6 } }
  },
  {
    id: 'cymbal',
    name: 'Cymbal',
    key: '8',
    color: '#14B8A6',
    synthType: 'metal',
    config: { frequency: 300, envelope: { attack: 0.001, decay: 0.8, release: 0.3 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 1.2, volume: -12 }
  },
  {
    id: 'rim',
    name: 'Rim Shot',
    key: '9',
    color: '#A855F7',
    synthType: 'membrane',
    config: { pitchDecay: 0.01, octaves: 2, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 } }
  }
];

// Reverse lookup: key → pad
export const KEY_TO_PAD = {};
DRUM_PADS.forEach(p => { KEY_TO_PAD[p.key] = p; });

// ========================================
// SCALE DEFINITIONS
// ========================================
// Each scale maps to a character archetype for Lesson 1 leitmotif examples
// `notes` are the note names within one octave (C4-C5) that belong to the scale
// Sharp-to-flat display labels for minor scales
// Tone.js uses sharps internally, but we show flats for minor keys
const FLAT_LABELS = {
  'C#4': 'Db', 'D#4': 'Eb', 'F#4': 'Gb', 'G#4': 'Ab', 'A#4': 'Bb',
  'C#5': 'Db', 'D#5': 'Eb',
};

export const SCALES = [
  {
    id: 'major',
    name: 'Major',
    character: 'Hero',
    color: '#EF4444',
    notes: new Set(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']),
    labels: null, // use default labels
  },
  {
    id: 'minor',
    name: 'Natural Minor',
    character: 'Villain',
    color: '#7C3AED',
    // C natural minor: C D Eb F G Ab Bb
    notes: new Set(['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5']),
    labels: FLAT_LABELS, // show Eb, Ab, Bb instead of D#, G#, A#
  },
  {
    id: 'pentatonic-major',
    name: 'Pentatonic Major',
    character: 'Romantic',
    color: '#EC4899',
    notes: new Set(['C4', 'D4', 'E4', 'G4', 'A4', 'C5']),
    labels: null,
  },
  {
    id: 'pentatonic-minor',
    name: 'Pentatonic Minor',
    character: 'Sneaky',
    color: '#F59E0B',
    // C minor pentatonic: C Eb F G Bb
    notes: new Set(['C4', 'D#4', 'F4', 'G4', 'A#4', 'C5']),
    labels: FLAT_LABELS, // show Eb, Bb instead of D#, A#
  },
  {
    id: 'chromatic',
    name: 'All Notes',
    character: null,
    color: '#6B7280',
    notes: null, // null = all notes allowed
    labels: null,
  },
];

// ========================================
// OCTAVE RANGE DEFINITIONS
// ========================================
export const OCTAVE_RANGES = [
  { id: 'low', name: 'C3–C4', label: '(Lower Pitch)', octave: 3 },
  { id: 'middle', name: 'C4–C5', label: '(Medium Pitch)', octave: 4 },
  { id: 'high', name: 'C5–C6', label: '(Higher Pitch)', octave: 5 },
];

// Generate keyboard notes for a given base octave
export const getNotesForOctave = (baseOctave) => {
  const BASE_NOTES = [
    { note: 'C', key: 'a', label: 'C', isBlack: false },
    { note: 'C#', key: 'w', label: 'C#', isBlack: true },
    { note: 'D', key: 's', label: 'D', isBlack: false },
    { note: 'D#', key: 'e', label: 'D#', isBlack: true },
    { note: 'E', key: 'd', label: 'E', isBlack: false },
    { note: 'F', key: 'f', label: 'F', isBlack: false },
    { note: 'F#', key: 't', label: 'F#', isBlack: true },
    { note: 'G', key: 'g', label: 'G', isBlack: false },
    { note: 'G#', key: 'y', label: 'G#', isBlack: true },
    { note: 'A', key: 'h', label: 'A', isBlack: false },
    { note: 'A#', key: 'u', label: 'A#', isBlack: true },
    { note: 'B', key: 'j', label: 'B', isBlack: false },
    { note: 'C', key: 'k', label: 'C', isBlack: false }, // top C is next octave
  ];
  return BASE_NOTES.map((n, i) => ({
    ...n,
    note: `${n.note}${i === BASE_NOTES.length - 1 ? baseOctave + 1 : baseOctave}`,
  }));
};

// Generate scale notes shifted to a given octave
export const getScaleForOctave = (scale, baseOctave) => {
  if (!scale?.notes) return null;
  const shifted = new Set();
  scale.notes.forEach(note => {
    const match = note.match(/([A-G]#?)(\d)/);
    if (match) {
      const offset = parseInt(match[2]) - 4; // scales are defined relative to octave 4
      shifted.add(`${match[1]}${baseOctave + offset}`);
    }
  });
  return shifted;
};

// Generate flat labels shifted to a given octave
export const getLabelsForOctave = (labels, baseOctave) => {
  if (!labels) return null;
  const shifted = {};
  Object.entries(labels).forEach(([note, label]) => {
    const match = note.match(/([A-G]#?)(\d)/);
    if (match) {
      const offset = parseInt(match[2]) - 4;
      shifted[`${match[1]}${baseOctave + offset}`] = label;
    }
  });
  return shifted;
};

// Default scale for each character archetype
export const CHARACTER_SCALE_MAP = {
  hero: 'major',
  villain: 'minor',
  romantic: 'pentatonic-major',
  sneaky: 'pentatonic-minor',
};

// ========================================
// TRACK DEFINITIONS
// ========================================
export const TRACK_DEFS = [
  { id: 'motif', name: 'Melody', color: '#3B82F6', type: 'recorded' },
  { id: 'bass', name: 'Bass', color: '#10B981', type: 'recorded' },
  { id: 'harmony', name: 'Harmony', color: '#8B5CF6', type: 'recorded' },
  { id: 'sfx', name: 'SFX', color: '#F59E0B', type: 'sfx' },
  { id: 'loops', name: 'Loops', color: '#EF4444', type: 'loop' },
];
