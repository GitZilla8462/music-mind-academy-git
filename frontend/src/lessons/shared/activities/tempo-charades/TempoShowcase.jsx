// File: /src/lessons/shared/activities/tempo-charades/TempoShowcase.jsx
// Interactive Tempo Showcase - Teacher presentation view
// Steps through Largo → Presto one at a time with visual metronome and speed highlighting
// Flow: Direction text → Play button → Next button (no auto-play)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, Check, RotateCcw } from 'lucide-react';

const TEMPOS = [
  { symbol: 'Largo', name: 'Largo', meaning: 'Very Slow', bpm: 50, color: '#93C5FD', emoji: '\u{1F40C}' },
  { symbol: 'Adagio', name: 'Adagio', meaning: 'Slow, Relaxed', bpm: 72, color: '#60A5FA', emoji: '\u{1F422}' },
  { symbol: 'Andante', name: 'Andante', meaning: 'Walking Speed', bpm: 92, color: '#FCD34D', emoji: '\u{1F6B6}' },
  { symbol: 'Allegro', name: 'Allegro', meaning: 'Fast, Lively', bpm: 138, color: '#FBBF24', emoji: '\u{1F3C3}' },
  { symbol: 'Presto', name: 'Presto', meaning: 'Very Fast', bpm: 184, color: '#EF4444', emoji: '\u26A1' },
];

// Direction text shown BEFORE playing each tempo
const DIRECTION_TEXT = [
  "Next, we will learn Largo \u2014 Very Slow (50 BPM)",
  "Next, we will learn Adagio \u2014 Slow, Relaxed (72 BPM)",
  "Next, we will learn Andante \u2014 Walking Speed (92 BPM)",
  "Next, we will learn Allegro \u2014 Fast, Lively (138 BPM)",
  "Next, we will learn Presto \u2014 Very Fast (184 BPM)",
];

// Teacher speaking text for each phase of the showcase
const TEACHER_SCRIPT = {
  intro: "Now we're going to learn five tempo markings. Tempo tells us how fast or slow to play the music. We'll go from the slowest all the way to the fastest. Watch how each tempo feels different.",
  perTempo: [
    "Largo \u2014 the slowest tempo. Think of a heavy, plodding walk through deep snow. Everything moves in slow motion. Watch the metronome \u2014 you could count to two between each beat.",
    "Adagio \u2014 slow and relaxed. Like a calm walk in a garden. Still gentle, but you can feel a steady pulse. Think of a lullaby or a quiet sunset.",
    "Andante \u2014 walking speed. This is comfortable and natural. Imagine walking to class \u2014 not rushing, not dragging. Most people's heartbeat is around this speed.",
    "Allegro \u2014 fast and lively! Now we're picking up energy. Think of running to recess or an exciting chase scene. The music has real momentum.",
    "Presto \u2014 the fastest tempo! Everything is racing. Think of a car chase or the finale of a fireworks show. Musicians have to be incredibly skilled to play this fast.",
  ],
  outro: "Those are your five tempo markings \u2014 from Largo to Presto. In a moment, you'll get to act them out in Tempo Charades!",
};

const BEATS_TO_PLAY = 8;

const TempoShowcase = ({ sessionData }) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = not started
  const [hasPlayed, setHasPlayed] = useState(false); // whether current tempo has been demonstrated
  const [demoFinished, setDemoFinished] = useState(false); // demo done, show Next
  const [isDemoing, setIsDemoing] = useState(false); // metronome animation active
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [beatCount, setBeatCount] = useState(0);

  const beatTimer = useRef(null);
  const beatCountRef = useRef(0);

  // Stop metronome helper
  const stopMetronome = useCallback(() => {
    if (beatTimer.current) {
      clearInterval(beatTimer.current);
      beatTimer.current = null;
    }
    setIsDemoing(false);
    setBeatCount(0);
    beatCountRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopMetronome(), [stopMetronome]);

  // Start metronome for a given index
  const startMetronome = useCallback((idx) => {
    const tempo = TEMPOS[idx];
    if (!tempo) return;

    stopMetronome();

    const intervalMs = 60000 / tempo.bpm;
    beatCountRef.current = 0;
    setBeatCount(0);
    setIsDemoing(true);
    setHasPlayed(true);
    setDemoFinished(false);

    // Immediately trigger beat 1
    beatCountRef.current = 1;
    setBeatCount(1);

    beatTimer.current = setInterval(() => {
      beatCountRef.current += 1;
      const currentBeat = beatCountRef.current;
      setBeatCount(currentBeat);

      if (currentBeat >= BEATS_TO_PLAY) {
        clearInterval(beatTimer.current);
        beatTimer.current = null;
        setIsDemoing(false);
        setDemoFinished(true);
      }
    }, intervalMs);
  }, [stopMetronome]);

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (isDemoing) {
      stopMetronome();
    } else {
      startMetronome(currentIndex);
    }
  }, [isDemoing, currentIndex, stopMetronome, startMetronome]);

  // Start: advance to first tempo (no auto-play - show direction first)
  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setHasPlayed(false);
    setDemoFinished(false);
  }, []);

  // Next: mark current done, advance to next (no auto-play)
  const handleNext = useCallback(() => {
    stopMetronome();

    // Mark current as completed
    if (currentIndex >= 0) {
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx < TEMPOS.length) {
      setCurrentIndex(nextIdx);
      setHasPlayed(false);
      setDemoFinished(false);
    } else {
      // Mark last as completed
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, stopMetronome]);

  // Reset to start
  const handleReset = useCallback(() => {
    stopMetronome();
    setCurrentIndex(-1);
    setHasPlayed(false);
    setDemoFinished(false);
    setCompletedIndices(new Set());
  }, [stopMetronome]);

  const allDone = completedIndices.size === TEMPOS.length;

  // Compute animation duration for metronome pulse
  const currentBpm = currentIndex >= 0 ? TEMPOS[currentIndex]?.bpm : 92;
  const pulseDuration = `${60 / currentBpm}s`;

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8 overflow-hidden">
      {/* Keyframes for metronome pulse */}
      <style>{`
        @keyframes metronomePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>

      {/* Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-6xl font-bold text-white mb-2">Tempo Markings</h1>
        <p className="text-2xl text-purple-300 mb-0">The Speed of Music — from Very Slow to Very Fast</p>
      </div>

      {/* Direction banner - shows what's coming next */}
      {currentIndex >= 0 && !allDone && (
        <div className="flex-shrink-0 max-w-3xl mx-auto w-full mb-3">
          <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-6 py-3">
            <p className="text-2xl text-yellow-200 font-bold text-center">
              {DIRECTION_TEXT[currentIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Teacher speaking text */}
      <div className="flex-shrink-0 max-w-4xl mx-auto w-full mb-4">
        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3">
          <p className="text-lg text-purple-100 leading-relaxed italic text-center">
            {currentIndex === -1 && TEACHER_SCRIPT.intro}
            {currentIndex >= 0 && !allDone && TEACHER_SCRIPT.perTempo[currentIndex]}
            {allDone && TEACHER_SCRIPT.outro}
          </p>
        </div>
      </div>

      {/* Tempo cards row */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex gap-4 w-full max-w-6xl justify-center">
          {TEMPOS.map((t, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = completedIndices.has(idx);
            const isUpcoming = idx > currentIndex || currentIndex === -1;

            return (
              <div
                key={t.symbol}
                className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-500 border-2 ${
                  isActive
                    ? 'flex-[2] py-8 px-4 shadow-2xl scale-105'
                    : 'flex-1 py-6 px-3'
                } ${
                  isUpcoming && !isActive ? 'opacity-30' : ''
                } ${
                  isCompleted && !isActive ? 'opacity-70' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'rgba(0,0,0,0.5)' : isCompleted ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)',
                  borderColor: isActive ? t.color : isCompleted ? `${t.color}80` : 'transparent',
                  boxShadow: isActive ? `0 0 30px ${t.color}50, inset 0 0 30px ${t.color}15` : 'none',
                  minWidth: isActive ? '180px' : '100px',
                }}
              >
                {/* Completed checkmark */}
                {isCompleted && !isActive && (
                  <div className="absolute top-2 right-2">
                    <Check size={20} style={{ color: t.color }} />
                  </div>
                )}

                {/* Emoji - prominent on active card */}
                <div
                  className={`transition-all duration-500 ${
                    isActive ? 'text-6xl mb-2' : 'text-3xl mb-1'
                  }`}
                >
                  {t.emoji}
                </div>

                {/* Symbol / Name */}
                <div
                  className={`font-black transition-all duration-500 ${
                    isActive ? 'text-5xl mb-2' : 'text-2xl mb-1'
                  }`}
                  style={{ color: isActive || isCompleted ? t.color : 'rgba(255,255,255,0.6)' }}
                >
                  {t.symbol}
                </div>

                {/* Meaning */}
                <div className={`font-bold text-white transition-all duration-500 ${
                  isActive ? 'text-2xl mb-1' : 'text-sm'
                }`}>
                  {t.meaning}
                </div>

                {/* BPM - only on active */}
                {isActive && (
                  <div className="text-lg text-white/70 mt-1 font-semibold">
                    {t.bpm} BPM
                  </div>
                )}

                {/* Metronome pulse - only on active while demoing */}
                {isActive && isDemoing && (
                  <div className="mt-3 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full"
                      style={{
                        backgroundColor: t.color,
                        animation: `metronomePulse ${pulseDuration} ease-in-out infinite`,
                      }}
                    />
                  </div>
                )}

                {/* Beat counter - only on active while demoing */}
                {isActive && isDemoing && (
                  <div className="text-sm text-white/50 mt-2">
                    Beat {beatCount} / {BEATS_TO_PLAY}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed bar */}
      <div className="flex-shrink-0 max-w-5xl mx-auto w-full mb-6">
        <div className="flex items-end gap-1 h-12 justify-center">
          {TEMPOS.map((t, idx) => {
            const barHeight = ((idx + 1) / TEMPOS.length) * 100;
            const isActive = idx === currentIndex;
            const isReached = idx <= currentIndex;
            return (
              <div
                key={t.symbol}
                className={`rounded-t transition-all duration-500 ${
                  isActive ? 'w-20' : 'w-14'
                }`}
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: isReached ? t.color : `${t.color}30`,
                  boxShadow: isActive ? `0 0 20px ${t.color}80` : 'none',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-sm text-white/50 mt-1 px-2 max-w-[380px] mx-auto">
          <span>Slowest</span>
          <span>Fastest</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4">
        {/* Not started yet */}
        {currentIndex === -1 && (
          <button
            onClick={handleStart}
            className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-3xl font-bold text-white hover:scale-105 transition-all flex items-center gap-3"
          >
            <Play size={36} /> Start
          </button>
        )}

        {/* Active tempo */}
        {currentIndex >= 0 && !allDone && (
          <>
            {/* Play button - highlighted when tempo hasn't been demonstrated yet */}
            <button
              onClick={togglePlay}
              className={`px-8 py-4 rounded-2xl text-2xl font-bold text-white flex items-center gap-3 hover:scale-105 transition-all ${
                isDemoing
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : !hasPlayed
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 ring-4 ring-purple-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
            >
              {isDemoing ? <><Pause size={28} /> Pause</> : <><Play size={28} /> {hasPlayed ? 'Replay' : 'Play'}</>}
            </button>

            {/* Next button - only shows after demo finishes */}
            {demoFinished && (
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl text-2xl font-bold text-white flex items-center gap-3 hover:scale-105 transition-all"
              >
                {currentIndex < TEMPOS.length - 1 ? (
                  <>Next <ChevronRight size={28} /></>
                ) : (
                  <>Finish <Check size={28} /></>
                )}
              </button>
            )}
          </>
        )}

        {/* All done */}
        {allDone && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl text-green-400 font-bold">All tempo markings covered!</span>
            <span className="text-lg text-white/60">Click Next in the sidebar to advance to the next slide</span>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-medium text-white flex items-center gap-2 transition-all"
            >
              <RotateCcw size={20} /> Replay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TempoShowcase;
