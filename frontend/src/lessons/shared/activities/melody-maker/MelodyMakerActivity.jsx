// File: /lessons/shared/activities/melody-maker/MelodyMakerActivity.jsx
// Student Melody Maker Activity - wrapper with save flow like StudentBeatMakerActivity
// Shows saved melodies, opens melody grid editor, saves to localStorage for DAW

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Save, Music, Check, ChevronDown, ArrowLeft, Music2 } from 'lucide-react';
import * as Tone from 'tone';

// Storage key matching what GameCompositionActivity looks for
const SAVED_MELODIES_KEY = 'lesson5-student-melodies';

// Load saved melodies from localStorage
const loadSavedMelodies = () => {
  try {
    const saved = localStorage.getItem(SAVED_MELODIES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save melody to localStorage
const saveMelodyToStorage = (melody) => {
  try {
    const existing = loadSavedMelodies();
    const updated = [...existing, melody];
    localStorage.setItem(SAVED_MELODIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save melody:', error);
    return loadSavedMelodies();
  }
};

// Mood presets with BPM and pentatonic scale
const MOODS = [
  {
    id: 'heroic',
    name: 'Heroic',
    emoji: '🦸',
    bpm: 110,
    color: '#f59e0b',
    key: 'C Major',
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
    notes: [
      { id: 'Bb4', name: 'Bb', color: '#a855f7' },
      { id: 'G4', name: 'G', color: '#3b82f6' },
      { id: 'F4', name: 'F', color: '#10b981' },
      { id: 'Eb4', name: 'Eb', color: '#f59e0b' },
      { id: 'C4', name: 'C', color: '#ef4444' },
    ]
  }
];

// Instrument presets
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

// Preset melody patterns (for 8 beats) - ONE note per beat only
const PRESETS = {
  ascending: {
    name: 'Ascending',
    // Row 0 = A4 (highest), Row 4 = C4 (lowest)
    // Goes C -> D -> E -> G -> A -> G -> E -> D (up then back down)
    pattern: [
      [false, false, false, false, true, false, false, false],  // A4 on beat 5
      [false, false, false, true, false, true, false, false],   // G4 on beats 4, 6
      [false, false, true, false, false, false, true, false],   // E4 on beats 3, 7
      [false, true, false, false, false, false, false, true],   // D4 on beats 2, 8
      [true, false, false, false, false, false, false, false],  // C4 on beat 1
    ]
  },
  descending: {
    name: 'Descending',
    // Goes A -> G -> E -> D -> C -> D -> E -> G (down then back up)
    pattern: [
      [true, false, false, false, false, false, false, false],  // A4 on beat 1
      [false, true, false, false, false, false, false, true],   // G4 on beats 2, 8
      [false, false, true, false, false, false, true, false],   // E4 on beats 3, 7
      [false, false, false, true, false, true, false, false],   // D4 on beats 4, 6
      [false, false, false, false, true, false, false, false],  // C4 on beat 5
    ]
  },
  arch: {
    name: 'Arch',
    // Goes C -> E -> G -> A -> A -> G -> E -> C (up to peak then down)
    pattern: [
      [false, false, false, true, true, false, false, false],   // A4 on beats 4, 5
      [false, false, true, false, false, true, false, false],   // G4 on beats 3, 6
      [false, true, false, false, false, false, true, false],   // E4 on beats 2, 7
      [false, false, false, false, false, false, false, false], // D4 (none)
      [true, false, false, false, false, false, false, true],   // C4 on beats 1, 8
    ]
  }
};

// Get contour description from notes
const getContourDescription = (grid, beats) => {
  const activeNotes = [];
  for (let beat = 0; beat < beats; beat++) {
    for (let noteIdx = 0; noteIdx < 5; noteIdx++) {
      if (grid[noteIdx] && grid[noteIdx][beat]) {
        activeNotes.push({ beat, noteIdx });
        break;
      }
    }
  }

  if (activeNotes.length < 2) return 'Add more notes';

  let ascending = 0;
  let descending = 0;
  let stationary = 0;

  for (let i = 1; i < activeNotes.length; i++) {
    const diff = activeNotes[i-1].noteIdx - activeNotes[i].noteIdx;
    if (diff > 0) ascending++;
    else if (diff < 0) descending++;
    else stationary++;
  }

  if (ascending > descending + stationary) return 'Ascending';
  if (descending > ascending + stationary) return 'Descending';
  if (stationary > ascending && stationary > descending) return 'Stationary';
  if (ascending > 0 && descending > 0) return 'Arch';
  return 'Mixed';
};

// ============================================
// MELODY GRID EDITOR COMPONENT
// ============================================
const MelodyGridEditor = ({ onSave, onClose, melodyCount = 0 }) => {
  const [beats, setBeats] = useState(8); // 8 = 2 beats, 16 = 4 beats
  const [moodIndex, setMoodIndex] = useState(0);
  const [instrument, setInstrument] = useState('piano');
  const [grid, setGrid] = useState(() => Array(5).fill(null).map(() => Array(8).fill(false)));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [audioReady, setAudioReady] = useState(false);
  const [triggeredNotes, setTriggeredNotes] = useState({});
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [melodyName, setMelodyName] = useState('');

  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const gridRef = useRef(grid);

  const currentMood = MOODS[moodIndex];
  const currentNotes = currentMood.notes;
  const bpm = currentMood.bpm;

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Update grid when beats change
  useEffect(() => {
    setGrid(prev => {
      if (prev[0].length === beats) return prev;
      return prev.map(row => {
        if (beats > row.length) {
          // Extend with false values
          return [...row, ...Array(beats - row.length).fill(false)];
        } else {
          // Truncate
          return row.slice(0, beats);
        }
      });
    });
  }, [beats]);

  // Update BPM when mood changes
  useEffect(() => {
    if (audioReady) {
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm, audioReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
      }
      if (synthRef.current) {
        try { synthRef.current.dispose(); } catch (e) { /* ignore */ }
      }
      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (e) { /* ignore */ }
    };
  }, []);

  // Create synth based on instrument
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
    try {
      await Tone.start();
      if (Tone.context.state !== 'running') {
        await Tone.context.resume();
      }
      Tone.Transport.bpm.value = bpm;
      if (!synthRef.current) {
        createSynth();
      }
      setAudioReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, [bpm, createSynth]);

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

        // Play the note
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
    setTriggeredNotes({});
  }, []);

  // Toggle play
  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const ready = await initializeAudio();
    if (!ready) return;

    if (!synthRef.current) {
      createSynth();
    }

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    const notesToPlay = [...currentNotes];
    const beatIndices = Array.from({ length: beats }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, beat) => {
        const currentGrid = gridRef.current;
        const triggered = {};

        notesToPlay.forEach((note, noteIndex) => {
          if (currentGrid[noteIndex] && currentGrid[noteIndex][beat]) {
            triggered[`${noteIndex}-${beat}`] = true;
            if (synthRef.current) {
              try {
                synthRef.current.triggerAttackRelease(note.id, '8n', time);
              } catch (e) {
                console.error('Error playing note:', e);
              }
            }
          }
        });

        Tone.Draw.schedule(() => {
          setCurrentBeat(beat);
          setTriggeredNotes(triggered);
          setTimeout(() => setTriggeredNotes({}), 100);
        }, time);
      },
      beatIndices,
      '8n'
    );

    sequenceRef.current.loop = true;
    sequenceRef.current.start(0);
    Tone.Transport.start('+0.05');
    setIsPlaying(true);
  };

  // Clear grid
  const clearGrid = () => {
    if (isPlaying) stopPlayback();
    setGrid(Array(5).fill(null).map(() => Array(beats).fill(false)));
  };

  // Apply preset
  const applyPreset = (presetId) => {
    const preset = PRESETS[presetId];
    if (preset) {
      // Extend or truncate pattern to match current beats
      const pattern = preset.pattern.map(row => {
        if (beats === 8) return [...row];
        if (beats === 16) return [...row, ...row]; // Repeat for 16 beats
        return row.slice(0, beats);
      });
      setGrid(pattern);
    }
    setShowPresetDropdown(false);
  };

  // Open naming modal before save
  const handleSaveClick = () => {
    if (isPlaying) stopPlayback();
    setMelodyName(`My ${currentMood.name} Melody`);
    setShowNameModal(true);
  };

  // Confirm save with custom name
  const confirmSave = () => {
    // Calculate duration
    const secondsPerBeat = 60 / bpm;
    const singlePatternDuration = secondsPerBeat * beats / 2;
    const LOOP_REPEATS = 4;
    const duration = singlePatternDuration * LOOP_REPEATS;

    const finalName = melodyName.trim() || `My ${currentMood.name} Melody`;

    const melodyLoop = {
      id: `mma-saved-melody-${Date.now()}`,
      name: finalName,
      file: null,
      mood: currentMood.name,
      color: currentMood.color,
      category: 'Melody',
      duration: duration,
      loaded: false,
      accessible: false,
      needsRender: true,
      type: 'custom-melody',
      bpm: bpm,
      key: currentMood.key,
      synthType: instrument,
      beats: beats,
      pattern: grid.map(row => [...row]),
      notes: currentNotes.map(n => n.id),
      savedAt: new Date().toISOString()
    };

    setShowNameModal(false);
    onSave(melodyLoop);
  };

  const noteCount = grid.flat().filter(Boolean).length;
  const contour = getContourDescription(grid, beats);
  const beatsPerMeasure = beats / 4; // 8 beats = 2 measures, 16 beats = 4 measures

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-2.5">
        <div className="flex items-center justify-center flex-wrap gap-3">
          {/* Back button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Beat Length Toggle */}
          <div className="flex bg-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setBeats(8)}
              className={`px-4 py-2 rounded font-bold transition-all ${
                beats === 8 ? 'bg-purple-600 text-white' : 'hover:bg-slate-600'
              }`}
            >
              2 Beats
            </button>
            <button
              onClick={() => setBeats(16)}
              className={`px-4 py-2 rounded font-bold transition-all ${
                beats === 16 ? 'bg-purple-600 text-white' : 'hover:bg-slate-600'
              }`}
            >
              4 Beats
            </button>
          </div>

          {/* Mood Selector */}
          <div className="relative">
            <button
              onClick={async () => {
                await initializeAudio();
                setShowMoodDropdown(!showMoodDropdown);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all"
              style={{ backgroundColor: currentMood.color }}
            >
              <span>{currentMood.emoji}</span>
              <span>{currentMood.name}</span>
              <ChevronDown size={16} />
            </button>
            {showMoodDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-slate-700 rounded-lg shadow-xl z-20 min-w-[150px]">
                {MOODS.map((mood, idx) => (
                  <button
                    key={mood.id}
                    onClick={() => { setMoodIndex(idx); setShowMoodDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instrument Selector */}
          <div className="flex items-center gap-0.5 bg-slate-700 rounded-lg p-0.5">
            {Object.entries(INSTRUMENTS).map(([id, inst]) => (
              <button
                key={id}
                onClick={async () => {
                  await initializeAudio();
                  setInstrument(id);
                }}
                className={`px-2.5 py-2 rounded text-xl transition-all ${
                  instrument === id ? 'bg-purple-600 text-white' : 'hover:bg-slate-600'
                }`}
                title={inst.name}
              >
                {inst.icon}
              </button>
            ))}
          </div>

          {/* Preset Selector */}
          <div className="relative">
            <button
              onClick={async () => {
                await initializeAudio();
                setShowPresetDropdown(!showPresetDropdown);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold"
            >
              Presets
              <ChevronDown size={16} />
            </button>
            {showPresetDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-slate-700 rounded-lg shadow-xl z-20 min-w-[130px]">
                {Object.entries(PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => applyPreset(id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-auto">
        {/* Beat header - shows "Beat 1" "Beat 2" etc */}
        <div className="flex items-center w-full max-w-3xl">
          <div className="w-12" />
          <div className="flex-1 flex">
            {Array(beats / 4).fill(0).map((_, beatNum) => (
              <div key={beatNum} className="flex-1 flex">
                <div className="flex-1 text-center text-sm font-bold text-slate-400">
                  Beat {beatNum + 1}
                </div>
                {beatNum < (beats / 4) - 1 && <div className="w-0.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Subdivision numbers - 1 2 3 4 for each beat */}
        <div className="flex items-center mb-1 w-full max-w-3xl">
          <div className="w-12" />
          <div className="flex-1 flex gap-px">
            {Array(beats).fill(0).map((_, i) => {
              const isBeatStart = i % 4 === 0;
              return (
                <React.Fragment key={i}>
                  {isBeatStart && i > 0 && <div className="w-0.5" />}
                  <div
                    className={`flex-1 text-center text-sm font-bold ${
                      isBeatStart ? 'text-white' : 'text-slate-500'
                    } ${currentBeat === i ? 'text-green-400' : ''}`}
                  >
                    {(i % 4) + 1}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="w-full max-w-3xl space-y-1">
          {currentNotes.map((note, noteIndex) => (
            <div key={note.id} className="flex items-center gap-2">
              {/* Note label */}
              <div
                className="w-12 flex items-center justify-end font-bold text-base"
                style={{ color: note.color }}
              >
                <span>{note.name}</span>
              </div>

              {/* Beats with visual separators every 4 */}
              <div className="flex-1 flex gap-px">
                {Array(beats).fill(0).map((_, beatIndex) => {
                  const isActive = grid[noteIndex] && grid[noteIndex][beatIndex];
                  const isCurrentBeat = currentBeat === beatIndex;
                  const isTriggered = triggeredNotes[`${noteIndex}-${beatIndex}`];
                  const isBeatStart = beatIndex % 4 === 0;

                  return (
                    <React.Fragment key={beatIndex}>
                      {isBeatStart && beatIndex > 0 && (
                        <div className="w-0.5 bg-slate-600" />
                      )}
                      <button
                        onClick={() => toggleCell(noteIndex, beatIndex)}
                        className={`
                          flex-1 rounded transition-all duration-75
                          flex items-center justify-center cursor-pointer hover:opacity-80
                          ${isCurrentBeat && isPlaying ? 'ring-1 ring-white' : ''}
                        `}
                        style={{
                          backgroundColor: isActive ? note.color : '#475569',
                          boxShadow: isActive && isTriggered
                            ? `0 0 12px ${note.color}`
                            : 'none',
                          transform: isActive && isTriggered ? 'scale(1.05)' : 'scale(1)',
                          height: '40px',
                          minWidth: beats === 16 ? '24px' : '40px'
                        }}
                      >
                        {isActive && (
                          <div
                            className="w-2 h-2 rounded-full bg-white"
                            style={{ opacity: isTriggered ? 1 : 0.7 }}
                          />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Playback indicator */}
        <div className="flex items-center gap-px mt-2 w-full max-w-3xl">
          <div className="w-12" />
          <div className="flex-1 flex gap-px">
            {Array(beats).fill(0).map((_, i) => {
              const isBeatStart = i % 4 === 0;
              return (
                <React.Fragment key={i}>
                  {isBeatStart && i > 0 && <div className="w-0.5" />}
                  <div
                    className="flex-1 h-1 rounded-full transition-all"
                    style={{
                      backgroundColor: currentBeat === i ? currentMood.color : '#334155',
                      boxShadow: currentBeat === i ? `0 0 6px ${currentMood.color}` : 'none'
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Stats Display */}
        <div className="mt-3 bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-3 text-sm">
          <span className="text-slate-400">Notes: <span className="font-bold text-white">{noteCount}</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Contour: <span className="font-semibold" style={{ color: currentMood.color }}>{contour}</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{bpm} BPM</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2.5">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-base transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            style={{
              boxShadow: isPlaying ? '0 0 20px #dc262680' : '0 0 20px #16a34a80'
            }}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Play
              </>
            )}
          </button>

          <button
            onClick={clearGrid}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-base transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>

          <button
            onClick={handleSaveClick}
            disabled={noteCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-base transition-all ${
              noteCount === 0
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
            style={{
              boxShadow: noteCount > 0 ? '0 0 20px #9333ea50' : 'none'
            }}
          >
            <Save className="w-5 h-5" />
            Save Melody
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showMoodDropdown || showPresetDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setShowMoodDropdown(false); setShowPresetDropdown(false); }}
        />
      )}

      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4">Name Your Melody</h3>
            <input
              type="text"
              value={melodyName}
              onChange={(e) => setMelodyName(e.target.value)}
              placeholder="Enter melody name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSave();
                if (e.key === 'Escape') setShowNameModal(false);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN ACTIVITY COMPONENT (wrapper with save flow)
// ============================================
const MelodyMakerActivity = ({
  onComplete,
  viewMode = false,
  isSessionMode = false
}) => {
  const [savedMelodies, setSavedMelodies] = useState(() => loadSavedMelodies());
  const [showMelodyMaker, setShowMelodyMaker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle when a melody is saved
  const handleSaveMelody = useCallback((melodyLoop) => {
    console.log('🎵 Melody created:', melodyLoop.name);

    const updated = saveMelodyToStorage(melodyLoop);
    setSavedMelodies(updated);
    setShowMelodyMaker(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 2000);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header - hide when melody maker is open */}
      {!showMelodyMaker && (
        <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Music2 className="text-purple-400" />
                Build Your Melody
              </h1>
              <p className="text-gray-400 mt-1">
                Create a melody to use in your game composition
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-400">Melodies Created</div>
                <div className="text-2xl font-bold text-purple-400">{savedMelodies.length}</div>
              </div>
              {savedMelodies.length > 0 && (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showMelodyMaker ? '' : 'items-center justify-center p-8'}`}>
        {showMelodyMaker ? (
          <MelodyGridEditor
            onSave={handleSaveMelody}
            onClose={() => setShowMelodyMaker(false)}
            melodyCount={savedMelodies.length}
          />
        ) : (
          /* Main menu */
          <div className="w-full max-w-xl space-y-6">
            {/* Success message */}
            {showSuccess && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                <Check className="text-green-400" size={24} />
                <span className="text-green-300 font-medium">
                  Melody saved! It will appear in your composition.
                </span>
              </div>
            )}

            {/* Saved melodies list */}
            {savedMelodies.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Your Melodies</h3>
                <div className="space-y-2">
                  {savedMelodies.map((melody, index) => (
                    <div
                      key={melody.id || index}
                      className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-4 py-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: melody.color || '#a855f7' }}
                      />
                      <span className="font-medium">{melody.name}</span>
                      <span className="text-gray-400 text-sm ml-auto">
                        {melody.bpm} BPM • {melody.beats === 16 ? '4' : '2'} beats
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <div>
              <button
                onClick={() => setShowMelodyMaker(true)}
                className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
              >
                <Music2 size={24} />
                {savedMelodies.length === 0 ? 'Create Your Melody' : 'Create Another Melody'}
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center text-gray-400 text-sm">
              <p>Your saved melodies will appear in your composition</p>
            </div>
          </div>
        )}
      </div>

      {/* Tips footer - only show when not in melody maker */}
      {!showMelodyMaker && (
        <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tips for a Great Melody:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Try ascending patterns (going up) for excitement</li>
              <li>• Use descending patterns (going down) for calm</li>
              <li>• Mix steps and skips for interesting contours</li>
              <li>• Match your mood to the game video energy!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MelodyMakerActivity;
export { MOODS, getContourDescription };
