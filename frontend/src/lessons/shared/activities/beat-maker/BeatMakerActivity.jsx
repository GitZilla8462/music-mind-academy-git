// File: /lessons/shared/activities/beat-maker/BeatMakerActivity.jsx
// Drum Grid / Step Sequencer for creating beat patterns
// Students can toggle kick, snare, and hi-hat on a 16-step grid
// Optimized for Chromebook - audio context created on user gesture

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2 } from 'lucide-react';
import * as Tone from 'tone';

const STEPS = 16;

// Drum SVG Icons
const KickIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const SnareIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="8" width="16" height="8" rx="2" />
    <line x1="4" y1="10" x2="20" y2="14" strokeWidth="1" />
    <line x1="4" y1="14" x2="20" y2="10" strokeWidth="1" />
  </svg>
);

const HiHatIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="8" rx="8" ry="3" />
    <ellipse cx="12" cy="12" rx="8" ry="3" />
    <line x1="12" y1="15" x2="12" y2="22" strokeWidth="2" />
  </svg>
);

const INSTRUMENTS = [
  { id: 'hihat', name: 'Hi-Hat', color: '#06b6d4', Icon: HiHatIcon },
  { id: 'snare', name: 'Snare', color: '#f97316', Icon: SnareIcon },
  { id: 'kick', name: 'Kick', color: '#a855f7', Icon: KickIcon }
];

// Preset beat patterns
const PRESETS = {
  rock: {
    name: 'Rock',
    pattern: [
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false]
    ]
  },
  hiphop: {
    name: 'Hip-Hop',
    pattern: [
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      [true, false, false, true, false, false, true, false, false, false, true, false, false, false, true, false]
    ]
  },
  electronic: {
    name: 'Electronic',
    pattern: [
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
    ]
  }
};

const BeatMakerActivity = ({ onComplete }) => {
  // Grid state: 3 instruments x 16 steps
  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem('beat-maker-grid');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INSTRUMENTS.map(() => Array(STEPS).fill(false));
      }
    }
    return INSTRUMENTS.map(() => Array(STEPS).fill(false));
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [activePreset, setActivePreset] = useState(null);
  const [triggeredSteps, setTriggeredSteps] = useState({});
  const [audioReady, setAudioReady] = useState(false);

  // Refs for Tone.js objects
  const synthsRef = useRef(null);
  const sequenceRef = useRef(null);
  const gridRef = useRef(grid);

  // Keep gridRef in sync with grid state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Save grid to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('beat-maker-grid', JSON.stringify(grid));
  }, [grid]);

  // Update BPM when it changes
  useEffect(() => {
    if (audioReady) {
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm, audioReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach(synth => {
          try { synth.dispose(); } catch (e) { /* ignore */ }
        });
        synthsRef.current = null;
      }
      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (e) { /* ignore */ }
    };
  }, []);

  // Initialize audio on first user interaction
  const initializeAudio = useCallback(async () => {
    console.log('🔊 initializeAudio called, audioReady:', audioReady);

    if (audioReady && synthsRef.current) {
      console.log('🔊 Audio already initialized, returning true');
      return true;
    }

    try {
      console.log('🔊 Creating new audio context...');

      // Create optimized context for Chromebook playback
      const newContext = new Tone.Context({
        latencyHint: 'playback',
        lookAhead: 0.2
      });
      Tone.setContext(newContext);
      console.log('🔊 Context set');

      // Start the audio context (requires user gesture)
      await Tone.start();
      console.log('🔊 Tone.start() completed, context state:', Tone.context.state);

      // Set BPM
      Tone.Transport.bpm.value = bpm;
      console.log('🔊 BPM set to:', bpm);

      // Create synths
      console.log('🔊 Creating synths...');
      synthsRef.current = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: 'sine' },
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
          octaves: 1.5
        }).toDestination()
      };
      synthsRef.current.hihat.volume.value = -10;
      console.log('🔊 Synths created:', Object.keys(synthsRef.current));

      setAudioReady(true);
      console.log('🔊 Audio initialization complete!');
      return true;
    } catch (error) {
      console.error('🔊 Failed to initialize audio:', error);
      return false;
    }
  }, [audioReady, bpm]);

  // Toggle a cell in the grid
  const toggleCell = (instrumentIndex, stepIndex) => {
    setActivePreset(null);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[instrumentIndex][stepIndex] = !newGrid[instrumentIndex][stepIndex];
      return newGrid;
    });
  };

  // Load a preset pattern
  const loadPreset = (presetKey) => {
    if (isPlaying) {
      stopPlayback();
    }
    setGrid(PRESETS[presetKey].pattern.map(row => [...row]));
    setActivePreset(presetKey);
  };

  // Stop playback helper
  const stopPlayback = useCallback(() => {
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (e) { /* ignore */ }

    if (sequenceRef.current) {
      try {
        sequenceRef.current.dispose();
      } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    setTriggeredSteps({});
  }, []);

  // Start/stop playback
  const togglePlay = async () => {
    console.log('🎵 Play button clicked, isPlaying:', isPlaying);

    if (isPlaying) {
      stopPlayback();
      return;
    }

    // Initialize audio on first play (user gesture)
    console.log('🎵 Initializing audio...');
    const ready = await initializeAudio();
    console.log('🎵 Audio ready:', ready);

    if (!ready) {
      console.error('Audio not ready');
      return;
    }

    // Dispose old sequence if it exists
    if (sequenceRef.current) {
      console.log('🎵 Disposing old sequence');
      try {
        sequenceRef.current.dispose();
      } catch (e) { /* ignore */ }
      sequenceRef.current = null;
    }

    // Make sure transport is stopped and cleared
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.position = 0;
    } catch (e) {
      console.log('🎵 Transport reset error:', e);
    }

    console.log('🎵 Creating sequence...');
    console.log('🎵 Synths available:', !!synthsRef.current);
    console.log('🎵 Grid state:', gridRef.current);

    // Create sequence
    const stepIndices = Array.from({ length: STEPS }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        console.log('🎵 Sequence step:', step);
        const currentGrid = gridRef.current;
        const triggered = {};

        // Schedule sounds using passed time for accurate timing
        INSTRUMENTS.forEach((inst, index) => {
          if (currentGrid[index][step]) {
            triggered[`${index}-${step}`] = true;
            console.log('🎵 Triggering:', inst.id, 'at step', step);

            if (inst.id === 'kick' && synthsRef.current?.kick) {
              synthsRef.current.kick.triggerAttackRelease('C1', '8n', time);
            } else if (inst.id === 'snare' && synthsRef.current?.snare) {
              synthsRef.current.snare.triggerAttackRelease('16n', time);
            } else if (inst.id === 'hihat' && synthsRef.current?.hihat) {
              synthsRef.current.hihat.triggerAttackRelease('32n', time);
            }
          }
        });

        // Schedule visual updates
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
          setTriggeredSteps(triggered);
          setTimeout(() => setTriggeredSteps({}), 80);
        }, time);
      },
      stepIndices,
      '16n'
    );

    console.log('🎵 Starting sequence and transport...');
    console.log('🎵 Transport state before start:', Tone.Transport.state);

    sequenceRef.current.start(0);
    Tone.Transport.start('+0.05');

    console.log('🎵 Transport state after start:', Tone.Transport.state);
    setIsPlaying(true);
  };

  // Clear the grid
  const clearGrid = () => {
    if (isPlaying) {
      stopPlayback();
    }
    setGrid(INSTRUMENTS.map(() => Array(STEPS).fill(false)));
    setActivePreset(null);
  };

  // Get beat number for step (1-4 repeating)
  const getBeatNumber = (step) => ((step % 4) + 1);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Beat Maker</h1>
            <p className="text-slate-400">Create a 4-bar beat pattern</p>
          </div>
          <div className="flex items-center gap-4">
            {/* BPM Control */}
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
              <span className="text-slate-400 text-sm">BPM:</span>
              <button
                onClick={() => setBpm(prev => Math.max(60, prev - 5))}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded text-lg font-bold"
              >
                -
              </button>
              <span className="w-12 text-center font-mono text-lg">{bpm}</span>
              <button
                onClick={() => setBpm(prev => Math.min(180, prev + 5))}
                className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6">
        {/* Measure labels */}
        <div className="flex items-center mb-2 w-full max-w-5xl">
          <div className="w-28 lg:w-32" />
          <div className="flex-1 flex">
            {[1, 2, 3, 4].map(measure => (
              <div key={measure} className="flex-1 text-center text-slate-500 text-sm font-medium">
                Measure {measure}
              </div>
            ))}
          </div>
        </div>

        {/* Beat labels */}
        <div className="flex items-center mb-3 w-full max-w-5xl">
          <div className="w-28 lg:w-32" />
          <div className="flex-1 flex">
            {Array(STEPS).fill(0).map((_, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-xs ${
                  i % 4 === 0 ? 'text-white font-bold' : 'text-slate-500'
                }`}
              >
                {getBeatNumber(i)}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="w-full max-w-5xl space-y-2">
          {INSTRUMENTS.map((instrument, instIndex) => (
            <div key={instrument.id} className="flex items-center gap-3">
              {/* Instrument label with icon */}
              <div
                className="w-28 lg:w-32 flex items-center justify-end gap-2 font-bold text-base lg:text-lg"
                style={{ color: instrument.color }}
              >
                <instrument.Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>{instrument.name}</span>
              </div>

              {/* Steps */}
              <div className="flex-1 flex gap-1">
                {Array(STEPS).fill(0).map((_, stepIndex) => {
                  const isActive = grid[instIndex][stepIndex];
                  const isCurrentStep = currentStep === stepIndex;
                  const isTriggered = triggeredSteps[`${instIndex}-${stepIndex}`];

                  return (
                    <button
                      key={stepIndex}
                      onClick={() => toggleCell(instIndex, stepIndex)}
                      className={`
                        flex-1 aspect-square rounded-lg transition-all duration-75
                        flex items-center justify-center
                        ${stepIndex % 4 === 0 ? 'ml-1' : ''}
                        ${isCurrentStep && isPlaying ? 'ring-2 ring-white' : ''}
                      `}
                      style={{
                        backgroundColor: isActive ? instrument.color : '#475569',
                        boxShadow: isActive && isTriggered
                          ? `0 0 20px ${instrument.color}, 0 0 40px ${instrument.color}`
                          : isActive
                            ? `0 0 8px ${instrument.color}40`
                            : 'none',
                        transform: isActive && isTriggered ? 'scale(1.1)' : 'scale(1)',
                        minHeight: '44px',
                        minWidth: '44px'
                      }}
                    >
                      {isActive && (
                        <div
                          className="w-2 h-2 rounded-full bg-white"
                          style={{ opacity: isTriggered ? 1 : 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Playback indicator */}
        <div className="flex items-center gap-1 mt-4 w-full max-w-5xl">
          <div className="w-28 lg:w-32" />
          <div className="flex-1 flex gap-1">
            {Array(STEPS).fill(0).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i % 4 === 0 ? 'ml-1' : ''
                }`}
                style={{
                  backgroundColor: currentStep === i ? '#ffffff' : '#334155',
                  boxShadow: currentStep === i ? '0 0 8px #ffffff' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <span className="text-slate-400 text-sm">Presets:</span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activePreset === key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-lg transition-all ${
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
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-3">
          Click squares to add sounds. Press Play to hear your beat.
        </p>
      </div>
    </div>
  );
};

export default BeatMakerActivity;
