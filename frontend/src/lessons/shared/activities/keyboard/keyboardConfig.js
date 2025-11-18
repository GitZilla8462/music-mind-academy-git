// keyboardConfig.js
// Configuration for virtual keyboard activity

// Note mappings - TWO OCTAVES: C3 to C5 (25 keys total)
// Lower octave uses bottom row: Z-M keys
// Upper octave uses top row: Q-I keys
export const notes = [
  // Lower Octave (C3 - B3) - 12 notes
  { note: 'C3', key: 'Z', isWhite: true, label: 'C', octave: 'lower' },
  { note: 'C#3', key: 'S', isWhite: false, label: 'C#', octave: 'lower' },
  { note: 'D3', key: 'X', isWhite: true, label: 'D', octave: 'lower' },
  { note: 'D#3', key: 'D', isWhite: false, label: 'D#', octave: 'lower' },
  { note: 'E3', key: 'C', isWhite: true, label: 'E', octave: 'lower' },
  { note: 'F3', key: 'V', isWhite: true, label: 'F', octave: 'lower' },
  { note: 'F#3', key: 'G', isWhite: false, label: 'F#', octave: 'lower' },
  { note: 'G3', key: 'B', isWhite: true, label: 'G', octave: 'lower' },
  { note: 'G#3', key: 'H', isWhite: false, label: 'G#', octave: 'lower' },
  { note: 'A3', key: 'N', isWhite: true, label: 'A', octave: 'lower' },
  { note: 'A#3', key: 'J', isWhite: false, label: 'A#', octave: 'lower' },
  { note: 'B3', key: 'M', isWhite: true, label: 'B', octave: 'lower' },
  
  // Upper Octave (C4 - C5) - 13 notes (includes the extra C)
  { note: 'C4', key: 'Q', isWhite: true, label: 'C', octave: 'upper' },
  { note: 'C#4', key: '2', isWhite: false, label: 'C#', octave: 'upper' },
  { note: 'D4', key: 'W', isWhite: true, label: 'D', octave: 'upper' },
  { note: 'D#4', key: '3', isWhite: false, label: 'D#', octave: 'upper' },
  { note: 'E4', key: 'E', isWhite: true, label: 'E', octave: 'upper' },
  { note: 'F4', key: 'R', isWhite: true, label: 'F', octave: 'upper' },
  { note: 'F#4', key: '5', isWhite: false, label: 'F#', octave: 'upper' },
  { note: 'G4', key: 'T', isWhite: true, label: 'G', octave: 'upper' },
  { note: 'G#4', key: '6', isWhite: false, label: 'G#', octave: 'upper' },
  { note: 'A4', key: 'Y', isWhite: true, label: 'A', octave: 'upper' },
  { note: 'A#4', key: '7', isWhite: false, label: 'A#', octave: 'upper' },
  { note: 'B4', key: 'U', isWhite: true, label: 'B', octave: 'upper' },
  { note: 'C5', key: 'I', isWhite: true, label: 'C', octave: 'upper' }
];

// Synth type configurations
export const synthTypes = [
  {
    id: 'piano',
    name: '🎹 Piano',
    displayName: 'Piano',
    config: {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2
      }
    }
  },
  {
    id: 'synth',
    name: '🎵 Synth',
    displayName: 'Synthesizer',
    config: {
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.9,
        release: 0.5
      }
    }
  },
  {
    id: 'organ',
    name: '🎼 Electric Piano',
    displayName: 'Electric Piano',
    config: {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 1.0,
        release: 0.1
      }
    }
  },
  {
    id: 'strings',
    name: '🎻 Synth 2',
    displayName: 'Synth 2',
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.3,
        decay: 0.5,
        sustain: 0.8,
        release: 1.5
      }
    }
  }
];

export const defaultVolume = -10; // dB
export const noteDuration = '8n'; // eighth note