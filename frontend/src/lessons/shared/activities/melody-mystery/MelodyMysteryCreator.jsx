// File: /lessons/shared/activities/melody-mystery/MelodyMysteryCreator.jsx
// Creator screen for Melody Mystery
// Player creates 6 melodies for each location in the story

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trash2, ChevronRight, ChevronLeft, MapPin, Music, Volume2 } from 'lucide-react';
import SimpleMelodyGrid, {
  createEmptySimpleGrid,
  countSimpleNotes,
  playSimpleGrid,
  disposeSimpleSynth,
  getSimpleContour,
  GRID_COLS
} from './SimpleMelodyGrid';
import {
  getMelodyAssignments,
  initMelodySynth
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getLocationBackground,
  getDeviceImage
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
        return existing?.grid || createEmptySimpleGrid();
      });
    }
    return locations.map(() => createEmptySimpleGrid());
  });
  // Track selected device for each location (default to first device)
  const [selectedDevices, setSelectedDevices] = useState(() => {
    // Initialize with existing melodies if available, or default to first device
    return locations.map((loc, i) => {
      if (existingMelodies && existingMelodies.length > 0) {
        const existing = existingMelodies.find(m => m.locationId === loc.id);
        if (existing?.selectedDevice) return existing.selectedDevice;
      }
      // Default to first selectable device
      return loc.selectableDevices?.[0] || null;
    });
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const playingRef = useRef(false);

  const location = locations[currentLocation];
  const currentGrid = grids[currentLocation];
  const canEditCurrentLocation = myMelodyAssignments.includes(currentLocation);
  const currentSelectedDevice = selectedDevices[currentLocation];
  const selectableDevices = location?.selectableDevices || [];

  // Get background image based on current location
  const backgroundImage = getLocationBackground(conceptId, currentLocation + 1);

  // Handle device selection
  const handleSelectDevice = (device) => {
    if (!canEditCurrentLocation) return;
    setSelectedDevices(prev => {
      const newDevices = [...prev];
      newDevices[currentLocation] = device;
      return newDevices;
    });
  };

  // Initialize audio on mount
  useEffect(() => {
    initMelodySynth();
    return () => disposeSimpleSynth();
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

  // Play current melody (synced audio + visual)
  const handlePlay = async () => {
    if (isPlaying) {
      playingRef.current = false;
      setIsPlaying(false);
      setCurrentBeat(-1);
      return;
    }

    setIsPlaying(true);
    playingRef.current = true;

    // Play with synced visual callback
    await playSimpleGrid(currentGrid, 120, (beat) => {
      if (playingRef.current) {
        setCurrentBeat(beat);
      }
    });

    setIsPlaying(false);
    setCurrentBeat(-1);
    playingRef.current = false;
  };

  // Clear current grid
  const clearGrid = () => {
    if (!canEditCurrentLocation) return;
    setGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocation] = createEmptySimpleGrid();
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
  const isCurrentValid = countSimpleNotes(currentGrid) >= 3;

  // Check if all assigned melodies are complete (only check this player's locations)
  const myLocationsComplete = myMelodyAssignments.every(locIndex =>
    countSimpleNotes(grids[locIndex]) >= 3
  );

  // Count progress for display
  const myCompletedCount = myMelodyAssignments.filter(locIndex =>
    countSimpleNotes(grids[locIndex]) >= 3
  ).length;

  // Handle completion
  const handleComplete = () => {
    if (myLocationsComplete) {
      const melodies = locations.map((loc, i) => ({
        locationId: loc.id,
        locationName: loc.name,
        grid: grids[i],
        contour: getSimpleContour(grids[i]),
        selectedDevice: selectedDevices[i] || loc.selectableDevices?.[0] || null
      }));
      onComplete(melodies);
    }
  };

  // Find next incomplete location for this player
  const findNextIncomplete = () => {
    return myMelodyAssignments.find(locIndex =>
      countSimpleNotes(grids[locIndex]) < 3
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
            const isComplete = countSimpleNotes(grids[i]) >= 3;
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

      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDE: Device Picker */}
        <div className="w-1/2 flex flex-col border-r border-white/10 bg-black/20">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-center text-white">
              Hide Signal In:
            </h2>
          </div>

          {/* Device Grid with Labels - Large tiles to fill space */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="grid grid-cols-3 gap-5 w-full max-w-lg">
              {selectableDevices.map((device) => {
                const deviceImagePath = getDeviceImage(conceptId, location.id, device.letter, device.id);
                return (
                  <div key={device.id} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleSelectDevice(device)}
                      disabled={!canEditCurrentLocation}
                      className={`w-full aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                        currentSelectedDevice?.id === device.id
                          ? 'border-amber-400 ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/30'
                          : 'border-slate-600 hover:border-slate-400'
                      } ${!canEditCurrentLocation ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <img
                        src={deviceImagePath}
                        alt={device.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <span className={`text-sm text-center font-medium ${
                      currentSelectedDevice?.id === device.id
                        ? 'text-amber-400'
                        : 'text-gray-400'
                    }`}>
                      {device.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Partner Lock Notice (if applicable) */}
          {!canEditCurrentLocation && (
            <div className="px-4 py-2 bg-orange-900/30 border-t border-orange-500/30">
              <p className="text-orange-400 text-xs text-center">
                This location is assigned to your partner.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Melody Puzzle */}
        <div className="w-1/2 flex flex-col bg-black/30">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-center text-white">
              Make Signal Melody
            </h2>
          </div>

          {/* Grid */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-sm">
              <SimpleMelodyGrid
                grid={currentGrid}
                onToggle={handleGridToggle}
                disabled={!canEditCurrentLocation}
                currentBeat={isPlaying ? currentBeat : -1}
              />
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-gray-400">
                Notes: {countSimpleNotes(currentGrid)}/4
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
