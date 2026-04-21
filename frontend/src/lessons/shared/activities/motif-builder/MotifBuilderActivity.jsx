// File: /src/lessons/shared/activities/motif-builder/MotifBuilderActivity.jsx
// Motif Builder — Students create a character and compose a 4-8 note theme
// Film Music Lesson 1: WHO Is In The Story? (Leitmotif & Melody)
//
// LEFT SIDE: Character Card (pick from 12, color, name, 3 words)
// RIGHT SIDE: Restricted DAW (5-note pentatonic keyboard, 6 instruments, record/playback)
//
// Responsive for 1920x1080 (teacher) and 1366x768 (Chromebook student)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Save, Check, ChevronRight, RotateCcw, Circle } from 'lucide-react';
import * as Tone from 'tone';
import { CHARACTER_LIBRARY, PENTATONIC_NOTES } from '../../../film-music/lesson1/Lesson1config';
import { MOTIF_INSTRUMENTS } from '../../../film-music/lesson1/motifInstrumentConfig';
import { saveCharacterCard, getCharacterCard, saveMotif, getMotif } from '../../../film-music/lesson1/lesson1StorageUtils';

// Color palette for character coloring
const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
  '#FFFFFF', '#1F2937',
];

const MOTIF_INSTRUMENT_LIST = Object.values(MOTIF_INSTRUMENTS);

const MotifBuilderActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // Character card state
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [threeWords, setThreeWords] = useState(['', '', '']);
  const [characterColor, setCharacterColor] = useState('#3B82F6');

  // Music state
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNoteIndex, setPlayingNoteIndex] = useState(-1);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [instrument, setInstrument] = useState('flute');

  // UI state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Refs
  const synthRef = useRef(null);
  const samplerRef = useRef(null);
  const recordingStartRef = useRef(null);
  const playbackTimeoutRef = useRef([]);

  // Initialize / switch synth when instrument changes
  useEffect(() => {
    const instConfig = MOTIF_INSTRUMENTS[instrument];
    if (!instConfig) return;

    // Dispose previous
    if (synthRef.current) { try { synthRef.current.dispose(); } catch(e) {} }
    if (samplerRef.current) { try { samplerRef.current.dispose(); } catch(e) {} }
    synthRef.current = null;
    samplerRef.current = null;

    // Try to load sampler first, fall back to PolySynth
    if (instConfig.useSampler && instConfig.samples) {
      try {
        const sampler = new Tone.Sampler({
          urls: instConfig.samples.urls,
          baseUrl: instConfig.samples.baseUrl,
          onload: () => {
            samplerRef.current = sampler;
          },
          onerror: () => {
            // Sample load failed — use PolySynth fallback
            sampler.dispose();
            const fallback = new Tone.PolySynth(Tone.Synth, instConfig.config).toDestination();
            fallback.volume.value = -6;
            synthRef.current = fallback;
          }
        }).toDestination();
        sampler.volume.value = -6;
        // Also create PolySynth immediately so we can play while samples load
        const poly = new Tone.PolySynth(Tone.Synth, instConfig.config).toDestination();
        poly.volume.value = -6;
        synthRef.current = poly;
      } catch (e) {
        const poly = new Tone.PolySynth(Tone.Synth, instConfig.config).toDestination();
        poly.volume.value = -6;
        synthRef.current = poly;
      }
    } else {
      const poly = new Tone.PolySynth(Tone.Synth, instConfig.config).toDestination();
      poly.volume.value = -6;
      synthRef.current = poly;
    }

    return () => {
      if (synthRef.current) { try { synthRef.current.dispose(); } catch(e) {} }
      if (samplerRef.current) { try { samplerRef.current.dispose(); } catch(e) {} }
      playbackTimeoutRef.current.forEach(t => clearTimeout(t));
    };
  }, [instrument]);

  // Load saved data on mount
  useEffect(() => {
    const savedCard = getCharacterCard();
    if (savedCard) {
      setSelectedCharacterId(savedCard.characterId);
      setCharacterName(savedCard.characterName || '');
      setThreeWords(savedCard.threeWords || ['', '', '']);
      setCharacterColor(savedCard.characterColor || '#3B82F6');
    }
    const savedMotif = getMotif();
    if (savedMotif) {
      setRecordedNotes(savedMotif.notes || []);
      setInstrument(savedMotif.instrument || 'flute');
      setHasSaved(true);
    }
  }, []);

  // Audio init
  const initAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setAudioReady(true);
  };

  // Play a single note
  const playNote = useCallback(async (note) => {
    await initAudio();
    const synth = samplerRef.current || synthRef.current;
    if (synth) {
      try {
        synth.triggerAttackRelease(note, '8n');
      } catch (err) {
        // Chromebook timing conflict — skip
      }
    }
  }, []);

  // Handle key press (click or keyboard)
  const handleNoteOn = useCallback((noteData) => {
    if (pressedKeys.has(noteData.note)) return;
    setPressedKeys(prev => new Set([...prev, noteData.note]));
    playNote(noteData.note);

    if (isRecording) {
      const timestamp = Date.now() - recordingStartRef.current;
      setRecordedNotes(prev => {
        if (prev.length >= 8) return prev;
        return [...prev, {
          note: noteData.note,
          label: noteData.label,
          timestamp,
          duration: 250
        }];
      });
    }
  }, [pressedKeys, playNote, isRecording]);

  const handleNoteOff = useCallback((noteData) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(noteData.note);
      return next;
    });
  }, []);

  // Keyboard event listeners (A, S, D, F, G)
  useEffect(() => {
    const down = (e) => {
      if (e.repeat) return;
      const nd = PENTATONIC_NOTES.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (nd) { e.preventDefault(); handleNoteOn(nd); }
    };
    const up = (e) => {
      const nd = PENTATONIC_NOTES.find(n => n.key.toLowerCase() === e.key.toLowerCase());
      if (nd) { e.preventDefault(); handleNoteOff(nd); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [handleNoteOn, handleNoteOff]);

  // Recording controls
  const startRecording = async () => {
    await initAudio();
    setRecordedNotes([]);
    setIsRecording(true);
    recordingStartRef.current = Date.now();
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  // Playback
  const playMotif = async () => {
    if (recordedNotes.length === 0) return;
    await initAudio();
    setIsPlaying(true);
    const timeouts = [];
    const beatDuration = 300; // ms between notes

    recordedNotes.forEach((nd, i) => {
      const delay = i * beatDuration;
      const t = setTimeout(() => {
        playNote(nd.note);
        setPlayingNoteIndex(i);
      }, delay);
      timeouts.push(t);
    });

    const endTimeout = setTimeout(() => {
      setIsPlaying(false);
      setPlayingNoteIndex(-1);
    }, recordedNotes.length * beatDuration + 400);
    timeouts.push(endTimeout);
    playbackTimeoutRef.current = timeouts;
  };

  const stopPlayback = () => {
    playbackTimeoutRef.current.forEach(t => clearTimeout(t));
    setIsPlaying(false);
    setPlayingNoteIndex(-1);
  };

  const clearMotif = () => {
    setRecordedNotes([]);
    stopPlayback();
  };

  // Save
  const handleSave = () => {
    if (recordedNotes.length < 4 || !selectedCharacterId) return;
    saveCharacterCard(selectedCharacterId, characterName, threeWords, characterColor);
    saveMotif(recordedNotes, selectedCharacterId, instrument, 80);
    setHasSaved(true);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  const noteCount = recordedNotes.length;
  const canSave = noteCount >= 4 && noteCount <= 8 && selectedCharacterId;
  const selectedCharacter = CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">🎼 Motif Builder</h1>
          <span className="text-gray-500 text-sm hidden md:inline">Build a Character. Build Their Theme.</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Note counter */}
          <div className="bg-gray-800 px-3 py-1 rounded-lg flex items-center gap-2">
            <span className="text-xs text-gray-400">Notes</span>
            <span className={`text-lg font-bold ${
              noteCount < 4 ? 'text-yellow-400' :
              noteCount <= 8 ? 'text-green-400' : 'text-red-400'
            }`}>
              {noteCount}/8
            </span>
          </div>
          {hasSaved && (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={18} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Two-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* ====== LEFT SIDE: Character Card ====== */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-700 flex flex-col overflow-y-auto p-4 space-y-4">

          {/* Character picker */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Pick Your Character</h2>
            <div className="grid grid-cols-4 gap-2">
              {CHARACTER_LIBRARY.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacterId(char.id)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-center ${
                    selectedCharacterId === char.id
                      ? 'ring-2 ring-orange-400 bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl">{char.emoji}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{char.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Character color */}
          {selectedCharacterId && (
            <div>
              <h2 className="text-sm font-semibold text-gray-300 mb-2">Color</h2>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCharacterColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      characterColor === c ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Character preview card */}
          {selectedCharacterId && (
            <div
              className="rounded-xl p-4 border-2 text-center"
              style={{
                borderColor: characterColor,
                background: `${characterColor}15`,
              }}
            >
              <div className="text-5xl mb-2">{selectedCharacter?.emoji}</div>

              {/* Name field */}
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value.slice(0, 20))}
                placeholder="Name your character"
                className="w-full bg-transparent text-center text-white text-lg font-bold placeholder-gray-500 outline-none border-b border-gray-600 focus:border-orange-400 pb-1 mb-3"
                maxLength={20}
              />

              {/* 3 words */}
              <p className="text-xs text-gray-400 mb-2">Describe in 3 words:</p>
              <div className="flex gap-1.5">
                {threeWords.map((word, i) => (
                  <input
                    key={i}
                    type="text"
                    value={word}
                    onChange={(e) => {
                      const next = [...threeWords];
                      next[i] = e.target.value.slice(0, 12);
                      setThreeWords(next);
                    }}
                    placeholder={`Word ${i + 1}`}
                    className="flex-1 bg-gray-800 text-center text-white text-xs rounded-lg px-1.5 py-1.5 placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-400"
                    maxLength={12}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Guidance box */}
          <div className="bg-gray-800/60 rounded-lg p-3 text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300">On-Screen Guidance</p>
            <p>1. Start with your 3 words</p>
            <p>2. Pick an instrument that matches</p>
            <p>3. Try 4-8 notes</p>
            <p>4. Play it back — does it sound like your words?</p>
            <p>5. If not, change something</p>
          </div>
        </div>

        {/* ====== RIGHT SIDE: DAW (Restricted Mode) ====== */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Instrument Selector */}
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 flex items-center gap-2 overflow-x-auto">
            {MOTIF_INSTRUMENT_LIST.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setInstrument(inst.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  instrument === inst.id
                    ? 'text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                }`}
                style={instrument === inst.id ? {
                  backgroundColor: inst.color,
                } : {}}
              >
                <span>{inst.emoji}</span>
                <span>{inst.name}</span>
              </button>
            ))}
          </div>

          {/* Visual note display */}
          <div className="flex-shrink-0 px-4 py-3">
            <div className="flex items-center gap-2 min-h-[52px] bg-gray-800 rounded-lg px-4 py-2">
              {recordedNotes.length === 0 ? (
                <span className="text-gray-500 text-sm">
                  {isRecording ? '🔴 Recording... play notes below!' : 'Press Record, then play notes on the keyboard'}
                </span>
              ) : (
                recordedNotes.map((nd, i) => {
                  const noteConfig = PENTATONIC_NOTES.find(n => n.note === nd.note);
                  return (
                    <div
                      key={i}
                      className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                        playingNoteIndex === i ? 'scale-110 ring-2 ring-white' : ''
                      }`}
                      style={{
                        backgroundColor: noteConfig ? `${noteConfig.color}40` : 'rgba(249,115,22,0.3)',
                        color: noteConfig?.color || '#F97316',
                      }}
                    >
                      {nd.label}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recording controls */}
          <div className="flex-shrink-0 px-4 pb-3 flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <Circle size={14} fill="currentColor" />
                Record
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <Square size={14} fill="currentColor" />
                Stop
              </button>
            )}

            <button
              onClick={isPlaying ? stopPlayback : playMotif}
              disabled={recordedNotes.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                recordedNotes.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Play</>}
            </button>

            <button
              onClick={clearMotif}
              disabled={recordedNotes.length === 0 || isRecording}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} />
              Clear
            </button>

            <div className="flex-1" />

            {/* Status hint */}
            <span className="text-xs text-gray-500">
              {noteCount < 4 && noteCount > 0 && `${4 - noteCount} more note${4 - noteCount > 1 ? 's' : ''} needed`}
              {noteCount >= 4 && noteCount <= 8 && !selectedCharacterId && 'Pick a character to save'}
              {canSave && !hasSaved && 'Ready to save!'}
              {isRecording && '🔴 Recording...'}
            </span>
          </div>

          {/* ====== 5-Note Pentatonic Keyboard ====== */}
          <div className="flex-1 flex items-stretch px-4 pb-4">
            <div className="flex-1 flex gap-2">
              {PENTATONIC_NOTES.map((nd) => {
                const isPressed = pressedKeys.has(nd.note);
                return (
                  <button
                    key={nd.note}
                    onPointerDown={(e) => { e.preventDefault(); handleNoteOn(nd); }}
                    onPointerUp={(e) => { e.preventDefault(); handleNoteOff(nd); }}
                    onPointerLeave={() => { if (pressedKeys.has(nd.note)) handleNoteOff(nd); }}
                    className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all select-none"
                    style={{
                      touchAction: 'none',
                      background: isPressed
                        ? `linear-gradient(180deg, ${nd.color} 0%, ${nd.color}CC 100%)`
                        : `linear-gradient(180deg, ${nd.color}30 0%, ${nd.color}15 100%)`,
                      border: `2px solid ${isPressed ? nd.color : nd.color + '50'}`,
                      boxShadow: isPressed
                        ? `0 0 20px ${nd.color}40, inset 0 2px 4px rgba(0,0,0,0.2)`
                        : `0 4px 12px rgba(0,0,0,0.3)`,
                      transform: isPressed ? 'scale(0.97)' : 'scale(1)',
                    }}
                  >
                    <span className={`text-4xl md:text-5xl font-bold transition-colors ${isPressed ? 'text-white' : ''}`} style={{ color: isPressed ? '#FFF' : nd.color }}>
                      {nd.label}
                    </span>
                    <span className={`text-lg md:text-xl font-mono mt-2 uppercase transition-colors ${isPressed ? 'text-white/80' : 'text-gray-500'}`}>
                      {nd.key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 px-4 py-2 flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-colors text-sm ${
            canSave
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save size={16} />
          Save
        </button>

        {hasSaved && (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Save success toast */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse text-sm">
          <Check size={18} />
          Saved!
        </div>
      )}
    </div>
  );
};

export default MotifBuilderActivity;
