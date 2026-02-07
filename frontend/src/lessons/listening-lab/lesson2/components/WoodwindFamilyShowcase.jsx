// File: WoodwindFamilyShowcase.jsx
// Teacher presentation: Auto-sequence through woodwind family instruments
// Shows message screens between instruments, plays audio clip for each
// Pattern based on StringFamilyShowcase from Lesson 1 (adapted for audio-only)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

// Woodwind instrument configurations with audio files
const INSTRUMENT_CONFIGS = [
  {
    id: 'flute',
    name: 'Flute',
    emoji: '\uD83C\uDFB5',
    color: '#3B82F6', // blue
    description: 'The highest voice in the woodwind family',
    audioPath: '/audio/orchestra-samples/woodwinds/flute/flute-demo.mp3',
    volume: 0.8,
    facts: ['No reed \u2014 sound made by blowing across the mouthhole', 'Made of metal, not wood!', 'Plays the highest notes in the woodwind family']
  },
  {
    id: 'oboe',
    name: 'Oboe',
    emoji: '\uD83C\uDFB5',
    color: '#8B5CF6', // purple
    description: 'A double reed with a piercing, nasal tone',
    audioPath: '/audio/orchestra-samples/woodwinds/oboe/oboe-demo.mp3',
    volume: 0.8,
    facts: ['Uses a double reed \u2014 two thin pieces of cane', 'Tunes the entire orchestra', 'Distinctive nasal, piercing sound']
  },
  {
    id: 'clarinet',
    name: 'Clarinet',
    emoji: '\uD83C\uDFB5',
    color: '#10B981', // emerald
    description: 'Warm and smooth, with the widest range',
    audioPath: '/audio/orchestra-samples/woodwinds/clarinet/clarinet-demo.mp3',
    volume: 0.8,
    facts: ['Uses a single reed', 'Widest range of any woodwind', 'Can sound warm or bright']
  },
  {
    id: 'bassoon',
    name: 'Bassoon',
    emoji: '\uD83C\uDFB5',
    color: '#EF4444', // red
    description: 'The deepest, richest woodwind sound',
    audioPath: '/audio/orchestra-samples/woodwinds/bassoon/bassoon-demo.mp3',
    volume: 0.8,
    facts: ['Uses a double reed, like the oboe', 'Lowest standard orchestral woodwind', 'Over 8 feet of tubing folded into its body']
  }
];

const MESSAGE_DURATION = 2500; // How long to show "Let's hear the..." message

const WoodwindFamilyShowcase = ({ onAdvance }) => {
  const [phase, setPhase] = useState('intro'); // intro, message, playing, next, done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [messageTimerDone, setMessageTimerDone] = useState(false);

  const audioRef = useRef(null);
  const config = INSTRUMENT_CONFIGS[currentIndex];

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    if (currentIndex < INSTRUMENT_CONFIGS.length - 1) {
      setPhase('next');
    } else {
      setPhase('done');
    }
  }, [currentIndex]);

  // Handle audio can play through
  const handleCanPlayThrough = useCallback(() => {
    console.log('Audio ready for:', config.name);
    setAudioReady(true);
  }, [config.name]);

  // Handle audio error
  const handleAudioError = useCallback((e) => {
    console.error('Audio load error:', e.target.error, 'for', config.audioPath);
  }, [config.audioPath]);

  // Start audio playback
  const startPlayback = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = config.volume ?? 0.8;
      await audioRef.current.play();
      setPhase('playing');
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, [config.volume]);

  // Message timer effect
  useEffect(() => {
    let timer;

    if (phase === 'message') {
      setMessageTimerDone(false);
      timer = setTimeout(() => {
        setMessageTimerDone(true);
      }, MESSAGE_DURATION);

      // Check if audio is already ready (might have loaded during intro)
      if (audioRef.current && audioRef.current.readyState >= 4) {
        setAudioReady(true);
      }
    } else if (phase === 'next') {
      timer = setTimeout(() => {
        if (currentIndex < INSTRUMENT_CONFIGS.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setAudioReady(false);
          setMessageTimerDone(false);
          setPhase('message');
        }
      }, MESSAGE_DURATION);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, currentIndex]);

  // When message timer is done AND audio is ready, start playing
  useEffect(() => {
    if (phase === 'message' && messageTimerDone && audioReady) {
      console.log('Starting playback for:', config.name);
      startPlayback();
    }
  }, [phase, messageTimerDone, audioReady, startPlayback, config.name]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Teacher starts the sequence
  const handleStart = () => {
    setPhase('message');
  };

  // Restart everything
  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentIndex(0);
    setAudioReady(false);
    setMessageTimerDone(false);
    setPhase('intro');
  };

  return (
    <div className="w-full h-full relative bg-black">
      {/* Audio element - always present but hidden */}
      <audio
        key={`audio-${currentIndex}`}
        ref={audioRef}
        onCanPlayThrough={handleCanPlayThrough}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="auto"
        src={config.audioPath}
      />

      {/* INTRO SCREEN */}
      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
          <div className="text-center px-8">
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight">
              Meet the Woodwind Family
            </h1>
            <div className="text-3xl text-white/90 mb-10 leading-relaxed">
              <p className="mb-6">Let's hear each instrument!</p>
              <div className="flex justify-center gap-6 mb-8">
                {INSTRUMENT_CONFIGS.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl"
                    style={{ backgroundColor: `${inst.color}40` }}
                  >
                    <span className="text-5xl">{inst.emoji}</span>
                    <span className="text-xl font-bold" style={{ color: inst.color }}>
                      {inst.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleStart}
              className="flex items-center gap-4 mx-auto px-16 py-7 bg-white hover:bg-gray-100 rounded-2xl text-gray-900 font-black text-4xl transition-all hover:scale-105 shadow-2xl"
            >
              <Play size={48} fill="currentColor" />
              START
            </button>
          </div>
        </div>
      )}

      {/* INSTRUMENT MESSAGE SCREEN */}
      {phase === 'message' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: config.color }}
        >
          <div className="text-center">
            <p className="text-4xl text-white/80 mb-4 font-medium">
              {currentIndex === 0 ? "First, let's hear the..." : "Next, let's hear the..."}
            </p>
            <div className="text-[150px] mb-4">{config.emoji}</div>
            <h2 className="text-8xl font-black text-white mb-6 tracking-tight">
              {config.name}
            </h2>
            <p className="text-3xl text-white/90 font-medium">
              {config.description}
            </p>
            {!audioReady && (
              <p className="mt-8 text-2xl text-white/60">Loading audio...</p>
            )}
          </div>
        </div>
      )}

      {/* NEXT INSTRUMENT MESSAGE SCREEN */}
      {phase === 'next' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="text-8xl mb-6" style={{ color: config.color }}>
              {config.emoji}
            </div>
            <p className="text-4xl text-white/70 mb-8">
              That was the <span className="font-bold text-white">{config.name}</span>!
            </p>
            <div className="text-6xl mb-4">{'\u2B07\uFE0F'}</div>
            <p className="text-3xl text-white/80 mb-4">Next up...</p>
            <div className="text-[120px] mb-4">
              {INSTRUMENT_CONFIGS[currentIndex + 1]?.emoji}
            </div>
            <h3
              className="text-6xl font-black"
              style={{ color: INSTRUMENT_CONFIGS[currentIndex + 1]?.color }}
            >
              {INSTRUMENT_CONFIGS[currentIndex + 1]?.name}
            </h3>
          </div>
        </div>
      )}

      {/* DONE SCREEN */}
      {phase === 'done' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center">
            <h2 className="text-6xl font-black text-white mb-8">
              The Woodwind Family!
            </h2>
            <div className="flex justify-center gap-8 mb-12">
              {INSTRUMENT_CONFIGS.map((inst) => (
                <div
                  key={inst.id}
                  className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl"
                  style={{ backgroundColor: inst.color }}
                >
                  <span className="text-6xl">{inst.emoji}</span>
                  <span className="text-2xl font-bold text-white">{inst.name}</span>
                </div>
              ))}
            </div>
            <p className="text-3xl text-white/80 mb-10">
              From <span className="text-blue-400 font-bold">highest</span> to{' '}
              <span className="text-red-400 font-bold">lowest</span>:
              Flute {'\u2192'} Oboe {'\u2192'} Clarinet {'\u2192'} Bassoon
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={onAdvance}
                className="px-12 py-6 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black text-4xl shadow-2xl transition-all hover:scale-105"
              >
                Continue {'\u2192'}
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center gap-3 px-8 py-6 bg-slate-700 hover:bg-slate-600 rounded-2xl text-white font-bold text-2xl transition-all"
              >
                <RotateCcw size={28} />
                Listen Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIO PLAYING SCREEN - Instrument card with audio visualization */}
      {phase === 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
          {/* Centered instrument card */}
          <div className="flex flex-col items-center">
            {/* Instrument badge */}
            <div
              className="px-10 py-5 rounded-full flex items-center gap-4 text-white font-black text-4xl shadow-2xl mb-10"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 50px ${config.color}`
              }}
            >
              <span className="text-5xl">{config.emoji}</span>
              {config.name}
            </div>

            {/* Audio visualization bars */}
            <div className="flex items-end justify-center gap-2 mb-10 h-32">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-4 rounded-full"
                  style={{
                    backgroundColor: config.color,
                    height: '100%',
                    animation: `audioBar 1.2s ease-in-out ${i * 0.15}s infinite`,
                    opacity: 0.85
                  }}
                />
              ))}
            </div>

            {/* Facts */}
            <div className="flex flex-col gap-4 mb-10">
              {config.facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-2xl text-white/90"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  {fact}
                </div>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-5">
              {INSTRUMENT_CONFIGS.map((inst, idx) => (
                <div
                  key={inst.id}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: idx === currentIndex
                        ? inst.color
                        : idx < currentIndex
                          ? '#10b981'
                          : 'rgba(255,255,255,0.3)',
                      transform: idx === currentIndex ? 'scale(1.3)' : 'scale(1)',
                      boxShadow: idx === currentIndex ? `0 0 20px ${inst.color}` : 'none'
                    }}
                  >
                    {idx < currentIndex && '\u2713'}
                  </div>
                  <span
                    className="text-sm font-bold transition-all"
                    style={{
                      color: idx === currentIndex ? inst.color : 'rgba(255,255,255,0.5)'
                    }}
                  >
                    {inst.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CSS animation for audio bars */}
          <style>{`
            @keyframes audioBar {
              0%, 100% {
                transform: scaleY(0.3);
              }
              50% {
                transform: scaleY(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default WoodwindFamilyShowcase;
