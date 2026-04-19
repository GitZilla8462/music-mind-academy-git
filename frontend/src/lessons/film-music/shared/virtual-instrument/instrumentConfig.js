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
// INSTRUMENT SOUND PACKS (PolySynth configs)
// ========================================
export const INSTRUMENTS = {
  piano: {
    id: 'piano',
    name: 'Piano',
    icon: 'Piano',
    trackTarget: 'motif',
    config: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
    }
  },
  strings: {
    id: 'strings',
    name: 'Strings',
    icon: 'Music',
    trackTarget: 'motif',
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.0 }
    }
  },
  brass: {
    id: 'brass',
    name: 'Brass',
    icon: 'Volume2',
    trackTarget: 'motif',
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.4 }
    }
  },
  woodwind: {
    id: 'woodwind',
    name: 'Woodwind',
    icon: 'Wind',
    trackTarget: 'motif',
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
    config: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.5, decay: 0.8, sustain: 0.9, release: 1.5 }
    }
  },
  plucked: {
    id: 'plucked',
    name: 'Plucked',
    icon: 'Guitar',
    trackTarget: 'motif',
    config: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.05, release: 0.4 }
    }
  },
  choir: {
    id: 'choir',
    name: 'Choir',
    icon: 'Users',
    trackTarget: 'motif',
    config: {
      oscillator: { type: 'sine', detune: 8 },
      envelope: { attack: 0.4, decay: 0.6, sustain: 0.7, release: 1.2 }
    }
  },
  bass: {
    id: 'bass',
    name: 'Electric Bass',
    icon: 'Activity',
    trackTarget: 'bass',
    // Bass plays one octave lower — handled by octave shift in the keyboard
    octaveShift: -2,
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.3 }
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
// TRACK DEFINITIONS
// ========================================
export const TRACK_DEFS = [
  { id: 'motif', name: 'Melody', color: '#3B82F6', type: 'recorded' },
  { id: 'bass', name: 'Bass', color: '#10B981', type: 'recorded' },
  { id: 'harmony', name: 'Harmony', color: '#8B5CF6', type: 'recorded' },
  { id: 'sfx', name: 'SFX', color: '#F59E0B', type: 'sfx' },
  { id: 'loops', name: 'Loops', color: '#EF4444', type: 'loop' },
];
