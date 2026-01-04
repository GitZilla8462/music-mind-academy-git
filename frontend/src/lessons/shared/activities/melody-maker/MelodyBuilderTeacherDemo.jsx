// File: /lessons/shared/activities/melody-maker/MelodyBuilderTeacherDemo.jsx
// Teacher demonstration: Step-by-step melody building tutorial
// Teaches: Melody, Contour (Ascending/Descending/Repeated), Steps, Skips
// Matches BeatBuilderDemo style from Lesson 4

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, ArrowLeft, ArrowRight, Music2, TrendingUp, TrendingDown, Minus, Footprints } from 'lucide-react';
import * as Tone from 'tone';

const BEATS = 8;
const BPM = 100;

// Pentatonic scale notes (low to high visually, top row = highest pitch)
const MELODY_NOTES = [
  { id: 'A4', name: 'A', color: '#a855f7', freq: 440 },
  { id: 'G4', name: 'G', color: '#3b82f6', freq: 392 },
  { id: 'E4', name: 'E', color: '#10b981', freq: 330 },
  { id: 'D4', name: 'D', color: '#f59e0b', freq: 294 },
  { id: 'C4', name: 'C', color: '#ef4444', freq: 262 },
];

// Icons for each concept
const CONCEPT_ICONS = {
  melody: Music2,
  contour: TrendingUp,
  ascending: TrendingUp,
  descending: TrendingDown,
  repeated: Minus,
  steps: Footprints,
  skips: TrendingUp,
};

// Tutorial steps - teaching melody concepts
const TUTORIAL_STEPS = [
  {
    id: 'melody',
    title: 'What is MELODY?',
    description: 'A sequence of pitches you can sing or hum',
    action: 'Watch the notes light up!',
    color: '#a855f7',
    teachingPoint: 'Every song has a melody - it\'s the part that gets stuck in your head!',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, true, false, false, false, false, false],   // G
      [true, true, false, true, true, false, false, true],       // E
      [false, false, false, false, false, true, true, false],    // D
      [false, false, false, false, false, false, false, false],  // C
    ]
  },
  {
    id: 'contour',
    title: 'What is CONTOUR?',
    description: 'The shape of a melody as it moves up, down, or stays the same',
    action: 'C → D → E → D → C → C → C → C',
    color: '#8b5cf6',
    teachingPoint: 'Contour is the SHAPE - watch how this melody goes UP, then DOWN, then STAYS the same!',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, false, false],  // G
      [false, false, true, false, false, false, false, false],   // E (beat 3 - highest point)
      [false, true, false, true, false, false, false, false],    // D (beats 2, 4)
      [true, false, false, false, true, true, true, true],       // C (beats 1, 5, 6, 7, 8 - repeated)
    ]
  },
  {
    id: 'ascending',
    title: 'ASCENDING Contour',
    description: 'Melody goes UP - pitches get higher',
    action: 'Watch the notes climb!',
    color: '#10b981',
    teachingPoint: 'Ascending melodies create excitement and energy - like powering up!',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, true, false],   // G (beat 7)
      [false, false, false, false, true, false, false, false],   // E (beat 5)
      [false, false, true, false, false, false, false, false],   // D (beat 3)
      [true, false, false, false, false, false, false, false],   // C (beat 1 - lowest)
    ]
  },
  {
    id: 'descending',
    title: 'DESCENDING Contour',
    description: 'Melody goes DOWN - pitches get lower',
    action: 'Watch the notes fall!',
    color: '#ef4444',
    teachingPoint: 'Descending melodies feel calming or sad - like winding down.',
    pattern: [
      [true, false, false, false, false, false, false, false],   // A (beat 1 - highest)
      [false, false, true, false, false, false, false, false],   // G (beat 3)
      [false, false, false, false, true, false, false, false],   // E (beat 5)
      [false, false, false, false, false, false, true, false],   // D (beat 7)
      [false, false, false, false, false, false, false, false],  // C
    ]
  },
  {
    id: 'repeated',
    title: 'REPEATED Contour',
    description: 'Same pitch over and over',
    action: 'Hear the steady beat!',
    color: '#f59e0b',
    teachingPoint: 'Repeated notes create tension or steadiness - like a heartbeat!',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, false, false],  // G
      [true, true, true, true, true, true, true, true],          // E (all same note)
      [false, false, false, false, false, false, false, false],  // D
      [false, false, false, false, false, false, false, false],  // C
    ]
  },
  {
    id: 'steps',
    title: 'Moving by STEPS',
    description: 'Going to the very next note - smooth!',
    action: 'C → D → E → D → C → D → E → D',
    color: '#3b82f6',
    teachingPoint: 'Steps sound smooth and connected - like walking up stairs.',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, false, false],  // G
      [false, false, true, false, false, false, true, false],    // E (beats 3, 7)
      [false, true, false, true, false, true, false, true],      // D (beats 2, 4, 6, 8)
      [true, false, false, false, true, false, false, false],    // C (beats 1, 5)
    ]
  },
  {
    id: 'skips',
    title: 'Moving by SKIPS',
    description: 'Jumping over notes - energetic!',
    action: 'C → E → C → E → C → E → C → E',
    color: '#ec4899',
    teachingPoint: 'Skips sound jumpy and exciting - like leaping over obstacles!',
    pattern: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, false, false],  // G
      [false, true, false, true, false, true, false, true],      // E (beats 2, 4, 6, 8)
      [false, false, false, false, false, false, false, false],  // D (skipped!)
      [true, false, true, false, true, false, true, false],      // C (beats 1, 3, 5, 7)
    ]
  }
];

const MelodyBuilderTeacherDemo = ({ onComplete }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [triggeredNotes, setTriggeredNotes] = useState({});

  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const timeoutRef = useRef(null);

  const currentConfig = TUTORIAL_STEPS[tutorialStep];
  const IconComponent = CONCEPT_ICONS[currentConfig.id] || Music2;

  // Check if a cell is active (has a note)
  const isCellActive = (noteIndex, beatIndex) => {
    return currentConfig.pattern[noteIndex]?.[beatIndex] || false;
  };

  // Create synth
  const createSynth = useCallback(() => {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
    }).toDestination();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopPlayback();
      if (synthRef.current) {
        try { synthRef.current.dispose(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

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

  // Play current pattern
  const playPattern = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // Ensure audio context is fully started and running
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }

    // Fully stop and reset transport first
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Clean up old sequence
    if (sequenceRef.current) {
      try {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
      } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }

    Tone.Transport.bpm.value = BPM;
    Tone.Transport.position = 0;

    // Create or recreate synth
    if (synthRef.current) {
      try { synthRef.current.dispose(); } catch (e) { /* ignore */ }
    }
    synthRef.current = createSynth();

    const pattern = currentConfig.pattern;
    const beatIndices = Array.from({ length: BEATS }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, beatIdx) => {
        const triggered = {};

        MELODY_NOTES.forEach((note, noteIndex) => {
          if (pattern[noteIndex][beatIdx]) {
            triggered[`${noteIndex}-${beatIdx}`] = true;
            synthRef.current.triggerAttackRelease(note.id, '8n', time);
          }
        });

        Tone.Draw.schedule(() => {
          setCurrentBeat(beatIdx);
          setTriggeredNotes(triggered);
          setTimeout(() => setTriggeredNotes({}), 150);
        }, time);
      },
      beatIndices,
      '8n'
    );

    sequenceRef.current.loop = false;
    sequenceRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);

    // Stop after one loop - use 8th note duration (half of quarter note)
    // At 100 BPM: quarter = 0.6s, eighth = 0.3s, 8 eighths = 2.4s
    const eighthNoteDuration = (60 / BPM) / 2; // Duration of one 8th note in seconds
    const totalDuration = eighthNoteDuration * BEATS * 1000 + 800; // Extra buffer for reliability

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store timeout in ref so it can be cleaned up
    timeoutRef.current = setTimeout(() => {
      stopPlayback();
    }, totalDuration);
  }, [isPlaying, currentConfig, createSynth, stopPlayback]);

  // Handle next step
  const handleNextStep = () => {
    stopPlayback();
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    stopPlayback();
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header - always visible */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="text-purple-400" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Building a Melody</h1>
              <p className="text-slate-400 text-base">Understanding contour, steps, and skips</p>
            </div>
          </div>

          {/* Step indicator circles */}
          <div className="flex gap-2">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { stopPlayback(); setTutorialStep(idx); }}
                className={`w-9 h-9 rounded-full font-bold text-base transition-all ${
                  idx === tutorialStep
                    ? 'text-white scale-110 ring-2 ring-offset-2 ring-offset-slate-800'
                    : idx < tutorialStep
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: idx === tutorialStep ? currentConfig.color : undefined,
                  ringColor: idx === tutorialStep ? currentConfig.color : undefined
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable if needed, controls always visible */}
      <div className="flex-1 flex flex-col px-8 py-2 min-h-0 overflow-auto">
        {/* Step Instructions - Extra large for board visibility */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-6 mb-2">
            <IconComponent size={100} style={{ color: currentConfig.color }} />
            <h2
              className="text-8xl font-black"
              style={{ color: currentConfig.color }}
            >
              {currentConfig.title}
            </h2>
          </div>
          <p className="text-5xl text-slate-300 mb-2">
            {currentConfig.description}
          </p>
          <span
            className="inline-block font-bold text-4xl px-10 py-4 rounded-xl"
            style={{
              backgroundColor: `${currentConfig.color}30`,
              color: currentConfig.color
            }}
          >
            {currentConfig.action}
          </span>
        </div>

        {/* Grid Container - Fills remaining space, centered vertically */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Beat Group Headers - "Beat 1" and "Beat 2" */}
          <div className="flex mb-1">
            <div className="w-24 flex-shrink-0" />
            <div className="flex-1 flex">
              <div className="flex-1 text-center text-2xl font-bold text-slate-400">Beat 1</div>
              <div className="w-6" /> {/* Spacer between beat groups */}
              <div className="flex-1 text-center text-2xl font-bold text-slate-400">Beat 2</div>
            </div>
          </div>

          {/* Subdivision Numbers - 1 2 3 4 | 1 2 3 4 */}
          <div className="flex mb-2">
            <div className="w-24 flex-shrink-0" />
            <div className="flex-1 flex">
              {/* Beat 1 subdivisions */}
              <div className="flex-1 flex gap-2">
                {[1, 2, 3, 4].map((num, i) => (
                  <div
                    key={`b1-${i}`}
                    className={`flex-1 text-center text-xl font-bold transition-all ${
                      currentBeat === i ? 'text-white scale-110' : 'text-slate-500'
                    }`}
                    style={{ color: currentBeat === i ? currentConfig.color : undefined }}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <div className="w-6" /> {/* Spacer between beat groups */}
              {/* Beat 2 subdivisions */}
              <div className="flex-1 flex gap-2">
                {[1, 2, 3, 4].map((num, i) => (
                  <div
                    key={`b2-${i}`}
                    className={`flex-1 text-center text-xl font-bold transition-all ${
                      currentBeat === (i + 4) ? 'text-white scale-110' : 'text-slate-500'
                    }`}
                    style={{ color: currentBeat === (i + 4) ? currentConfig.color : undefined }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-3">
            {MELODY_NOTES.map((note, noteIndex) => {
              const hasNotes = currentConfig.pattern[noteIndex]?.some(Boolean);

              return (
                <div
                  key={note.id}
                  className={`flex items-center transition-opacity ${hasNotes ? 'opacity-100' : 'opacity-40'}`}
                  style={{ height: '70px' }}
                >
                  {/* Note label */}
                  <div
                    className="w-24 flex-shrink-0 flex items-center gap-2 pr-4 justify-end"
                    style={{ color: note.color }}
                  >
                    <span className="text-3xl font-bold">{note.name}</span>
                  </div>

                  {/* Beat cells - grouped into Beat 1 and Beat 2 */}
                  <div className="flex flex-1 h-full">
                    {/* Beat 1 cells (0-3) */}
                    <div className="flex-1 flex gap-2">
                      {[0, 1, 2, 3].map((beatIndex) => {
                        const isActive = isCellActive(noteIndex, beatIndex);
                        const isCurrent = currentBeat === beatIndex && isPlaying;
                        const isTriggered = triggeredNotes[`${noteIndex}-${beatIndex}`];

                        return (
                          <div
                            key={beatIndex}
                            className="flex-1 rounded-xl transition-all relative"
                            style={{
                              backgroundColor: isActive
                                ? (isTriggered ? '#ffffff' : note.color)
                                : isCurrent
                                  ? `${currentConfig.color}30`
                                  : 'rgba(255, 255, 255, 0.08)',
                              border: isActive
                                ? `3px solid ${note.color}`
                                : isCurrent
                                  ? `2px solid ${currentConfig.color}60`
                                  : '2px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: isActive
                                ? `0 0 20px ${note.color}50`
                                : isCurrent
                                  ? `0 0 15px ${currentConfig.color}30`
                                  : 'none',
                              transform: isTriggered ? 'scale(1.1)' : 'scale(1)',
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Empty spacer between beat groups - no visible element */}
                    <div className="w-6" />

                    {/* Beat 2 cells (4-7) */}
                    <div className="flex-1 flex gap-2">
                      {[4, 5, 6, 7].map((beatIndex) => {
                        const isActive = isCellActive(noteIndex, beatIndex);
                        const isCurrent = currentBeat === beatIndex && isPlaying;
                        const isTriggered = triggeredNotes[`${noteIndex}-${beatIndex}`];

                        return (
                          <div
                            key={beatIndex}
                            className="flex-1 rounded-xl transition-all relative"
                            style={{
                              backgroundColor: isActive
                                ? (isTriggered ? '#ffffff' : note.color)
                                : isCurrent
                                  ? `${currentConfig.color}30`
                                  : 'rgba(255, 255, 255, 0.08)',
                              border: isActive
                                ? `3px solid ${note.color}`
                                : isCurrent
                                  ? `2px solid ${currentConfig.color}60`
                                  : '2px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: isActive
                                ? `0 0 20px ${note.color}50`
                                : isCurrent
                                  ? `0 0 15px ${currentConfig.color}30`
                                  : 'none',
                              transform: isTriggered ? 'scale(1.1)' : 'scale(1)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Teaching Point */}
          <div
            className="mt-6 text-center p-4 rounded-xl mx-auto max-w-3xl"
            style={{ backgroundColor: `${currentConfig.color}20`, borderColor: currentConfig.color, borderWidth: '2px' }}
          >
            <p className="text-xl text-white font-medium">
              {currentConfig.teachingPoint}
            </p>
          </div>
        </div>
      </div>

      {/* Controls - always visible at bottom */}
      <div className="flex-shrink-0 bg-slate-800 border-t border-slate-700 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Previous */}
          <button
            onClick={handlePrevStep}
            disabled={tutorialStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-base transition-all ${
              tutorialStep === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-600 hover:bg-slate-500 text-white'
            }`}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {/* Play/Stop */}
          <button
            onClick={playPattern}
            className={`flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-xl transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            style={{
              boxShadow: isPlaying ? '0 0 24px #dc262650' : '0 0 24px #16a34a50'
            }}
          >
            {isPlaying ? (
              <>
                <Square size={24} />
                Stop
              </>
            ) : (
              <>
                <Play size={24} />
                Listen
              </>
            )}
          </button>

          {/* Next / Finish */}
          {tutorialStep === TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => {
                stopPlayback();
                if (onComplete) onComplete();
              }}
              className="flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-2xl transition-all bg-green-600 hover:bg-green-500 text-white"
              style={{ boxShadow: '0 0 20px #16a34a50' }}
            >
              Finish
              <ArrowRight size={28} />
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-2xl transition-all hover:brightness-110 text-white"
              style={{ backgroundColor: currentConfig.color }}
            >
              Next
              <ArrowRight size={28} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MelodyBuilderTeacherDemo;
