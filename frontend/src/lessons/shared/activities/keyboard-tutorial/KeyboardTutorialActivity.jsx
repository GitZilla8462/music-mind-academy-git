// File: /src/lessons/shared/activities/keyboard-tutorial/KeyboardTutorialActivity.jsx
// Piano Player with Synthesia-style Falling Notes
// Full octave piano with black keys, continuous falling notes, splash effects
//
// PERFORMANCE OPTIMIZATIONS FOR CHROMEBOOK:
// - requestAnimationFrame for smooth 60fps animation
// - CSS transforms for GPU-accelerated rendering
// - Minimal DOM updates during animation

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Unlock, Play, Music, ArrowUp, ArrowDown } from 'lucide-react';
import * as Tone from 'tone';

// Full octave: C4 to C5 (13 keys including black keys)
const PIANO_KEYS = [
  { note: 'C4', label: 'C', isBlack: false, keyboardKey: 'a' },
  { note: 'C#4', label: 'C#', isBlack: true, keyboardKey: 'w' },
  { note: 'D4', label: 'D', isBlack: false, keyboardKey: 's' },
  { note: 'D#4', label: 'D#', isBlack: true, keyboardKey: 'e' },
  { note: 'E4', label: 'E', isBlack: false, keyboardKey: 'd' },
  { note: 'F4', label: 'F', isBlack: false, keyboardKey: 'f' },
  { note: 'F#4', label: 'F#', isBlack: true, keyboardKey: 't' },
  { note: 'G4', label: 'G', isBlack: false, keyboardKey: 'g' },
  { note: 'G#4', label: 'G#', isBlack: true, keyboardKey: 'y' },
  { note: 'A4', label: 'A', isBlack: false, keyboardKey: 'h' },
  { note: 'A#4', label: 'A#', isBlack: true, keyboardKey: 'u' },
  { note: 'B4', label: 'B', isBlack: false, keyboardKey: 'j' },
  { note: 'C5', label: 'C', isBlack: false, keyboardKey: 'k' },
];

const WHITE_KEYS = PIANO_KEYS.filter(k => !k.isBlack);
const BLACK_KEYS = PIANO_KEYS.filter(k => k.isBlack);

// Key dimensions
const WHITE_KEY_WIDTH = 52;
const WHITE_KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 32;
const BLACK_KEY_HEIGHT = 90;
const PIANO_WIDTH = WHITE_KEYS.length * WHITE_KEY_WIDTH;

// O(1) lookup
const KEY_TO_NOTE = new Map(PIANO_KEYS.map(k => [k.keyboardKey.toLowerCase(), k]));
const NOTE_TO_KEY = new Map(PIANO_KEYS.map(k => [k.note, k]));

// Get X position for any note (center of the key)
const getNoteX = (note) => {
  const keyData = NOTE_TO_KEY.get(note);
  if (!keyData) return 0;

  if (keyData.isBlack) {
    // Black key position - between white keys
    const blackIndex = BLACK_KEYS.findIndex(k => k.note === note);
    // Black keys appear after C, D, F, G, A (indices 0, 1, 3, 4, 5 of white keys)
    const whiteKeyPositions = [0, 1, 3, 4, 5]; // Which white key each black key follows
    const whiteKeyIndex = whiteKeyPositions[blackIndex];
    return (whiteKeyIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
  } else {
    // White key position
    const whiteIndex = WHITE_KEYS.findIndex(k => k.note === note);
    return whiteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH / 2 - 20; // Center of white key
  }
};

// Melodies (using only white keys for simplicity)
const MELODIES = {
  ascending: {
    id: 'ascending',
    name: 'Ascending Scale',
    icon: <ArrowUp size={20} />,
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    description: 'C → D → E → F → G → A → B → C'
  },
  descending: {
    id: 'descending',
    name: 'Descending Scale',
    icon: <ArrowDown size={20} />,
    notes: ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    description: 'C → B → A → G → F → E → D → C'
  }
};

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
// Splash Effect Component
// ============================================
const SplashEffect = ({ x, color, onComplete }) => {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 300;

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setOpacity(1 - progress);
      setScale(0.5 + progress * 1.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        bottom: WHITE_KEY_HEIGHT - 10,
        width: 60,
        height: 60,
        marginLeft: -30,
        backgroundColor: color,
        opacity,
        transform: `scale(${scale})`,
        transition: 'none',
      }}
    />
  );
};

// ============================================
// Main Component
// ============================================
const KeyboardTutorialActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mode, setMode] = useState('menu');
  const [selectedMelody, setSelectedMelody] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [splashes, setSplashes] = useState([]);
  const [score, setScore] = useState({ hits: 0, total: 0 });

  // Falling notes state
  const [fallingNotes, setFallingNotes] = useState([]);
  const animationRef = useRef(null);
  const synthRef = useRef(null);
  const containerRef = useRef(null);
  const splashIdRef = useRef(0);

  // Note dimensions for falling
  const NOTE_WIDTH = 40;
  const NOTE_HEIGHT = 60;
  const FALL_AREA_HEIGHT = 300;
  const FALL_SPEED = 200; // pixels per second

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 8,
      ...PIANO_CONFIG
    }).toDestination();
    synthRef.current.volume.value = -10;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Handle unlock
  const handleUnlock = async () => {
    await initAudio();
    setIsUnlocked(true);
  };

  // Play a note with splash
  const playNote = useCallback((noteData, fromFallingNote = false) => {
    if (!synthRef.current) return;

    synthRef.current.triggerAttackRelease(noteData.note, '8n', Tone.immediate());

    setPressedKeys(prev => new Set([...prev, noteData.note]));

    // Add splash effect
    const x = getNoteX(noteData.note) + (noteData.isBlack ? BLACK_KEY_WIDTH / 2 : 20);
    const splashId = ++splashIdRef.current;
    setSplashes(prev => [...prev, {
      id: splashId,
      x,
      color: fromFallingNote ? '#22c55e' : '#f97316'
    }]);

    // Clear pressed key
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteData.note);
        return newSet;
      });
    }, 150);
  }, []);

  // Remove splash
  const removeSplash = useCallback((id) => {
    setSplashes(prev => prev.filter(s => s.id !== id));
  }, []);

  // Start melody
  const startMelody = (melodyId) => {
    const melody = MELODIES[melodyId];
    setSelectedMelody(melody);
    setScore({ hits: 0, total: melody.notes.length });
    setMode('playing');

    // Create falling notes with staggered positions
    const notes = melody.notes.map((note, index) => ({
      id: `${note}-${index}-${Date.now()}`,
      note,
      y: -NOTE_HEIGHT - (index * 100), // Stagger start positions
      hit: false,
      passed: false
    }));

    setFallingNotes(notes);
    setIsPlaying(true);
  };

  // Animation loop for falling notes
  useEffect(() => {
    if (!isPlaying || fallingNotes.length === 0) return;

    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setFallingNotes(prev => {
        let allPassed = true;
        const updated = prev.map(note => {
          if (note.passed) return note;

          allPassed = false;
          const newY = note.y + FALL_SPEED * deltaTime;

          // Check if note hit the piano (bottom of fall area)
          if (newY >= FALL_AREA_HEIGHT - NOTE_HEIGHT && !note.hit) {
            // Auto-play the note when it hits
            const keyData = NOTE_TO_KEY.get(note.note);
            if (keyData) {
              playNote(keyData, true);
              setScore(s => ({ ...s, hits: s.hits + 1 }));
            }
            return { ...note, y: newY, hit: true };
          }

          // Mark as passed when off screen
          if (newY > FALL_AREA_HEIGHT + 50) {
            return { ...note, passed: true };
          }

          return { ...note, y: newY };
        });

        // Check if all notes have passed
        if (allPassed || updated.every(n => n.passed)) {
          setTimeout(() => {
            setIsPlaying(false);
            setMode('complete');
          }, 500);
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
  }, [isPlaying, playNote]);

  // Keyboard input
  useEffect(() => {
    if (!isUnlocked) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const keyData = KEY_TO_NOTE.get(e.key.toLowerCase());
      if (keyData) {
        e.preventDefault();
        playNote(keyData);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, playNote]);

  // Reset to menu
  const resetToMenu = () => {
    setMode('menu');
    setSelectedMelody(null);
    setIsPlaying(false);
    setFallingNotes([]);
    setSplashes([]);
  };

  // Unlock Screen
  if (!isUnlocked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center max-w-lg p-8">
          <div className="text-8xl mb-6">🎹</div>
          <h1 className="text-4xl font-bold text-white mb-4">Piano Player</h1>
          <p className="text-xl text-gray-300 mb-8">
            Watch the falling notes and play along!
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
              {mode === 'playing' ? selectedMelody?.name : mode === 'freeplay' ? 'Free Play' : 'Select a melody'}
            </p>
          </div>
          {(mode === 'playing' || mode === 'freeplay') && (
            <button onClick={resetToMenu} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
              Back
            </button>
          )}
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
                onClick={() => startMelody(melody.id)}
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

        {/* Playing / Free Play Mode */}
        {(mode === 'playing' || mode === 'freeplay') && (
          <div
            ref={containerRef}
            className="relative"
            style={{ width: PIANO_WIDTH }}
          >
            {/* Falling Notes Area */}
            <div
              className="relative bg-gray-950 rounded-t-xl overflow-hidden"
              style={{ height: FALL_AREA_HEIGHT }}
            >
              {/* Lane guides for white keys */}
              {WHITE_KEYS.map((key, idx) => (
                <div
                  key={key.note}
                  className="absolute top-0 bottom-0 border-r border-gray-800/50"
                  style={{
                    left: idx * WHITE_KEY_WIDTH,
                    width: WHITE_KEY_WIDTH
                  }}
                />
              ))}

              {/* Falling notes */}
              {fallingNotes.map((note) => {
                const keyData = NOTE_TO_KEY.get(note.note);
                const noteX = getNoteX(note.note);
                const isBlack = keyData?.isBlack;

                return (
                  <div
                    key={note.id}
                    className={`absolute rounded-md flex items-center justify-center font-bold text-sm ${
                      note.hit
                        ? 'bg-green-500'
                        : isBlack
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      left: noteX,
                      top: note.y,
                      width: NOTE_WIDTH,
                      height: NOTE_HEIGHT,
                      opacity: note.hit ? 0.5 : 1,
                      transform: 'translateZ(0)',
                    }}
                  >
                    <span className="text-white">{keyData?.label}</span>
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
              {/* Splash effects */}
              {splashes.map((splash) => (
                <SplashEffect
                  key={splash.id}
                  x={splash.x}
                  color={splash.color}
                  onComplete={() => removeSplash(splash.id)}
                />
              ))}

              {/* White keys */}
              <div className="relative flex">
                {WHITE_KEYS.map((key) => {
                  const isPressed = pressedKeys.has(key.note);
                  return (
                    <button
                      key={key.note}
                      onMouseDown={() => playNote(key)}
                      onTouchStart={(e) => { e.preventDefault(); playNote(key); }}
                      className={`relative flex flex-col items-center justify-end pb-2 rounded-b-lg border border-gray-300 transition-all duration-50 ${
                        isPressed
                          ? 'bg-orange-300 border-orange-400'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                      style={{
                        width: WHITE_KEY_WIDTH,
                        height: WHITE_KEY_HEIGHT,
                        transform: isPressed ? 'translateY(2px)' : 'none',
                      }}
                    >
                      <span className={`text-xs font-bold ${isPressed ? 'text-orange-700' : 'text-gray-700'}`}>
                        {key.label}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {key.keyboardKey.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Black keys */}
              {BLACK_KEYS.map((key, idx) => {
                const isPressed = pressedKeys.has(key.note);
                // Position black keys between white keys
                const positions = [0, 1, 3, 4, 5]; // After C, D, F, G, A
                const leftPos = (positions[idx] + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;

                return (
                  <button
                    key={key.note}
                    onMouseDown={() => playNote(key)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(key); }}
                    className={`absolute top-1 rounded-b-lg flex flex-col items-center justify-end pb-1 transition-all duration-50 ${
                      isPressed
                        ? 'bg-purple-600'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
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
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-white">Great Job!</h2>
            <p className="text-xl text-gray-300">
              You played <span className="text-orange-400">{selectedMelody?.name}</span>
            </p>
            <div className="bg-gray-800 rounded-xl p-6 inline-block">
              <div className="text-4xl font-bold text-green-400">{score.hits} / {score.total}</div>
              <div className="text-gray-400">Notes</div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => startMelody(selectedMelody.id)}
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
