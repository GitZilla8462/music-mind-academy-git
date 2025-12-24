// BeatEscapeRoomCreator.jsx - CREATE mode
// Design beat puzzles for others to solve

import React, { useState, useCallback, useEffect } from 'react';
import { Play, ArrowRight, RotateCcw } from 'lucide-react';
import BeatGrid from './BeatGrid';
import {
  getLockAssignments,
  createEmptyPattern,
  validatePattern,
  countActiveNotes,
  playPattern,
  sounds,
  MODES
} from './beatEscapeRoomConfig';
import { THEMES, getRoomBackground, getThemeAssets } from './beatEscapeRoomThemes';

// Preload background images
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

const BeatEscapeRoomCreator = ({
  mode,
  themeId = 'space-station',
  playerIndex = 0,
  shareCode,
  onComplete,
  onBack
}) => {
  const modeConfig = MODES[mode];
  const myLocks = getLockAssignments(mode, playerIndex);
  const theme = THEMES[themeId] || THEMES['space-station'];

  const [currentLockIndex, setCurrentLockIndex] = useState(0);
  const [patterns, setPatterns] = useState({});
  const [currentPattern, setCurrentPattern] = useState(createEmptyPattern());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const currentLockNumber = myLocks[currentLockIndex];
  const isLastLock = currentLockIndex === myLocks.length - 1;
  const isValid = validatePattern(currentPattern, 3);
  const noteCount = countActiveNotes(currentPattern);

  const toggleCell = useCallback((instrumentId, beatIndex) => {
    setCurrentPattern(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((val, i) =>
        i === beatIndex ? !val : val
      )
    }));
    setShowValidation(false);
  }, []);

  const handlePreview = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await playPattern(currentPattern);
    setIsPlaying(false);
  };

  const handleClear = () => {
    setCurrentPattern(createEmptyPattern());
    setShowValidation(false);
  };

  const handleSaveLock = () => {
    if (!isValid) {
      setShowValidation(true);
      sounds.wrongGuess();
      return;
    }

    sounds.click();

    // Save this pattern
    const newPatterns = { ...patterns, [currentLockNumber]: { ...currentPattern } };
    setPatterns(newPatterns);

    if (!isLastLock) {
      // Move to next lock
      setCurrentLockIndex(prev => prev + 1);
      setCurrentPattern(createEmptyPattern());
      setShowValidation(false);
    } else {
      // All locks created - complete!
      sounds.unlock();
      onComplete(newPatterns);
    }
  };

  // Progress dots
  const renderProgress = () => (
    <div className="flex gap-3 justify-center mb-2">
      {myLocks.map((lockNum, idx) => (
        <div
          key={lockNum}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
            idx < currentLockIndex
              ? 'bg-green-600 border-green-400 text-white'
              : idx === currentLockIndex
                ? 'bg-cyan-600 border-cyan-400 text-white scale-110 ring-2 ring-cyan-300'
                : 'bg-gray-700 border-gray-500 text-gray-400'
          }`}
          style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif" }}
        >
          {idx < currentLockIndex ? '✓' : idx + 1}
        </div>
      ))}
    </div>
  );

  // Get background based on how many locks we've created
  const backgroundImage = getRoomBackground(themeId, currentLockNumber, myLocks.length);

  // Preload all backgrounds on mount
  useEffect(() => {
    const assets = getThemeAssets(themeId);
    preloadImage(assets.bgRoom1);
    preloadImage(assets.bgRoom2);
    preloadImage(assets.bgRoom3);
    preloadImage(assets.bgEscaped);
  }, [themeId]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.colors.background || '#0f172a',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />

      {/* Fixed top left: EXIT */}
      <div className="fixed top-4 left-4 z-20" style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", letterSpacing: '0.1em' }}>
        <button
          onClick={onBack}
          className="hover:text-white transition-colors bg-gray-900/90 rounded-lg border-2 px-4 py-2 text-lg font-bold"
          style={{ color: theme.colors.primary, borderColor: `${theme.colors.primary}99` }}
        >
          ← EXIT
        </button>
      </div>

      {/* Fixed top right: Room Code (partner/trio) or Mode (solo) */}
      <div
        className="fixed top-4 right-4 z-20 bg-gray-900/90 rounded-lg border-2 px-4 py-2 text-center"
        style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", borderColor: `${theme.colors.primary}99`, letterSpacing: '0.1em' }}
      >
        {shareCode && mode !== 'solo' ? (
          <>
            <div className="text-gray-400 text-sm">ROOM</div>
            <div className="text-2xl font-bold tracking-widest" style={{ color: theme.colors.primary }}>{shareCode}</div>
          </>
        ) : (
          <>
            <div className="text-gray-400 text-sm">MODE</div>
            <div className="text-xl font-bold" style={{ color: theme.colors.primary }}>{modeConfig?.label}</div>
          </>
        )}
      </div>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col overflow-auto">
        {/* Title at top center */}
        <div className="w-full pt-4 mb-2">
          <h1
            className="text-2xl font-bold text-white text-center"
            style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif", textShadow: `0 0 10px ${theme.colors.primary}80`, letterSpacing: '0.15em' }}
          >
            CREATE LOCK {currentLockIndex + 1} OF {myLocks.length}
          </h1>
          {renderProgress()}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pb-2">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-3 w-full max-w-lg border border-cyan-500/30">
            {/* Beat Grid */}
            <div className="flex justify-center mb-3">
              <BeatGrid
                pattern={currentPattern}
                onToggle={toggleCell}
                mode="create"
                showConstraints={true}
                size="large"
                themeId={themeId}
              />
            </div>

            {/* Note count */}
            <div className={`text-center mb-2 text-sm ${noteCount < 3 ? 'text-orange-400' : 'text-green-400'}`}>
              {noteCount} / 3 minimum sounds
              {noteCount < 3 && showValidation && (
                <span className="block text-red-400 text-xs mt-1">
                  Add at least 3 sounds!
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center mb-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 font-semibold transition-colors flex items-center gap-2"
              >
                <RotateCcw size={18} />
                Clear
              </button>

              <button
                onClick={handlePreview}
                disabled={isPlaying || noteCount === 0}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
              >
                <Play size={18} />
                {isPlaying ? 'Playing...' : 'Preview'}
              </button>

              <button
                onClick={handleSaveLock}
                disabled={!isValid}
                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isValid
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLastLock ? 'Finish' : 'Next'}
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Created locks indicator */}
            {Object.keys(patterns).length > 0 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {Object.entries(patterns).map(([lockNum, pattern]) => (
                  <div
                    key={lockNum}
                    className="bg-green-900/50 rounded px-2 py-1 text-xs text-green-300 flex items-center gap-1"
                  >
                    <span>✓</span>
                    <span>Lock {lockNum}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Font import */}
      <style>{`
        @import url('${theme.font?.import || "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"}');
      `}</style>
    </div>
  );
};

export default BeatEscapeRoomCreator;
