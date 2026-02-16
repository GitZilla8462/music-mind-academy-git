// File: BrassFamilyShowcase.jsx
// Teacher presentation: Auto-sequence through brass family instruments
// Shows message screens between instruments, plays video clip for each
// Pattern based on WoodwindFamilyShowcase from Lesson 2

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

// Brass instrument configurations with video files
const INSTRUMENT_CONFIGS = [
  {
    id: 'trumpet',
    name: 'Trumpet',
    emoji: '🎺',
    color: '#F59E0B', // amber
    description: 'The highest voice in the brass family',
    videoPath: '/lessons/listening-lab/lesson3/videos/trumpet-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'Esteban Batallán — Haydn Trumpet Concerto, Real Filharmonía de Galicia (CC BY)',
    facts: ['Highest-pitched brass instrument', 'Uses three valves to change notes', 'Featured in Mountain King\'s explosive finale!']
  },
  {
    id: 'french-horn',
    name: 'French Horn',
    emoji: '📯',
    color: '#8B5CF6', // purple
    description: 'Warm and mellow, with over 12 feet of tubing',
    videoPath: '/lessons/listening-lab/lesson3/videos/french-horn-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'Gergely Sugar — Rainer Boschog: Sonata for Horn Solo, International Albanian Brass Festival (CC BY)',
    facts: ['Over 12 feet of tubing coiled in a circle', 'Player puts their hand in the bell', 'Can sound heroic or soft and lyrical']
  },
  {
    id: 'trombone',
    name: 'Trombone',
    emoji: '🎵',
    color: '#3B82F6', // blue
    description: 'Uses a slide instead of valves, rich and bold',
    videoPath: '/lessons/listening-lab/lesson3/videos/trombone-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'James Seymour — Senior Recital, Northwestern University (CC BY)',
    facts: ['Uses a slide instead of valves', 'Name means "big trumpet" in Italian', 'Can glide smoothly between notes (glissando)']
  },
  {
    id: 'tuba',
    name: 'Tuba',
    emoji: '🎵',
    color: '#EF4444', // red
    description: 'The lowest, deepest brass sound',
    videoPath: '/lessons/listening-lab/lesson3/videos/tuba-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'David Mercedes — Jean-François Charles: Llull, U of Iowa Center for New Music (CC BY)',
    facts: ['Lowest-pitched brass instrument', 'Up to 16 feet of tubing', 'Provides the bass for the whole brass section']
  }
];

const MESSAGE_DURATION = 2500; // How long to show "Let's hear the..." message

const BrassFamilyShowcase = ({ onAdvance }) => {
  const [phase, setPhase] = useState('intro'); // intro, message, playing, next, done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [messageTimerDone, setMessageTimerDone] = useState(false);

  const videoRef = useRef(null);
  const config = INSTRUMENT_CONFIGS[currentIndex];

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    if (currentIndex < INSTRUMENT_CONFIGS.length - 1) {
      setPhase('next');
    } else {
      setPhase('done');
    }
  }, [currentIndex]);

  // Handle video can play
  const handleCanPlay = () => {
    setVideoReady(true);
  };

  // Handle video error
  const handleVideoError = (e) => {
    console.error('Video load error:', e.target.error, 'for', config.videoPath);
  };

  // Start video playback at the configured start time
  const startPlayback = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      videoRef.current.currentTime = config.startTime;
      videoRef.current.volume = config.volume ?? 0.8;
      await videoRef.current.play();
      setPhase('playing');
    } catch (err) {
      console.error('Video playback error:', err);
    }
  }, [config.startTime, config.volume]);

  // Check if we've reached the end time
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && videoRef.current.currentTime >= config.endTime) {
      videoRef.current.pause();
      handleVideoEnded();
    }
  }, [config.endTime, handleVideoEnded]);

  // Message timer effect
  useEffect(() => {
    let timer;

    if (phase === 'message') {
      setMessageTimerDone(false);
      timer = setTimeout(() => {
        setMessageTimerDone(true);
      }, MESSAGE_DURATION);

      // Check if video is already ready
      if (videoRef.current && videoRef.current.readyState >= 3) {
        setVideoReady(true);
      }
    } else if (phase === 'next') {
      timer = setTimeout(() => {
        if (currentIndex < INSTRUMENT_CONFIGS.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setVideoReady(false);
          setMessageTimerDone(false);
          setPhase('message');
        }
      }, MESSAGE_DURATION);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, currentIndex]);

  // When message timer is done AND video is ready, start playing
  useEffect(() => {
    if (phase === 'message' && messageTimerDone && videoReady) {
      startPlayback();
    }
  }, [phase, messageTimerDone, videoReady, startPlayback]);

  // Teacher starts the sequence
  const handleStart = () => {
    setPhase('message');
  };

  // Restart everything
  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setCurrentIndex(0);
    setVideoReady(false);
    setMessageTimerDone(false);
    setPhase('intro');
  };

  return (
    <div className="w-full h-full relative bg-black">
      {/* Video element - always present but hidden when showing messages */}
      <video
        key={`video-${currentIndex}`}
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${phase === 'playing' ? 'opacity-100' : 'opacity-0'}`}
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        onEnded={handleVideoEnded}
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        playsInline
        preload="auto"
        src={config.videoPath}
      />

      {/* INTRO SCREEN */}
      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
          <div className="text-center px-8">
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight">
              Meet the Brass Family
            </h1>
            <div className="text-3xl text-white/90 mb-10 leading-relaxed">
              <p className="mb-6">Let's see and hear each instrument!</p>
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
              <p className="text-xl text-white/70 mb-6">All brass instruments make sound the same way — <span className="font-bold text-amber-300">buzzing lips</span> into a cup-shaped mouthpiece!</p>
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
            {!videoReady && (
              <p className="mt-8 text-2xl text-white/60">Loading video...</p>
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
              The Brass Family!
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
              From <span className="text-amber-400 font-bold">highest</span> to{' '}
              <span className="text-red-400 font-bold">lowest</span>:
              Trumpet {'\u2192'} French Horn {'\u2192'} Trombone {'\u2192'} Tuba
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
                Watch Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYING OVERLAY */}
      {phase === 'playing' && (
        <>
          {/* Instrument badge - top left */}
          <div
            className="absolute top-8 left-8 px-10 py-5 rounded-full flex items-center gap-4 text-white font-black text-4xl shadow-2xl"
            style={{
              backgroundColor: config.color,
              boxShadow: `0 0 50px ${config.color}`
            }}
          >
            <span className="text-5xl">{config.emoji}</span>
            {config.name}
          </div>

          {/* Performer credit - bottom left, max width so it wraps and stays out of the way */}
          <div className="absolute bottom-10 left-8 max-w-sm px-4 py-2 rounded-lg bg-black/60 text-white text-sm font-medium leading-snug">
            {config.credit}
          </div>

          {/* Progress dots - bottom center */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5">
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
        </>
      )}
    </div>
  );
};

export default BrassFamilyShowcase;
