// File: StringFamilyShowcase.jsx
// Teacher presentation: Auto-sequence through string family instruments
// Shows message screens between instruments, plays video clip for each
// Pattern based on VideoHookComparison from Lesson 4

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

// String instrument configurations with local MP4 files
const INSTRUMENT_CONFIGS = [
  {
    id: 'violin',
    name: 'Violin',
    emoji: '🎻',
    color: '#3B82F6', // blue
    description: 'The highest voice in the string family',
    videoPath: '/lessons/listening-lab/lesson1/videos/violin-demo.mp4',
    startTime: 134, // 2:14
    endTime: 144,   // 2:24
    facts: ['Smallest string instrument', 'Plays the highest notes', 'Often plays the melody']
  },
  {
    id: 'viola',
    name: 'Viola',
    emoji: '🎻',
    color: '#8B5CF6', // purple
    description: 'Slightly larger, with a warmer tone',
    videoPath: '/lessons/listening-lab/lesson1/videos/viola-demo.mp4',
    startTime: 33,  // 0:33
    endTime: 45,    // 0:45
    facts: ['Larger than a violin', 'Warmer, darker sound', 'Often plays harmony']
  },
  {
    id: 'cello',
    name: 'Cello',
    emoji: '🎻',
    color: '#10B981', // emerald
    description: 'Rich and warm, like a singing voice',
    videoPath: '/lessons/listening-lab/lesson1/videos/cello-demo.mp4',
    startTime: 253, // 4:13
    endTime: 263,   // 4:23
    facts: ['Played sitting down', 'Rich, warm tone', 'Can play melody or bass']
  },
  {
    id: 'bass',
    name: 'Double Bass',
    emoji: '🎻',
    color: '#EF4444', // red
    description: 'The deepest, most powerful sound',
    videoPath: '/lessons/listening-lab/lesson1/videos/bass-demo.mp4',
    startTime: 13,  // 0:13
    endTime: 23,    // 0:23
    facts: ['Largest string instrument', 'Provides the foundation', 'Players stand or use tall stool']
  }
];

const MESSAGE_DURATION = 2500; // How long to show "Let's hear the..." message

const StringFamilyShowcase = ({ onAdvance }) => {
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
    console.log('Video ready for:', config.name);
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
      await videoRef.current.play();
      setPhase('playing');
    } catch (err) {
      console.error('Video playback error:', err);
    }
  }, [config.startTime]);

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

      // Check if video is already ready (might have loaded during intro)
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
      console.log('Starting playback for:', config.name);
      startPlayback();
    }
  }, [phase, messageTimerDone, videoReady, startPlayback, config.name]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
          <div className="text-center px-8">
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight">
              Meet the String Family
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
            <div className="text-6xl mb-4">⬇️</div>
            <p className="text-3xl text-white/80 mb-4">Next up...</p>
            <div
              className="text-[120px] mb-4"
            >
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
              The String Family!
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
              Violin → Viola → Cello → Bass
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={onAdvance}
                className="px-12 py-6 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black text-4xl shadow-2xl transition-all hover:scale-105"
              >
                Continue →
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
          {/* Instrument badge - top center */}
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 px-10 py-5 rounded-full flex items-center gap-4 text-white font-black text-4xl shadow-2xl"
            style={{
              backgroundColor: config.color,
              boxShadow: `0 0 50px ${config.color}`
            }}
          >
            <span className="text-5xl">{config.emoji}</span>
            {config.name}
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
                  {idx < currentIndex && '✓'}
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

export default StringFamilyShowcase;
