// File: BeatBuilderDemo.jsx
// Teacher demonstration: Step-by-step beat building tutorial
// Improved UI: larger cells, full track names, beat separators, target highlighting

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, ArrowLeft, ArrowRight, Music2, Circle, Disc, Waves, CircleDot } from 'lucide-react';
import * as Tone from 'tone';

const STEPS = 16;
const BPM = 110;

// DAW-style icons for each instrument
const TRACK_ICONS = {
  kick: Circle,      // Solid circle for bass drum
  snare: Disc,       // Disc for snare
  hihat: Waves,      // Waves for hi-hat
  openhat: CircleDot // Circle with dot for open hat
};

// Drum tracks with full info
const DRUM_TRACKS = [
  { id: 'kick', label: 'Kick', abbrev: 'KK', color: '#a855f7' },
  { id: 'snare', label: 'Snare', abbrev: 'SN', color: '#f97316' },
  { id: 'hihat', label: 'Hi-Hat', abbrev: 'HH', color: '#06b6d4' },
  { id: 'openhat', label: 'Open Hat', abbrev: 'OH', color: '#22c55e' },
];

// Tutorial steps with target cells
const TUTORIAL_STEPS = [
  {
    id: 'kick',
    title: 'Add the Kick',
    description: 'The kick drum is the foundation',
    action: 'click beats 1 and 3',
    highlightTrack: 'kick',
    targets: { track: 'kick', steps: [0, 8] },
    pattern: {
      kick: [0, 8],
      snare: [],
      hihat: [],
      openhat: []
    }
  },
  {
    id: 'snare',
    title: 'Add the Snare',
    description: 'The snare creates the backbeat',
    action: 'click beats 2 and 4',
    highlightTrack: 'snare',
    targets: { track: 'snare', steps: [4, 12] },
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [],
      openhat: []
    }
  },
  {
    id: 'hihat',
    title: 'Add the Hi-Hat',
    description: 'Hi-hats keep the rhythm moving',
    action: 'click every other step',
    highlightTrack: 'hihat',
    targets: { track: 'hihat', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
      openhat: []
    }
  },
  {
    id: 'openhat',
    title: 'Add the Open Hat',
    description: 'Open hats add accents and energy',
    action: 'add some flair',
    highlightTrack: 'openhat',
    targets: { track: 'openhat', steps: [6, 14] },
    pattern: {
      kick: [0, 8],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
      openhat: [6, 14]
    }
  }
];

const BeatBuilderDemo = () => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const synthsRef = useRef(null);
  const sequenceRef = useRef(null);

  const currentConfig = TUTORIAL_STEPS[tutorialStep];

  // Check if a cell is a target for current step
  const isTargetCell = (trackId, stepIndex) => {
    const targets = currentConfig.targets;
    if (!targets) return false;
    return targets.track === trackId && targets.steps.includes(stepIndex);
  };

  // Check if a cell is active (filled)
  const isCellActive = (trackId, stepIndex) => {
    return currentConfig.pattern[trackId]?.includes(stepIndex) || false;
  };

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
    Tone.Transport.bpm.value = BPM;

    if (!synthsRef.current) {
      synthsRef.current = createSynths();
    }

    const pattern = currentConfig.pattern;

    if (sequenceRef.current) {
      try { sequenceRef.current.dispose(); } catch (e) { /* ignore */ }
    }

    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.position = 0;
    } catch (e) { /* ignore */ }

    const stepIndices = Array.from({ length: STEPS }, (_, i) => i);

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
  }, [isPlaying, currentConfig, createSynths, stopPlayback]);

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

  // Get track by id
  const getTrack = (trackId) => DRUM_TRACKS.find(t => t.id === trackId);
  const highlightedTrack = getTrack(currentConfig.highlightTrack);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="text-purple-400" size={28} />
            <div>
              <h1 className="text-xl font-bold">Building a Beat</h1>
              <p className="text-slate-400 text-sm">Layer by layer</p>
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
                    ? 'bg-purple-500 text-white scale-110 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800'
                    : idx < tutorialStep
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Fills Screen */}
      <div className="flex-1 flex flex-col px-8 py-4">
        {/* Step Instructions - Large and prominent */}
        <div className="text-center mb-4">
          <h2
            className="text-5xl font-black mb-2"
            style={{ color: highlightedTrack?.color }}
          >
            Step {tutorialStep + 1}: {currentConfig.title}
          </h2>
          <p className="text-2xl text-slate-300">
            {currentConfig.description} — {' '}
            <span
              className="font-bold px-4 py-1.5 rounded-lg"
              style={{
                backgroundColor: `${highlightedTrack?.color}30`,
                color: highlightedTrack?.color
              }}
            >
              {currentConfig.action}
            </span>
          </p>
        </div>

        {/* Grid Container - Fills remaining space, centered vertically */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Beat Headers - directly above grid */}
          <div className="flex mb-2" style={{ marginLeft: '140px' }}>
            {[1, 2, 3, 4].map((beatNum) => (
              <div
                key={beatNum}
                className="flex-1 text-center border-r border-slate-700 last:border-r-0 px-2"
              >
                <div className="text-2xl font-bold text-white mb-1">Beat {beatNum}</div>
                <div className="flex justify-around">
                  {[1, 2, 3, 4].map(n => (
                    <span key={n} className="text-lg font-semibold text-slate-400 flex-1 text-center">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Grid rows - fixed height for each row */}
          <div className="flex flex-col gap-3">
            {DRUM_TRACKS.map(track => {
              const hasNotes = currentConfig.pattern[track.id]?.length > 0;

              return (
                <div
                  key={track.id}
                  className={`flex items-center transition-opacity ${hasNotes ? 'opacity-100' : 'opacity-40'}`}
                  style={{ height: '70px' }}
                >
                  {/* Track label with DAW icon and full name */}
                  <div
                    className="w-36 flex-shrink-0 flex items-center gap-3 pr-4 justify-end"
                    style={{ color: track.color }}
                  >
                    {(() => {
                      const IconComponent = TRACK_ICONS[track.id];
                      return IconComponent ? <IconComponent size={28} strokeWidth={2.5} /> : null;
                    })()}
                    <span className="text-2xl font-bold">{track.label}</span>
                  </div>

                  {/* Beat groups with separators */}
                  <div className="flex flex-1 h-full">
                    {[0, 1, 2, 3].map(beatIndex => (
                      <div
                        key={beatIndex}
                        className={`flex-1 flex gap-1.5 px-2 border-r border-slate-700 last:border-r-0 h-full ${
                          beatIndex % 2 === 0 ? 'bg-slate-800/30' : ''
                        }`}
                        style={{ borderRadius: '6px' }}
                      >
                        {[0, 1, 2, 3].map(stepInBeat => {
                          const stepIndex = beatIndex * 4 + stepInBeat;
                          const isActive = isCellActive(track.id, stepIndex);
                          const isTarget = isTargetCell(track.id, stepIndex);
                          const isCurrent = currentBeat === stepIndex && isPlaying;
                          const isCurrentColumn = currentBeat === stepIndex;

                          return (
                            <div
                              key={stepIndex}
                              className={`
                                flex-1 rounded-xl transition-all cursor-pointer relative
                                ${isTarget && !isActive ? 'animate-pulse' : ''}
                              `}
                              style={{
                                backgroundColor: isActive
                                  ? (isCurrent ? '#22c55e' : track.color)
                                  : isCurrentColumn && isPlaying
                                    ? 'rgba(34, 197, 94, 0.3)'
                                    : isTarget
                                      ? `${track.color}25`
                                      : 'rgba(255, 255, 255, 0.08)',
                                border: isTarget && !isActive
                                  ? `3px solid ${track.color}60`
                                  : isActive
                                    ? `3px solid ${track.color}`
                                    : isCurrentColumn && isPlaying
                                      ? '2px solid rgba(34, 197, 94, 0.6)'
                                      : '2px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: isActive
                                  ? `0 0 20px ${track.color}50`
                                  : isCurrentColumn && isPlaying
                                    ? '0 0 15px rgba(34, 197, 94, 0.4)'
                                    : isTarget && !isActive
                                      ? `0 0 15px ${track.color}30`
                                      : 'none',
                                transform: isCurrent && isActive ? 'scale(1.05)' : 'scale(1)',
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 bg-slate-800 border-t border-slate-700 px-6 py-4">
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

          {/* Next */}
          <button
            onClick={handleNextStep}
            disabled={tutorialStep === TUTORIAL_STEPS.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-base transition-all ${
              tutorialStep === TUTORIAL_STEPS.length - 1
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BeatBuilderDemo;
