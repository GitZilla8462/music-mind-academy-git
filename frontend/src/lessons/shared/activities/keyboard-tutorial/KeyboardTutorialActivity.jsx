// File: /src/lessons/shared/activities/keyboard-tutorial/KeyboardTutorialActivity.jsx
// Keyboard Tutorial with Synthesia-style Falling Notes Game
// Part of Film Music Lesson 1: WHO Is In The Story? (Leitmotif & Melody)
//
// FEATURES:
// - Falling notes display (notes fall toward piano keys)
// - Wait Mode: Song pauses until correct note is played
// - Free Play Mode: Just play the keyboard freely
// - Two melodies: Ascending (C-D-E-F-G) and Descending (G-F-E-D-C)
//
// PERFORMANCE OPTIMIZATIONS FOR CHROMEBOOK:
// - requestAnimationFrame for smooth 60fps animation
// - CSS transforms for GPU-accelerated rendering
// - Limited DOM elements (reuse note elements)
// - Low-latency audio context

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronRight, Unlock, Play, Music, ArrowUp, ArrowDown } from 'lucide-react';
import * as Tone from 'tone';

// Piano keys for the game (one octave: C4 to G4 for simplicity)
const GAME_NOTES = [
  { note: 'C4', key: 'a', label: 'C', color: 'white' },
  { note: 'D4', key: 's', label: 'D', color: 'white' },
  { note: 'E4', key: 'd', label: 'E', color: 'white' },
  { note: 'F4', key: 'f', label: 'F', color: 'white' },
  { note: 'G4', key: 'g', label: 'G', color: 'white' },
];

// O(1) lookup maps
const KEY_TO_NOTE = new Map(GAME_NOTES.map(n => [n.key.toLowerCase(), n]));
const NOTE_TO_INDEX = new Map(GAME_NOTES.map((n, i) => [n.note, i]));

// Melodies
const MELODIES = {
  ascending: {
    id: 'ascending',
    name: 'Ascending Scale',
    icon: <ArrowUp size={20} />,
    notes: ['C4', 'D4', 'E4', 'F4', 'G4'],
    description: 'C → D → E → F → G'
  },
  descending: {
    id: 'descending',
    name: 'Descending Scale',
    icon: <ArrowDown size={20} />,
    notes: ['G4', 'F4', 'E4', 'D4', 'C4'],
    description: 'G → F → E → D → C'
  }
};

// Instrument config (simple piano sound)
const PIANO_CONFIG = {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.15, release: 0.4 }
};

// Initialize low-latency audio context
let audioContextInitialized = false;
const initLowLatencyContext = async () => {
  if (audioContextInitialized) return;
  const context = new Tone.Context({
    latencyHint: 'interactive',
    lookAhead: 0.01,
  });
  Tone.setContext(context);
  await Tone.start();
  audioContextInitialized = true;
};

// ============================================
// Falling Notes Display Component
// ============================================
const FallingNotesDisplay = ({
  currentNoteIndex,
  melody,
  isPlaying,
  onNoteHit,
  playNote
}) => {
  const containerRef = useRef(null);
  const [fallingNotes, setFallingNotes] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Note dimensions
  const NOTE_WIDTH = 60;
  const NOTE_HEIGHT = 80;
  const FALL_SPEED = 150; // pixels per second
  const HIT_LINE_Y = 320; // Y position of hit line
  const SPAWN_INTERVAL = 600; // ms between notes

  // Spawn notes when playing
  useEffect(() => {
    if (!isPlaying || !melody) {
      setFallingNotes([]);
      return;
    }

    // Spawn all notes with staggered start positions
    const notes = melody.notes.map((note, index) => ({
      id: `${note}-${index}`,
      note,
      index,
      y: -NOTE_HEIGHT - (index * SPAWN_INTERVAL * FALL_SPEED / 1000),
      hit: false,
      missed: false
    }));

    setFallingNotes(notes);
  }, [isPlaying, melody]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || fallingNotes.length === 0) return;

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setFallingNotes(prev => {
        // Only move notes that haven't been hit yet and are after current note
        return prev.map(note => {
          if (note.hit) return note;

          // In wait mode, only the current note falls
          if (note.index < currentNoteIndex) {
            return { ...note, hit: true };
          }

          // Current note falls until it reaches hit line, then waits
          if (note.index === currentNoteIndex) {
            const newY = Math.min(note.y + FALL_SPEED * deltaTime, HIT_LINE_Y - NOTE_HEIGHT);
            return { ...note, y: newY };
          }

          // Future notes stay above, stacked
          return note;
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, currentNoteIndex, fallingNotes.length]);

  // Get X position for a note
  const getNoteX = (note) => {
    const index = NOTE_TO_INDEX.get(note);
    if (index === undefined) return 0;
    // Center the notes over the keys
    const containerWidth = 5 * 72; // 5 keys * 72px each
    const startX = (containerWidth - 5 * NOTE_WIDTH) / 2 + 10;
    return startX + index * (NOTE_WIDTH + 12);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 bg-gray-950 rounded-t-xl overflow-hidden"
      style={{ minHeight: '320px' }}
    >
      {/* Lane lines */}
      {GAME_NOTES.map((noteData, idx) => (
        <div
          key={noteData.note}
          className="absolute top-0 bottom-0 border-l border-gray-800"
          style={{ left: `${getNoteX(noteData.note)}px`, width: NOTE_WIDTH }}
        />
      ))}

      {/* Hit line */}
      <div
        className="absolute left-0 right-0 h-1 bg-orange-500 shadow-lg shadow-orange-500/50"
        style={{ top: HIT_LINE_Y }}
      />
      <div
        className="absolute left-0 right-0 text-center text-orange-400 text-xs font-medium"
        style={{ top: HIT_LINE_Y + 8 }}
      >
        ▼ PLAY HERE ▼
      </div>

      {/* Falling notes */}
      {fallingNotes.map((note) => {
        const isCurrentNote = note.index === currentNoteIndex;
        const isWaiting = isCurrentNote && note.y >= HIT_LINE_Y - NOTE_HEIGHT - 5;

        return (
          <div
            key={note.id}
            className={`absolute rounded-lg flex items-center justify-center font-bold text-xl transition-colors ${
              note.hit
                ? 'bg-green-500 text-white'
                : isWaiting
                ? 'bg-orange-500 text-white animate-pulse'
                : 'bg-blue-500 text-white'
            }`}
            style={{
              left: getNoteX(note.note),
              top: note.y,
              width: NOTE_WIDTH,
              height: NOTE_HEIGHT,
              transform: 'translateZ(0)', // GPU acceleration
              opacity: note.hit ? 0.5 : 1
            }}
          >
            {GAME_NOTES.find(n => n.note === note.note)?.label}
          </div>
        );
      })}

      {/* Instructions overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80">
          <div className="text-center">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Select a melody and press Play</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Piano Keys Component (simplified for game)
// ============================================
const GamePiano = ({
  onNotePlay,
  currentNote,
  pressedKeys,
  disabled
}) => {
  const synthRef = useRef(null);
  const activeNotesRef = useRef(new Set());

  // Initialize synth
  useEffect(() => {
    if (disabled) return;

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 4,
      ...PIANO_CONFIG
    }).toDestination();
    synthRef.current.volume.value = -10;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [disabled]);

  // Play note
  const playNote = useCallback((noteData) => {
    if (disabled || !synthRef.current) return;
    if (activeNotesRef.current.has(noteData.note)) return;

    synthRef.current.triggerAttack(noteData.note, Tone.immediate());
    activeNotesRef.current.add(noteData.note);

    if (onNotePlay) {
      onNotePlay(noteData);
    }
  }, [disabled, onNotePlay]);

  // Stop note
  const stopNote = useCallback((noteData) => {
    if (disabled || !synthRef.current) return;
    if (!activeNotesRef.current.has(noteData.note)) return;

    synthRef.current.triggerRelease(noteData.note, Tone.immediate());
    activeNotesRef.current.delete(noteData.note);
  }, [disabled]);

  // Keyboard events
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const noteData = KEY_TO_NOTE.get(e.key.toLowerCase());
      if (noteData) {
        e.preventDefault();
        playNote(noteData);
      }
    };

    const handleKeyUp = (e) => {
      const noteData = KEY_TO_NOTE.get(e.key.toLowerCase());
      if (noteData) {
        e.preventDefault();
        stopNote(noteData);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote, disabled]);

  return (
    <div className="bg-gray-800 rounded-b-xl p-4">
      <div className="flex justify-center gap-1">
        {GAME_NOTES.map((noteData) => {
          const isPressed = pressedKeys.has(noteData.note);
          const isTarget = currentNote === noteData.note;

          return (
            <button
              key={noteData.note}
              onMouseDown={() => playNote(noteData)}
              onMouseUp={() => stopNote(noteData)}
              onMouseLeave={() => stopNote(noteData)}
              onTouchStart={(e) => { e.preventDefault(); playNote(noteData); }}
              onTouchEnd={(e) => { e.preventDefault(); stopNote(noteData); }}
              disabled={disabled}
              className={`
                w-16 h-32 rounded-b-lg border-2 flex flex-col items-center justify-end pb-3
                transition-all duration-50
                ${isPressed
                  ? 'bg-green-400 border-green-500 transform translate-y-1'
                  : isTarget
                  ? 'bg-orange-200 border-orange-400 animate-pulse'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
                }
              `}
            >
              <span className={`text-lg font-bold ${isPressed ? 'text-white' : 'text-gray-800'}`}>
                {noteData.label}
              </span>
              <span className={`text-sm mt-1 ${isPressed ? 'text-white/80' : 'text-gray-500'}`}>
                {noteData.key.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-gray-500 text-xs mt-3">
        Use keys A, S, D, F, G to play
      </p>
    </div>
  );
};

// ============================================
// Main Component
// ============================================
const KeyboardTutorialActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mode, setMode] = useState('menu'); // 'menu', 'playing', 'complete', 'freeplay'
  const [selectedMelody, setSelectedMelody] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [score, setScore] = useState({ hits: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle unlock
  const handleUnlock = async () => {
    await initLowLatencyContext();
    setIsUnlocked(true);
  };

  // Start a melody
  const startMelody = (melodyId) => {
    const melody = MELODIES[melodyId];
    setSelectedMelody(melody);
    setCurrentNoteIndex(0);
    setScore({ hits: 0, total: melody.notes.length });
    setMode('playing');
    setIsPlaying(true);
  };

  // Handle note played
  const handleNotePlay = useCallback((noteData) => {
    setPressedKeys(prev => new Set([...prev, noteData.note]));

    // Check if correct note in playing mode
    if (mode === 'playing' && selectedMelody && isPlaying) {
      const expectedNote = selectedMelody.notes[currentNoteIndex];

      if (noteData.note === expectedNote) {
        // Correct note!
        setScore(prev => ({ ...prev, hits: prev.hits + 1 }));

        // Move to next note
        if (currentNoteIndex < selectedMelody.notes.length - 1) {
          setCurrentNoteIndex(prev => prev + 1);
        } else {
          // Melody complete!
          setTimeout(() => {
            setIsPlaying(false);
            setMode('complete');
          }, 500);
        }
      }
    }

    // Clear pressed key after short delay
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteData.note);
        return newSet;
      });
    }, 150);
  }, [mode, selectedMelody, currentNoteIndex, isPlaying]);

  // Reset to menu
  const resetToMenu = () => {
    setMode('menu');
    setSelectedMelody(null);
    setCurrentNoteIndex(0);
    setIsPlaying(false);
    setScore({ hits: 0, total: 0 });
  };

  // Get current target note
  const currentNote = mode === 'playing' && selectedMelody
    ? selectedMelody.notes[currentNoteIndex]
    : null;

  // Unlock Screen
  if (!isUnlocked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center max-w-lg p-8">
          <div className="text-8xl mb-6">🎹</div>
          <h1 className="text-4xl font-bold text-white mb-4">Piano Player</h1>
          <p className="text-xl text-gray-300 mb-8">
            Watch the falling notes and play along!
            <br />
            <span className="text-orange-400">Wait Mode</span> - the song waits for you.
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
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🎹 Piano Player
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === 'playing' ? selectedMelody?.name :
               mode === 'freeplay' ? 'Free Play Mode' :
               'Select a melody'}
            </p>
          </div>

          {mode === 'playing' && (
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg text-center">
                <div className="text-xs text-gray-400">Note</div>
                <div className="text-lg font-bold text-orange-400">
                  {currentNoteIndex + 1} / {selectedMelody?.notes.length}
                </div>
              </div>
              <button
                onClick={resetToMenu}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Menu Mode */}
          {mode === 'menu' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                Choose a Melody
              </h2>

              {Object.values(MELODIES).map((melody) => (
                <button
                  key={melody.id}
                  onClick={() => startMelody(melody.id)}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    {melody.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {melody.name}
                    </div>
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
                    <div className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      Free Play
                    </div>
                    <div className="text-sm text-gray-400">Just play the keyboard freely</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Playing Mode */}
          {mode === 'playing' && (
            <div className="space-y-0">
              <FallingNotesDisplay
                currentNoteIndex={currentNoteIndex}
                melody={selectedMelody}
                isPlaying={isPlaying}
              />
              <GamePiano
                onNotePlay={handleNotePlay}
                currentNote={currentNote}
                pressedKeys={pressedKeys}
                disabled={false}
              />
            </div>
          )}

          {/* Complete Mode */}
          {mode === 'complete' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-white">Great Job!</h2>
              <p className="text-xl text-gray-300">
                You completed <span className="text-orange-400">{selectedMelody?.name}</span>
              </p>
              <div className="bg-gray-800 rounded-xl p-6 inline-block">
                <div className="text-4xl font-bold text-green-400">
                  {score.hits} / {score.total}
                </div>
                <div className="text-gray-400">Notes Hit</div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={() => startMelody(selectedMelody.id)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={resetToMenu}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Choose Another
                </button>
              </div>
            </div>
          )}

          {/* Free Play Mode */}
          {mode === 'freeplay' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Music className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Free Play Mode</h2>
                <p className="text-gray-400">Play any notes you like!</p>
              </div>
              <GamePiano
                onNotePlay={handleNotePlay}
                currentNote={null}
                pressedKeys={pressedKeys}
                disabled={false}
              />
              <button
                onClick={resetToMenu}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 p-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            {mode === 'playing' && (
              <span className="text-orange-400">
                ▶ Play the highlighted note: <strong>{currentNote}</strong>
              </span>
            )}
            {mode === 'menu' && <span>Choose a melody to start</span>}
            {mode === 'freeplay' && <span>Press A, S, D, F, G to play</span>}
          </div>

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

// Export for DAW reuse
export { GAME_NOTES, MELODIES, GamePiano };
export default KeyboardTutorialActivity;
