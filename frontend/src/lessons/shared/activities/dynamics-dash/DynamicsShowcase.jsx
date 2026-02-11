// File: /src/lessons/shared/activities/dynamics-dash/DynamicsShowcase.jsx
// Interactive Dynamics Showcase - Teacher presentation view
// Steps through pp → ff one at a time with audio playback and visual highlighting
// Flow: Direction text → Play button → Next button (no auto-play)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { AUDIO_PATH, DYNAMICS, getVolumeForDynamic } from './dynamicsDashConfig';

// Direction text shown BEFORE playing each dynamic
const DIRECTION_TEXT = [
  "Next, we will hear Pianissimo (pp) — Very Soft",
  "Next, we will hear Piano (p) — Soft",
  "Next, we will hear Mezzo Piano (mp) — Medium Soft",
  "Next, we will hear Mezzo Forte (mf) — Medium Loud",
  "Next, we will hear Forte (f) — Loud",
  "Next, we will hear Fortissimo (ff) — Very Loud",
];

// Teacher speaking text for each phase of the showcase
const TEACHER_SCRIPT = {
  intro: "Now we're going to hear all six dynamic markings. Dynamics tell us how loud or soft to play the music. We'll go from the softest all the way to the loudest. Listen carefully to how each one sounds different.",
  perDynamic: [
    "Pianissimo — the softest dynamic. Written as two little p's. This is like a whisper in music. You have to really lean in to hear it.",
    "Piano — soft, but not as quiet as pianissimo. One p. Think of how you'd talk in a library. Listen to how you can hear the melody more clearly now.",
    "Mezzo piano — medium soft. \"Mezzo\" means \"medium\" in Italian. We're right in the middle-soft range now. It's comfortable — not straining to hear, not overwhelming.",
    "Mezzo forte — medium loud. Still in the middle, but now leaning toward the loud side. This is probably the dynamic you hear most often in music. Listen to the energy pick up.",
    "Forte — loud! One f. This is bold and confident. The musicians are really digging in now. You can feel the difference.",
    "Fortissimo — the loudest dynamic! Two f's. This is full power — every instrument giving everything they've got. Listen to how much bigger this sounds.",
  ],
  outro: "Those are your six dynamic levels — from pianissimo to fortissimo. In a moment, you'll get to test your ears and see if you can identify them on your own!",
};

// Showcase clips - one per dynamic level, ordered pp → ff
const SHOWCASE_CLIPS = [
  { symbol: 'pp', startTime: 78, endTime: 84, description: 'Quiet strings after the storm' },
  { symbol: 'p',  startTime: 8,  endTime: 14, description: 'Gentle bird songs' },
  { symbol: 'mp', startTime: 26, endTime: 31, description: 'Murmuring brook' },
  { symbol: 'mf', startTime: 36, endTime: 42, description: 'Building energy' },
  { symbol: 'f',  startTime: 0,  endTime: 6,  description: 'Bold opening theme' },
  { symbol: 'ff', startTime: 71, endTime: 77, description: 'Thunder and lightning' },
];

const DynamicsShowcase = ({ sessionData }) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = not started
  const [hasPlayed, setHasPlayed] = useState(false); // whether current clip has been played at least once
  const [clipFinished, setClipFinished] = useState(false); // clip done playing, show Next
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedIndices, setCompletedIndices] = useState(new Set());

  const audioRef = useRef(null);
  const playbackTimer = useRef(null);

  // Stop audio helper
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playbackTimer.current) {
      clearTimeout(playbackTimer.current);
      playbackTimer.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  // Play clip for a given index
  const playClipAtIndex = useCallback((idx) => {
    const clip = SHOWCASE_CLIPS[idx];
    if (!clip) return;

    stopAudio();

    const audio = new Audio(AUDIO_PATH);
    audioRef.current = audio;
    audio.currentTime = clip.startTime;
    audio.volume = getVolumeForDynamic(clip.symbol);

    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    });

    setIsPlaying(true);
    setHasPlayed(true);
    setClipFinished(false);

    // Stop after clip duration
    const duration = (clip.endTime - clip.startTime) * 1000;
    playbackTimer.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setClipFinished(true);
    }, duration);
  }, [stopAudio]);

  // Play/pause current clip
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playClipAtIndex(currentIndex);
    }
  }, [isPlaying, currentIndex, stopAudio, playClipAtIndex]);

  // Start: advance to first dynamic (no auto-play - show direction first)
  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setHasPlayed(false);
    setClipFinished(false);
  }, []);

  // Next: mark current done, advance to next (no auto-play)
  const handleNext = useCallback(() => {
    stopAudio();

    // Mark current as completed
    if (currentIndex >= 0) {
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx < SHOWCASE_CLIPS.length) {
      setCurrentIndex(nextIdx);
      setHasPlayed(false);
      setClipFinished(false);
    } else {
      // Mark last as completed
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, stopAudio]);

  // Reset to start
  const handleReset = useCallback(() => {
    stopAudio();
    setCurrentIndex(-1);
    setHasPlayed(false);
    setClipFinished(false);
    setCompletedIndices(new Set());
  }, [stopAudio]);

  const allDone = completedIndices.size === SHOWCASE_CLIPS.length;

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-7xl lg:text-8xl font-bold text-white mb-2">Dynamic Markings</h1>
        <p className="text-3xl lg:text-4xl text-purple-300 mb-0">The Volume of Music — from Very Soft to Very Loud</p>
      </div>

      {/* Direction banner - shows what's coming next */}
      {currentIndex >= 0 && !allDone && (
        <div className="flex-shrink-0 max-w-4xl mx-auto w-full mb-3">
          <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-6 py-3">
            <p className="text-3xl text-yellow-200 font-bold text-center">
              {DIRECTION_TEXT[currentIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Teacher speaking text */}
      <div className="flex-shrink-0 max-w-5xl mx-auto w-full mb-4">
        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3">
          <p className="text-xl text-purple-100 leading-relaxed italic text-center">
            {currentIndex === -1 && TEACHER_SCRIPT.intro}
            {currentIndex >= 0 && !allDone && TEACHER_SCRIPT.perDynamic[currentIndex]}
            {allDone && TEACHER_SCRIPT.outro}
          </p>
        </div>
      </div>

      {/* Dynamic cards row */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex gap-4 w-full max-w-6xl justify-center">
          {DYNAMICS.map((d, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = completedIndices.has(idx);
            const isUpcoming = idx > currentIndex || currentIndex === -1;
            const clip = SHOWCASE_CLIPS[idx];

            return (
              <div
                key={d.symbol}
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
                  borderColor: isActive ? d.color : isCompleted ? `${d.color}80` : 'transparent',
                  boxShadow: isActive ? `0 0 30px ${d.color}50, inset 0 0 30px ${d.color}15` : 'none',
                  minWidth: isActive ? '180px' : '100px',
                }}
              >
                {/* Completed checkmark */}
                {isCompleted && !isActive && (
                  <div className="absolute top-2 right-2">
                    <Check size={20} style={{ color: d.color }} />
                  </div>
                )}

                {/* Symbol */}
                <div
                  className={`font-black transition-all duration-500 ${
                    isActive ? 'text-8xl mb-3' : 'text-5xl mb-1'
                  }`}
                  style={{ color: isActive || isCompleted ? d.color : 'rgba(255,255,255,0.6)' }}
                >
                  {d.symbol}
                </div>

                {/* Name */}
                <div className={`font-bold text-white transition-all duration-500 ${
                  isActive ? 'text-3xl mb-1' : 'text-base'
                }`}>
                  {d.name}
                </div>

                {/* Meaning */}
                <div className={`text-white/80 transition-all duration-500 ${
                  isActive ? 'text-xl' : 'text-sm'
                }`}>
                  {d.meaning}
                </div>

                {/* Description - only on active */}
                {isActive && clip && (
                  <div className="text-sm text-white/60 mt-2 italic">
                    "{clip.description}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume bar */}
      <div className="flex-shrink-0 max-w-5xl mx-auto w-full mb-6">
        <div className="flex items-end gap-1 h-12 justify-center">
          {DYNAMICS.map((d, idx) => {
            const barHeight = ((idx + 1) / DYNAMICS.length) * 100;
            const isActive = idx === currentIndex;
            const isReached = idx <= currentIndex;
            return (
              <div
                key={d.symbol}
                className={`rounded-t transition-all duration-500 ${
                  isActive ? 'w-20' : 'w-14'
                }`}
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: isReached ? d.color : `${d.color}30`,
                  boxShadow: isActive ? `0 0 20px ${d.color}80` : 'none',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-base text-white/50 mt-1 px-2 max-w-[420px] mx-auto">
          <span>Softest</span>
          <span>Loudest</span>
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

        {/* Active dynamic */}
        {currentIndex >= 0 && !allDone && (
          <>
            {/* Play button - highlighted when clip hasn't played yet */}
            <button
              onClick={togglePlay}
              className={`px-8 py-4 rounded-2xl text-2xl font-bold text-white flex items-center gap-3 hover:scale-105 transition-all ${
                isPlaying
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : !hasPlayed
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 ring-4 ring-purple-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
            >
              {isPlaying ? <><Pause size={28} /> Pause</> : <><Play size={28} /> {hasPlayed ? 'Replay' : 'Play'}</>}
            </button>

            {/* Next button - greyed out until clip finishes, then turns green */}
            <button
              onClick={handleNext}
              disabled={!clipFinished}
              className={`px-8 py-4 rounded-2xl text-2xl font-bold text-white flex items-center gap-3 transition-all ${
                clipFinished
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 cursor-pointer'
                  : 'bg-gray-600/50 opacity-40 cursor-not-allowed'
              }`}
            >
              {currentIndex < SHOWCASE_CLIPS.length - 1 ? (
                <>Next <ChevronRight size={28} /></>
              ) : (
                <>Finish <Check size={28} /></>
              )}
            </button>
          </>
        )}

        {/* All done */}
        {allDone && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl text-green-400 font-bold">All dynamics covered!</span>
            <span className="text-xl text-white/60">Click Next in the sidebar to advance to the next slide</span>
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

export default DynamicsShowcase;
