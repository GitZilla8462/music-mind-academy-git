// File: /src/lessons/shared/activities/bass-builder/BassBuilderActivity.jsx
// Bass Builder - Students experiment with adding bass notes underneath a melody
// Part of Film Music Lesson 2: WHAT Do They Feel? (Orchestration & Bass)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Save, Check, RotateCcw, Volume2, ChevronRight } from 'lucide-react';
import * as Tone from 'tone';
import { saveStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Bass notes available (C2-C3 range)
const BASS_NOTES = [
  { note: 'C2', label: 'C', key: 'a' },
  { note: 'D2', label: 'D', key: 's' },
  { note: 'E2', label: 'E', key: 'd' },
  { note: 'F2', label: 'F', key: 'f' },
  { note: 'G2', label: 'G', key: 'g' },
  { note: 'A2', label: 'A', key: 'h' },
  { note: 'B2', label: 'B', key: 'j' },
  { note: 'C3', label: 'C', key: 'k' },
];

// Pre-made bass patterns students can try
const BASS_PATTERNS = [
  {
    id: 'pedal',
    name: 'Pedal Tone',
    description: 'One note held steady underneath',
    notes: [
      { note: 'C2', time: 0, duration: 4 },
    ]
  },
  {
    id: 'walking',
    name: 'Walking Bass',
    description: 'Bass moves step by step',
    notes: [
      { note: 'C2', time: 0, duration: 1 },
      { note: 'D2', time: 1, duration: 1 },
      { note: 'E2', time: 2, duration: 1 },
      { note: 'F2', time: 3, duration: 1 },
    ]
  },
  {
    id: 'root-fifth',
    name: 'Root & Fifth',
    description: 'Alternates between two strong notes',
    notes: [
      { note: 'C2', time: 0, duration: 1 },
      { note: 'G2', time: 1, duration: 1 },
      { note: 'C2', time: 2, duration: 1 },
      { note: 'G2', time: 3, duration: 1 },
    ]
  },
];

const BassBuilderActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const synthRef = useRef(null);
  const recordStartTimeRef = useRef(null);

  // Initialize bass synth
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.3 }
    }).toDestination();
    synthRef.current.volume.value = -4;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  const playNote = useCallback(async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, '4n');
    }
  }, []);

  const handleNotePress = useCallback((bassNote) => {
    playNote(bassNote.note);
    setPressedKeys(prev => new Set(prev).add(bassNote.note));
    setTimeout(() => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(bassNote.note);
        return next;
      });
    }, 200);

    if (isRecording) {
      const timestamp = (Date.now() - recordStartTimeRef.current) / 1000;
      setRecordedNotes(prev => [...prev, {
        note: bassNote.note,
        timestamp,
        duration: 0.5,
      }]);
    }
  }, [playNote, isRecording]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const bassNote = BASS_NOTES.find(n => n.key === e.key.toLowerCase());
      if (bassNote) {
        handleNotePress(bassNote);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNotePress]);

  const handleStartRecording = async () => {
    await Tone.start();
    setRecordedNotes([]);
    setIsRecording(true);
    recordStartTimeRef.current = Date.now();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    recordStartTimeRef.current = null;
  };

  const handlePlayback = useCallback(async () => {
    if (isPlaying || recordedNotes.length === 0) return;
    await Tone.start();
    setIsPlaying(true);

    const now = Tone.now();
    recordedNotes.forEach(({ note, timestamp, duration }) => {
      synthRef.current.triggerAttackRelease(note, duration, now + timestamp);
    });

    const totalDuration = Math.max(...recordedNotes.map(n => n.timestamp + n.duration));
    setTimeout(() => setIsPlaying(false), totalDuration * 1000 + 200);
  }, [recordedNotes, isPlaying]);

  const handleTryPattern = useCallback(async (pattern) => {
    await Tone.start();
    setSelectedPattern(pattern.id);
    setIsPlaying(true);

    const now = Tone.now();
    pattern.notes.forEach(({ note, time, duration }) => {
      synthRef.current.triggerAttackRelease(note, duration, now + time * 0.5);
    });

    const totalDuration = Math.max(...pattern.notes.map(n => (n.time + n.duration) * 0.5));
    setTimeout(() => setIsPlaying(false), totalDuration * 1000 + 200);
  }, []);

  const handleSave = () => {
    const studentId = getStudentId();
    saveStudentWork('fm-lesson2-bass-builder', {
      title: 'Bass Builder',
      emoji: '🎸',
      subtitle: `${recordedNotes.length} notes`,
      category: 'Film Music',
      data: { recordedNotes }
    }, studentId);
    setIsSaved(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <h1 className="text-lg font-bold">Bass Builder</h1>
        <p className="text-sm text-gray-400">Experiment with bass notes — feel how they anchor the melody</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left panel - Patterns to try */}
        <div className="w-full lg:w-72 bg-gray-850 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Bass Patterns to Try
          </h3>
          <div className="space-y-2">
            {BASS_PATTERNS.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => handleTryPattern(pattern)}
                disabled={isPlaying}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedPattern === pattern.id
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-sm">{pattern.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{pattern.description}</div>
              </button>
            ))}
          </div>

          {/* Recorded notes indicator */}
          {recordedNotes.length > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-sm font-medium text-green-400">Your Recording</div>
              <div className="text-xs text-gray-400 mt-1">{recordedNotes.length} notes captured</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handlePlayback}
                  disabled={isPlaying}
                  className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                >
                  <Play className="w-3 h-3" /> Play
                </button>
                <button
                  onClick={() => setRecordedNotes([])}
                  className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main area - Keyboard and controls */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {/* Instructions */}
          <div className="text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">Play Bass Notes</h2>
            <p className="text-gray-400">
              Use keys <span className="font-mono bg-gray-800 px-1 rounded">A S D F G H J K</span> to play bass notes.
              Try a pattern first, then record your own!
            </p>
          </div>

          {/* Bass keyboard */}
          <div className="flex gap-1.5">
            {BASS_NOTES.map(bassNote => (
              <button
                key={bassNote.note}
                onMouseDown={() => handleNotePress(bassNote)}
                className={`w-14 h-24 rounded-lg border-2 flex flex-col items-center justify-end pb-2 transition-all ${
                  pressedKeys.has(bassNote.note)
                    ? 'bg-green-600 border-green-400 scale-95'
                    : 'bg-gray-800 border-gray-600 hover:border-green-500'
                }`}
              >
                <span className="text-lg font-bold">{bassNote.label}</span>
                <span className="text-xs text-gray-400 font-mono">{bassNote.key.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Record controls */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-white" />
                Record
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold animate-pulse transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop Recording
              </button>
            )}

            {recordedNotes.length > 0 && !isRecording && (
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors ${
                  isSaved
                    ? 'bg-green-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Continue
                  </>
                )}
              </button>
            )}
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording — play bass notes!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BassBuilderActivity;
