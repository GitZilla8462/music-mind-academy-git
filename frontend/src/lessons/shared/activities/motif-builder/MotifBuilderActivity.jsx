// File: /src/lessons/shared/activities/motif-builder/MotifBuilderActivity.jsx
// Motif Builder - Students create a 4-8 note character theme using a virtual keyboard
// Part of Film Music Lesson 1: WHO Is In The Story? (Leitmotif & Melody)
// Responsive for 1920x1080 (teacher) and 1366x768 (Chromebook student)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Save, Music, Check, ChevronRight, RotateCcw, Volume2 } from 'lucide-react';
import * as Tone from 'tone';
import { CHARACTER_TYPES } from '../leitmotif-detective/leitmotifDetectiveConfig';
import { saveMotif, getMotif } from '../../../film-music/lesson1/lesson1StorageUtils';

// Keyboard note configuration (one octave + few extra notes for melody range)
const KEYBOARD_NOTES = [
  { note: 'C4', key: 'a', label: 'C', color: 'white' },
  { note: 'C#4', key: 'w', label: 'C#', color: 'black' },
  { note: 'D4', key: 's', label: 'D', color: 'white' },
  { note: 'D#4', key: 'e', label: 'D#', color: 'black' },
  { note: 'E4', key: 'd', label: 'E', color: 'white' },
  { note: 'F4', key: 'f', label: 'F', color: 'white' },
  { note: 'F#4', key: 't', label: 'F#', color: 'black' },
  { note: 'G4', key: 'g', label: 'G', color: 'white' },
  { note: 'G#4', key: 'y', label: 'G#', color: 'black' },
  { note: 'A4', key: 'h', label: 'A', color: 'white' },
  { note: 'A#4', key: 'u', label: 'A#', color: 'black' },
  { note: 'B4', key: 'j', label: 'B', color: 'white' },
  { note: 'C5', key: 'k', label: 'C', color: 'white' }
];

// Instrument presets for character types
const INSTRUMENTS = {
  piano: {
    name: 'Piano',
    icon: '🎹',
    config: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 } }
  },
  brass: {
    name: 'Brass',
    icon: '🎺',
    config: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.4 } }
  },
  strings: {
    name: 'Strings',
    icon: '🎻',
    config: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.0 } }
  },
  celesta: {
    name: 'Celesta',
    icon: '✨',
    config: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 1.5 } }
  },
  synth: {
    name: 'Dark Synth',
    icon: '🎛️',
    config: { oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.6 } }
  }
};

// Tempo presets
const TEMPOS = [
  { value: 60, label: 'Slow (60 BPM)' },
  { value: 80, label: 'Medium (80 BPM)' },
  { value: 100, label: 'Fast (100 BPM)' },
  { value: 120, label: 'Very Fast (120 BPM)' }
];

const MotifBuilderActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // Character selection
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Recording state
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // Settings
  const [instrument, setInstrument] = useState('piano');
  const [tempo, setTempo] = useState(80);

  // UI state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasSavedMotif, setHasSavedMotif] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Refs
  const synthRef = useRef(null);
  const recordingStartRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  // Initialize synth
  useEffect(() => {
    const config = INSTRUMENTS[instrument].config;
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    synthRef.current = new Tone.PolySynth(Tone.Synth, config).toDestination();
    synthRef.current.volume.value = -6;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (playbackTimeoutRef.current) {
        playbackTimeoutRef.current.forEach(t => clearTimeout(t));
      }
    };
  }, [instrument]);

  // Load saved motif on mount
  useEffect(() => {
    const saved = getMotif();
    if (saved) {
      setRecordedNotes(saved.notes || []);
      setSelectedCharacter(saved.characterType || null);
      setInstrument(saved.instrument || 'piano');
      setTempo(saved.tempo || 80);
      setHasSavedMotif(true);
    }
  }, []);

  // Start audio context
  const initAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setAudioReady(true);
  };

  // Play a note
  const playNote = useCallback(async (note) => {
    await initAudio();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, '8n');
    }
  }, []);

  // Handle key press
  const handleKeyDown = useCallback((noteData) => {
    if (pressedKeys.has(noteData.note)) return;

    setPressedKeys(prev => new Set([...prev, noteData.note]));
    playNote(noteData.note);

    // Record if recording
    if (isRecording) {
      const timestamp = Date.now() - recordingStartRef.current;
      setRecordedNotes(prev => {
        if (prev.length >= 8) return prev; // Max 8 notes
        return [...prev, {
          note: noteData.note,
          label: noteData.label,
          timestamp,
          duration: 250 // Default duration
        }];
      });
    }
  }, [pressedKeys, playNote, isRecording]);

  // Handle key release
  const handleKeyUp = useCallback((noteData) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteData.note);
      return newSet;
    });
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyboardDown = (e) => {
      if (e.repeat) return;
      const noteData = KEYBOARD_NOTES.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (noteData) {
        e.preventDefault();
        handleKeyDown(noteData);
      }
    };

    const handleKeyboardUp = (e) => {
      const noteData = KEYBOARD_NOTES.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (noteData) {
        e.preventDefault();
        handleKeyUp(noteData);
      }
    };

    window.addEventListener('keydown', handleKeyboardDown);
    window.addEventListener('keyup', handleKeyboardUp);

    return () => {
      window.removeEventListener('keydown', handleKeyboardDown);
      window.removeEventListener('keyup', handleKeyboardUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Start recording
  const startRecording = async () => {
    await initAudio();
    setRecordedNotes([]);
    setIsRecording(true);
    recordingStartRef.current = Date.now();
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Play recorded motif
  const playMotif = async () => {
    if (recordedNotes.length === 0) return;
    await initAudio();

    setIsPlaying(true);
    const timeouts = [];
    const beatDuration = 60000 / tempo / 2; // Eighth note duration

    recordedNotes.forEach((noteData, index) => {
      const delay = index * beatDuration;
      const t = setTimeout(() => {
        playNote(noteData.note);
      }, delay);
      timeouts.push(t);
    });

    // Stop playing after all notes
    const totalDuration = recordedNotes.length * beatDuration + 500;
    const endTimeout = setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration);
    timeouts.push(endTimeout);

    playbackTimeoutRef.current = timeouts;
  };

  // Stop playback
  const stopPlayback = () => {
    if (playbackTimeoutRef.current) {
      playbackTimeoutRef.current.forEach(t => clearTimeout(t));
    }
    setIsPlaying(false);
  };

  // Clear recorded notes
  const clearMotif = () => {
    setRecordedNotes([]);
    stopPlayback();
  };

  // Save motif
  const handleSave = () => {
    if (recordedNotes.length < 4) return;

    saveMotif(recordedNotes, selectedCharacter, instrument, tempo);
    setHasSavedMotif(true);
    setShowSaveSuccess(true);

    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Handle completion
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Get character data
  const getCharacterData = (charId) => {
    return CHARACTER_TYPES.find(c => c.id === charId);
  };

  const noteCount = recordedNotes.length;
  const canSave = noteCount >= 4 && noteCount <= 8 && selectedCharacter;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🎼</span>
              Motif Builder
            </h1>
            <p className="text-gray-400 mt-1">Create a 4-8 note theme for your character</p>
          </div>

          {/* Note counter */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-gray-400">Notes</div>
              <div className={`text-2xl font-bold ${
                noteCount < 4 ? 'text-yellow-400' :
                noteCount <= 8 ? 'text-green-400' : 'text-red-400'
              }`}>
                {noteCount}/8
              </div>
            </div>

            {hasSavedMotif && (
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={24} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Character Selection */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">1. Choose Your Character Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHARACTER_TYPES.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCharacter === char.id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                  }`}
                >
                  <span
                    className="text-xl font-bold block mb-1"
                    style={{ color: char.color }}
                  >
                    {char.name}
                  </span>
                  <span className="text-sm text-gray-400">{char.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instrument Selection */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Instrument</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(INSTRUMENTS).map(([id, inst]) => (
                  <button
                    key={id}
                    onClick={() => setInstrument(id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      instrument === id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <span>{inst.icon}</span>
                    <span className="hidden md:inline">{inst.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo Selection */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Tempo</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPOS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTempo(t.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      tempo === t.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recorded Notes Display */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">2. Record Your Motif</h2>

            {/* Notes visualization */}
            <div className="flex items-center gap-2 mb-4 min-h-[60px] bg-gray-700/50 rounded-lg p-4">
              {recordedNotes.length === 0 ? (
                <span className="text-gray-500">Click "Start Recording" then play notes on the keyboard below</span>
              ) : (
                recordedNotes.map((noteData, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      isPlaying && index === Math.floor((Date.now() - recordingStartRef.current) / (60000 / tempo / 2))
                        ? 'bg-orange-500 text-white scale-110'
                        : 'bg-orange-500/30 text-orange-300'
                    }`}
                  >
                    {noteData.label}
                  </div>
                ))
              )}
            </div>

            {/* Recording controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
                >
                  <Square size={16} fill="currentColor" />
                  Stop Recording
                </button>
              )}

              <button
                onClick={isPlaying ? stopPlayback : playMotif}
                disabled={recordedNotes.length === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  recordedNotes.length === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : isPlaying
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square size={16} fill="currentColor" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Play Motif
                  </>
                )}
              </button>

              <button
                onClick={clearMotif}
                disabled={recordedNotes.length === 0}
                className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
          </div>

          {/* Piano Keyboard */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Virtual Keyboard</h2>
            <p className="text-sm text-gray-400 mb-4">Click the keys or use your computer keyboard (A-K for white keys, W-U for black keys)</p>

            {/* Keyboard */}
            <div className="relative flex justify-center">
              <div className="relative flex">
                {KEYBOARD_NOTES.filter(n => n.color === 'white').map((noteData, index) => {
                  const isPressed = pressedKeys.has(noteData.note);
                  const blackKeyAfter = KEYBOARD_NOTES.find(
                    n => n.color === 'black' && n.note.replace('#', '') === noteData.note.replace('4', '').replace('5', '') + '#' + noteData.note.slice(-1)
                  );

                  return (
                    <div key={noteData.note} className="relative">
                      {/* White key */}
                      <button
                        onMouseDown={() => handleKeyDown(noteData)}
                        onMouseUp={() => handleKeyUp(noteData)}
                        onMouseLeave={() => handleKeyUp(noteData)}
                        className={`w-12 md:w-14 h-36 md:h-44 border border-gray-600 rounded-b-lg transition-all flex flex-col items-center justify-end pb-2 ${
                          isPressed
                            ? 'bg-orange-400 border-orange-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isPressed ? 'text-white' : 'text-gray-600'}`}>
                          {noteData.label}
                        </span>
                        <span className={`text-xs ${isPressed ? 'text-white/80' : 'text-gray-400'}`}>
                          {noteData.key.toUpperCase()}
                        </span>
                      </button>
                    </div>
                  );
                })}

                {/* Black keys overlay */}
                {KEYBOARD_NOTES.filter(n => n.color === 'black').map((noteData) => {
                  const isPressed = pressedKeys.has(noteData.note);
                  // Calculate position based on note name
                  const noteBase = noteData.note.replace('#', '').replace('4', '').replace('5', '');
                  const positions = { 'C': 0, 'D': 1, 'F': 3, 'G': 4, 'A': 5 };
                  const posIndex = positions[noteBase];
                  if (posIndex === undefined) return null;

                  // Adjust for key width (48px on mobile, 56px on desktop)
                  const leftOffset = (posIndex * 48) + 32; // For white key width of 48px

                  return (
                    <button
                      key={noteData.note}
                      onMouseDown={() => handleKeyDown(noteData)}
                      onMouseUp={() => handleKeyUp(noteData)}
                      onMouseLeave={() => handleKeyUp(noteData)}
                      className={`absolute w-8 md:w-9 h-24 md:h-28 rounded-b-lg transition-all flex flex-col items-center justify-end pb-1 z-10 ${
                        isPressed
                          ? 'bg-orange-600'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      style={{
                        left: `${posIndex * 48 + 32}px`,
                        top: 0
                      }}
                    >
                      <span className="text-xs text-gray-300">{noteData.key.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Character Tips */}
          {selectedCharacter && (
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: `${getCharacterData(selectedCharacter)?.color}20`,
                borderColor: getCharacterData(selectedCharacter)?.color
              }}
            >
              <h3 className="font-semibold text-white mb-2">
                Tips for a {getCharacterData(selectedCharacter)?.name} Theme:
              </h3>
              <p className="text-gray-300">
                {getCharacterData(selectedCharacter)?.characteristics}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <Check size={20} />
          Motif saved successfully!
        </div>
      )}

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-gray-400">
            {noteCount < 4 && (
              <span className="text-yellow-400">Add at least {4 - noteCount} more note{4 - noteCount > 1 ? 's' : ''}</span>
            )}
            {noteCount >= 4 && noteCount <= 8 && !selectedCharacter && (
              <span className="text-yellow-400">Select a character type to save</span>
            )}
            {canSave && !hasSavedMotif && (
              <span className="text-green-400">Ready to save your motif!</span>
            )}
            {hasSavedMotif && (
              <span className="text-green-400">✓ Motif saved</span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                canSave
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={20} />
              Save Motif
            </button>

            {hasSavedMotif && (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotifBuilderActivity;
