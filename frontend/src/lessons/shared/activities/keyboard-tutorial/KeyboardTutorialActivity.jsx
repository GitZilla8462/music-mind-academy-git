// File: /src/lessons/shared/activities/keyboard-tutorial/KeyboardTutorialActivity.jsx
// Piano Player with Synthesia-style Falling Notes
// Features: Learn mode (frozen notes), Play mode (falling notes with beat), Hit/Miss detection
//
// PERFORMANCE OPTIMIZATIONS FOR CHROMEBOOK:
// - requestAnimationFrame for smooth 60fps animation
// - CSS transforms for GPU-accelerated rendering

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Unlock, Play, Music, ArrowUp, ArrowDown } from 'lucide-react';
import * as Tone from 'tone';

// Full octave: C4 to C5 (13 keys including black keys)
const PIANO_KEYS = [
  { note: 'C4', label: 'C', isBlack: false, keyboardKey: 'a', finger: 'L5' }, // Left pinky
  { note: 'C#4', label: 'C#', isBlack: true, keyboardKey: 'w', finger: null },
  { note: 'D4', label: 'D', isBlack: false, keyboardKey: 's', finger: 'L4' }, // Left ring
  { note: 'D#4', label: 'D#', isBlack: true, keyboardKey: 'e', finger: null },
  { note: 'E4', label: 'E', isBlack: false, keyboardKey: 'd', finger: 'L3' }, // Left middle
  { note: 'F4', label: 'F', isBlack: false, keyboardKey: 'f', finger: 'L2' }, // Left index
  { note: 'F#4', label: 'F#', isBlack: true, keyboardKey: 't', finger: null },
  { note: 'G4', label: 'G', isBlack: false, keyboardKey: 'g', finger: 'R2' }, // Right index
  { note: 'G#4', label: 'G#', isBlack: true, keyboardKey: 'y', finger: null },
  { note: 'A4', label: 'A', isBlack: false, keyboardKey: 'h', finger: 'R3' }, // Right middle
  { note: 'A#4', label: 'A#', isBlack: true, keyboardKey: 'u', finger: null },
  { note: 'B4', label: 'B', isBlack: false, keyboardKey: 'j', finger: 'R4' }, // Right ring
  { note: 'C5', label: 'C', isBlack: false, keyboardKey: 'k', finger: 'R5' }, // Right pinky
];

const WHITE_KEYS = PIANO_KEYS.filter(k => !k.isBlack);
const BLACK_KEYS = PIANO_KEYS.filter(k => k.isBlack);

// Key dimensions
const WHITE_KEY_WIDTH = 52;
const WHITE_KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 32;
const BLACK_KEY_HEIGHT = 90;
const PIANO_WIDTH = WHITE_KEYS.length * WHITE_KEY_WIDTH;

// Falling notes dimensions
const NOTE_WIDTH = 40;
const NOTE_HEIGHT = 50;
const FALL_AREA_HEIGHT = 320;
const HIT_ZONE_Y = FALL_AREA_HEIGHT - NOTE_HEIGHT; // Hit zone is at the piano keys
const HIT_ZONE_TOLERANCE = 80; // Wide tolerance for easier gameplay

// Learn mode note spacing
const LEARN_NOTE_SPACING = 60; // Pixels between notes in learn mode

// O(1) lookup
const KEY_TO_NOTE = new Map(PIANO_KEYS.map(k => [k.keyboardKey.toLowerCase(), k]));
const NOTE_TO_KEY = new Map(PIANO_KEYS.map(k => [k.note, k]));

// Get X position for any note
const getNoteX = (note) => {
  const keyData = NOTE_TO_KEY.get(note);
  if (!keyData) return 0;

  if (keyData.isBlack) {
    const blackIndex = BLACK_KEYS.findIndex(k => k.note === note);
    const whiteKeyPositions = [0, 1, 3, 4, 5];
    const whiteKeyIndex = whiteKeyPositions[blackIndex];
    return (whiteKeyIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
  } else {
    const whiteIndex = WHITE_KEYS.findIndex(k => k.note === note);
    return whiteIndex * WHITE_KEY_WIDTH + (WHITE_KEY_WIDTH - NOTE_WIDTH) / 2;
  }
};

// Melodies
const MELODIES = {
  ascending: {
    id: 'ascending',
    name: 'Ascending Scale',
    icon: <ArrowUp size={20} />,
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    description: 'C → D → E → F → G → A → B → C',
    learnMessage: "Let's play an ascending scale!"
  },
  descending: {
    id: 'descending',
    name: 'Descending Scale',
    icon: <ArrowDown size={20} />,
    notes: ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    description: 'C → B → A → G → F → E → D → C',
    learnMessage: "Let's play a descending scale!"
  }
};

// Tempo settings - Quarter notes at 80 BPM
const BPM = 80;
const BEAT_DURATION_MS = 60000 / BPM; // 750ms per beat (quarter note)
const FALL_TIME_BEATS = 2; // How many beats it takes for a note to fall from top to hit zone
const PIXELS_PER_MS = FALL_AREA_HEIGHT / (BEAT_DURATION_MS * FALL_TIME_BEATS);
const NOTE_SPACING_MS = BEAT_DURATION_MS; // One quarter note between each note

// Piano sound config
const PIANO_CONFIG = {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.15, release: 0.4 }
};

// Initialize low-latency audio
let audioContextInitialized = false;
const initAudio = async () => {
  if (audioContextInitialized) return;
  const context = new Tone.Context({ latencyHint: 'interactive', lookAhead: 0.01 });
  Tone.setContext(context);
  await Tone.start();
  audioContextInitialized = true;
};

// ============================================
// Hand Overlay Component - Positioned over piano keys
// ============================================
const HandOverlay = () => {
  // Hand overlay that sits on top of the piano keys
  // Left hand covers keys 0-3 (C,D,E,F), Right hand covers keys 4-7 (G,A,B,C)
  const leftHandX = 0; // Start at first key
  const rightHandX = 4 * WHITE_KEY_WIDTH; // Start at 5th key (G)
  const handWidth = 4 * WHITE_KEY_WIDTH; // Each hand spans 4 keys
  const handHeight = 120;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        top: 10,
        left: 0,
        right: 0,
        height: handHeight,
      }}
    >
      {/* Left Hand */}
      <svg
        className="absolute"
        style={{ left: leftHandX, top: 0 }}
        width={handWidth}
        height={handHeight}
        viewBox="0 0 208 120"
      >
        {/* Palm outline */}
        <path
          d="M 30 115
             Q 10 100 15 80
             L 20 50
             Q 22 40 30 38
             L 30 25 Q 30 15 38 15 Q 46 15 46 25 L 46 45
             L 50 20 Q 50 8 60 8 Q 70 8 70 20 L 70 48
             L 74 15 Q 74 3 85 3 Q 96 3 96 15 L 96 50
             L 100 22 Q 100 10 111 10 Q 122 10 122 22 L 122 55
             L 130 45 Q 145 35 155 50 Q 160 58 150 70 L 125 95
             Q 110 115 80 115 Z"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        {/* Finger numbers */}
        <text x="38" y="12" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">5</text>
        <text x="65" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">4</text>
        <text x="90" y="0" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">3</text>
        <text x="116" y="7" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">2</text>
        <text x="158" y="42" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" opacity="0.5">1</text>
      </svg>

      {/* Right Hand */}
      <svg
        className="absolute"
        style={{ left: rightHandX, top: 0 }}
        width={handWidth}
        height={handHeight}
        viewBox="0 0 208 120"
      >
        {/* Palm outline - mirrored */}
        <path
          d="M 178 115
             Q 198 100 193 80
             L 188 50
             Q 186 40 178 38
             L 178 25 Q 178 15 170 15 Q 162 15 162 25 L 162 45
             L 158 20 Q 158 8 148 8 Q 138 8 138 20 L 138 48
             L 134 15 Q 134 3 123 3 Q 112 3 112 15 L 112 50
             L 108 22 Q 108 10 97 10 Q 86 10 86 22 L 86 55
             L 78 45 Q 63 35 53 50 Q 48 58 58 70 L 83 95
             Q 98 115 128 115 Z"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        {/* Finger numbers */}
        <text x="50" y="42" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" opacity="0.5">1</text>
        <text x="92" y="7" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">2</text>
        <text x="118" y="0" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">3</text>
        <text x="143" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">4</text>
        <text x="170" y="12" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">5</text>
      </svg>
    </div>
  );
};

// ============================================
// Beat Indicator Component
// ============================================
const BeatIndicator = ({ beat, isPlaying }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-400 text-sm">Beat:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((b) => (
          <div
            key={b}
            className={`w-3 h-3 rounded-full transition-all duration-100 ${
              isPlaying && beat === b ? 'bg-orange-500 scale-125' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <span className="text-gray-500 text-xs ml-2">♩ = {BPM}</span>
    </div>
  );
};

// ============================================
// Main Component
// ============================================
const KeyboardTutorialActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mode, setMode] = useState('menu'); // menu, learn, playing, freeplay, complete
  const [selectedMelody, setSelectedMelody] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [keyFeedback, setKeyFeedback] = useState({}); // { note: 'hit' | 'miss' }
  const [score, setScore] = useState({ hits: 0, misses: 0, total: 0 });
  const [currentBeat, setCurrentBeat] = useState(1);

  // Learn mode state
  const [learnCurrentIndex, setLearnCurrentIndex] = useState(0);
  const [learnNoteOffsets, setLearnNoteOffsets] = useState([]); // Y offset for each note (for animation)

  // Falling notes state (for play mode)
  const [fallingNotes, setFallingNotes] = useState([]);
  const animationRef = useRef(null);
  const synthRef = useRef(null);
  const metronomeRef = useRef(null);
  const beatIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Initialize synth AFTER unlock
  useEffect(() => {
    if (!isUnlocked) return;

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 8,
      ...PIANO_CONFIG
    }).toDestination();
    synthRef.current.volume.value = -6;

    // Create metronome sound (woodblock-like click)
    metronomeRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }).toDestination();
    metronomeRef.current.volume.value = -12;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
        metronomeRef.current = null;
      }
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, [isUnlocked]);

  // Handle unlock
  const handleUnlock = async () => {
    await initAudio();
    setIsUnlocked(true);
  };

  // Play metronome click
  const playMetronomeClick = useCallback((isDownbeat = false) => {
    if (!metronomeRef.current) return;
    // Higher pitch for downbeat (beat 1)
    const pitch = isDownbeat ? 'C3' : 'G2';
    metronomeRef.current.triggerAttackRelease(pitch, '16n', Tone.immediate());
  }, []);

  // Start beat tracking for play mode
  const startBeatTracking = useCallback(() => {
    let beat = 0;

    // Play first beat immediately
    beat = 1;
    setCurrentBeat(1);
    playMetronomeClick(true);

    beatIntervalRef.current = setInterval(() => {
      beat = (beat % 4) + 1;
      setCurrentBeat(beat);
      playMetronomeClick(beat === 1);
    }, BEAT_DURATION_MS);
  }, [playMetronomeClick]);

  // Stop beat tracking
  const stopBeatTracking = useCallback(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    setCurrentBeat(1);
  }, []);

  // Set key feedback (green for hit, red for miss)
  const setKeyFeedbackWithTimeout = useCallback((note, type, duration = 400) => {
    setKeyFeedback(prev => ({ ...prev, [note]: type }));
    setTimeout(() => {
      setKeyFeedback(prev => {
        const next = { ...prev };
        delete next[note];
        return next;
      });
    }, duration);
  }, []);

  // Play a note sound
  const playNoteSound = useCallback((note) => {
    if (!synthRef.current) return;
    synthRef.current.triggerAttackRelease(note, '8n', Tone.immediate());
  }, []);

  // Handle player pressing a key
  const handleKeyPress = useCallback((noteData) => {
    setPressedKeys(prev => new Set([...prev, noteData.note]));

    // Always play the sound
    playNoteSound(noteData.note);

    // LEARN MODE: Check if correct note
    if (mode === 'learn' && selectedMelody) {
      const expectedNote = selectedMelody.notes[learnCurrentIndex];

      if (noteData.note === expectedNote) {
        // Correct! Light up green and shift notes down
        setKeyFeedbackWithTimeout(noteData.note, 'hit', 300);

        // Animate all notes shifting down
        setLearnNoteOffsets(prev => prev.map((offset, idx) =>
          idx >= learnCurrentIndex ? offset + LEARN_NOTE_SPACING + NOTE_HEIGHT : offset
        ));

        // Move to next note
        const nextIndex = learnCurrentIndex + 1;
        if (nextIndex >= selectedMelody.notes.length) {
          // Done with learn mode! Start play mode after a brief delay
          setTimeout(() => {
            startPlayMode();
          }, 800);
        } else {
          setLearnCurrentIndex(nextIndex);
        }
      }
    }

    // PLAY MODE: Check if there's a note to hit in the hit zone
    if (mode === 'playing' && isPlaying) {
      setFallingNotes(prev => {
        const noteInZone = prev.find(n =>
          !n.hit && !n.missed &&
          n.note === noteData.note &&
          n.y >= HIT_ZONE_Y - HIT_ZONE_TOLERANCE &&
          n.y <= HIT_ZONE_Y + HIT_ZONE_TOLERANCE
        );

        if (noteInZone) {
          // HIT! Light up key green
          setKeyFeedbackWithTimeout(noteData.note, 'hit');
          setScore(s => ({ ...s, hits: s.hits + 1 }));
          return prev.map(n =>
            n.id === noteInZone.id ? { ...n, hit: true } : n
          );
        }

        return prev;
      });
    }

    // Clear pressed key after short delay
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteData.note);
        return newSet;
      });
    }, 150);
  }, [mode, selectedMelody, learnCurrentIndex, isPlaying, playNoteSound, setKeyFeedbackWithTimeout]);

  // Start learn mode for a melody
  const startLearnMode = (melodyId) => {
    const melody = MELODIES[melodyId];
    setSelectedMelody(melody);
    setLearnCurrentIndex(0);
    // Initialize note offsets (all start at 0)
    setLearnNoteOffsets(new Array(melody.notes.length).fill(0));
    setMode('learn');
  };

  // Start play mode (falling notes with beat)
  const startPlayMode = useCallback(() => {
    if (!selectedMelody) return;

    setScore({ hits: 0, misses: 0, total: selectedMelody.notes.length });
    setMode('playing');

    // Create falling notes spaced as quarter notes
    const pixelsPerQuarterNote = PIXELS_PER_MS * NOTE_SPACING_MS;

    const notes = selectedMelody.notes.map((note, index) => ({
      id: `${note}-${index}-${Date.now()}`,
      note,
      y: -NOTE_HEIGHT - (index * pixelsPerQuarterNote),
      hit: false,
      missed: false
    }));

    setFallingNotes(notes);
    setIsPlaying(true);
    lastTimeRef.current = 0;

    // Start the beat/metronome
    startBeatTracking();
  }, [selectedMelody, startBeatTracking]);

  // Animation loop for play mode
  useEffect(() => {
    if (mode !== 'playing' || !isPlaying || fallingNotes.length === 0) return;

    const animate = (currentTime) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const pixelsDelta = PIXELS_PER_MS * deltaTime;

      setFallingNotes(prev => {
        let allDone = true;

        const updated = prev.map(note => {
          if (note.hit || note.missed) {
            // Already handled, but keep it visible briefly
            if (note.y < FALL_AREA_HEIGHT + 100) {
              allDone = false;
              return { ...note, y: note.y + pixelsDelta };
            }
            return note;
          }

          allDone = false;
          const newY = note.y + pixelsDelta;

          // Check if note passed the hit zone without being hit (MISS)
          if (newY > HIT_ZONE_Y + HIT_ZONE_TOLERANCE + NOTE_HEIGHT) {
            // Light up key red for miss
            setKeyFeedbackWithTimeout(note.note, 'miss');
            setScore(s => ({ ...s, misses: s.misses + 1 }));
            return { ...note, y: newY, missed: true };
          }

          return { ...note, y: newY };
        });

        // Check if song is done
        if (allDone || updated.every(n => n.hit || n.missed)) {
          const remaining = updated.filter(n => !n.hit && !n.missed && n.y < FALL_AREA_HEIGHT);
          if (remaining.length === 0) {
            setTimeout(() => {
              setIsPlaying(false);
              stopBeatTracking();
              setMode('complete');
            }, 500);
          }
        }

        return updated;
      });

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, isPlaying, setKeyFeedbackWithTimeout, stopBeatTracking]);

  // Keyboard input
  useEffect(() => {
    if (!isUnlocked) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const keyData = KEY_TO_NOTE.get(e.key.toLowerCase());
      if (keyData) {
        e.preventDefault();
        handleKeyPress(keyData);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, handleKeyPress]);

  // Reset to menu
  const resetToMenu = () => {
    setMode('menu');
    setSelectedMelody(null);
    setIsPlaying(false);
    setFallingNotes([]);
    setKeyFeedback({});
    setLearnCurrentIndex(0);
    setLearnNoteOffsets([]);
    stopBeatTracking();
    lastTimeRef.current = 0;
  };

  // Calculate accuracy
  const accuracy = score.hits + score.misses > 0
    ? Math.round((score.hits / (score.hits + score.misses)) * 100)
    : 0;

  // Get the current note to play in learn mode
  const currentLearnNote = selectedMelody?.notes[learnCurrentIndex];

  // Unlock Screen
  if (!isUnlocked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center max-w-lg p-8">
          <div className="text-8xl mb-6">🎹</div>
          <h1 className="text-4xl font-bold text-white mb-4">Piano Player</h1>
          <p className="text-xl text-gray-300 mb-2">
            Learn melodies step by step!
          </p>
          <p className="text-gray-500 mb-8">
            First learn, then play at {BPM} BPM
          </p>
          <button
            onClick={handleUnlock}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Unlock size={28} />
            Start Playing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">🎹 Piano Player</h1>
            <p className="text-gray-400 text-sm">
              {mode === 'learn' ? `Part 1: Play Note by Note` :
               mode === 'playing' ? `Part 2: Play in Time • ♩ = ${BPM}` :
               mode === 'freeplay' ? 'Free Play' : 'Select a melody'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {mode === 'playing' && (
              <div className="flex gap-3 text-sm">
                <span className="text-green-400">✓ {score.hits}</span>
                <span className="text-red-400">✗ {score.misses}</span>
              </div>
            )}
            {mode === 'learn' && (
              <div className="text-sm text-gray-400">
                {learnCurrentIndex + 1} / {selectedMelody?.notes.length}
              </div>
            )}
            {(mode === 'playing' || mode === 'freeplay' || mode === 'learn') && (
              <button onClick={resetToMenu} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">

        {/* Menu */}
        {mode === 'menu' && (
          <div className="w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Choose a Melody</h2>
            {Object.values(MELODIES).map((melody) => (
              <button
                key={melody.id}
                onClick={() => startLearnMode(melody.id)}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {melody.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="text-lg font-semibold text-white group-hover:text-orange-400">{melody.name}</div>
                  <div className="text-sm text-gray-400">{melody.description}</div>
                </div>
                <Play className="text-gray-500 group-hover:text-orange-400" />
              </button>
            ))}
            <div className="border-t border-gray-700 pt-4 mt-6">
              <button
                onClick={() => setMode('freeplay')}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  <Music size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-lg font-semibold text-white group-hover:text-purple-400">Free Play</div>
                  <div className="text-sm text-gray-400">Just play the keyboard freely</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Learn Mode */}
        {mode === 'learn' && selectedMelody && (
          <div className="relative" style={{ width: PIANO_WIDTH }}>
            {/* Part 1 Title */}
            <div className="text-center mb-2">
              <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-semibold mb-2">
                Part 1: Play Note by Note
              </div>
              <p className="text-2xl font-bold text-white mb-1">{selectedMelody.learnMessage}</p>
              <p className="text-gray-400 text-sm">Play each note as it's highlighted</p>
            </div>

            {/* Notes Area */}
            <div
              className="relative bg-gray-950 rounded-t-xl overflow-hidden"
              style={{ height: FALL_AREA_HEIGHT }}
            >
              {/* Lane guides */}
              {WHITE_KEYS.map((key, idx) => (
                <div
                  key={key.note}
                  className="absolute top-0 bottom-0 border-r border-gray-800/30"
                  style={{ left: idx * WHITE_KEY_WIDTH, width: WHITE_KEY_WIDTH }}
                />
              ))}

              {/* Frozen notes - all visible, stacked from bottom */}
              {selectedMelody.notes.map((note, index) => {
                const keyData = NOTE_TO_KEY.get(note);
                const noteX = getNoteX(note);
                const isCurrentNote = index === learnCurrentIndex;
                const isPlayed = index < learnCurrentIndex;

                // Calculate Y position: bottom note is at hit zone, others stack above
                // As notes are played, they shift down (offset increases)
                const baseY = HIT_ZONE_Y - (index * (NOTE_HEIGHT + LEARN_NOTE_SPACING));
                const offset = learnNoteOffsets[index] || 0;
                const noteY = baseY + offset;

                // Don't render notes that have scrolled off
                if (isPlayed) return null;

                return (
                  <div
                    key={`learn-${note}-${index}`}
                    className={`absolute rounded-md flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                      isCurrentNote
                        ? 'bg-green-500 ring-4 ring-green-400/50'
                        : keyData?.isBlack
                        ? 'bg-purple-500/70'
                        : 'bg-blue-500/70'
                    }`}
                    style={{
                      left: noteX,
                      top: noteY,
                      width: NOTE_WIDTH,
                      height: NOTE_HEIGHT,
                      transform: 'translateZ(0)',
                    }}
                  >
                    <span className="text-white text-shadow">{keyData?.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Piano Keyboard with Hand Overlay */}
            <div className="relative bg-gray-800 rounded-b-xl pt-1 pb-2 px-1" style={{ height: WHITE_KEY_HEIGHT + 20 }}>
              {/* Hand outline overlay */}
              <HandOverlay />

              {/* White keys */}
              <div className="relative flex">
                {WHITE_KEYS.map((key) => {
                  const isPressed = pressedKeys.has(key.note);
                  const feedback = keyFeedback[key.note];
                  const isExpectedKey = key.note === currentLearnNote;

                  // Determine key color
                  let bgClass = 'bg-white hover:bg-gray-100';
                  let borderClass = 'border-gray-300';
                  if (feedback === 'hit') {
                    bgClass = 'bg-green-400';
                    borderClass = 'border-green-500';
                  } else if (feedback === 'miss') {
                    bgClass = 'bg-red-400';
                    borderClass = 'border-red-500';
                  } else if (isExpectedKey) {
                    bgClass = 'bg-green-200';
                    borderClass = 'border-green-400';
                  } else if (isPressed) {
                    bgClass = 'bg-orange-300';
                    borderClass = 'border-orange-400';
                  }

                  return (
                    <button
                      key={key.note}
                      onMouseDown={() => handleKeyPress(key)}
                      onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key); }}
                      className={`relative flex flex-col items-center justify-end pb-2 rounded-b-lg border transition-all duration-100 ${bgClass} ${borderClass}`}
                      style={{
                        width: WHITE_KEY_WIDTH,
                        height: WHITE_KEY_HEIGHT,
                        transform: isPressed ? 'translateY(2px)' : 'none',
                      }}
                    >
                      <span className={`text-xs font-bold ${feedback ? 'text-white' : isExpectedKey ? 'text-green-700' : isPressed ? 'text-orange-700' : 'text-gray-700'}`}>
                        {key.label}
                      </span>
                      <span className={`text-[10px] mt-0.5 ${feedback ? 'text-white/70' : 'text-gray-400'}`}>
                        {key.keyboardKey.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Black keys */}
              {BLACK_KEYS.map((key, idx) => {
                const isPressed = pressedKeys.has(key.note);
                const feedback = keyFeedback[key.note];
                const isExpectedKey = key.note === currentLearnNote;
                const positions = [0, 1, 3, 4, 5];
                const leftPos = (positions[idx] + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;

                // Determine black key color
                let bgClass = 'bg-gray-900 hover:bg-gray-800';
                if (feedback === 'hit') {
                  bgClass = 'bg-green-500';
                } else if (feedback === 'miss') {
                  bgClass = 'bg-red-500';
                } else if (isExpectedKey) {
                  bgClass = 'bg-green-600';
                } else if (isPressed) {
                  bgClass = 'bg-purple-600';
                }

                return (
                  <button
                    key={key.note}
                    onMouseDown={() => handleKeyPress(key)}
                    onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key); }}
                    className={`absolute top-1 rounded-b-lg flex flex-col items-center justify-end pb-1 transition-all duration-100 ${bgClass}`}
                    style={{
                      left: leftPos,
                      width: BLACK_KEY_WIDTH,
                      height: BLACK_KEY_HEIGHT,
                      transform: isPressed ? 'translateY(2px)' : 'none',
                      zIndex: 10
                    }}
                  >
                    <span className="text-[9px] text-gray-400">
                      {key.keyboardKey.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Playing / Free Play Mode */}
        {(mode === 'playing' || mode === 'freeplay') && (
          <div className="relative" style={{ width: PIANO_WIDTH }}>
            {/* Part 2 Title & Beat Indicator */}
            {mode === 'playing' && (
              <div className="text-center mb-2">
                <div className="inline-block px-3 py-1 bg-orange-600 rounded-full text-white text-sm font-semibold mb-2">
                  Part 2: Play in Time
                </div>
                <p className="text-lg font-bold text-white mb-1">Now play with the beat!</p>
                <BeatIndicator beat={currentBeat} isPlaying={isPlaying} />
              </div>
            )}

            {/* Falling Notes Area */}
            <div
              className="relative bg-gray-950 rounded-t-xl overflow-hidden"
              style={{ height: FALL_AREA_HEIGHT }}
            >
              {/* Lane guides */}
              {WHITE_KEYS.map((key, idx) => (
                <div
                  key={key.note}
                  className="absolute top-0 bottom-0 border-r border-gray-800/30"
                  style={{ left: idx * WHITE_KEY_WIDTH, width: WHITE_KEY_WIDTH }}
                />
              ))}

              {/* Falling notes */}
              {fallingNotes.map((note) => {
                const keyData = NOTE_TO_KEY.get(note.note);
                const noteX = getNoteX(note.note);

                return (
                  <div
                    key={note.id}
                    className={`absolute rounded-md flex items-center justify-center font-bold text-sm shadow-lg ${
                      note.hit
                        ? 'bg-green-500 scale-110'
                        : note.missed
                        ? 'bg-red-500 opacity-50'
                        : keyData?.isBlack
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      left: noteX,
                      top: note.y,
                      width: NOTE_WIDTH,
                      height: NOTE_HEIGHT,
                      transform: 'translateZ(0)',
                      transition: note.hit ? 'transform 0.1s, background-color 0.1s' : 'none',
                    }}
                  >
                    <span className="text-white text-shadow">{keyData?.label}</span>
                  </div>
                );
              })}

              {/* Free play message */}
              {mode === 'freeplay' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Music className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-400">Play any keys!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Piano Keyboard */}
            <div className="relative bg-gray-800 rounded-b-xl pt-1 pb-2 px-1" style={{ height: WHITE_KEY_HEIGHT + 20 }}>
              {/* White keys */}
              <div className="relative flex">
                {WHITE_KEYS.map((key) => {
                  const isPressed = pressedKeys.has(key.note);
                  const feedback = keyFeedback[key.note];

                  // Determine key color: hit=green, miss=red, pressed=orange, default=white
                  let bgClass = 'bg-white hover:bg-gray-100';
                  let borderClass = 'border-gray-300';
                  if (feedback === 'hit') {
                    bgClass = 'bg-green-400';
                    borderClass = 'border-green-500';
                  } else if (feedback === 'miss') {
                    bgClass = 'bg-red-400';
                    borderClass = 'border-red-500';
                  } else if (isPressed) {
                    bgClass = 'bg-orange-300';
                    borderClass = 'border-orange-400';
                  }

                  return (
                    <button
                      key={key.note}
                      onMouseDown={() => handleKeyPress(key)}
                      onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key); }}
                      className={`relative flex flex-col items-center justify-end pb-2 rounded-b-lg border transition-all duration-100 ${bgClass} ${borderClass}`}
                      style={{
                        width: WHITE_KEY_WIDTH,
                        height: WHITE_KEY_HEIGHT,
                        transform: isPressed ? 'translateY(2px)' : 'none',
                      }}
                    >
                      <span className={`text-xs font-bold ${feedback ? 'text-white' : isPressed ? 'text-orange-700' : 'text-gray-700'}`}>
                        {key.label}
                      </span>
                      <span className={`text-[10px] mt-0.5 ${feedback ? 'text-white/70' : 'text-gray-400'}`}>
                        {key.keyboardKey.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Black keys */}
              {BLACK_KEYS.map((key, idx) => {
                const isPressed = pressedKeys.has(key.note);
                const feedback = keyFeedback[key.note];
                const positions = [0, 1, 3, 4, 5];
                const leftPos = (positions[idx] + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;

                // Determine black key color: hit=green, miss=red, pressed=purple, default=dark
                let bgClass = 'bg-gray-900 hover:bg-gray-800';
                if (feedback === 'hit') {
                  bgClass = 'bg-green-500';
                } else if (feedback === 'miss') {
                  bgClass = 'bg-red-500';
                } else if (isPressed) {
                  bgClass = 'bg-purple-600';
                }

                return (
                  <button
                    key={key.note}
                    onMouseDown={() => handleKeyPress(key)}
                    onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key); }}
                    className={`absolute top-1 rounded-b-lg flex flex-col items-center justify-end pb-1 transition-all duration-100 ${bgClass}`}
                    style={{
                      left: leftPos,
                      width: BLACK_KEY_WIDTH,
                      height: BLACK_KEY_HEIGHT,
                      transform: isPressed ? 'translateY(2px)' : 'none',
                      zIndex: 10
                    }}
                  >
                    <span className="text-[9px] text-gray-400">
                      {key.keyboardKey.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Key hint */}
            <p className="text-center text-gray-500 text-xs mt-3">
              White: A S D F G H J K • Black: W E T Y U
            </p>
          </div>
        )}

        {/* Complete */}
        {mode === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">{accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</div>
            <h2 className="text-3xl font-bold text-white">
              {accuracy >= 80 ? 'Excellent!' : accuracy >= 50 ? 'Good Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-xl text-gray-300">
              <span className="text-orange-400">{selectedMelody?.name}</span> • ♩ = {BPM}
            </p>
            <div className="flex gap-6 justify-center">
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">{score.hits}</div>
                <div className="text-gray-400 text-sm">Hits</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400">{score.misses}</div>
                <div className="text-gray-400 text-sm">Misses</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-3xl font-bold text-orange-400">{accuracy}%</div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => startLearnMode(selectedMelody.id)}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
              >
                Play Again
              </button>
              <button
                onClick={resetToMenu}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg"
              >
                Choose Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 p-3">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button
            onClick={() => onComplete?.()}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
          >
            Continue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { PIANO_KEYS, MELODIES };
export default KeyboardTutorialActivity;
