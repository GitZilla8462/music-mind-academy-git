// SimpleMelodyGrid.jsx - 3x4 melody grid with Beat Maker styling
// 3 rows (C, D, E) x 4 columns
// Column 1: C only, Columns 2-4: C, D, E
// Matches Beat Maker Escape Room tile styling exactly

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// Note configuration - C is bottom, E is top (like piano)
const NOTES = [
  { id: 'E4', name: 'E', color: '#10B981', row: 0 },  // Green - top
  { id: 'D4', name: 'D', color: '#F59E0B', row: 1 },  // Orange - middle
  { id: 'C4', name: 'C', color: '#EF4444', row: 2 },  // Red - bottom
];

const GRID_ROWS = 3;
const GRID_COLS = 4;

// Column constraints: which rows are available per column
// Column 0: only C (row 2), Columns 1-3: all notes (rows 0, 1, 2)
const COLUMN_CONSTRAINTS = {
  0: [2],        // Only C
  1: [0, 1, 2],  // E, D, C
  2: [0, 1, 2],  // E, D, C
  3: [0, 1, 2],  // E, D, C
};

// Create empty grid
export const createEmptySimpleGrid = () => {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
};

// Toggle cell with one-note-per-column constraint
export const toggleSimpleCell = (grid, row, col) => {
  const newGrid = grid.map(r => [...r]);

  // Check if this row is allowed in this column
  if (!COLUMN_CONSTRAINTS[col]?.includes(row)) {
    return grid; // Not allowed, return unchanged
  }

  // If clicking on an already-active cell, just turn it off
  if (newGrid[row][col]) {
    newGrid[row][col] = false;
    return newGrid;
  }

  // Clear entire column first, then activate clicked cell
  for (let r = 0; r < GRID_ROWS; r++) {
    newGrid[r][col] = false;
  }
  newGrid[row][col] = true;

  return newGrid;
};

// Count active notes
export const countSimpleNotes = (grid) => {
  let count = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col]) count++;
    }
  }
  return count;
};

// Get contour (melodic shape) as array of row indices per column
export const getSimpleContour = (grid) => {
  const contour = [];
  for (let col = 0; col < GRID_COLS; col++) {
    let foundRow = -1;
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        foundRow = row;
        break;
      }
    }
    contour.push(foundRow);
  }
  return contour;
};

// Check if grids match exactly
export const simpleGridsMatch = (grid1, grid2) => {
  if (!grid1 || !grid2) return false;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid1[row][col] !== grid2[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Compare contours - returns percentage match
export const compareSimpleContours = (grid1, grid2) => {
  const contour1 = getSimpleContour(grid1);
  const contour2 = getSimpleContour(grid2);

  let matches = 0;
  let total = 0;

  for (let col = 0; col < GRID_COLS; col++) {
    if (contour1[col] !== -1 && contour2[col] !== -1) {
      total++;
      if (contour1[col] === contour2[col]) {
        matches++;
      }
    } else if (contour1[col] !== -1 || contour2[col] !== -1) {
      total++;
    }
  }

  return total > 0 ? (matches / total) * 100 : 0;
};

// Calculate score with partial credit
export const calculateSimpleScore = (userGrid, targetGrid) => {
  if (simpleGridsMatch(userGrid, targetGrid)) {
    return { points: 100, stars: 3, message: 'Perfect!' };
  }

  const contourMatch = compareSimpleContours(userGrid, targetGrid);

  if (contourMatch >= 80) {
    return { points: 75, stars: 2, message: 'Great contour!' };
  } else if (contourMatch >= 50) {
    return { points: 50, stars: 1, message: 'Getting there!' };
  } else {
    return { points: 25, stars: 0, message: 'Keep trying!' };
  }
};

// ========================================
// DEVICE-SPECIFIC SOUND CONFIGURATIONS
// ========================================

// Each device has dramatically different audio character
// - octaveShift: moves notes up/down for pitch character
// - synthType: 'basic', 'fm', 'am', 'duo', 'membrane', 'metal', 'pluck'
// - oscType: sine, square, triangle, sawtooth, pulse, pwm
// - Envelope: attack, decay, sustain, release
// - Effects: filter, distortion, tremolo, chorus, delay, reverb, bitcrusher, phaser

const DEVICE_SOUNDS = {
  // === MUSIC BOX === Delicate, crystalline, high-pitched celesta-like
  musicbox: {
    octaveShift: 2,
    synthType: 'fm',
    harmonicity: 12,
    modulationIndex: 4,
    envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 2 },
    effects: { reverb: 0.5, highpass: 800 }
  },

  // === GRAMOPHONE === Scratchy, wobbly, vintage crackle
  gramophone: {
    octaveShift: -1,
    synthType: 'basic',
    oscType: 'sawtooth',
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.6 },
    effects: { bandpass: 1200, bandpassQ: 2, distortion: 0.4, wobble: 0.15, reverb: 0.2 }
  },

  // === RECORD PLAYER === Warm vinyl, slight wow/flutter
  recordplayer: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.03, decay: 0.3, sustain: 0.4, release: 0.8 },
    effects: { lowpass: 4000, distortion: 0.1, wobble: 0.08, reverb: 0.15 }
  },

  // === RADIO === AM radio sound, louder and clearer
  radio: {
    octaveShift: 0,
    synthType: 'am',
    harmonicity: 2,
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.6 },
    effects: { lowpass: 4000, distortion: 0.08, gain: 1.5 }
  },

  // === TUBE RADIO === Warmer, richer radio sound
  tuberadio: {
    octaveShift: 0,
    synthType: 'am',
    harmonicity: 1.5,
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.5, release: 0.7 },
    effects: { bandpass: 1400, bandpassQ: 2, distortion: 0.2, reverb: 0.1 }
  },

  // === PORTABLE RADIO === Tiny speaker, tinny
  portableradio: {
    octaveShift: 1,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
    effects: { bandpass: 2500, bandpassQ: 4, distortion: 0.1 }
  },

  // === RADIO CABINET === Rich, room-filling
  radiocabinet: {
    octaveShift: -1,
    synthType: 'am',
    harmonicity: 2,
    envelope: { attack: 0.03, decay: 0.4, sustain: 0.5, release: 1 },
    effects: { lowpass: 3000, reverb: 0.3 }
  },

  // === CUBE RADIO === Digital, modern small speaker
  cuberadio: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'pulse',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
    effects: { bandpass: 2200, bandpassQ: 2 }
  },

  // === PAYPHONE === DTMF-like, telephone quality
  payphone: {
    octaveShift: 1,
    synthType: 'duo',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    effects: { bandpass: 1200, bandpassQ: 6 }
  },

  // === WALKIE TALKIE === Harsh, compressed, static
  walkietalkie: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.6, release: 0.1 },
    effects: { bandpass: 1600, bandpassQ: 5, distortion: 0.5, bitcrush: 6 }
  },

  // === MEGAPHONE === Distorted, honky, mid-range
  megaphone: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    effects: { bandpass: 1000, bandpassQ: 4, distortion: 0.6 }
  },

  // === BOOMBOX === Punchy bass, 80s character
  boombox: {
    octaveShift: -1,
    synthType: 'basic',
    oscType: 'sawtooth',
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.5 },
    effects: { lowpass: 6000, bassBoost: 8, distortion: 0.15 }
  },

  // === JUKEBOX === Warm, nostalgic, full sound
  jukebox: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 1 },
    effects: { lowpass: 5000, reverb: 0.35, chorus: true }
  },

  // === REEL TO REEL === Tape warmth, slight saturation
  reeltoreel: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.03, decay: 0.35, sustain: 0.45, release: 0.9 },
    effects: { lowpass: 6000, distortion: 0.12, wobble: 0.04, reverb: 0.1 }
  },

  // === TAPE RECORDER === Warmer, more saturated
  taperecorder: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.4, release: 0.7 },
    effects: { lowpass: 4000, distortion: 0.2, wobble: 0.06 }
  },

  // === CASSETTE PLAYER === Lo-fi, hissy, wobbly
  cassetteplayer: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.03, decay: 0.25, sustain: 0.35, release: 0.5 },
    effects: { lowpass: 3500, distortion: 0.25, wobble: 0.1 }
  },

  // === WALKMAN === Intimate, personal, slight flutter
  walkman: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.6 },
    effects: { lowpass: 4500, wobble: 0.05 }
  },

  // === AMPLIFIER === Overdriven tube amp
  amplifier: {
    octaveShift: -1,
    synthType: 'basic',
    oscType: 'sawtooth',
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.8 },
    effects: { lowpass: 4000, distortion: 0.4, reverb: 0.2 }
  },

  // === SPEAKER === Clean, neutral reference
  speaker: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.4, release: 0.6 },
    effects: { reverb: 0.15 }
  },

  // === METRONOME === Sharp, percussive click
  metronome: {
    octaveShift: 2,
    synthType: 'metal',
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    effects: {}
  },

  // === HEADPHONES === Clean, detailed, intimate
  headphones: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'sine',
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 1 },
    effects: { reverb: 0.05 }
  },

  // === MICROPHONE === Clean with room ambience
  microphone: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'sine',
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
    effects: { reverb: 0.25 }
  },

  // === LANTERN === Morse code beeps, mysterious
  lantern: {
    octaveShift: 1,
    synthType: 'basic',
    oscType: 'sine',
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
    effects: { reverb: 0.4, delay: 0.3 }
  },

  // === ARCADE === 8-bit chiptune, retro game
  arcade: {
    octaveShift: 1,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.1 },
    effects: { bitcrush: 4, delay: 0.15 }
  },

  // === SYNTHESIZER === Fat analog synth
  synthesizer: {
    octaveShift: -1,
    synthType: 'duo',
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.6, release: 1.2 },
    effects: { lowpass: 3000, phaser: true, reverb: 0.2 }
  },

  // === COMPUTER === Digital beeps
  computer: {
    octaveShift: 1,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.1 },
    effects: { bitcrush: 8 }
  },

  // === INTERCOM === Compressed, speaker-like
  intercom: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.2 },
    effects: { bandpass: 1400, bandpassQ: 3, distortion: 0.2 }
  },

  // === TELEGRAPH === Morse code dots/dashes
  telegraph: {
    octaveShift: 2,
    synthType: 'basic',
    oscType: 'sine',
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    effects: { bandpass: 800, bandpassQ: 8 }
  },

  // === ALARM CLOCK === Harsh wake-up beep
  alarmclock: {
    octaveShift: 2,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.001, decay: 0.02, sustain: 0.8, release: 0.02 },
    effects: { distortion: 0.1 }
  },

  // === BELL === Church/school bell
  bell: {
    octaveShift: 1,
    synthType: 'metal',
    envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 2 },
    effects: { reverb: 0.5 }
  },

  // === SHIP RADIO === Maritime radio, static-filled
  shipradio: {
    octaveShift: 0,
    synthType: 'am',
    harmonicity: 3,
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.4, release: 0.4 },
    effects: { bandpass: 1600, bandpassQ: 4, distortion: 0.25, tremolo: 6 }
  },

  // === PHONE === Generic telephone
  phone: {
    octaveShift: 1,
    synthType: 'duo',
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 },
    effects: { bandpass: 1400, bandpassQ: 5 }
  },

  // === KEYBOARD === Electronic keyboard
  keyboard: {
    octaveShift: 0,
    synthType: 'fm',
    harmonicity: 2,
    modulationIndex: 1.5,
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.4, release: 1 },
    effects: { chorus: true, reverb: 0.15 }
  },

  // === TERMINAL === Computer terminal beeps
  terminal: {
    octaveShift: 1,
    synthType: 'basic',
    oscType: 'square',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.1 },
    effects: { bitcrush: 6, bandpass: 2000, bandpassQ: 2 }
  },

  // === DEFAULT === Clean triangle wave
  default: {
    octaveShift: 0,
    synthType: 'basic',
    oscType: 'triangle',
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
    effects: { reverb: 0.1 }
  }
};

// Get device config (with fallback to default)
const getDeviceConfig = (deviceId) => {
  if (!deviceId) return DEVICE_SOUNDS.default;
  // Normalize device ID (remove numbers, lowercase, remove spaces/dashes)
  const normalizedId = deviceId.toLowerCase().replace(/[\s\-_0-9]/g, '');
  return DEVICE_SOUNDS[normalizedId] || DEVICE_SOUNDS.default;
};

// ========================================
// AUDIO ENGINE
// ========================================

let currentSynth = null;
let currentEffects = [];
let currentDeviceId = null;
let audioInitialized = false;

// Create synth chain for a specific device
const createDeviceSynth = async (deviceId) => {
  const config = getDeviceConfig(deviceId);

  await Tone.start();

  // Dispose previous synth if exists
  disposeCurrentSynth();

  // Create base synth based on type
  let synth;
  const env = config.envelope;

  switch (config.synthType) {
    case 'fm':
      // FM synth for bell-like/music box sounds
      synth = new Tone.FMSynth({
        harmonicity: config.harmonicity || 8,
        modulationIndex: config.modulationIndex || 2,
        envelope: env,
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 }
      });
      break;

    case 'am':
      // AM synth for radio-like sounds
      synth = new Tone.AMSynth({
        harmonicity: config.harmonicity || 2,
        envelope: env,
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.2, decay: 0.1, sustain: 0.5, release: 0.3 }
      });
      break;

    case 'duo':
      // DuoSynth for thick, detuned sounds (telephone, synth)
      synth = new Tone.DuoSynth({
        vibratoAmount: 0.2,
        vibratoRate: 5,
        voice0: { oscillator: { type: 'sine' }, envelope: env },
        voice1: { oscillator: { type: 'sine' }, envelope: env }
      });
      break;

    case 'membrane':
      // Membrane synth for drum-like sounds
      synth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: env
      });
      break;

    case 'metal':
      // MetalSynth for bell/metallic sounds
      synth = new Tone.MetalSynth({
        frequency: 200,
        envelope: { ...env, sustain: 0 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      });
      break;

    case 'pluck':
      // PluckSynth for string-like sounds
      synth = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.9
      });
      break;

    case 'basic':
    default:
      // Standard synth with oscillator type
      synth = new Tone.Synth({
        oscillator: { type: config.oscType || 'triangle' },
        envelope: env
      });
      break;
  }

  // Build effects chain
  const effects = [];
  const fx = config.effects || {};

  // Gain boost (for quiet devices like radio)
  if (fx.gain && fx.gain !== 1) {
    const gain = new Tone.Gain(fx.gain);
    effects.push(gain);
  }

  // Bitcrusher (for digital/retro sounds) - apply early
  if (fx.bitcrush) {
    const crusher = new Tone.BitCrusher(fx.bitcrush);
    effects.push(crusher);
  }

  // Filters
  if (fx.highpass) {
    const hp = new Tone.Filter({ type: 'highpass', frequency: fx.highpass, Q: 0.5 });
    effects.push(hp);
  }
  if (fx.lowpass) {
    const lp = new Tone.Filter({ type: 'lowpass', frequency: fx.lowpass, Q: 0.5 });
    effects.push(lp);
  }
  if (fx.bandpass) {
    const bp = new Tone.Filter({ type: 'bandpass', frequency: fx.bandpass, Q: fx.bandpassQ || 2 });
    effects.push(bp);
  }

  // Distortion
  if (fx.distortion) {
    const dist = new Tone.Distortion({ distortion: fx.distortion, wet: 0.6 });
    effects.push(dist);
  }

  // Bass boost EQ
  if (fx.bassBoost) {
    const eq = new Tone.EQ3({ low: fx.bassBoost, mid: 0, high: -2 });
    effects.push(eq);
  }

  // Wobble/flutter (for vinyl/tape)
  if (fx.wobble) {
    const vib = new Tone.Vibrato({ frequency: 3 + Math.random() * 2, depth: fx.wobble });
    effects.push(vib);
  }

  // Tremolo (for AM radio effect)
  if (fx.tremolo) {
    const trem = new Tone.Tremolo({ frequency: fx.tremolo, depth: 0.3 }).start();
    effects.push(trem);
  }

  // Phaser (for synth sounds)
  if (fx.phaser) {
    const phase = new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 350 });
    effects.push(phase);
  }

  // Chorus (for jukebox warmth)
  if (fx.chorus) {
    const chor = new Tone.Chorus({ frequency: 2, delayTime: 3.5, depth: 0.5 }).start();
    effects.push(chor);
  }

  // Delay
  if (fx.delay) {
    const del = new Tone.FeedbackDelay({ delayTime: '8n', feedback: fx.delay, wet: 0.3 });
    effects.push(del);
  }

  // Reverb (apply last)
  if (fx.reverb) {
    const rev = new Tone.Reverb({ decay: 2, wet: fx.reverb });
    await rev.generate();
    effects.push(rev);
  }

  // Connect chain: synth -> effects -> destination
  if (effects.length > 0) {
    synth.chain(...effects, Tone.Destination);
  } else {
    synth.toDestination();
  }

  currentSynth = synth;
  currentEffects = effects;
  currentDeviceId = deviceId;
  audioInitialized = true;

  console.log(`🔊 Device sound: ${deviceId || 'default'} (${config.synthType}, octave ${config.octaveShift > 0 ? '+' : ''}${config.octaveShift})`);
};

// Dispose current synth and effects
const disposeCurrentSynth = () => {
  try {
    currentSynth?.dispose();
    currentEffects?.forEach(effect => effect.dispose());
  } catch (e) { /* ignore */ }
  currentSynth = null;
  currentEffects = null;
};

// Shift a note by octaves (e.g., "C4" + 2 = "C6")
const shiftNoteOctave = (noteId, octaveShift) => {
  if (!octaveShift || octaveShift === 0) return noteId;
  const match = noteId.match(/^([A-G]#?)(\d+)$/);
  if (!match) return noteId;
  const [, noteName, octave] = match;
  const newOctave = Math.max(1, Math.min(8, parseInt(octave) + octaveShift));
  return `${noteName}${newOctave}`;
};

// Initialize audio with optional device
const initAudio = async (deviceId = null) => {
  // If same device already initialized, skip
  if (audioInitialized && deviceId === currentDeviceId) return;

  await createDeviceSynth(deviceId);
};

// Play a single note with current device
const playNote = async (noteId, deviceId = null) => {
  await initAudio(deviceId);

  // Apply octave shift from device config
  const config = getDeviceConfig(deviceId);
  const shiftedNote = shiftNoteOctave(noteId, config.octaveShift);

  // MetalSynth uses frequency, not note names
  if (config.synthType === 'metal') {
    // Convert note to frequency for MetalSynth
    const freq = Tone.Frequency(shiftedNote).toFrequency();
    currentSynth?.triggerAttackRelease(freq, '8n');
  } else {
    currentSynth?.triggerAttackRelease(shiftedNote, '8n');
  }
};

// Play entire grid with optional device sound
export const playSimpleGrid = async (grid, bpm = 120, onBeatChange, deviceId = null) => {
  await initAudio(deviceId);

  const config = getDeviceConfig(deviceId);
  const interval = (60 / bpm) * 1000 / 2; // 8th notes

  for (let col = 0; col < GRID_COLS; col++) {
    if (onBeatChange) onBeatChange(col);

    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        const shiftedNote = shiftNoteOctave(NOTES[row].id, config.octaveShift);

        // MetalSynth uses frequency
        if (config.synthType === 'metal') {
          const freq = Tone.Frequency(shiftedNote).toFrequency();
          currentSynth?.triggerAttackRelease(freq, '8n');
        } else {
          currentSynth?.triggerAttackRelease(shiftedNote, '8n');
        }
        break; // One note per column
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (onBeatChange) onBeatChange(-1);
};

// Cleanup synth
export const disposeSimpleSynth = () => {
  disposeCurrentSynth();
  currentDeviceId = null;
  audioInitialized = false;
};

// Export for external use
export const initDeviceSound = initAudio;
export const getAvailableDeviceSounds = () => Object.keys(DEVICE_SOUNDS);

const SimpleMelodyGrid = ({
  grid,
  onToggle,
  disabled = false,
  currentBeat = -1,  // For playback animation (progress bar)
  highlightCells = true,  // Whether to highlight grid cells during playback (false for Signal)
  showLabels = true,
  className = '',
  revealedCols = [],   // Columns revealed as hints (locked, show correct answer)
  targetGrid = null,   // The correct answer grid (for showing X marks)
}) => {
  const [triggeredCells, setTriggeredCells] = useState({});

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  // Handle cell click
  const handleCellClick = async (row, col) => {
    if (disabled) return;

    // Check if this column is revealed (hint) - can't change revealed columns
    if (revealedCols.includes(col)) return;

    // Check if allowed
    if (!COLUMN_CONSTRAINTS[col]?.includes(row)) return;

    // Play note
    await playNote(NOTES[row].id);

    // Toggle cell
    if (onToggle) {
      const newGrid = toggleSimpleCell(grid, row, col);
      onToggle(newGrid);
    }
  };

  // Trigger animation when currentBeat changes
  useEffect(() => {
    if (currentBeat >= 0 && currentBeat < GRID_COLS) {
      // Find which cell is active in this column
      for (let row = 0; row < GRID_ROWS; row++) {
        if (grid[row][currentBeat]) {
          setTriggeredCells({ [`${row}-${currentBeat}`]: true });
          setTimeout(() => setTriggeredCells({}), 80);
          break;
        }
      }
    }
  }, [currentBeat, grid]);

  const renderCell = (row, col) => {
    const note = NOTES[row];
    const isActive = grid[row][col];
    const isCurrentBeat = currentBeat === col && highlightCells;  // Only highlight cells if highlightCells is true
    const isTriggered = triggeredCells[`${row}-${col}`] && highlightCells;  // Only trigger animation if highlighting
    const isAllowed = COLUMN_CONSTRAINTS[col]?.includes(row);
    const isRevealed = revealedCols.includes(col);

    // For revealed columns, check if this cell should show X (cell is OFF in target)
    const isRevealedAsOff = isRevealed && targetGrid && !targetGrid[row][col] && isAllowed;

    // If not allowed in this column, render empty/hidden cell
    if (!isAllowed) {
      return (
        <div
          key={`${row}-${col}`}
          className="flex-1 aspect-square"
          style={{ visibility: 'hidden' }}
        />
      );
    }

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={disabled || isRevealed}
        className={`
          flex-1 aspect-square rounded-lg relative flex items-center justify-center
          ${!isChromebook ? 'transition-all duration-75' : ''}
          ${disabled || isRevealed ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isCurrentBeat ? 'ring-2 ring-white' : ''}
          ${isRevealed ? 'ring-2 ring-amber-400' : ''}
        `}
        style={{
          backgroundColor: isActive ? note.color : '#475569',
          boxShadow: isActive && isTriggered
            ? `0 0 20px ${note.color}, 0 0 40px ${note.color}`
            : isActive
              ? `0 0 8px ${note.color}40`
              : 'none',
          transform: isActive && isTriggered ? 'scale(1.1)' : 'scale(1)',
          minHeight: '48px',
          minWidth: '48px',
          opacity: disabled && !isActive ? 0.5 : 1,
        }}
      >
        {/* White dot indicator when active - matches Beat Maker */}
        {isActive && (
          <div
            className="w-2.5 h-2.5 rounded-full bg-white"
            style={{ opacity: isTriggered ? 1 : 0.7 }}
          />
        )}
        {/* Red X for revealed cells that should be OFF */}
        {isRevealedAsOff && (
          <svg
            className="absolute w-full h-full p-2 pointer-events-none"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))' }}
          >
            <line
              x1="4" y1="4" x2="20" y2="20"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="20" y1="4" x2="4" y2="20"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div className={`simple-melody-grid ${className}`}>
      {/* Beat column labels */}
      {showLabels && (
        <div className="flex items-center gap-1 mb-2">
          <div className="w-10" /> {/* Spacer for note labels */}
          {Array.from({ length: GRID_COLS }, (_, col) => (
            <div
              key={col}
              className={`flex-1 text-center text-sm font-bold ${
                currentBeat === col
                  ? 'text-white scale-110'
                  : col === 0
                    ? 'text-green-400'
                    : 'text-gray-400'
              }`}
              style={{
                minWidth: '48px',
                transition: !isChromebook ? 'all 150ms' : 'none',
              }}
            >
              {col + 1}
            </div>
          ))}
        </div>
      )}

      {/* Grid rows */}
      <div className="space-y-1">
        {NOTES.map((note, row) => (
          <div key={note.id} className="flex items-center gap-1">
            {/* Note label */}
            {showLabels && (
              <div
                className="w-10 text-right pr-2 font-bold text-sm"
                style={{ color: note.color }}
              >
                {note.name}
              </div>
            )}

            {/* Beat cells */}
            <div className="flex gap-1 flex-1">
              {Array.from({ length: GRID_COLS }, (_, col) => renderCell(row, col))}
            </div>
          </div>
        ))}
      </div>

      {/* Playback indicator bar */}
      <div className="flex items-center gap-1 mt-3">
        {showLabels && <div className="w-10" />}
        <div className="flex gap-1 flex-1">
          {Array.from({ length: GRID_COLS }, (_, col) => (
            <div
              key={col}
              className="flex-1 h-1.5 rounded-full"
              style={{
                backgroundColor: currentBeat === col ? '#ffffff' : '#334155',
                boxShadow: currentBeat === col ? '0 0 8px #ffffff' : 'none',
                minWidth: '48px',
                transition: !isChromebook ? 'all 150ms' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Column 1 instruction */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>Beat 1 starts on C • Beats 2-4 can be C, D, or E</p>
      </div>
    </div>
  );
};

export default SimpleMelodyGrid;
export { NOTES, GRID_ROWS, GRID_COLS, COLUMN_CONSTRAINTS };
