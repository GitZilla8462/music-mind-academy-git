// File: MelodyMakerPanel.jsx
// Melody maker panel for the Film Music Score DAW
// Features: 5 notes (pentatonic), mood-based key signatures, 8/16 beats, WAV export
// Chromebook optimized: 44px touch targets, efficient rendering

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Plus, ChevronDown, Music2 } from 'lucide-react';
import * as Tone from 'tone';

const BEATS_OPTIONS = [8, 16];

// Mood presets with BPM and pentatonic scale
// Each mood has a different key signature that works over its chord progression
const MOODS = [
  {
    id: 'heroic',
    name: 'Heroic',
    emoji: '🦸',
    bpm: 110,
    color: '#f59e0b',
    key: 'C Major',
    // C major pentatonic (works over C, G, Am, F)
    notes: [
      { id: 'A4', name: 'A', color: '#a855f7' },
      { id: 'G4', name: 'G', color: '#3b82f6' },
      { id: 'E4', name: 'E', color: '#10b981' },
      { id: 'D4', name: 'D', color: '#f59e0b' },
      { id: 'C4', name: 'C', color: '#ef4444' },
    ]
  },
  {
    id: 'upbeat',
    name: 'Upbeat',
    emoji: '🎉',
    bpm: 127,
    color: '#22c55e',
    key: 'A Minor',
    // A minor pentatonic (works over Am, C, F, Dm)
    notes: [
      { id: 'A4', name: 'A', color: '#a855f7' },
      { id: 'G4', name: 'G', color: '#3b82f6' },
      { id: 'E4', name: 'E', color: '#10b981' },
      { id: 'D4', name: 'D', color: '#f59e0b' },
      { id: 'C4', name: 'C', color: '#ef4444' },
    ]
  },
  {
    id: 'hype',
    name: 'Hype',
    emoji: '🔥',
    bpm: 70,
    color: '#ef4444',
    key: 'F Minor',
    // F minor pentatonic (works over Fm, Db, Ab, Eb)
    notes: [
      { id: 'Eb5', name: 'Eb', color: '#a855f7' },
      { id: 'C5', name: 'C', color: '#3b82f6' },
      { id: 'Bb4', name: 'Bb', color: '#10b981' },
      { id: 'Ab4', name: 'Ab', color: '#f59e0b' },
      { id: 'F4', name: 'F', color: '#ef4444' },
    ]
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    emoji: '🔮',
    bpm: 70,
    color: '#8b5cf6',
    key: 'A Minor',
    // A minor pentatonic (works over Am, F, G, Em)
    notes: [
      { id: 'A4', name: 'A', color: '#a855f7' },
      { id: 'G4', name: 'G', color: '#3b82f6' },
      { id: 'E4', name: 'E', color: '#10b981' },
      { id: 'D4', name: 'D', color: '#f59e0b' },
      { id: 'C4', name: 'C', color: '#ef4444' },
    ]
  },
  {
    id: 'scary',
    name: 'Scary',
    emoji: '👻',
    bpm: 70,
    color: '#6b7280',
    key: 'C Minor',
    // C minor pentatonic (works over Cm, Db, Cm, Cm)
    notes: [
      { id: 'Bb4', name: 'Bb', color: '#a855f7' },
      { id: 'G4', name: 'G', color: '#3b82f6' },
      { id: 'F4', name: 'F', color: '#10b981' },
      { id: 'Eb4', name: 'Eb', color: '#f59e0b' },
      { id: 'C4', name: 'C', color: '#ef4444' },
    ]
  }
];

// Instrument presets (synth sounds)
const INSTRUMENTS = {
  piano: {
    name: 'Piano',
    icon: '🎹',
    synth: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 } }
  },
  synth: {
    name: 'Synth',
    icon: '🎛️',
    synth: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.4 } }
  },
  marimba: {
    name: 'Marimba',
    icon: '🎵',
    synth: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 1.0 } }
  },
  '8bit': {
    name: '8-Bit',
    icon: '👾',
    synth: { oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.1 } }
  },
  bells: {
    name: 'Bells',
    icon: '🔔',
    synth: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.8, sustain: 0.2, release: 1.5 } }
  }
};

// Preset melody patterns
const PRESETS = {
  ascending: {
    name: 'Ascending',
    // 8-beat ascending pattern: C D E G A (bottom to top)
    pattern: [
      [false, false, false, false, true, false, false, true],   // A (top)
      [false, false, false, true, false, false, true, false],   // G
      [false, false, true, false, false, true, false, false],   // E
      [false, true, false, false, true, false, false, false],   // D
      [true, false, false, true, false, false, false, false],   // C (bottom)
    ]
  },
  descending: {
    name: 'Descending',
    pattern: [
      [true, false, false, true, false, false, false, false],   // A (top)
      [false, true, false, false, true, false, false, false],   // G
      [false, false, true, false, false, true, false, false],   // E
      [false, false, false, true, false, false, true, false],   // D
      [false, false, false, false, true, false, false, true],   // C (bottom)
    ]
  },
  arch: {
    name: 'Arch',
    pattern: [
      [false, false, false, true, true, false, false, false],   // A (top - peak)
      [false, false, true, false, false, true, false, false],   // G
      [false, true, false, false, false, false, true, false],   // E
      [true, false, false, false, false, false, false, true],   // D
      [false, false, false, false, false, false, false, false], // C (bottom)
    ]
  }
};

// Convert AudioBuffer to WAV blob
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

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

const MelodyMakerPanel = ({ onClose, onAddToProject, customLoopCount = 0, hideCloseButton = false }) => {
  const [beats, setBeats] = useState(8);
  const [grid, setGrid] = useState(() => Array(5).fill(null).map(() => Array(8).fill(false)));
  const [instrument, setInstrument] = useState('piano');
  const [bpm, setBpm] = useState(110);
  const [selectedMood, setSelectedMood] = useState('heroic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [audioReady, setAudioReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const gridRef = useRef(grid);

  // Get current mood's notes
  const currentMood = MOODS.find(m => m.id === selectedMood) || MOODS[0];
  const currentNotes = currentMood.notes;

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (synthRef.current) {
        try { synthRef.current.dispose(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Handle mood selection - sets BPM and changes note scale
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setBpm(mood.bpm);
    // Clear grid when mood changes (notes are different)
    setGrid(Array(5).fill(null).map(() => Array(beats).fill(false)));
  };

  // Handle beats change
  const handleBeatsChange = (newBeats) => {
    if (isPlaying) stopPlayback();
    setBeats(newBeats);
    setGrid(prev => {
      if (newBeats > prev[0].length) {
        // Expand grid
        return prev.map(row => [...row, ...Array(newBeats - row.length).fill(false)]);
      } else {
        // Shrink grid
        return prev.map(row => row.slice(0, newBeats));
      }
    });
  };

  // Create synth based on selected instrument
  const createSynth = useCallback(() => {
    if (synthRef.current) {
      try { synthRef.current.dispose(); } catch (e) { /* ignore */ }
    }
    const config = INSTRUMENTS[instrument].synth;
    synthRef.current = new Tone.Synth(config).toDestination();
    if (instrument === 'bells') {
      synthRef.current.volume.value = -6;
    }
  }, [instrument]);

  // Recreate synth when instrument changes
  useEffect(() => {
    if (audioReady) {
      createSynth();
    }
  }, [instrument, audioReady, createSynth]);

  // Initialize audio
  const initializeAudio = useCallback(async () => {
    if (audioReady && synthRef.current) return true;

    try {
      await Tone.start();
      if (Tone.context.state !== 'running') {
        await Tone.context.resume();
      }
      Tone.Transport.bpm.value = bpm;
      createSynth();
      setAudioReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, [audioReady, bpm, createSynth]);

  // Toggle cell (one note per beat)
  const toggleCell = async (noteIndex, beatIndex) => {
    if (!audioReady) {
      await initializeAudio();
    }

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);

      if (newGrid[noteIndex][beatIndex]) {
        newGrid[noteIndex][beatIndex] = false;
      } else {
        // Clear other notes on this beat
        for (let i = 0; i < 5; i++) {
          newGrid[i][beatIndex] = false;
        }
        newGrid[noteIndex][beatIndex] = true;

        // Play note preview
        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(currentNotes[noteIndex].id, '8n');
        }
      }

      return newGrid;
    });
  };

  // Stop playback
  const stopPlayback = useCallback(() => {
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (e) { /* ignore */ }

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  // Start/stop playback
  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const ready = await initializeAudio();
    if (!ready) return;

    // Ensure audio context is running (critical for modal playback inside DAW)
    try {
      await Tone.start();
      if (Tone.context.state !== 'running') {
        console.log('🔊 Resuming audio context...');
        await Tone.context.resume();
      }
      console.log('✅ Audio context state:', Tone.context.state);
    } catch (err) {
      console.error('❌ Failed to start audio context:', err);
      return;
    }

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.position = 0;

    const beatIndices = Array.from({ length: beats }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, beatIdx) => {
        const currentGrid = gridRef.current;

        currentNotes.forEach((note, noteIndex) => {
          if (currentGrid[noteIndex]?.[beatIdx]) {
            if (synthRef.current) {
              synthRef.current.triggerAttackRelease(note.id, '8n', time);
            }
          }
        });

        // Update visual beat indicator
        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIdx);
        }, time);
      },
      beatIndices,
      '8n'
    );

    sequenceRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

  // Clear grid
  const clearGrid = () => {
    if (isPlaying) stopPlayback();
    setGrid(Array(5).fill(null).map(() => Array(beats).fill(false)));
  };

  // Load preset
  const loadPreset = (presetKey) => {
    if (isPlaying) stopPlayback();
    const pattern = PRESETS[presetKey].pattern.map(row => {
      if (beats === 8) return [...row];
      if (beats === 16) return [...row, ...row];
      return row.slice(0, beats);
    });
    setGrid(pattern);
    setShowPresetDropdown(false);
  };

  // Export to WAV
  const exportMelody = async () => {
    setIsExporting(true);

    try {
      const secondsPerBeat = 60 / bpm;
      const singlePatternDuration = secondsPerBeat * beats / 2; // 8th notes
      const LOOP_REPEATS = 4;
      const duration = singlePatternDuration * LOOP_REPEATS;

      console.log(`🎵 Exporting melody: ${beats} beats, ${bpm} BPM`);
      console.log(`   Single pattern: ${singlePatternDuration.toFixed(2)}s, Total: ${duration.toFixed(2)}s`);

      // Render melody to buffer
      const sampleRate = 44100;
      const outputLength = Math.ceil(duration * sampleRate);
      const offlineContext = new OfflineAudioContext(2, outputLength, sampleRate);

      // Create synth in offline context
      const config = INSTRUMENTS[instrument].synth;
      const oscillatorType = config.oscillator.type;
      const envelope = config.envelope;

      const stepDuration = secondsPerBeat / 2; // 8th notes

      // Schedule all notes
      for (let repeat = 0; repeat < LOOP_REPEATS; repeat++) {
        const repeatOffset = repeat * singlePatternDuration;

        for (let beatIdx = 0; beatIdx < beats; beatIdx++) {
          const noteTime = repeatOffset + (beatIdx * stepDuration);

          for (let noteIdx = 0; noteIdx < 5; noteIdx++) {
            if (grid[noteIdx][beatIdx]) {
              const note = currentNotes[noteIdx];
              const freq = Tone.Frequency(note.id).toFrequency();

              // Create oscillator and gain for each note
              const osc = offlineContext.createOscillator();
              const gain = offlineContext.createGain();

              osc.type = oscillatorType;
              osc.frequency.value = freq;

              // ADSR envelope - constrain to note duration
              const startTime = noteTime;
              const noteDuration = stepDuration * 0.8;

              // Constrain envelope times to fit within note duration
              const attack = Math.min(envelope.attack, noteDuration * 0.2);
              const decay = Math.min(envelope.decay, noteDuration * 0.2);
              const release = Math.min(envelope.release, noteDuration * 0.3);
              const sustainTime = Math.max(0, noteDuration - attack - decay - release);

              gain.gain.setValueAtTime(0, startTime);
              gain.gain.linearRampToValueAtTime(0.5, startTime + attack);
              gain.gain.linearRampToValueAtTime(0.5 * envelope.sustain, startTime + attack + decay);
              gain.gain.setValueAtTime(0.5 * envelope.sustain, startTime + attack + decay + sustainTime);
              gain.gain.linearRampToValueAtTime(0, startTime + noteDuration);

              osc.connect(gain);
              gain.connect(offlineContext.destination);

              osc.start(startTime);
              osc.stop(startTime + noteDuration + 0.1);
            }
          }
        }
      }

      // Render
      const buffer = await offlineContext.startRendering();
      console.log(`   ✅ Rendered buffer: ${buffer.duration.toFixed(2)}s`);

      // Convert to WAV
      const wavBlob = audioBufferToWav(buffer);
      const blobURL = URL.createObjectURL(wavBlob);
      console.log(`   ✅ WAV blob created: ${(wavBlob.size / 1024).toFixed(1)}KB`);

      // Create loop object
      const melodyLoop = {
        id: `custom-melody-${Date.now()}`,
        name: `${currentMood.name} Melody ${customLoopCount + 1}`,
        file: blobURL,
        instrument: 'Melody',
        mood: currentMood.name,
        color: currentMood.color,
        category: 'Melody',
        duration: duration,
        loaded: true,
        accessible: true,
        type: 'custom-melody',
        bpm: bpm,
        key: currentMood.key,
        synthType: instrument,
        beats: beats,
        pattern: grid.map(row => [...row])
      };

      console.log(`   ✅ Melody loop object created:`, melodyLoop);
      onAddToProject(melodyLoop);

    } catch (error) {
      console.error('Failed to export melody:', error);
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music2 size={20} className="text-purple-400" />
            Build Your Melody
          </h2>

          {/* Right: Instrument, Preset, Beats */}
          <div className="flex items-center gap-2">
            {/* Instrument Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowInstrumentDropdown(!showInstrumentDropdown)}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span>{INSTRUMENTS[instrument].icon} {INSTRUMENTS[instrument].name}</span>
                <ChevronDown size={14} />
              </button>
              {showInstrumentDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-20 min-w-32">
                  {Object.entries(INSTRUMENTS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => { setInstrument(key); setShowInstrumentDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${instrument === key ? 'bg-gray-600' : ''}`}
                    >
                      {value.icon} {value.name}
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

            {/* Beats Toggle */}
            <div className="flex bg-gray-700 rounded-lg overflow-hidden">
              {BEATS_OPTIONS.map(b => (
                <button
                  key={b}
                  onClick={() => handleBeatsChange(b)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    beats === b ? 'bg-purple-600' : 'hover:bg-gray-600'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* BPM Display */}
            <div className="bg-gray-700 px-3 py-2 rounded-lg text-sm">
              <span className="text-gray-400">BPM:</span>{' '}
              <span className="font-mono font-bold">{bpm}</span>
            </div>

            {/* Key Display */}
            <div className="bg-gray-700 px-3 py-2 rounded-lg text-sm">
              <span className="text-gray-400">Key:</span>{' '}
              <span className="font-bold" style={{ color: currentMood.color }}>{currentMood.key}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Selection Row */}
      <div className="flex-shrink-0 bg-gray-800/50 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">Mood:</span>
          {MOODS.map(mood => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedMood === mood.id
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: mood.color }}
            >
              <span>{mood.emoji}</span>
              <span>{mood.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        {/* Beat Headers */}
        <div className="grid mb-1" style={{ marginLeft: '50px', gridTemplateColumns: `repeat(${beats}, 1fr)`, gap: '2px' }}>
          {Array.from({ length: beats }, (_, i) => (
            <div
              key={i}
              className={`text-center text-xs font-bold ${
                currentBeat === i ? '' : 'text-gray-500'
              }`}
              style={{ color: currentBeat === i ? currentMood.color : undefined }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div className="flex-1 flex flex-col gap-0.5 min-h-0">
          {currentNotes.map((note, noteIndex) => (
            <div key={note.id} className="flex items-center gap-1 flex-1 min-h-0">
              {/* Note Label */}
              <div
                className="w-12 flex-shrink-0 text-right font-bold text-sm"
                style={{ color: note.color }}
              >
                {note.name}
              </div>

              {/* Beat Cells - using CSS Grid for consistent sizing */}
              <div
                className="flex-1 grid h-full"
                style={{ gridTemplateColumns: `repeat(${beats}, 1fr)`, gap: '2px' }}
              >
                {Array.from({ length: beats }, (_, beatIndex) => {
                  const isActive = grid[noteIndex]?.[beatIndex];
                  const isCurrent = currentBeat === beatIndex && isPlaying;

                  return (
                    <button
                      key={beatIndex}
                      onClick={() => toggleCell(noteIndex, beatIndex)}
                      className="rounded transition-colors flex items-center justify-center"
                      style={{
                        backgroundColor: isActive
                          ? note.color
                          : isCurrent
                            ? `${currentMood.color}30`
                            : 'rgba(255, 255, 255, 0.08)',
                        border: isActive
                          ? `2px solid ${note.color}`
                          : isCurrent
                            ? `2px solid ${currentMood.color}60`
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: isActive
                          ? `0 0 8px ${note.color}50`
                          : 'none',
                        minHeight: '36px'
                      }}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Playback Progress */}
        <div className="grid mt-1" style={{ marginLeft: '50px', gridTemplateColumns: `repeat(${beats}, 1fr)`, gap: '2px' }}>
          {Array.from({ length: beats }, (_, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                backgroundColor: currentBeat === i ? currentMood.color : '#374151',
                boxShadow: currentBeat === i ? `0 0 6px ${currentMood.color}` : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Play, Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              style={{
                boxShadow: isPlaying ? '0 0 20px #dc262650' : '0 0 20px #16a34a50'
              }}
            >
              {isPlaying ? (
                <>
                  <Square size={18} />
                  Stop
                </>
              ) : (
                <>
                  <Play size={18} />
                  Play
                </>
              )}
            </button>

            <button
              onClick={clearGrid}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>

          {/* Right: Add to Project */}
          <button
            onClick={exportMelody}
            disabled={!hasNotes || isExporting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              hasNotes && !isExporting
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            style={{
              boxShadow: hasNotes && !isExporting ? '0 0 20px #9333ea50' : 'none'
            }}
          >
            <Plus size={18} />
            {isExporting ? 'Exporting...' : 'Add to Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MelodyMakerPanel;
