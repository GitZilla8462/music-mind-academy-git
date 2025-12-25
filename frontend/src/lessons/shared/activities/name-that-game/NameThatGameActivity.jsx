// File: /lessons/shared/activities/name-that-game/NameThatGameActivity.jsx
// "Name That Game!" activity - Teacher plays game theme songs, students guess
// Used in Lesson 5 (Game On - Melody & Contour)

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Eye, EyeOff, Volume2, RotateCcw, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

// Game theme songs configuration
const GAME_THEMES = [
  {
    id: 1,
    title: 'Super Mario Bros.',
    color: '#ef4444',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/20',
    audioPath: '/lessons/film-music-project/lesson5/slides/Super Mario Bros. Theme Song.mp3',
    hint: 'Classic platformer from Nintendo',
    contour: 'Ascending with skips - bouncy and fun!',
    volume: 1.0
  },
  {
    id: 2,
    title: 'Minecraft',
    color: '#10b981',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/20',
    audioPath: '/lessons/film-music-project/lesson5/slides/Minecraft theme song (3 Minutes).mp3',
    hint: 'Build and explore in blocks',
    contour: 'Gentle steps - peaceful and calm',
    volume: 4.0 // 4x louder - quiet source audio
  },
  {
    id: 3,
    title: 'Geometry Dash',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/20',
    audioPath: '/lessons/film-music-project/lesson5/slides/Geometry Dash Stereo Madness soundtrack.mp3',
    hint: 'Rhythm-based runner game',
    contour: 'Fast repeated notes - intense and driving!',
    volume: 1.0
  },
  {
    id: 4,
    title: 'Roblox Adopt Me',
    color: '#ec4899',
    borderColor: 'border-pink-500',
    bgColor: 'bg-pink-500/20',
    audioPath: '/lessons/film-music-project/lesson5/slides/ROBLOX  Adopt Me Morning soundtrack Extended 10 minutes.mp3',
    hint: 'Popular Roblox game with pets',
    contour: 'Smooth steps - happy and upbeat',
    volume: 1.0
  }
];

const PLAY_DURATION = 10; // Only play first 10 seconds

const NameThatGameActivity = ({ onComplete }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [songsCompleted, setSongsCompleted] = useState([false, false, false, false]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const currentSong = GAME_THEMES[currentSongIndex];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Stop audio when changing songs
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setPlayProgress(0);
    setIsRevealed(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, [currentSongIndex]);

  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsPlaying(false);
    } else {
      // Play
      if (!audioRef.current) {
        audioRef.current = new Audio(currentSong.audioPath);

        // Use Web Audio API for volume > 1.0
        if (currentSong.volume > 1.0) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          }
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.gain.value = currentSong.volume;
          sourceNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioContextRef.current.destination);
        } else {
          audioRef.current.volume = currentSong.volume || 1.0;
        }
      }
      audioRef.current.play();
      setIsPlaying(true);

      // Track progress and auto-stop after 10 seconds
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / PLAY_DURATION) * 100, 100);
        setPlayProgress(progress);

        // Auto-stop after 10 seconds
        if (elapsed >= PLAY_DURATION) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setPlayProgress(100);
          clearInterval(progressIntervalRef.current);
        }
      }, 100);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    // Mark this song as completed
    const newCompleted = [...songsCompleted];
    newCompleted[currentSongIndex] = true;
    setSongsCompleted(newCompleted);
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setPlayProgress(0);
    setIsRevealed(false);
  };

  const handleNext = () => {
    if (currentSongIndex < GAME_THEMES.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const allCompleted = songsCompleted.every(Boolean);

  // Show completion view when all songs are revealed
  if (allCompleted) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">🎮</span>
              NAME THAT GAME!
            </h1>
            <div className="flex items-center gap-2">
              {GAME_THEMES.map((song, idx) => (
                <div
                  key={song.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-green-500"
                >
                  ✓
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Completion Message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl mb-8">🎉</div>
            <h2 className="text-6xl font-bold mb-4 text-green-400">Good Job!</h2>
            <p className="text-2xl text-slate-300 mb-8">You identified all 4 video game melodies!</p>
            <p className="text-xl text-amber-400 font-semibold mb-12">
              You recognized each game by its MELODY - that's the power of a great theme!
            </p>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-2xl font-bold flex items-center gap-3 mx-auto transition-all hover:scale-105 active:scale-95"
              >
                Continue
                <ArrowRight size={28} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-950 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">🎮</span>
              NAME THAT GAME!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {GAME_THEMES.map((song, idx) => (
              <button
                key={song.id}
                onClick={() => setCurrentSongIndex(idx)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  idx === currentSongIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-60 hover:opacity-100'
                } ${songsCompleted[idx] ? 'bg-green-500' : ''}`}
                style={{ backgroundColor: songsCompleted[idx] ? undefined : song.color }}
              >
                {songsCompleted[idx] ? '✓' : idx + 1}
              </button>
            ))}
          </div>
        </div>
        {/* Large directions for students to read from the board */}
        <div className="mt-4 text-center">
          <p className="text-4xl font-bold text-white">
            Listen to each <span className="text-purple-400">MELODY</span>. Can you guess the game?
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Song Card */}
          <div
            className={`rounded-2xl border-4 p-8 ${currentSong.bgColor}`}
            style={{ borderColor: currentSong.color }}
          >
            {/* Song Number */}
            <div className="text-center mb-6">
              <span
                className="text-2xl font-bold px-6 py-2 rounded-full"
                style={{ backgroundColor: currentSong.color }}
              >
                VIDEO GAME MELODY {currentSong.id}
              </span>
            </div>

            {/* Mystery or Revealed */}
            <div className="text-center mb-8">
              {isRevealed ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <h2 className="text-6xl font-bold mb-4">{currentSong.title}</h2>
                  <p className="text-xl text-indigo-200">{currentSong.hint}</p>
                </div>
              ) : (
                <div>
                  <div className="text-8xl mb-4">❓</div>
                  <h2 className="text-4xl font-bold text-slate-300">???</h2>
                  <p className="text-xl text-slate-400 mt-2">Play the music and guess!</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-100 rounded-full"
                  style={{
                    width: `${playProgress}%`,
                    backgroundColor: currentSong.color
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-400 mt-1">
                <span>0:00</span>
                <span className="flex items-center gap-1">
                  <Volume2 size={14} />
                  Play ~10 seconds
                </span>
                <span>0:10</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlay}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg`}
                style={{ backgroundColor: currentSong.color }}
              >
                {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all"
              >
                <RotateCcw size={24} />
              </button>

              {/* Reveal Button */}
              <button
                onClick={handleReveal}
                disabled={isRevealed}
                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${
                  isRevealed
                    ? 'bg-green-600 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'
                }`}
              >
                {isRevealed ? (
                  <>
                    <Eye size={24} />
                    Revealed!
                  </>
                ) : (
                  <>
                    <EyeOff size={24} />
                    Reveal Answer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentSongIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentSongIndex === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-center">
              <span className="text-slate-400">
                Song {currentSongIndex + 1} of {GAME_THEMES.length}
              </span>
              {allCompleted && (
                <p className="text-green-400 text-sm mt-1">All songs revealed!</p>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentSongIndex === GAME_THEMES.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentSongIndex === GAME_THEMES.length - 1
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer with key insight */}
      <div className="flex-shrink-0 px-8 py-4 bg-slate-800/50 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg">
            <span className="text-slate-400">How did you know which game it was? </span>
            <span className="text-amber-400 font-bold">You recognized the MELODY! That's the power of a great theme.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NameThatGameActivity;
