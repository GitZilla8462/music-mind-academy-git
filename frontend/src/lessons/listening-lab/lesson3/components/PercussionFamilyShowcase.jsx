// File: PercussionFamilyShowcase.jsx
// Teacher presentation: Auto-sequence through percussion family instruments
// Shows message screens between instruments, plays video clip for each
// Pattern based on WoodwindFamilyShowcase from Lesson 2
// Percussion has two categories: Pitched (timpani) and Unpitched (snare, bass drum, cymbals)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

// Percussion instrument configurations with video files
const INSTRUMENT_CONFIGS = [
  {
    id: 'timpani',
    name: 'Timpani',
    emoji: '🥁',
    color: '#F59E0B', // amber
    category: 'Pitched',
    description: 'Large drums that can play specific notes',
    videoPath: '/lessons/listening-lab/lesson3/videos/timpani-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'Michael Venti — Elliott Carter: Eight Pieces for Four Timpani (Saëta), via Daniel Más (CC BY)',
    facts: ['PITCHED — can play specific notes', 'Pedal changes pitch by tightening the drumhead', 'Stars in the Mouret Rondeau alongside the trumpets!']
  },
  {
    id: 'xylophone',
    name: 'Xylophone',
    emoji: '🎵',
    color: '#8B5CF6', // purple
    category: 'Pitched',
    description: 'Wooden bars struck with mallets — bright and sparkling',
    videoPath: '/lessons/listening-lab/lesson3/videos/xylophone-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'Daniel Hallet — Keiko Abe: Prism Rhapsody, MYAC Symphony Orchestra (CC BY)',
    facts: ['PITCHED — plays specific notes', 'Wooden bars arranged like piano keys', 'Bright, sharp tone that cuts through the orchestra']
  },
  {
    id: 'snare-drum',
    name: 'Snare Drum',
    emoji: '🥁',
    color: '#3B82F6', // blue
    category: 'Unpitched',
    description: 'Sharp, crisp buzz from metal wires underneath',
    videoPath: '/lessons/listening-lab/lesson3/videos/snare-drum-demo.mp4',
    startTime: 0,
    endTime: 9999,
    volume: 0.8,
    credit: 'Daniel Hallet — Keiko Abe: Prism Rhapsody, MYAC Symphony Orchestra (CC BY)',
    facts: ['UNPITCHED — no specific note', 'Metal wires (snares) on the bottom create the buzz', 'Used for marches, rolls, and rhythmic patterns']
  },
  {
    id: 'cymbals',
    name: 'Cymbals',
    emoji: '🥁',
    color: '#10B981', // emerald
    category: 'Unpitched',
    description: 'Metallic crash — punctuates big moments',
    audioOnly: true,
    audioPath: '/lessons/listening-lab/lesson3/videos/cymbals-demo.mp3',
    imagePath: '/lessons/listening-lab/lesson3/images/cymbals.jpg',
    volume: 0.8,
    credit: 'Photo: RZuljani (CC BY-SA 3.0) | Audio (CC BY)',
    facts: ['UNPITCHED — no specific note', 'Made of bronze alloy', 'Crash cymbals are struck together for big accents']
  }
];

const MESSAGE_DURATION = 2500; // How long to show "Let's hear the..." message

const PercussionFamilyShowcase = ({ onAdvance }) => {
  const [phase, setPhase] = useState('intro'); // intro, message, playing, next, done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [messageTimerDone, setMessageTimerDone] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
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
    if (phase === 'message' && messageTimerDone) {
      if (config.audioOnly) {
        // Audio-only: go straight to playing phase
        setPhase('playing');
      } else if (videoReady) {
        startPlayback();
      }
    }
  }, [phase, messageTimerDone, videoReady, startPlayback, config.audioOnly]);

  // Teacher starts the sequence
  const handleStart = () => {
    setPhase('message');
  };

  // Restart everything
  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentIndex(0);
    setVideoReady(false);
    setMessageTimerDone(false);
    setPhase('intro');
  };

  return (
    <div className="w-full h-full relative bg-black">
      {/* Video element - only for video instruments */}
      {!config.audioOnly && (
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
      )}

      {/* INTRO SCREEN */}
      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900">
          <div className="text-center px-8">
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight">
              Meet the Percussion Family
            </h1>
            <div className="text-3xl text-white/90 mb-10 leading-relaxed">
              <p className="mb-6">Instruments you strike, shake, or scrape!</p>

              {/* Two categories */}
              <div className="flex justify-center gap-10 mb-8">
                <div className="bg-amber-500/30 rounded-2xl px-6 py-4">
                  <p className="text-xl font-bold text-amber-300 mb-2">Pitched</p>
                  <p className="text-lg text-white/80">Can play specific NOTES</p>
                  <div className="flex justify-center gap-3 mt-3">
                    {INSTRUMENT_CONFIGS.filter(i => i.category === 'Pitched').map(inst => (
                      <div key={inst.id} className="flex flex-col items-center">
                        <span className="text-4xl">{inst.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: inst.color }}>{inst.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-500/30 rounded-2xl px-6 py-4">
                  <p className="text-xl font-bold text-blue-300 mb-2">Unpitched</p>
                  <p className="text-lg text-white/80">No specific note — just RHYTHM</p>
                  <div className="flex justify-center gap-3 mt-3">
                    {INSTRUMENT_CONFIGS.filter(i => i.category === 'Unpitched').map(inst => (
                      <div key={inst.id} className="flex flex-col items-center">
                        <span className="text-4xl">{inst.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: inst.color }}>{inst.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
            <h2 className="text-8xl font-black text-white mb-4 tracking-tight">
              {config.name}
            </h2>
            <div className="inline-block px-4 py-1 rounded-full bg-white/20 mb-4">
              <span className="text-xl font-bold text-white">{config.category}</span>
            </div>
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
              The Percussion Family!
            </h2>
            <div className="flex justify-center gap-8 mb-8">
              {INSTRUMENT_CONFIGS.map((inst) => (
                <div
                  key={inst.id}
                  className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl"
                  style={{ backgroundColor: inst.color }}
                >
                  <span className="text-6xl">{inst.emoji}</span>
                  <span className="text-2xl font-bold text-white">{inst.name}</span>
                  <span className="text-sm font-medium text-white/80">{inst.category}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mb-10">
              <div className="bg-amber-500/20 rounded-xl px-6 py-3">
                <span className="text-xl font-bold text-amber-300">Pitched</span>
                <span className="text-lg text-white/80 ml-2">= plays NOTES (Timpani, Xylophone)</span>
              </div>
              <div className="bg-blue-500/20 rounded-xl px-6 py-3">
                <span className="text-xl font-bold text-blue-300">Unpitched</span>
                <span className="text-lg text-white/80 ml-2">= just RHYTHM (Snare Drum, Cymbals)</span>
              </div>
            </div>
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

      {/* AUDIO-ONLY PLAYING SCREEN */}
      {phase === 'playing' && config.audioOnly && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${config.color}dd, ${config.color}88, #1e293b)` }}
        >
          <div className="text-center">
            {config.imagePath ? (
              <img
                src={config.imagePath}
                alt={config.name}
                className="w-64 h-64 object-contain mx-auto mb-6 rounded-2xl"
              />
            ) : (
              <div className="text-[180px] mb-6">{config.emoji}</div>
            )}
            <h2 className="text-7xl font-black text-white mb-4">{config.name}</h2>
            <div className="inline-block px-4 py-1 rounded-full bg-white/20 mb-8">
              <span className="text-xl font-bold text-white">{config.category}</span>
            </div>
            <div className="flex flex-col gap-3 mb-10 max-w-xl mx-auto">
              {config.facts.map((fact, i) => (
                <p key={i} className="text-2xl text-white/90 bg-black/20 rounded-xl px-6 py-3">{fact}</p>
              ))}
            </div>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.volume = config.volume ?? 0.8;
                  audioRef.current.play();
                }
              }}
              className="flex items-center gap-4 mx-auto px-12 py-5 bg-white hover:bg-gray-100 rounded-2xl text-gray-900 font-black text-3xl transition-all hover:scale-105 shadow-2xl mb-6"
            >
              <Play size={36} fill="currentColor" />
              Play Sound
            </button>
            <button
              onClick={handleVideoEnded}
              className="px-10 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white font-bold text-2xl transition-all"
            >
              {currentIndex < INSTRUMENT_CONFIGS.length - 1 ? 'Next Instrument \u2192' : 'Finish \u2192'}
            </button>
            <audio ref={audioRef} src={config.audioPath} preload="auto" />
          </div>
        </div>
      )}

      {/* VIDEO PLAYING OVERLAY */}
      {phase === 'playing' && !config.audioOnly && (
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

          {/* Category badge - top right */}
          <div className="absolute top-8 right-8 px-6 py-3 rounded-full bg-black/60 text-white font-bold text-2xl">
            {config.category}
          </div>

          {/* Performer credit - bottom left */}
          <div className="absolute bottom-10 left-8 px-4 py-2 rounded-lg bg-black/60 text-white text-lg font-medium">
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

export default PercussionFamilyShowcase;
