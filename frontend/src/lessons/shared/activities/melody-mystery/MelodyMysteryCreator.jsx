// File: /lessons/shared/activities/melody-mystery/MelodyMysteryCreator.jsx
// Creator screen for Melody Mystery
// Player creates 6 melodies for each location in the story

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, ChevronRight, ChevronLeft, MapPin, Music, Volume2 } from 'lucide-react';
import MelodyGrid from './MelodyGrid';
import {
  MELODY_NOTES,
  GRID_ROWS,
  GRID_COLS,
  createEmptyGrid,
  countActiveNotes,
  getContour,
  getMelodyAssignments,
  playGrid,
  initMelodySynth,
  disposeSynth
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getLocationBackground
} from './melodyMysteryConcepts';

const MelodyMysteryCreator = ({
  conceptId = 'vanishing-composer',
  ending,
  mode = 'solo',
  playerIndex = 0,
  existingMelodies = null,
  onComplete,
  onBack
}) => {
  const concept = getConcept(conceptId);
  const endingData = getEnding(conceptId, ending);
  const locations = endingData?.locations || [];

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  // Get which melody numbers this player is assigned (1-indexed, convert to 0-indexed)
  const myMelodyAssignments = getMelodyAssignments(mode, playerIndex).map(m => m - 1);

  const [currentLocation, setCurrentLocation] = useState(() => {
    // Start at first assigned location for this player
    return myMelodyAssignments[0] || 0;
  });
  const [grids, setGrids] = useState(() => {
    // Initialize with existing melodies if partner mode
    if (existingMelodies && existingMelodies.length > 0) {
      return locations.map((_, i) => {
        const existing = existingMelodies.find(m => m.locationId === locations[i].id);
        return existing?.grid || createEmptyGrid();
      });
    }
    return locations.map(() => createEmptyGrid());
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const playingRef = useRef(false);

  const location = locations[currentLocation];
  const currentGrid = grids[currentLocation];
  const canEditCurrentLocation = myMelodyAssignments.includes(currentLocation);

  // Get background image based on current location
  const backgroundImage = getLocationBackground(conceptId, currentLocation + 1);

  // Initialize audio on mount
  useEffect(() => {
    initMelodySynth();
    return () => disposeSynth();
  }, []);

  // Handle grid toggle from MelodyGrid component
  const handleGridToggle = (newGrid) => {
    if (!canEditCurrentLocation) return;

    setGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocation] = newGrid;
      return newGrids;
    });
  };

  // Play current melody
  const handlePlay = async () => {
    if (isPlaying) {
      playingRef.current = false;
      setIsPlaying(false);
      setCurrentBeat(-1);
      return;
    }

    setIsPlaying(true);
    playingRef.current = true;

    // Animate beats during playback
    const interval = (60 / 120) * 1000 / 2; // 8th notes at 120 BPM

    for (let col = 0; col < GRID_COLS; col++) {
      if (!playingRef.current) break;
      setCurrentBeat(col);
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // Play the actual audio
    await playGrid(currentGrid);

    setIsPlaying(false);
    setCurrentBeat(-1);
    playingRef.current = false;
  };

  // Clear current grid
  const clearGrid = () => {
    if (!canEditCurrentLocation) return;
    setGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocation] = createEmptyGrid();
      return newGrids;
    });
  };

  // Navigate locations
  const goToLocation = (index) => {
    setIsPlaying(false);
    setCurrentBeat(-1);
    playingRef.current = false;
    setCurrentLocation(index);
  };

  // Check if current melody is valid (3+ notes)
  const isCurrentValid = countActiveNotes(currentGrid) >= 3;

  // Check if all assigned melodies are complete (only check this player's locations)
  const myLocationsComplete = myMelodyAssignments.every(locIndex =>
    countActiveNotes(grids[locIndex]) >= 3
  );

  // Count progress for display
  const myCompletedCount = myMelodyAssignments.filter(locIndex =>
    countActiveNotes(grids[locIndex]) >= 3
  ).length;

  // Handle completion
  const handleComplete = () => {
    if (myLocationsComplete) {
      const melodies = locations.map((loc, i) => ({
        locationId: loc.id,
        locationName: loc.name,
        grid: grids[i],
        contour: getContour(grids[i])
      }));
      onComplete(melodies);
    }
  };

  // Find next incomplete location for this player
  const findNextIncomplete = () => {
    return myMelodyAssignments.find(locIndex =>
      countActiveNotes(grids[locIndex]) < 3
    );
  };

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
              <span>{endingData?.icon}</span>
              <span>{endingData?.name}</span>
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: concept.colors.accent }} />
              Location {currentLocation + 1}: {location?.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              {mode === 'partner' ? 'Your Progress' : mode === 'trio' ? 'Your Melodies' : 'Progress'}
            </p>
            <p className="text-white font-bold">
              {myCompletedCount} / {myMelodyAssignments.length}
            </p>
          </div>
        </div>

        {/* Location dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {locations.map((loc, i) => {
            const isMyLocation = myMelodyAssignments.includes(i);
            const isComplete = countActiveNotes(grids[i]) >= 3;
            return (
              <button
                key={i}
                onClick={() => goToLocation(i)}
                className={`w-3 h-3 rounded-full ${!isChromebook ? 'transition-all' : ''} ${
                  i === currentLocation
                    ? 'scale-125'
                    : ''
                }`}
                style={{
                  backgroundColor: i === currentLocation
                    ? concept.colors.primary
                    : isComplete
                      ? '#22c55e'
                      : isMyLocation
                        ? '#475569'
                        : '#334155',
                  opacity: !isMyLocation ? 0.5 : 1
                }}
                title={`${loc.name}${!isMyLocation ? ' (Partner)' : ''}`}
              />
            );
          })}
        </div>
      </div>

      {/* Clue Preview / Partner Lock Notice */}
      <div className="bg-black/30 px-6 py-3 border-b border-white/10">
        {canEditCurrentLocation ? (
          <p className="text-gray-300 text-sm text-center">
            When solved, this melody reveals:{' '}
            <span className="font-semibold" style={{ color: concept.colors.accent }}>
              "{location?.clue}"
            </span>
          </p>
        ) : (
          <p className="text-orange-400 text-sm text-center font-medium">
            This location is assigned to your partner. You can view but not edit.
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-2xl">
          <MelodyGrid
            grid={currentGrid}
            onToggle={handleGridToggle}
            mode="create"
            disabled={!canEditCurrentLocation}
            conceptId={conceptId}
            currentBeat={isPlaying ? currentBeat : null}
            size="normal"
          />
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-gray-400">
            Notes: {countActiveNotes(currentGrid)}/8
          </span>
          <span className="text-gray-600">|</span>
          {canEditCurrentLocation ? (
            <span className={isCurrentValid ? 'text-green-400' : 'text-yellow-400'}>
              {isCurrentValid ? 'Ready!' : 'Add 3+ notes'}
            </span>
          ) : (
            <span className="text-orange-400">
              Partner's location
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className="border-t border-white/20 px-6 py-4"
        style={{ backgroundColor: `${concept.colors.primary}20` }}
      >
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => goToLocation(Math.max(0, currentLocation - 1))}
            disabled={currentLocation === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${!isChromebook ? 'transition-all' : ''} ${
              currentLocation === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {/* Playback controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold ${!isChromebook ? 'transition-all' : ''}`}
              style={{
                backgroundColor: isPlaying ? '#dc2626' : concept.colors.primary
              }}
            >
              {isPlaying ? (
                <>
                  <Square className="w-5 h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={clearGrid}
              disabled={!canEditCurrentLocation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                canEditCurrentLocation
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              Clear
            </button>
          </div>

          {/* Next / Complete */}
          {!myLocationsComplete ? (
            <button
              onClick={() => {
                const nextIncomplete = findNextIncomplete();
                if (nextIncomplete !== undefined) {
                  goToLocation(nextIncomplete);
                } else if (currentLocation < locations.length - 1) {
                  goToLocation(currentLocation + 1);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white ${!isChromebook ? 'transition-all' : ''}`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white ${!isChromebook ? 'transition-all' : ''}`}
              style={{ backgroundColor: '#16a34a' }}
            >
              Create Mystery
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center mt-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MelodyMysteryCreator;
