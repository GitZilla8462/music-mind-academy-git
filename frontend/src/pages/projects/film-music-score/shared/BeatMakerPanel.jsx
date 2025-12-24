// File: BeatMakerPanel.jsx
// Compact beat maker panel for the Film Music Score DAW
// Features: 5 drum tracks, 3 kits, 16/32 steps, WAV export
// Chromebook optimized: 44px touch targets, efficient rendering

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Plus, X, ChevronDown, Circle, Disc, Waves, Hand, CircleDot } from 'lucide-react';
import * as Tone from 'tone';

// DAW-style icons for each instrument
const INSTRUMENT_ICONS = {
  kick: Circle,      // Solid circle for bass drum
  snare: Disc,       // Disc for snare
  hihat: Waves,      // Waves for hi-hat
  clap: Hand,        // Hand for clap
  openhat: CircleDot // Circle with dot for open hat
};

// Drum track configuration (KK on top, OH on bottom)
const INSTRUMENTS = [
  { id: 'kick', name: 'Kick', color: '#a855f7', shortName: 'KK' },
  { id: 'snare', name: 'Snare', color: '#f97316', shortName: 'SN' },
  { id: 'hihat', name: 'Hi-Hat', color: '#06b6d4', shortName: 'HH' },
  { id: 'clap', name: 'Clap', color: '#ec4899', shortName: 'CP' },
  { id: 'openhat', name: 'Open Hat', color: '#22c55e', shortName: 'OH' }
];

// Kit presets with synth parameters
const KITS = {
  electronic: {
    name: 'Electronic',
    synths: {
      kick: { pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } },
      snare: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } },
      clap: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.15 } },
      hihat: { frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10 },
      openhat: { frequency: 180, envelope: { attack: 0.001, decay: 0.3, release: 0.1 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -8 }
    }
  },
  acoustic: {
    name: 'Acoustic',
    synths: {
      kick: { pitchDecay: 0.08, octaves: 3, envelope: { attack: 0.002, decay: 0.3, sustain: 0.02, release: 0.8 } },
      snare: { noise: { type: 'pink' }, envelope: { attack: 0.002, decay: 0.25, sustain: 0.02, release: 0.25 } },
      clap: { noise: { type: 'brown' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.01, release: 0.2 } },
      hihat: { frequency: 300, envelope: { attack: 0.002, decay: 0.08, release: 0.02 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 1.2, volume: -12 },
      openhat: { frequency: 280, envelope: { attack: 0.002, decay: 0.4, release: 0.15 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 1.2, volume: -10 }
    }
  },
  '808': {
    name: '808',
    synths: {
      kick: { pitchDecay: 0.15, octaves: 6, envelope: { attack: 0.001, decay: 0.8, sustain: 0.01, release: 2 } },
      snare: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 } },
      clap: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } },
      hihat: { frequency: 250, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 6, modulationIndex: 40, resonance: 5000, octaves: 2, volume: -8 },
      openhat: { frequency: 220, envelope: { attack: 0.001, decay: 0.25, release: 0.08 }, harmonicity: 6, modulationIndex: 40, resonance: 5000, octaves: 2, volume: -6 }
    }
  }
};

// Mood presets with BPM (matched to loop library)
// BPM calculated from loop durations: BPM = (beats / duration) × 60
// Upbeat loops: 7.5755s for 16 beats = 127 BPM
// Heroic loops: 17.53s for 32 beats = 110 BPM
// Scary/Mysterious/Hype loops: ~13.7s for 16 beats = 70 BPM
const MOODS = [
  { id: 'heroic', name: 'Heroic', emoji: '🦸', bpm: 110, color: '#f59e0b' },
  { id: 'upbeat', name: 'Upbeat', emoji: '🎉', bpm: 127, color: '#22c55e' },
  { id: 'hype', name: 'Hype', emoji: '🔥', bpm: 70, color: '#ef4444' },
  { id: 'mysterious', name: 'Mysterious', emoji: '🔮', bpm: 70, color: '#8b5cf6' },
  { id: 'scary', name: 'Scary', emoji: '👻', bpm: 70, color: '#6b7280' }
];

// Preset patterns (order: kick, snare, hihat, clap, openhat)
const PRESETS = {
  basic: {
    name: 'Basic',
    pattern: [
      [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false], // kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // hihat
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // clap
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] // openhat
    ]
  },
  hiphop: {
    name: 'Hip-Hop',
    pattern: [
      [true, false, false, true, false, false, true, false, false, false, true, false, false, false, true, false], // kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true], // snare
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // hihat
      [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false], // clap
      [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] // openhat
    ]
  },
  house: {
    name: 'House',
    pattern: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // hihat
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // clap
      [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] // openhat
    ]
  }
};

// Convert AudioBuffer to WAV blob
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleave channels and write samples
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

const BeatMakerPanel = ({ onClose, onAddToProject, customLoopCount = 0, hideClap = false, hideCloseButton = false }) => {
  // Filter instruments based on hideClap prop
  const visibleInstruments = hideClap
    ? INSTRUMENTS.filter(inst => inst.id !== 'clap')
    : INSTRUMENTS;
  const [steps, setSteps] = useState(16);
  const [grid, setGrid] = useState(() => INSTRUMENTS.map(() => Array(16).fill(false)));
  const [kit, setKit] = useState('electronic');
  const [bpm, setBpm] = useState(120);
  const [selectedMood, setSelectedMood] = useState('heroic'); // Default to Heroic
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [audioReady, setAudioReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showKitDropdown, setShowKitDropdown] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Detect Chromebook for performance optimizations
  const isChromebook = navigator.userAgent.includes('CrOS');

  // Handle mood selection - sets BPM automatically
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setBpm(mood.bpm);
  };

  const synthsRef = useRef(null);
  const sequenceRef = useRef(null);
  const playerRef = useRef(null);  // For pre-rendered playback
  const stepIntervalRef = useRef(null);  // For visual step tracking
  const gridRef = useRef(grid);
  const drumSamplesRef = useRef(null); // Pre-rendered drum samples for fast export

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Update steps in grid when step count changes
  useEffect(() => {
    setGrid(prev => prev.map(row => {
      if (row.length === steps) return row;
      if (steps > row.length) {
        return [...row, ...Array(steps - row.length).fill(false)];
      }
      return row.slice(0, steps);
    }));
  }, [steps]);

  // Update BPM when it changes
  useEffect(() => {
    if (audioReady) {
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm, audioReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up pre-rendered player
      if (playerRef.current) {
        try { playerRef.current.stop(); playerRef.current.dispose(); } catch (e) { /* ignore */ }
      }
      // Clean up step interval
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      // Clean up sequence
      if (sequenceRef.current) {
        try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
      }
      // Clean up synths
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach(synth => {
          try { synth.dispose(); } catch (e) { /* ignore */ }
        });
      }
      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (e) { /* ignore */ }
    };
  }, []);

  // Create synths based on kit
  const createSynths = useCallback((kitName) => {
    const kitConfig = KITS[kitName];
    return {
      kick: new Tone.MembraneSynth(kitConfig.synths.kick).toDestination(),
      snare: new Tone.NoiseSynth(kitConfig.synths.snare).toDestination(),
      clap: new Tone.NoiseSynth(kitConfig.synths.clap).toDestination(),
      hihat: new Tone.MetalSynth(kitConfig.synths.hihat).toDestination(),
      openhat: new Tone.MetalSynth(kitConfig.synths.openhat).toDestination()
    };
  }, []);

  // Pre-render drum samples for fast export (Chromebook-friendly)
  const preRenderDrumSamples = useCallback(async (kitName) => {
    const kitConfig = KITS[kitName];
    const sampleDuration = 0.5; // 500ms per sample is plenty

    const renderSample = async (createSynth, triggerFn) => {
      return await Tone.Offline(({ transport }) => {
        const synth = createSynth();
        triggerFn(synth);
        transport.start(0);
      }, sampleDuration);
    };

    const samples = {
      kick: await renderSample(
        () => new Tone.MembraneSynth(kitConfig.synths.kick).toDestination(),
        (s) => s.triggerAttackRelease('C1', '8n', 0.01)
      ),
      snare: await renderSample(
        () => new Tone.NoiseSynth(kitConfig.synths.snare).toDestination(),
        (s) => s.triggerAttackRelease('16n', 0.01)
      ),
      clap: await renderSample(
        () => new Tone.NoiseSynth(kitConfig.synths.clap).toDestination(),
        (s) => s.triggerAttackRelease('16n', 0.01)
      ),
      hihat: await renderSample(
        () => new Tone.MetalSynth(kitConfig.synths.hihat).toDestination(),
        (s) => s.triggerAttackRelease('32n', 0.01)
      ),
      openhat: await renderSample(
        () => new Tone.MetalSynth(kitConfig.synths.openhat).toDestination(),
        (s) => s.triggerAttackRelease('16n', 0.01)
      )
    };

    return samples;
  }, []);

  // Initialize audio
  const initializeAudio = useCallback(async () => {
    // Set up optimized audio context for Chromebook
    if (isChromebook && Tone.context.state !== 'running') {
      try {
        // Use "playback" latencyHint for sustained playback on low-powered devices
        Tone.setContext(new Tone.Context({ latencyHint: 'playback' }));
        console.log('🖥️ Chromebook: Using playback latency mode');
      } catch (e) {
        console.warn('Could not set playback context:', e);
      }
    }

    // Always ensure synths exist (they can be lost after HMR)
    if (!synthsRef.current) {
      try {
        await Tone.start();
        Tone.Transport.bpm.value = bpm;
        synthsRef.current = createSynths(kit);
        console.log('🎵 Created playback synths');
      } catch (error) {
        console.error('Failed to create synths:', error);
        return false;
      }
    }

    // Pre-render samples for export if not already done
    if (!drumSamplesRef.current) {
      try {
        console.log('🥁 Pre-rendering drum samples...');
        drumSamplesRef.current = await preRenderDrumSamples(kit);
        console.log('✅ Drum samples ready');
      } catch (error) {
        console.error('Failed to pre-render samples:', error);
        // Non-fatal - export just won't work
      }
    }

    if (!audioReady) {
      setAudioReady(true);
    }
    return true;
  }, [audioReady, bpm, kit, createSynths, preRenderDrumSamples]);

  // Update synths when kit changes
  useEffect(() => {
    if (!audioReady || !synthsRef.current) return;

    // Dispose old synths
    Object.values(synthsRef.current).forEach(synth => {
      try { synth.dispose(); } catch (e) { /* ignore */ }
    });

    // Create new synths with new kit
    synthsRef.current = createSynths(kit);

    // Re-render drum samples for new kit
    preRenderDrumSamples(kit).then(samples => {
      drumSamplesRef.current = samples;
      console.log('✅ Drum samples updated for kit:', kit);
    });
  }, [kit, audioReady, createSynths, preRenderDrumSamples]);

  // Toggle cell
  const toggleCell = (instrumentIndex, stepIndex) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[instrumentIndex][stepIndex] = !newGrid[instrumentIndex][stepIndex];
      return newGrid;
    });
  };

  // Stop playback
  const stopPlayback = useCallback(() => {
    // Stop the pre-rendered player
    if (playerRef.current) {
      try {
        playerRef.current.stop();
        playerRef.current.dispose();
      } catch (e) { /* ignore */ }
      playerRef.current = null;
    }

    // Clear the step tracking interval
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }

    // Also stop any legacy sequence-based playback
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (e) { /* ignore */ }

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }

    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  // Pre-render the current pattern to an audio buffer
  const renderPatternToBuffer = useCallback(async () => {
    const samples = drumSamplesRef.current;
    if (!samples) {
      console.error('Drum samples not ready for playback');
      return null;
    }

    // Calculate duration for one bar
    const secondsPerBeat = 60 / bpm;
    const bars = steps === 16 ? 1 : 2;
    const duration = secondsPerBeat * 4 * bars;

    // Create output buffer
    const sampleRate = samples.kick.sampleRate;
    const outputLength = Math.ceil(duration * sampleRate);
    const outputBuffer = Tone.context.createBuffer(2, outputLength, sampleRate);
    const leftChannel = outputBuffer.getChannelData(0);
    const rightChannel = outputBuffer.getChannelData(1);

    const stepDuration = (60 / bpm) / 4;
    const baseOffset = 0.005;

    // Mix samples into output buffer
    for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
      const stepTime = baseOffset + (stepIndex * stepDuration);
      const startSample = Math.floor(stepTime * sampleRate);

      INSTRUMENTS.forEach((inst, instIndex) => {
        if (grid[instIndex][stepIndex]) {
          const sampleBuffer = samples[inst.id];
          if (!sampleBuffer) return;

          const sampleLeft = sampleBuffer.getChannelData(0);
          const sampleRight = sampleBuffer.numberOfChannels > 1
            ? sampleBuffer.getChannelData(1)
            : sampleLeft;

          // Mix sample into output
          for (let i = 0; i < sampleLeft.length && startSample + i < outputLength; i++) {
            leftChannel[startSample + i] += sampleLeft[i];
            rightChannel[startSample + i] += sampleRight[i];
          }
        }
      });
    }

    // Normalize to prevent clipping
    let maxSample = 0;
    for (let i = 0; i < outputLength; i++) {
      maxSample = Math.max(maxSample, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
    }
    if (maxSample > 1) {
      const scale = 0.95 / maxSample;
      for (let i = 0; i < outputLength; i++) {
        leftChannel[i] *= scale;
        rightChannel[i] *= scale;
      }
    }

    return { buffer: outputBuffer, duration };
  }, [bpm, steps, grid]);

  // Real-time playback for desktop (supports live editing)
  const startRealtimePlayback = async () => {
    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
    }

    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.position = 0;
    } catch (e) { /* ignore */ }

    const stepIndices = Array.from({ length: steps }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        const currentGrid = gridRef.current;

        INSTRUMENTS.forEach((inst, index) => {
          if (currentGrid[index][step]) {
            if (inst.id === 'kick') {
              synthsRef.current.kick.triggerAttackRelease('C1', '8n', time);
            } else if (inst.id === 'snare') {
              synthsRef.current.snare.triggerAttackRelease('16n', time);
            } else if (inst.id === 'clap') {
              synthsRef.current.clap.triggerAttackRelease('16n', time);
            } else if (inst.id === 'hihat') {
              synthsRef.current.hihat.triggerAttackRelease('32n', time);
            } else if (inst.id === 'openhat') {
              synthsRef.current.openhat.triggerAttackRelease('16n', time);
            }
          }
        });

        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);
      },
      stepIndices,
      '16n'
    );

    sequenceRef.current.start(0);
    Tone.Transport.start('+0.05');
    setIsPlaying(true);
    console.log('▶️ Playback started (real-time synthesis)');
  };

  // Pre-rendered playback for Chromebook (stable but no live editing)
  const startPrerenderedPlayback = async () => {
    // Wait a moment for samples to be ready
    if (!drumSamplesRef.current) {
      console.log('⏳ Waiting for drum samples...');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!drumSamplesRef.current) {
        console.error('Drum samples still not ready');
        return;
      }
    }

    console.log('🎵 Pre-rendering pattern for playback...');
    const result = await renderPatternToBuffer();
    if (!result) return;

    const { buffer, duration } = result;
    console.log(`✅ Pattern rendered: ${duration.toFixed(2)}s`);

    // Create a Tone.Player with the buffer
    const toneBuffer = new Tone.ToneAudioBuffer(buffer);
    playerRef.current = new Tone.Player(toneBuffer).toDestination();
    playerRef.current.loop = true;

    // Start playback
    await Tone.start();
    playerRef.current.start();
    setIsPlaying(true);
    console.log('▶️ Playback started (pre-rendered)');

    // Set up visual step tracking with a simple interval
    const stepDurationMs = (60 / bpm / 4) * 1000;
    const startTime = performance.now();

    stepIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const currentStepCalc = Math.floor((elapsed / stepDurationMs) % steps);
      setCurrentStep(currentStepCalc);
    }, stepDurationMs / 2);
  };

  // Play/stop - uses hybrid approach based on device
  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // Initialize audio if needed
    const ready = await initializeAudio();
    if (!ready) return;

    // Choose playback mode based on device
    // - Chromebook: pre-rendered (stable, no live editing)
    // - Desktop: real-time synthesis (supports live editing)
    if (isChromebook) {
      await startPrerenderedPlayback();
    } else {
      await startRealtimePlayback();
    }
  };

  // Clear grid
  const clearGrid = () => {
    if (isPlaying) stopPlayback();
    setGrid(INSTRUMENTS.map(() => Array(steps).fill(false)));
  };

  // Load preset
  const loadPreset = (presetKey) => {
    if (isPlaying) stopPlayback();
    const pattern = PRESETS[presetKey].pattern.map(row => {
      if (steps === 16) return [...row];
      if (steps === 32) return [...row, ...row]; // Duplicate for 32 steps
      return row.slice(0, steps);
    });
    setGrid(pattern);
    setShowPresetDropdown(false);
  };

  // Export to WAV
  const exportBeat = async () => {
    setIsExporting(true);

    try {
      // Calculate duration: 16 steps = 1 bar, 32 steps = 2 bars
      // Then multiply by 4 to create a longer loop (4 repetitions)
      const bars = steps === 16 ? 1 : 2;
      const secondsPerBeat = 60 / bpm;
      const singlePatternDuration = secondsPerBeat * 4 * bars; // 4 beats per bar
      const LOOP_REPEATS = 4; // Repeat the pattern 4 times
      const duration = singlePatternDuration * LOOP_REPEATS;

      console.log(`🥁 Exporting beat: ${steps} steps, ${bpm} BPM, ${bars} bars`);
      console.log(`   Single pattern: ${singlePatternDuration.toFixed(2)}s, Total: ${duration.toFixed(2)}s`);

      // Use pre-rendered samples for fast, Chromebook-friendly export
      const samples = drumSamplesRef.current;
      if (!samples) {
        console.error('Drum samples not ready');
        return;
      }

      // Create output buffer manually by mixing samples
      const sampleRate = samples.kick.sampleRate;
      const outputLength = Math.ceil(duration * sampleRate);
      const outputBuffer = Tone.context.createBuffer(2, outputLength, sampleRate);
      const leftChannel = outputBuffer.getChannelData(0);
      const rightChannel = outputBuffer.getChannelData(1);

      const stepDuration = (60 / bpm) / 4;
      const baseOffset = 0.005;

      // Count and log notes
      let noteCount = 0;
      grid.forEach(row => row.forEach(cell => { if (cell) noteCount++; }));
      console.log(`   📝 Mixing ${noteCount * LOOP_REPEATS} samples...`);

      // Mix samples into output buffer
      for (let repeat = 0; repeat < LOOP_REPEATS; repeat++) {
        const repeatOffset = repeat * singlePatternDuration;

        for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
          const stepTime = baseOffset + repeatOffset + (stepIndex * stepDuration);
          const startSample = Math.floor(stepTime * sampleRate);

          INSTRUMENTS.forEach((inst, instIndex) => {
            if (grid[instIndex][stepIndex]) {
              const sampleBuffer = samples[inst.id];
              const sampleLeft = sampleBuffer.getChannelData(0);
              const sampleRight = sampleBuffer.numberOfChannels > 1
                ? sampleBuffer.getChannelData(1)
                : sampleLeft;

              // Mix sample into output
              for (let i = 0; i < sampleLeft.length && startSample + i < outputLength; i++) {
                leftChannel[startSample + i] += sampleLeft[i];
                rightChannel[startSample + i] += sampleRight[i];
              }
            }
          });
        }
      }

      // Normalize to prevent clipping
      let maxSample = 0;
      for (let i = 0; i < outputLength; i++) {
        maxSample = Math.max(maxSample, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
      }
      if (maxSample > 1) {
        const scale = 0.95 / maxSample;
        for (let i = 0; i < outputLength; i++) {
          leftChannel[i] *= scale;
          rightChannel[i] *= scale;
        }
      }

      const buffer = outputBuffer;

      console.log(`   ✅ Rendered buffer: ${buffer.duration.toFixed(2)}s`);

      // Convert to WAV
      const wavBlob = audioBufferToWav(buffer);
      const blobURL = URL.createObjectURL(wavBlob);
      console.log(`   ✅ WAV blob created: ${(wavBlob.size / 1024).toFixed(1)}KB`);
      console.log(`   ✅ Blob URL: ${blobURL}`);

      // Get the mood name for the beat
      const moodInfo = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;
      const moodName = moodInfo ? moodInfo.name : 'Custom';

      // Create loop object
      const beatLoop = {
        id: `custom-beat-${Date.now()}`,
        name: `${moodName} Beat ${customLoopCount + 1}`,
        file: blobURL,
        instrument: 'Drums',
        mood: moodName,
        color: moodInfo?.color || '#dc2626',
        category: 'Drums',
        duration: duration,
        loaded: true,
        accessible: true,
        type: 'custom-beat',
        bpm: bpm,
        kit: kit,
        steps: steps,
        pattern: grid.map(row => [...row])
      };

      console.log(`   ✅ Beat loop object created:`, beatLoop);
      console.log(`   📤 Calling onAddToProject...`);
      onAddToProject(beatLoop);
      console.log(`   ✅ onAddToProject called successfully`);

    } catch (error) {
      console.error('Failed to export beat:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Check if grid has any notes
  const hasNotes = grid.some(row => row.some(cell => cell));

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header Row - Title and Controls */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <h2 className="text-xl font-bold text-white">Build Your Beat</h2>

          {/* Right: Kit, Preset, Steps, BPM */}
          <div className="flex items-center gap-2">
            {/* Kit Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowKitDropdown(!showKitDropdown)}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span>{KITS[kit].name}</span>
                <ChevronDown size={14} />
              </button>
              {showKitDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-20 min-w-32">
                  {Object.entries(KITS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => { setKit(key); setShowKitDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${kit === key ? 'bg-gray-600' : ''}`}
                    >
                      {value.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preset Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span>Presets</span>
                <ChevronDown size={14} />
              </button>
              {showPresetDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-20 min-w-32">
                  {Object.entries(PRESETS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => loadPreset(key)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {value.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Steps Toggle */}
            <div className="flex bg-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setSteps(16)}
                className={`px-3 py-2 text-sm font-bold transition-colors ${steps === 16 ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                16
              </button>
              <button
                onClick={() => setSteps(32)}
                className={`px-3 py-2 text-sm font-bold transition-colors ${steps === 32 ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                32
              </button>
            </div>

            {/* BPM Display */}
            <div className="flex items-center gap-1 bg-purple-600 rounded-lg px-3 py-2">
              <span className="text-lg font-mono font-bold text-white">{bpm}</span>
              <span className="text-sm text-purple-200">BPM</span>
            </div>

            {/* Close button - only if not hidden */}
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mood Selector Row */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-400">Select Mood:</span>
          <div className="flex items-center gap-2">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-offset-gray-900'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: isSelected ? mood.color : undefined,
                    ringColor: isSelected ? mood.color : undefined
                  }}
                >
                  <span className="text-lg leading-none">{mood.emoji}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {mood.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Area - fixed width range to prevent uneven shrinking and gaps */}
      <div className="flex-1 flex flex-col px-6 py-4 justify-center items-center overflow-x-auto overflow-y-auto">
        <div style={{ minWidth: steps === 16 ? '600px' : '900px', maxWidth: steps === 16 ? '800px' : '1100px', width: '100%' }}>
          {/* Beat Headers - uses same flex structure as grid for alignment */}
          <div className="flex items-end mb-2">
            {/* Spacer matching instrument label width */}
            <div className="w-28 flex-shrink-0" />
          {/* Beat header groups - matches grid structure */}
          <div className="flex flex-1 gap-1">
            {Array(steps / 4).fill(0).map((_, beatIndex) => (
              <div
                key={beatIndex}
                className={`flex-1 text-center border-r border-slate-600 last:border-r-0 px-1`}
              >
                <div className="text-base font-bold text-white mb-1">Beat {beatIndex + 1}</div>
                <div className="flex">
                  {[1, 2, 3, 4].map(n => {
                    const isCurrent = currentStep === beatIndex * 4 + n - 1 && isPlaying;
                    return (
                      <span
                        key={n}
                        className={`flex-1 text-center text-sm font-semibold ${
                          isCurrent ? 'text-green-400 font-bold' : 'text-slate-500'
                        }`}
                        style={isCurrent && !isChromebook ? { textShadow: '0 0 8px #4ade80' } : undefined}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid rows - square cells */}
        <div className="flex flex-col gap-2">
          {visibleInstruments.map((instrument) => {
            const instIndex = INSTRUMENTS.findIndex(i => i.id === instrument.id);
            const rowHasNotes = grid[instIndex]?.some(cell => cell);
            const IconComponent = INSTRUMENT_ICONS[instrument.id];

            return (
              <div
                key={instrument.id}
                className={`flex items-center transition-opacity ${rowHasNotes ? 'opacity-100' : 'opacity-70'}`}
              >
                {/* Track label with DAW icon and full name */}
                <div
                  className="w-28 flex-shrink-0 flex items-center gap-2 pr-3 justify-end"
                  style={{ color: instrument.color }}
                >
                  {IconComponent && <IconComponent size={20} strokeWidth={2.5} />}
                  <span className="text-base font-bold">{instrument.name}</span>
                </div>

                {/* Beat groups with separators - square cells */}
                <div className="flex flex-1 gap-1">
                  {Array(steps / 4).fill(0).map((_, beatIndex) => (
                    <div
                      key={beatIndex}
                      className={`flex-1 flex gap-1 px-1 border-r border-slate-600 last:border-r-0 ${
                        beatIndex % 2 === 0 ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      {[0, 1, 2, 3].map(stepInBeat => {
                        const stepIndex = beatIndex * 4 + stepInBeat;
                        const isActive = grid[instIndex][stepIndex];
                        const isCurrent = currentStep === stepIndex && isPlaying;

                        // Chromebook: simpler styles for better performance
                        if (isChromebook) {
                          return (
                            <button
                              key={stepIndex}
                              onClick={() => toggleCell(instIndex, stepIndex)}
                              className="flex-1 aspect-square rounded-xl min-w-[40px] max-w-[56px]"
                              style={{
                                backgroundColor: isActive
                                  ? (isCurrent ? '#22c55e' : instrument.color)
                                  : isCurrent
                                    ? '#4ade80'
                                    : 'rgba(255, 255, 255, 0.08)',
                                border: isActive
                                  ? `3px solid ${instrument.color}`
                                  : isCurrent
                                    ? '3px solid #22c55e'
                                    : '2px solid rgba(255, 255, 255, 0.1)',
                              }}
                            />
                          );
                        }

                        // Desktop: full visual effects with square cells
                        return (
                          <button
                            key={stepIndex}
                            onClick={() => toggleCell(instIndex, stepIndex)}
                            className="flex-1 aspect-square rounded-xl transition-colors min-w-[40px] max-w-[56px]"
                            style={{
                              backgroundColor: isActive
                                ? (isCurrent ? '#22c55e' : instrument.color)
                                : isCurrent
                                  ? 'rgba(34, 197, 94, 0.3)'
                                  : 'rgba(255, 255, 255, 0.08)',
                              border: isActive
                                ? `3px solid ${instrument.color}`
                                : isCurrent
                                  ? '2px solid rgba(34, 197, 94, 0.6)'
                                  : '2px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: isActive
                                ? `0 0 15px ${instrument.color}50`
                                : isCurrent
                                  ? '0 0 10px rgba(34, 197, 94, 0.4)'
                                  : 'none',
                              transform: isCurrent && isActive ? 'scale(1.05)' : 'scale(1)',
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Bottom Controls - Larger buttons */}
      <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Play/Stop */}
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            style={{
              boxShadow: isPlaying ? '0 0 20px #dc262640' : '0 0 20px #16a34a40'
            }}
          >
            {isPlaying ? <Square size={20} /> : <Play size={20} />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>

          {/* Clear */}
          <button
            onClick={clearGrid}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 size={18} />
            Clear
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add to Project */}
          <button
            onClick={exportBeat}
            disabled={!hasNotes || isExporting}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all ${
              hasNotes && !isExporting
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            {isExporting ? 'Saving...' : 'Save Beat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeatMakerPanel;
