// File: /src/lessons/shared/activities/layer-lab/audioEngine.js
// Tone.js audio engine for Layer Lab

import * as Tone from 'tone';
import { INSTRUMENT_SOUNDS, DRUM_KITS, SCALES } from './trackConfig';

// ============================================================================
// AUDIO ENGINE CLASS
// ============================================================================

class AudioEngine {
  constructor() {
    this.isInitialized = false;
    this.synths = {};
    this.drumKits = {};
    this.currentScale = 'pentatonic';
    this.currentOctaveOffset = 0;
  }

  // Initialize Tone.js and create all instruments
  async init() {
    if (this.isInitialized) return;
    
    await Tone.start();
    console.log('🎵 Audio engine initialized');
    
    // Pre-create synths for each track type
    this.createMelodySynths();
    this.createHarmonySynths();
    this.createBassSynths();
    this.createDrumKits();
    
    this.isInitialized = true;
  }

  // Create melody synths (all variations)
  createMelodySynths() {
    Object.entries(INSTRUMENT_SOUNDS.melody).forEach(([key, config]) => {
      this.synths[`melody_${key}`] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: config.type },
        envelope: {
          attack: config.attack,
          decay: config.decay,
          sustain: config.sustain,
          release: config.release
        },
        volume: -10
      }).toDestination();
    });
  }

  // Create harmony synths
  createHarmonySynths() {
    Object.entries(INSTRUMENT_SOUNDS.harmony).forEach(([key, config]) => {
      this.synths[`harmony_${key}`] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: config.type },
        envelope: {
          attack: config.attack,
          decay: config.decay,
          sustain: config.sustain,
          release: config.release
        },
        volume: -12
      }).toDestination();
    });
  }

  // Create bass synths
  createBassSynths() {
    Object.entries(INSTRUMENT_SOUNDS.bass).forEach(([key, config]) => {
      this.synths[`bass_${key}`] = new Tone.MonoSynth({
        oscillator: { type: config.type },
        envelope: {
          attack: config.attack,
          decay: config.decay,
          sustain: config.sustain,
          release: config.release
        },
        filter: {
          Q: 2,
          type: 'lowpass',
          rolloff: -24
        },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
          baseFrequency: 100,
          octaves: 2
        },
        volume: -6
      }).toDestination();
    });
  }

  // Create drum kits
  createDrumKits() {
    Object.entries(DRUM_KITS).forEach(([kitName, kit]) => {
      this.drumKits[kitName] = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 6,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: kit.sounds.kick.decay,
            sustain: 0.01,
            release: kit.sounds.kick.decay
          },
          volume: -4
        }).toDestination(),
        
        snare: new Tone.NoiseSynth({
          noise: { type: kit.sounds.snare.noise || 'white' },
          envelope: {
            attack: 0.001,
            decay: kit.sounds.snare.decay,
            sustain: 0,
            release: kit.sounds.snare.decay
          },
          volume: -10
        }).toDestination(),
        
        hihat: new Tone.MetalSynth({
          frequency: kit.sounds.hihat.freq,
          envelope: {
            attack: 0.001,
            decay: kit.sounds.hihat.decay,
            release: 0.01
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5,
          volume: -18
        }).toDestination(),
        
        tom: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: kit.sounds.tom.decay,
            sustain: 0.01,
            release: kit.sounds.tom.decay
          },
          volume: -8
        }).toDestination(),
        
        // Additional percussion for second drum track
        shaker: new Tone.NoiseSynth({
          noise: { type: 'pink' },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
          volume: -16
        }).toDestination(),
        
        clap: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
          volume: -12
        }).toDestination(),
        
        cowbell: new Tone.MetalSynth({
          frequency: 560,
          envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
          harmonicity: 2,
          modulationIndex: 10,
          resonance: 2000,
          octaves: 0.5,
          volume: -16
        }).toDestination(),
        
        conga: new Tone.MembraneSynth({
          pitchDecay: 0.03,
          octaves: 3,
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.15 },
          volume: -10
        }).toDestination()
      };
    });
  }

  // Get note from scale
  getNoteFromScale(scaleName, noteIndex, octave) {
    const scale = SCALES[scaleName] || SCALES.pentatonic;
    const noteInScale = noteIndex % scale.notes.length;
    const octaveOffset = Math.floor(noteIndex / scale.notes.length);
    return scale.notes[noteInScale] + (octave + octaveOffset);
  }

  // Play a melodic note
  playMelodicNote(trackType, soundName, noteIndex, octave, time = Tone.now(), duration = '8n') {
    const synthKey = `${trackType}_${soundName}`;
    const synth = this.synths[synthKey];
    
    if (!synth) {
      console.warn(`Synth not found: ${synthKey}`);
      return;
    }
    
    const note = this.getNoteFromScale(this.currentScale, noteIndex, octave);
    synth.triggerAttackRelease(note, duration, time);
  }

  // Play a drum hit
  playDrumHit(kitName, drumType, time = Tone.now()) {
    const kit = this.drumKits[kitName];
    if (!kit) {
      console.warn(`Drum kit not found: ${kitName}`);
      return;
    }
    
    const drumTypeMap = {
      0: 'hihat',
      1: 'snare', 
      2: 'kick',
      3: 'tom',
      // Percussion track
      'shaker': 'shaker',
      'clap': 'clap',
      'cowbell': 'cowbell',
      'conga': 'conga'
    };
    
    const drum = kit[drumTypeMap[drumType] || drumType];
    if (!drum) return;
    
    if (drumType === 2 || drumType === 3 || drumType === 'conga') {
      // Membrane synths need a pitch
      const pitch = drumType === 2 ? 'C1' : drumType === 3 ? 'G2' : 'C3';
      drum.triggerAttackRelease(pitch, '8n', time);
    } else {
      // Noise and metal synths
      drum.triggerAttackRelease('8n', time);
    }
  }

  // Play percussion hit
  playPercussionHit(kitName, percType, time = Tone.now()) {
    const kit = this.drumKits[kitName];
    if (!kit) return;
    
    const percMap = ['shaker', 'clap', 'cowbell', 'conga'];
    const drum = kit[percMap[percType]];
    
    if (!drum) return;
    
    if (percType === 3) {
      drum.triggerAttackRelease('C3', '8n', time);
    } else {
      drum.triggerAttackRelease('8n', time);
    }
  }

  // Set the current scale
  setScale(scaleName) {
    this.currentScale = scaleName;
  }

  // Set BPM
  setBPM(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  // Start transport
  start() {
    Tone.Transport.start();
  }

  // Stop transport
  stop() {
    Tone.Transport.stop();
  }

  // Dispose all synths (cleanup)
  dispose() {
    Object.values(this.synths).forEach(synth => synth.dispose());
    Object.values(this.drumKits).forEach(kit => {
      Object.values(kit).forEach(drum => drum.dispose());
    });
    this.synths = {};
    this.drumKits = {};
    this.isInitialized = false;
  }
}

// Singleton instance
let audioEngineInstance = null;

export const getAudioEngine = () => {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
};

export default AudioEngine;