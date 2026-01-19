// File: VideoHookComparison.jsx
// Teacher presentation: Auto-sequence through all videos
// Shows message screens between phases, auto-advances through all 3 videos

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Music, Drum } from 'lucide-react';

// Video configurations
const VIDEO_CONFIGS = [
  {
    id: 1,
    title: 'Basketball',
    emoji: '🏀',
    videoPath: '/lessons/film-music-project/lesson4/BasketballHighlightReel.mp4',
    melodyPath: '/projects/film-music-score/loops/Hype Bass 1.m4a',
    drumsPath: '/projects/film-music-score/loops/Hype Drums 1.m4a',
    color: '#ef4444'
  },
  {
    id: 2,
    title: 'Soccer',
    emoji: '⚽',
    videoPath: '/lessons/film-music-project/lesson4/SoccerHighlightReel.mp4',
    melodyPath: '/projects/film-music-score/loops/Hype Bass 2.m4a',
    drumsPath: '/projects/film-music-score/loops/Hype Drums 2.m4a',
    color: '#22c55e'
  },
  {
    id: 3,
    title: 'Skateboarding',
    emoji: '🛹',
    videoPath: '/lessons/film-music-project/lesson4/SkateboardHighlighReel.mp4',
    melodyPath: '/projects/film-music-score/loops/Hype Guitar 1.m4a',
    drumsPath: '/projects/film-music-score/loops/Hype Drums 3.m4a',
    color: '#a855f7'
  }
];

const VIDEO_DURATION = 10;
const MESSAGE_DURATION = 2500;

const VideoHookComparison = ({ onAdvance }) => {
  const [phase, setPhase] = useState('intro');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [messageTimerDone, setMessageTimerDone] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const videoRef = useRef(null);
  const melodyRef = useRef(null);
  const drumsRef = useRef(null);

  const config = VIDEO_CONFIGS[currentVideoIndex];
  const isPlaying = phase === 'melody-play' || phase === 'beat-play';

  // Clean up audio
  const cleanupAudio = useCallback(() => {
    if (melodyRef.current) {
      melodyRef.current.pause();
      melodyRef.current.src = '';
      melodyRef.current = null;
    }
    if (drumsRef.current) {
      drumsRef.current.pause();
      drumsRef.current.src = '';
      drumsRef.current = null;
    }
    setAudioReady(false);
  }, []);

  // Initialize audio for current video
  const initAudio = useCallback(() => {
    cleanupAudio();

    melodyRef.current = new Audio(config.melodyPath);
    melodyRef.current.loop = true;
    melodyRef.current.volume = 0.6;

    drumsRef.current = new Audio(config.drumsPath);
    drumsRef.current.loop = true;
    drumsRef.current.volume = 0.5;

    // Wait for both to be ready
    let loadCount = 0;
    const onLoad = () => {
      loadCount++;
      if (loadCount >= 2) {
        setAudioReady(true);
      }
    };

    melodyRef.current.addEventListener('canplaythrough', onLoad);
    drumsRef.current.addEventListener('canplaythrough', onLoad);

    // Load them
    melodyRef.current.load();
    drumsRef.current.load();
  }, [config, cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  // Start melody playback
  const startMelodyPlay = useCallback(async () => {
    if (!videoRef.current || !melodyRef.current) {
      console.log('Video or melody not ready');
      return;
    }

    try {
      videoRef.current.currentTime = 0;
      melodyRef.current.currentTime = 0;

      const playPromise = videoRef.current.play();
      if (playPromise) await playPromise;

      await melodyRef.current.play();

      setPhase('melody-play');
      setCurrentTime(0);
      setMessageTimerDone(false);
    } catch (err) {
      console.error('Playback error:', err);
    }
  }, []);

  // Start beat playback
  const startBeatPlay = useCallback(async () => {
    if (!videoRef.current || !melodyRef.current || !drumsRef.current) {
      console.log('Video or audio not ready');
      return;
    }

    try {
      videoRef.current.currentTime = 0;
      melodyRef.current.currentTime = 0;
      drumsRef.current.currentTime = 0;

      const playPromise = videoRef.current.play();
      if (playPromise) await playPromise;

      await melodyRef.current.play();
      await drumsRef.current.play();

      setPhase('beat-play');
      setCurrentTime(0);
      setMessageTimerDone(false);
    } catch (err) {
      console.error('Playback error:', err);
    }
  }, []);

  // Message timer effect
  useEffect(() => {
    let timer;

    if (phase === 'melody-msg') {
      initAudio();
      timer = setTimeout(() => {
        setMessageTimerDone(true);
      }, MESSAGE_DURATION);
    } else if (phase === 'beat-msg') {
      timer = setTimeout(() => {
        setMessageTimerDone(true);
      }, MESSAGE_DURATION);
    } else if (phase === 'next-msg') {
      timer = setTimeout(() => {
        cleanupAudio();
        if (currentVideoIndex < VIDEO_CONFIGS.length - 1) {
          setCurrentVideoIndex(prev => prev + 1);
          setVideoReady(false);
          setAudioReady(false);
          setMessageTimerDone(false);
          setPhase('melody-msg');
        } else {
          setPhase('done');
        }
      }, MESSAGE_DURATION);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, currentVideoIndex, initAudio, cleanupAudio]);

  // When both timer is done AND video/audio are ready, start playing
  useEffect(() => {
    if (phase === 'melody-msg' && messageTimerDone && videoReady && audioReady) {
      startMelodyPlay();
    }
  }, [phase, messageTimerDone, videoReady, audioReady, startMelodyPlay]);

  // When timer is done for beat phase, start playing
  useEffect(() => {
    if (phase === 'beat-msg' && messageTimerDone) {
      startBeatPlay();
    }
  }, [phase, messageTimerDone, startBeatPlay]);

  // Stop all playback
  const stopPlayback = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    if (melodyRef.current) melodyRef.current.pause();
    if (drumsRef.current) drumsRef.current.pause();
  }, []);

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (time >= VIDEO_DURATION) {
        stopPlayback();

        if (phase === 'melody-play') {
          setPhase('beat-msg');
        } else if (phase === 'beat-play') {
          if (currentVideoIndex < VIDEO_CONFIGS.length - 1) {
            setPhase('next-msg');
          } else {
            setPhase('done');
          }
        }
      }
    }
  }, [phase, currentVideoIndex, stopPlayback]);

  // Handle video can play
  const handleCanPlay = () => {
    console.log('Video ready');
    setVideoReady(true);
  };

  // Teacher starts the sequence
  const handleStart = () => {
    setPhase('melody-msg');
  };

  // Restart everything
  const handleRestart = () => {
    stopPlayback();
    cleanupAudio();
    setCurrentVideoIndex(0);
    setCurrentTime(0);
    setVideoReady(false);
    setAudioReady(false);
    setMessageTimerDone(false);
    setPhase('intro');
  };

  const progress = (currentTime / VIDEO_DURATION) * 100;

  return (
    <div className="h-full relative bg-black">
      {/* Video element - always present but hidden when showing messages */}
      <video
        key={`video-${currentVideoIndex}`}
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-contain ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        muted
        playsInline
        preload="auto"
      >
        <source src={config.videoPath} type="video/mp4" />
      </video>

      {/* INTRO SCREEN */}
      {phase === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
          <div className="text-center px-8">
            <h1 className="text-7xl font-black text-white mb-10 tracking-tight">
              Melody vs Melody + Beat
            </h1>
            <div className="text-4xl text-white/90 mb-12 leading-relaxed font-medium">
              <p className="mb-6">You'll see the same clip <span className="text-cyan-400 font-bold">twice</span></p>
              <p className="mb-4">
                <span className="inline-flex items-center gap-3 bg-blue-600 px-8 py-3 rounded-full">
                  <Music size={36} />
                  First: Just Melody
                </span>
              </p>
              <p>
                <span className="inline-flex items-center gap-3 bg-orange-500 px-8 py-3 rounded-full">
                  <Drum size={36} />
                  Then: Melody + Beat
                </span>
              </p>
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

      {/* MELODY MESSAGE SCREEN */}
      {phase === 'melody-msg' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: config.color }}
        >
          <div className="text-center">
            <div className="text-[150px] mb-8">{config.emoji}</div>
            <h2 className="text-7xl font-black text-white mb-8 tracking-tight">
              {config.title}
            </h2>
            <div className="inline-flex items-center gap-4 bg-blue-600 px-12 py-6 rounded-full">
              <Music size={56} className="text-white" />
              <span className="text-5xl font-black text-white">Just Melody</span>
            </div>
            {(!videoReady || !audioReady) && (
              <p className="mt-8 text-2xl text-white/70">Loading...</p>
            )}
          </div>
        </div>
      )}

      {/* BEAT MESSAGE SCREEN */}
      {phase === 'beat-msg' && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-500">
          <div className="text-center">
            <div className="text-[150px] mb-8">{config.emoji}</div>
            <h2 className="text-7xl font-black text-white mb-8 tracking-tight">
              Same Clip — Now Listen!
            </h2>
            <div className="inline-flex items-center gap-4 bg-orange-700 px-12 py-6 rounded-full">
              <Drum size={56} className="text-white" />
              <span className="text-5xl font-black text-white">Melody + Beat</span>
            </div>
          </div>
        </div>
      )}

      {/* NEXT VIDEO MESSAGE SCREEN */}
      {phase === 'next-msg' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="text-9xl mb-8">✓</div>
            <h2 className="text-6xl font-black text-white mb-12 tracking-tight">
              Next Up...
            </h2>
            <div className="text-[180px] mb-6">
              {VIDEO_CONFIGS[currentVideoIndex + 1]?.emoji}
            </div>
            <h3 className="text-7xl font-black text-white">
              {VIDEO_CONFIGS[currentVideoIndex + 1]?.title}
            </h3>
          </div>
        </div>
      )}

      {/* DONE SCREEN */}
      {phase === 'done' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <button
              onClick={onAdvance}
              className="px-16 py-8 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black text-5xl shadow-2xl transition-all hover:scale-105"
            >
              Advance →
            </button>
            <button
              onClick={handleRestart}
              className="block mx-auto mt-8 text-white/60 hover:text-white text-2xl underline transition-colors"
            >
              or watch again
            </button>
          </div>
        </div>
      )}

      {/* VIDEO PLAYING OVERLAYS */}
      {isPlaying && (
        <>
          {/* Phase badge - top center */}
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 px-10 py-5 rounded-full flex items-center gap-4 text-white font-black text-4xl"
            style={{
              backgroundColor: phase === 'beat-play' ? '#f97316' : '#3b82f6',
              boxShadow: `0 0 50px ${phase === 'beat-play' ? '#f97316' : '#3b82f6'}`
            }}
          >
            {phase === 'melody-play' ? (
              <>
                <Music size={44} />
                Just Melody
              </>
            ) : (
              <>
                <Drum size={44} />
                Melody + Beat
              </>
            )}
          </div>

          {/* Video indicator - top right */}
          <div className="absolute top-8 right-8 flex items-center gap-4 px-8 py-4 bg-black/60 rounded-full">
            <span className="text-5xl">{config.emoji}</span>
            <span className="text-white font-bold text-3xl">{config.title}</span>
          </div>

          {/* Progress bar - bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-black/50">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                backgroundColor: phase === 'beat-play' ? '#f97316' : '#3b82f6'
              }}
            />
          </div>

          {/* Video progress dots - bottom center */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5">
            {VIDEO_CONFIGS.map((v, idx) => (
              <div
                key={v.id}
                className="w-6 h-6 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentVideoIndex
                    ? v.color
                    : idx < currentVideoIndex
                      ? '#10b981'
                      : 'rgba(255,255,255,0.3)',
                  transform: idx === currentVideoIndex ? 'scale(1.4)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoHookComparison;
