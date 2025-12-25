// File: /lessons/shared/activities/melody-mystery/MelodyMysterySolver.jsx
// Solver screen for Melody Mystery
// Player listens to melodies and recreates them to decode clues

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, Headphones, CheckCircle, MapPin, Volume2, Star, Lightbulb } from 'lucide-react';
import MelodyGrid from './MelodyGrid';
import {
  MELODY_NOTES,
  GRID_ROWS,
  GRID_COLS,
  createEmptyGrid,
  gridsMatch,
  countActiveNotes,
  getContour,
  compareContours,
  calculateScore,
  playGrid,
  initMelodySynth,
  disposeSynth,
  sounds
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getLocationBackground
} from './melodyMysteryConcepts';

const MelodyMysterySolver = ({ mysteryData, onComplete, onBack }) => {
  const conceptId = mysteryData?.concept || 'vanishing-composer';
  const concept = getConcept(conceptId);
  const ending = getEnding(conceptId, mysteryData?.ending);
  const melodies = mysteryData?.melodies || [];
  const locations = ending?.locations || [];

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  const [currentLocation, setCurrentLocation] = useState(0);
  const [playerGrids, setPlayerGrids] = useState(() =>
    locations.map(() => createEmptyGrid())
  );
  const [solvedLocations, setSolvedLocations] = useState([]);
  const [listensRemaining, setListensRemaining] = useState(
    locations.map(() => 3)
  );
  const [hintsUsed, setHintsUsed] = useState(
    locations.map(() => 0)
  );
  const [revealedCols, setRevealedCols] = useState(
    locations.map(() => [])
  );
  const [showClue, setShowClue] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingPlayer, setIsPlayingPlayer] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [locationScores, setLocationScores] = useState([]);

  const playingRef = useRef(false);

  const location = locations[currentLocation];
  const targetMelody = melodies[currentLocation];
  const playerGrid = playerGrids[currentLocation];
  const isSolved = solvedLocations.includes(currentLocation);
  const currentRevealedCols = revealedCols[currentLocation] || [];

  // Get background image based on current location
  const backgroundImage = getLocationBackground(conceptId, currentLocation + 1);

  // Initialize audio on mount
  useEffect(() => {
    initMelodySynth();
    return () => disposeSynth();
  }, []);

  // Handle grid toggle from MelodyGrid component
  const handleGridToggle = (newGrid) => {
    if (isSolved) return;

    setPlayerGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocation] = newGrid;
      return newGrids;
    });
  };

  // Play a grid with beat animation
  const playGridWithAnimation = async (grid) => {
    if (playingRef.current) return;
    playingRef.current = true;

    const interval = (60 / 120) * 1000 / 2; // 8th notes at 120 BPM

    // Start visual animation first
    for (let col = 0; col < GRID_COLS; col++) {
      if (!playingRef.current) break;
      setCurrentBeat(col);
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // Play actual audio
    await playGrid(grid);

    setCurrentBeat(-1);
    playingRef.current = false;
  };

  // Play target melody
  const playTargetMelody = async () => {
    if (listensRemaining[currentLocation] <= 0 || isPlayingTarget) return;

    setListensRemaining(prev => {
      const newRemaining = [...prev];
      newRemaining[currentLocation]--;
      return newRemaining;
    });

    setIsPlayingTarget(true);
    await playGridWithAnimation(targetMelody.grid);
    setIsPlayingTarget(false);
  };

  // Play player melody
  const playPlayerMelody = async () => {
    if (isPlayingPlayer) return;
    setIsPlayingPlayer(true);
    await playGridWithAnimation(playerGrid);
    setIsPlayingPlayer(false);
  };

  // Use hint - reveal one column
  const useHint = () => {
    if (hintsUsed[currentLocation] >= 2) return; // Max 2 hints per location

    // Find a column that isn't revealed and has a note in target
    const targetGrid = targetMelody.grid;
    const currentRevealed = revealedCols[currentLocation] || [];

    let colToReveal = -1;
    for (let col = 0; col < GRID_COLS; col++) {
      if (!currentRevealed.includes(col)) {
        // Check if this column has a note in target
        for (let row = 0; row < GRID_ROWS; row++) {
          if (targetGrid[row][col]) {
            colToReveal = col;
            break;
          }
        }
        if (colToReveal >= 0) break;
      }
    }

    if (colToReveal >= 0) {
      sounds.hint();
      setRevealedCols(prev => {
        const newRevealed = [...prev];
        newRevealed[currentLocation] = [...(newRevealed[currentLocation] || []), colToReveal];
        return newRevealed;
      });
      setHintsUsed(prev => {
        const newHints = [...prev];
        newHints[currentLocation]++;
        return newHints;
      });
    }
  };

  // Clear grid
  const clearGrid = () => {
    if (isSolved) return;
    playingRef.current = false;
    setIsPlayingPlayer(false);
    setIsPlayingTarget(false);
    setCurrentBeat(-1);
    setPlayerGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocation] = createEmptyGrid();
      return newGrids;
    });
  };

  // Decode (check answer)
  const handleDecode = () => {
    const targetGrid = targetMelody.grid;
    const score = calculateScore(playerGrid, targetGrid);
    const listensUsed = 3 - listensRemaining[currentLocation];
    const hintsUsedCount = hintsUsed[currentLocation];

    // Adjust score based on hints and listens
    let adjustedPoints = score.points;
    if (hintsUsedCount > 0) adjustedPoints = Math.max(25, adjustedPoints - (hintsUsedCount * 10));
    if (listensUsed > 1) adjustedPoints = Math.max(25, adjustedPoints - ((listensUsed - 1) * 5));

    const finalScore = { ...score, points: adjustedPoints };

    // Need at least 50 points or 50% contour match to pass
    if (finalScore.points >= 50 || gridsMatch(playerGrid, targetGrid)) {
      sounds.unlock();
      setSolvedLocations(prev => [...prev, currentLocation]);
      setLocationScores(prev => [...prev, {
        location: currentLocation,
        score: finalScore,
        listensUsed,
        hintsUsed: hintsUsedCount
      }]);
      setShowClue(true);
    } else {
      sounds.wrongGuess();
      setInputError('Not quite! Listen again and try to match the melody contour.');
      setTimeout(() => setInputError(null), 3000);
    }
  };

  // Continue to next location
  const handleContinue = () => {
    if (currentLocation < locations.length - 1) {
      setShowClue(false);
      setCurrentLocation(currentLocation + 1);
    } else {
      // Final location - complete the mystery!
      sounds.escape();
      const totalScore = locationScores.reduce((sum, s) => sum + s.score.points, 0);
      const totalStars = locationScores.reduce((sum, s) => sum + s.score.stars, 0);
      onComplete({
        solvedLocations,
        locationScores,
        totalScore,
        totalStars,
        maxStars: locations.length * 3,
        ending: mysteryData.ending,
        finalAnswer: ending?.finalAnswer
      });
    }
  };

  const noteCount = countActiveNotes(playerGrid);
  const currentScore = locationScores[locationScores.length - 1]?.score;

  return (
    <div
      className="h-screen flex flex-col text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 27, 75, 0.9), rgba(30, 27, 75, 0.95)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Header */}
      <div
        className="border-b border-white/20 px-6 py-4"
        style={{ backgroundColor: `${concept.colors.primary}20` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm mb-1" style={{ color: concept.colors.accent }}>
              <span>{ending?.icon}</span>
              <span>{concept.name}</span>
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: concept.colors.accent }} />
              Location {currentLocation + 1}: {location?.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Solved</p>
            <p className="text-white font-bold">
              {solvedLocations.length} / {locations.length}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {locations.map((loc, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === currentLocation
                  ? 'scale-125'
                  : ''
              }`}
              style={{
                backgroundColor: i === currentLocation
                  ? concept.colors.primary
                  : solvedLocations.includes(i)
                    ? '#22c55e'
                    : '#475569'
              }}
              title={loc.name}
            />
          ))}
        </div>
      </div>

      {/* Clue Revealed Screen */}
      {showClue ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-slate-800/90 rounded-2xl p-8 max-w-lg w-full text-center border border-white/10">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-4">Clue Unlocked!</h2>

            <div className="bg-slate-700/80 rounded-xl p-6 mb-6">
              <p className="text-xl font-semibold" style={{ color: concept.colors.accent }}>
                "{location?.clue}"
              </p>
            </div>

            {/* Score display */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      currentScore && i <= currentScore.stars
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-white font-bold">+{currentScore?.points} pts</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">{currentScore?.message}</span>
            </div>

            <button
              onClick={handleContinue}
              className={`px-8 py-3 rounded-xl font-bold text-lg ${!isChromebook ? 'transition-all' : ''}`}
              style={{ backgroundColor: concept.colors.primary }}
            >
              {currentLocation < locations.length - 1 ? 'Next Location' : 'Solve Mystery!'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Listen Section */}
          <div className="bg-black/30 px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={playTargetMelody}
                disabled={listensRemaining[currentLocation] <= 0 || isPlayingTarget}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${!isChromebook ? 'transition-all' : ''} ${
                  listensRemaining[currentLocation] > 0 && !isPlayingTarget
                    ? 'text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: listensRemaining[currentLocation] > 0 && !isPlayingTarget
                    ? concept.colors.accent
                    : undefined
                }}
              >
                <Headphones className="w-5 h-5" />
                {isPlayingTarget ? 'Playing...' : 'Listen to Signal'}
              </button>
              <span className="text-gray-400 text-sm">
                Listens: {listensRemaining[currentLocation]}
              </span>
              <span className="text-gray-600">|</span>
              <button
                onClick={useHint}
                disabled={hintsUsed[currentLocation] >= 2}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                  hintsUsed[currentLocation] < 2
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Hint ({2 - hintsUsed[currentLocation]} left)
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            <p className="text-gray-400 mb-4">Recreate the melody to decode the clue:</p>

            <div className="w-full max-w-2xl">
              <MelodyGrid
                grid={playerGrid}
                onToggle={handleGridToggle}
                mode="play"
                disabled={isSolved}
                conceptId={conceptId}
                currentBeat={isPlayingTarget || isPlayingPlayer ? currentBeat : null}
                revealedCols={currentRevealedCols}
                targetGrid={targetMelody?.grid}
                size="normal"
              />
            </div>

            {/* Error message */}
            {inputError && (
              <p className="text-red-400 mt-4 text-center">{inputError}</p>
            )}

            {/* Note count */}
            <p className="text-gray-400 mt-4">Notes: {noteCount}/8</p>
          </div>

          {/* Controls */}
          <div
            className="border-t border-white/20 px-6 py-4"
            style={{ backgroundColor: `${concept.colors.primary}20` }}
          >
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={playPlayerMelody}
                disabled={noteCount === 0 || isPlayingPlayer}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg ${!isChromebook ? 'transition-all' : ''} ${
                  noteCount > 0 && !isPlayingPlayer
                    ? ''
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: noteCount > 0 && !isPlayingPlayer ? concept.colors.primary : undefined
                }}
              >
                <Volume2 className="w-5 h-5" />
                {isPlayingPlayer ? 'Playing...' : 'Play Mine'}
              </button>

              <button
                onClick={clearGrid}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>

              <button
                onClick={handleDecode}
                disabled={noteCount < 3}
                className={`flex items-center gap-2 px-8 py-2 rounded-lg font-bold ${!isChromebook ? 'transition-all' : ''} ${
                  noteCount >= 3
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Decode Signal
              </button>
            </div>

            <div className="text-center mt-3">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-300 text-sm"
              >
                Exit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MelodyMysterySolver;
