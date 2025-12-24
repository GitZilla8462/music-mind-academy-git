// File: StudentBeatMakerActivity.jsx
// Student-facing Beat Maker activity for Lesson 4
// Uses the BeatMakerPanel from the DAW but in a full-screen activity format
// Beats are saved to localStorage and loaded into the SportsComposition activity

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Music2, ArrowRight, Play, Square, Volume2 } from 'lucide-react';
import * as Tone from 'tone';
import BeatMakerPanel from '../../../../pages/projects/film-music-score/shared/BeatMakerPanel';

// Storage key for saved beats
const SAVED_BEATS_KEY = 'lesson4-student-beats';

// Instrument configuration matching BeatMakerPanel (without clap)
const INSTRUMENTS = [
  { id: 'kick', name: 'Kick', color: '#a855f7', shortName: 'KK' },
  { id: 'snare', name: 'Snare', color: '#f97316', shortName: 'SN' },
  { id: 'hihat', name: 'Hi-Hat', color: '#06b6d4', shortName: 'HH' },
  { id: 'openhat', name: 'Open Hat', color: '#22c55e', shortName: 'OH' }
];

// Tutorial steps - each step adds a new instrument layer
const TUTORIAL_STEPS = [
  {
    id: 'kick',
    title: 'Step 1: Add the Kick',
    subtitle: 'The kick drum is the foundation - it hits on beats 1 and 3',
    activeInstruments: ['kick'],
    pattern: {
      kick: [0, 8],
      snare: [],
      hihat: [],
      openhat: []
    }
  },
  {
    id: 'snare',
    title: 'Step 2: Add the Snare',
    subtitle: 'The snare creates the backbeat on beats 2 and 4',
    activeInstruments: ['kick', 'snare'],
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [],
      openhat: []
    }
  },
  {
    id: 'hihat',
    title: 'Step 3: Add the Hi-Hat',
    subtitle: 'Hi-hats keep the rhythm moving with steady eighth notes',
    activeInstruments: ['kick', 'snare', 'hihat'],
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
      openhat: []
    }
  },
  {
    id: 'openhat',
    title: 'Step 4: Add the Open Hat',
    subtitle: 'Open hats add accents and energy to the groove',
    activeInstruments: ['kick', 'snare', 'hihat', 'openhat'],
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
      openhat: [6, 14]
    }
  }
];

// Load saved beats from localStorage
const loadSavedBeats = () => {
  try {
    const saved = localStorage.getItem(SAVED_BEATS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save beats to localStorage
const saveBeatToStorage = (beat) => {
  try {
    const existing = loadSavedBeats();
    const updated = [...existing, beat];
    localStorage.setItem(SAVED_BEATS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save beat:', error);
    return loadSavedBeats();
  }
};

// Clear saved beats (for reset)
export const clearSavedBeats = () => {
  localStorage.removeItem(SAVED_BEATS_KEY);
};

// Teacher Demo Tutorial Component
const TeacherBeatTutorial = () => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const synthsRef = useRef(null);
  const sequenceRef = useRef(null);
  const bpm = 110;

  // Create synths
  const createSynths = useCallback(() => {
    return {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).toDestination(),
      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      }).toDestination(),
      hihat: new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -10
      }).toDestination(),
      openhat: new Tone.MetalSynth({
        frequency: 180,
        envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -8
      }).toDestination()
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach(synth => {
          try { synth.dispose(); } catch (e) { /* ignore */ }
        });
      }
    };
  }, []);

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

  // Play current pattern
  const playPattern = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    await Tone.start();
    Tone.Transport.bpm.value = bpm;

    if (!synthsRef.current) {
      synthsRef.current = createSynths();
    }

    const step = TUTORIAL_STEPS[tutorialStep];
    const pattern = step.pattern;

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
    }

    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.position = 0;
    } catch (e) { /* ignore */ }

    const stepIndices = Array.from({ length: 16 }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, stepIdx) => {
        if (pattern.kick.includes(stepIdx)) {
          synthsRef.current.kick.triggerAttackRelease('C1', '8n', time);
        }
        if (pattern.snare.includes(stepIdx)) {
          synthsRef.current.snare.triggerAttackRelease('16n', time);
        }
        if (pattern.hihat.includes(stepIdx)) {
          synthsRef.current.hihat.triggerAttackRelease('32n', time);
        }
        if (pattern.openhat.includes(stepIdx)) {
          synthsRef.current.openhat.triggerAttackRelease('16n', time);
        }

        Tone.Draw.schedule(() => {
          setCurrentBeat(stepIdx);
        }, time);
      },
      stepIndices,
      '16n'
    );

    sequenceRef.current.start(0);
    Tone.Transport.start('+0.05');
    setIsPlaying(true);
  }, [isPlaying, tutorialStep, createSynths, stopPlayback]);

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

  const currentTutorial = TUTORIAL_STEPS[tutorialStep];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Music2 className="text-purple-400" />
              Building a Beat - Teacher Demo
            </h1>
            <p className="text-gray-400 mt-1">
              Walk through each layer of a beat with your class
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { stopPlayback(); setTutorialStep(idx); }}
                className={`w-8 h-8 rounded-full font-bold transition-all ${
                  idx === tutorialStep
                    ? 'bg-purple-500 text-white scale-110'
                    : idx < tutorialStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current step info */}
      <div className="bg-purple-900/30 border-b border-purple-500/30 px-6 py-4">
        <h2 className="text-2xl font-bold text-purple-300">{currentTutorial.title}</h2>
        <p className="text-gray-300 mt-1">{currentTutorial.subtitle}</p>
      </div>

      {/* Beat Grid */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* Beat numbers */}
          <div className="flex mb-2">
            <div className="w-16 flex-shrink-0" />
            <div className="flex flex-1">
              {Array(16).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-sm font-bold ${
                    i % 4 === 0 ? 'text-white' : 'text-gray-500'
                  } ${currentBeat === i ? 'text-green-400' : ''}`}
                >
                  {(i % 4) + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Grid rows - show all instruments */}
          {INSTRUMENTS.map((instrument) => {
            const isActive = currentTutorial.activeInstruments.includes(instrument.id);
            const pattern = currentTutorial.pattern[instrument.id] || [];

            return (
              <div key={instrument.id} className="flex items-center mb-2">
                {/* Instrument label */}
                <div
                  className={`w-16 flex-shrink-0 text-sm font-bold pr-2 transition-all ${
                    isActive ? '' : 'opacity-30'
                  }`}
                  style={{ color: instrument.color }}
                >
                  {instrument.shortName}
                </div>

                {/* Steps */}
                <div className="flex flex-1 gap-1">
                  {Array(16).fill(0).map((_, stepIndex) => {
                    const isFilled = pattern.includes(stepIndex);
                    const isCurrent = currentBeat === stepIndex && isPlaying;

                    return (
                      <div
                        key={stepIndex}
                        className={`flex-1 aspect-square rounded transition-all ${
                          stepIndex % 4 === 0 ? 'ring-1 ring-gray-600' : ''
                        }`}
                        style={{
                          backgroundColor: isFilled
                            ? (isCurrent ? '#22c55e' : instrument.color)
                            : (isActive ? '#374151' : '#1f2937'),
                          opacity: isActive ? 1 : 0.3,
                          transform: isCurrent && isFilled ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isCurrent && isFilled ? `0 0 12px ${instrument.color}` : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous */}
          <button
            onClick={handlePrevStep}
            disabled={tutorialStep === 0}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              tutorialStep === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            ← Previous
          </button>

          {/* Play/Stop */}
          <button
            onClick={playPattern}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-3 ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
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

          {/* Next */}
          <button
            onClick={handleNextStep}
            disabled={tutorialStep === TUTORIAL_STEPS.length - 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              tutorialStep === TUTORIAL_STEPS.length - 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentBeatMakerActivity = ({
  onComplete,
  viewMode = false,
  isSessionMode = false,
  isTeacherDemo = false
}) => {
  const [savedBeats, setSavedBeats] = useState(() => loadSavedBeats());
  const [showBeatMaker, setShowBeatMaker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Minimum beats required before moving on
  const MIN_BEATS_REQUIRED = 1;
  const hasEnoughBeats = savedBeats.length >= MIN_BEATS_REQUIRED;

  // Handle when a beat is added from BeatMakerPanel
  const handleAddBeat = useCallback((beatLoop) => {
    console.log('🎵 Beat created:', beatLoop.name);

    // Save to localStorage for persistence
    const updated = saveBeatToStorage({
      ...beatLoop,
      // Remove blob URL for storage - will be re-rendered when loaded
      file: null,
      pattern: beatLoop.pattern,
      bpm: beatLoop.bpm,
      kit: beatLoop.kit,
      steps: beatLoop.steps,
      savedAt: new Date().toISOString()
    });

    setSavedBeats(updated);
    setShowBeatMaker(false);
    setShowSuccess(true);

    // Hide success message after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000);
  }, []);

  // Handle continue to composition
  const handleContinue = () => {
    if (onComplete) {
      onComplete({ beatsCreated: savedBeats.length });
    }
  };

  // Teacher demo mode - show the tutorial
  if (isTeacherDemo) {
    return <TeacherBeatTutorial />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header - hide when beat maker is open to maximize screen space */}
      {!showBeatMaker && (
        <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Music2 className="text-purple-400" />
                Build Your Beat
              </h1>
              <p className="text-gray-400 mt-1">
                Create a beat to use in your sports composition
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-400">Beats Created</div>
                <div className="text-2xl font-bold text-purple-400">{savedBeats.length}</div>
              </div>
              {hasEnoughBeats && (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showBeatMaker ? '' : 'items-center justify-center p-8'}`}>
        {showBeatMaker ? (
          /* Beat Maker Panel - Full screen mode, no padding */
          <BeatMakerPanel
            onClose={() => setShowBeatMaker(false)}
            onAddToProject={handleAddBeat}
            customLoopCount={savedBeats.length}
            hideClap
          />
        ) : (
          /* Main menu */
          <div className="w-full max-w-xl space-y-6">
            {/* Success message */}
            {showSuccess && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                <Check className="text-green-400" size={24} />
                <span className="text-green-300 font-medium">
                  Beat saved! It will appear in your composition.
                </span>
              </div>
            )}

            {/* Saved beats list */}
            {savedBeats.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Your Beats</h3>
                <div className="space-y-2">
                  {savedBeats.map((beat, index) => (
                    <div
                      key={beat.id || index}
                      className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-4 py-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: beat.color || '#a855f7' }}
                      />
                      <span className="font-medium">{beat.name}</span>
                      <span className="text-gray-400 text-sm ml-auto">
                        {beat.bpm} BPM
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <div>
              <button
                onClick={() => setShowBeatMaker(true)}
                className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
              >
                <Music2 size={24} />
                {savedBeats.length === 0 ? 'Create Your Beat' : 'Create Another Beat'}
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center text-gray-400 text-sm">
              <p>Your saved beats will appear in your composition</p>
            </div>
          </div>
        )}
      </div>

      {/* Tips footer - only show when not in beat maker */}
      {!showBeatMaker && (
        <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tips for a Great Beat:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Start with a simple kick on beats 1 and 3</li>
              <li>• Add snare on beats 2 and 4 for a backbeat</li>
              <li>• Use hi-hats to fill in the rhythm</li>
              <li>• Match your mood to the sports video energy!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBeatMakerActivity;
