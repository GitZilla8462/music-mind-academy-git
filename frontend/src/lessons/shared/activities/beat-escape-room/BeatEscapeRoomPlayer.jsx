// BeatEscapeRoomPlayer.jsx - PLAY mode
// Solve beat puzzles - listen and recreate
// Features progressive room backgrounds as you advance

import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, Check, RotateCcw, Lightbulb } from 'lucide-react';
import BeatGrid from './BeatGrid';
import {
  createEmptyPattern,
  patternsMatch,
  playPattern,
  sounds,
  INSTRUMENTS
} from './beatEscapeRoomConfig';
import { THEMES, getThemeAssets, getRoomBackground, getEscapedBackground } from './beatEscapeRoomThemes';

// Preload background images
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

const BeatEscapeRoomPlayer = ({ roomData, onComplete, onBack }) => {
  // Get theme from room data (default to space-station)
  const themeId = roomData.theme || 'space-station';
  const theme = THEMES[themeId] || THEMES['space-station'];
  const assets = getThemeAssets(themeId);

  // Get locks sorted by number
  // Handle both old format (direct pattern) and new format (pattern with grid property)
  const locks = Object.entries(roomData.patterns)
    .map(([num, patternData]) => {
      // New format has { grid, createdBy, completedAt }, old format is direct pattern
      const pattern = patternData.grid || patternData;
      return { number: parseInt(num), pattern };
    })
    .sort((a, b) => a.number - b.number);

  const [currentLockIndex, setCurrentLockIndex] = useState(0);
  const [userPattern, setUserPattern] = useState(createEmptyPattern());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(null);
  const [lockScores, setLockScores] = useState([]); // Array of percentages per lock
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [escaped, setEscaped] = useState(false);

  const currentLock = locks[currentLockIndex];
  const targetPattern = currentLock?.pattern;
  const totalLocks = locks.length;
  const currentLockNumber = currentLock?.number || 1;

  // Calculate average percentage score
  const averageScore = lockScores.length > 0
    ? Math.round(lockScores.reduce((a, b) => a + b, 0) / lockScores.length)
    : 0;

  // Get current background based on lock progress
  const currentBackground = escaped
    ? getEscapedBackground(themeId)
    : getRoomBackground(themeId, currentLockNumber, totalLocks);

  // Preload all backgrounds on mount
  useEffect(() => {
    const assets = getThemeAssets(themeId);
    preloadImage(assets.bgRoom1);
    preloadImage(assets.bgRoom2);
    preloadImage(assets.bgRoom3);
    preloadImage(assets.bgEscaped);
  }, [themeId]);

  // Reset state when moving to new lock
  useEffect(() => {
    setUserPattern(createEmptyPattern());
    setWrongAttempts(0);
    setRevealedHints([]);
    setHasPlayedOnce(false);
    setShowSuccess(false);
  }, [currentLockIndex]);

  const toggleCell = useCallback((instrumentId, beatIndex) => {
    if (showSuccess) return;
    setUserPattern(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((val, i) =>
        i === beatIndex ? !val : val
      )
    }));
  }, [showSuccess]);

  const handlePlayBeat = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setHasPlayedOnce(true);

    // Animate column highlight from left to right
    const interval = 600; // ms per beat at ~100 BPM
    for (let beat = 0; beat < 4; beat++) {
      setTimeout(() => {
        setCurrentBeat(beat);
      }, beat * interval);
    }

    await playPattern(targetPattern);

    setTimeout(() => {
      setCurrentBeat(null);
      setIsPlaying(false);
    }, 4 * interval + 100);
  };

  const handleClear = () => {
    setUserPattern(createEmptyPattern());
  };

  const revealNextHint = () => {
    const order = ['kick', 'snare', 'hihat'];
    const nextToReveal = order.find(inst => !revealedHints.includes(inst));

    if (nextToReveal) {
      setRevealedHints(prev => [...prev, nextToReveal]);
      sounds.hint();

      // Copy the revealed row from target to user pattern
      setUserPattern(prev => ({
        ...prev,
        [nextToReveal]: [...targetPattern[nextToReveal]]
      }));
    }
  };

  const handleCheckAnswer = async () => {
    if (!hasPlayedOnce || showSuccess) return;

    const isCorrect = patternsMatch(userPattern, targetPattern);

    if (isCorrect) {
      // Calculate percentage for this lock (100% = first try, no hints)
      const attemptPenalty = wrongAttempts * 15; // -15% per wrong attempt
      const hintPenalty = revealedHints.length * 20; // -20% per hint
      const lockPercent = Math.max(100 - attemptPenalty - hintPenalty, 0);

      setLockScores(prev => [...prev, lockPercent]);
      setShowSuccess(true);
      await sounds.unlock();

      // Move to next lock after delay
      setTimeout(() => {
        if (currentLockIndex < totalLocks - 1) {
          setCurrentLockIndex(prev => prev + 1);
        } else {
          // All locks complete!
          setEscaped(true);
          sounds.escape();
          // Don't auto-navigate - let user click Exit or Continue
        }
      }, 1500);
    } else {
      // Wrong answer
      setWrongAttempts(prev => prev + 1);
      sounds.wrongGuess();

      // Shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Reveal hint after 3 wrong attempts
      if (wrongAttempts + 1 >= 3 && revealedHints.length < 3) {
        setTimeout(() => revealNextHint(), 600);
      }
    }
  };

  // Render lock progress - simple circles instead of images to avoid transparency issues
  const renderProgress = () => (
    <div className="flex gap-3 justify-center mb-3">
      {locks.map((lock, idx) => {
        const isComplete = idx < currentLockIndex || (idx === currentLockIndex && showSuccess);
        const isCurrent = idx === currentLockIndex && !showSuccess;
        return (
          <div
            key={lock.number}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
              isComplete
                ? 'bg-green-600 border-green-400 text-white'
                : isCurrent
                  ? 'bg-cyan-600 border-cyan-400 text-white scale-110 ring-2 ring-cyan-300'
                  : 'bg-gray-700 border-gray-500 text-gray-400'
            }`}
            style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif" }}
          >
            {isComplete ? '✓' : idx + 1}
          </div>
        );
      })}
    </div>
  );

  if (!currentLock) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">No locks found!</p>
      </div>
    );
  }

  return (
    <div
      className="beat-escape-player min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background || '#0f172a',
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability - fixed to cover full viewport */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />

      {/* Fixed top left: EXIT, Attempts, PTS stacked */}
      <div className="fixed top-4 left-4 z-20 flex flex-col gap-2" style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}>
        <button
          onClick={onBack}
          className="text-cyan-300 hover:text-white transition-colors bg-gray-900/90 rounded-lg border-2 border-cyan-500/60 px-4 py-2 text-lg font-bold"
        >
          ← EXIT
        </button>
        <div className="bg-gray-900/90 rounded-lg border-2 border-cyan-500/60 px-4 py-2">
          <div className="text-gray-400 text-sm mb-1">ATTEMPTS</div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full transition-colors ${
                  wrongAttempts >= i ? 'bg-red-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-900/90 rounded-lg border-2 border-cyan-500/60 px-4 py-2 text-center">
          <div className="text-gray-400 text-sm">SCORE</div>
          <div className="text-cyan-300 text-2xl font-bold">{averageScore}%</div>
        </div>
      </div>

      {/* Fixed top right: ROOM */}
      <div
        className="fixed top-4 right-4 z-20 bg-gray-900/90 rounded-lg border-2 border-cyan-400/60 px-4 py-2 text-center"
        style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}
      >
        <div className="text-gray-400 text-sm">ROOM</div>
        <div className="text-cyan-300 text-2xl font-bold tracking-widest" style={{ textShadow: '0 0 8px rgba(6, 182, 212, 0.6)' }}>
          {roomData.shareCode}
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col overflow-auto">
        {/* Lock title at top center */}
        <div className="w-full pt-4 mb-2">
          <h1
            className="text-3xl font-bold text-white text-center"
            style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", textShadow: `0 0 10px ${theme.colors.primary}80`, letterSpacing: '0.15em' }}
          >
            {escaped ? '🎉 ESCAPED!' : showSuccess ? '🔓 UNLOCKED!' : `LOCK ${currentLockIndex + 1} OF ${totalLocks}`}
          </h1>

          {renderProgress()}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pb-2 pt-1">
          <div className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl p-3 w-full max-w-lg transition-all border border-cyan-500/30 ${
            showSuccess ? 'ring-4 ring-green-500' : ''
          } ${escaped ? 'ring-4 ring-yellow-400' : ''}`}>
            {/* Escaped celebration */}
            {escaped && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3 animate-bounce">🏆</div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", textShadow: `0 0 10px ${theme.colors.primary}80`, color: theme.colors.primary, letterSpacing: '0.15em' }}
                >
                  ESCAPED!
                </h2>
                <p className="text-4xl font-bold text-white mb-2" style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}>
                  {averageScore}%
                </p>
                <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.15em' }}>
                  ACCURACY
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl text-white font-bold transition-all flex items-center gap-2 border-2"
                    style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, letterSpacing: '0.1em' }}
                  >
                    ← EXIT
                  </button>
                  <button
                    onClick={() => {
                      setEscaped(false);
                      setCurrentLockIndex(0);
                      setLockScores([]);
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all flex items-center gap-2 border-2 border-green-400"
                    style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}
                  >
                    PLAY AGAIN
                  </button>
                </div>
              </div>
            )}

            {/* Normal play UI */}
            {!escaped && (
              <>
                {/* Play Button */}
                <div className="flex justify-center mb-2">
                  <button
                    onClick={handlePlayBeat}
                    disabled={isPlaying}
                    className={`px-6 py-2 rounded-xl font-bold text-lg transition-all flex items-center gap-2 border-2 ${
                      isPlaying
                        ? 'bg-cyan-900/50 text-cyan-200 border-cyan-500/50'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 hover:scale-105 animate-pulse-subtle'
                    }`}
                    style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}
                  >
                    <Volume2 size={22} className={isPlaying ? 'animate-pulse' : ''} />
                    {isPlaying ? 'PLAYING...' : 'PLAY BEAT'}
                  </button>
                </div>

                {/* Beat Grid */}
                <div className={`flex justify-center mb-3 ${isShaking ? 'grid-shake' : ''}`}>
                  <BeatGrid
                    pattern={userPattern}
                    onToggle={toggleCell}
                    mode="play"
                    showConstraints={false}
                    revealedRows={revealedHints}
                    targetPattern={targetPattern}
                    disabled={showSuccess || !hasPlayedOnce}
                    size="large"
                    themeId={themeId}
                    currentBeat={currentBeat}
                  />
                </div>

                {/* Controls - always render to prevent layout shift */}
                <div className={`flex gap-3 justify-center mb-3 transition-opacity ${
                  !showSuccess && hasPlayedOnce ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 font-semibold transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Clear
                  </button>

                  <button
                    onClick={handleCheckAnswer}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <Check size={20} />
                    Check Answer
                  </button>
                </div>

                {/* Success Message - fixed height container to prevent shift */}
                <div className="h-8 flex items-center justify-center mb-2">
                  {showSuccess && (
                    <div className="text-center text-green-400 text-lg font-bold animate-bounce">
                      ✨ Perfect! Moving to next lock...
                    </div>
                  )}
                </div>

                {/* Hint/Warning area - fixed height to prevent shift */}
                <div className="h-10">
                  {/* Hint Display */}
                  {revealedHints.length > 0 && !showSuccess && (
                    <div className="bg-yellow-900/50 rounded-lg p-2 flex items-center gap-2">
                      <Lightbulb className="text-yellow-400 flex-shrink-0" size={16} />
                      <p className="text-yellow-200 text-xs">
                        <span className="font-semibold">Hint:</span> {revealedHints.map((h, i) => {
                          const inst = INSTRUMENTS.find(inst => inst.id === h);
                          return (
                            <span key={h}>
                              {i > 0 && (i === revealedHints.length - 1 ? ' & ' : ', ')}
                              <span style={{ color: theme.colors[h] || inst?.color }}>{inst?.name}</span>
                            </span>
                          );
                        })} shown
                      </p>
                    </div>
                  )}

                  {/* Attempt Warning */}
                  {wrongAttempts >= 2 && wrongAttempts < 3 && revealedHints.length === 0 && !showSuccess && (
                    <div className="bg-orange-900/50 rounded-lg p-2 text-center">
                      <p className="text-orange-300 text-xs">
                        ⚠️ One more wrong = hint revealed
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Font import and animations with fluid scaling */}
      <style>{`
        @import url('${theme.font?.import || "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"}');

        /* Fluid scaling variables */
        :root {
          --fluid-scale: clamp(0.7, 0.5 + 0.4vw, 1);
        }

        .beat-escape-player {
          font-size: clamp(12px, 2.5vw, 16px);
        }

        .beat-escape-player .fluid-title {
          font-size: clamp(1rem, 4vw, 1.5rem);
        }

        .beat-escape-player .fluid-button {
          font-size: clamp(0.8rem, 2.5vw, 1.1rem);
          padding: clamp(0.4rem, 1.5vw, 0.75rem) clamp(0.8rem, 3vw, 1.5rem);
        }

        .beat-escape-player .fluid-label {
          font-size: clamp(0.6rem, 1.8vw, 0.75rem);
        }

        .beat-escape-player .fluid-badge {
          padding: clamp(0.25rem, 1vw, 0.4rem) clamp(0.5rem, 1.5vw, 0.75rem);
          font-size: clamp(0.65rem, 2vw, 0.875rem);
        }

        .beat-escape-player .fluid-progress {
          width: clamp(1.75rem, 5vw, 2.5rem);
          height: clamp(1.75rem, 5vw, 2.5rem);
          font-size: clamp(0.7rem, 2vw, 0.875rem);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .grid-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.4); }
          50% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.8); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BeatEscapeRoomPlayer;
