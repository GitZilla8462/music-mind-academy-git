// File: /lessons/shared/activities/melody-mystery/MelodyMysterySolver.jsx
// Point-and-click adventure game solver for Melody Mystery
// States: SCENE → DEVICE_FOUND → EXAMINE → SOLVING → CLUE_REVEALED → TYPE_LOCATION → (repeat or FINAL_ANSWER)

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Trash2,
  Headphones,
  CheckCircle,
  Star,
  Lightbulb,
  Search,
  MapPin,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import SimpleMelodyGrid, {
  createEmptySimpleGrid,
  countSimpleNotes,
  playSimpleGrid,
  disposeSimpleSynth,
  simpleGridsMatch,
  GRID_COLS,
  GRID_ROWS
} from './SimpleMelodyGrid';
import {
  initMelodySynth,
  sounds
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getSceneImage,
  getDeviceImage
} from './melodyMysteryConcepts';

// Game states
const STATES = {
  SCENE: 'scene',               // Exploring scene, clicking hotspots
  DEVICE_FOUND: 'device_found', // Device glows, click to examine
  EXAMINE: 'examine',           // Device close-up, play signal
  SOLVING: 'solving',           // Decoder with melody grid
  CLUE_REVEALED: 'clue_revealed', // Show decoded clue + score
  TYPE_LOCATION: 'type_location', // Type next destination
  FINAL_ANSWER: 'final_answer'    // Last location - solve mystery
};

// Validate location answer with flexible matching
const validateLocationAnswer = (input, location) => {
  const normalized = input.toLowerCase().trim();
  const answer = location.answer.toLowerCase();

  // Check exact match
  if (normalized === answer) return true;

  // Check accepted variations
  if (location.acceptedAnswers?.some(ans => normalized === ans.toLowerCase())) return true;

  // Check if contains the key word (for multi-word answers like "BUS STATION")
  const keyWords = answer.split(' ');
  const lastKeyWord = keyWords[keyWords.length - 1];
  if (keyWords.length > 1 && normalized.includes(lastKeyWord)) return true;

  return false;
};

// Validate final answer
const validateFinalAnswer = (input, ending) => {
  const normalized = input.toLowerCase().trim();
  const answer = ending.finalAnswer.toLowerCase();

  if (normalized === answer) return true;
  if (ending.acceptedFinalAnswers?.some(ans => normalized === ans.toLowerCase())) return true;

  return false;
};

const MelodyMysterySolver = ({ mysteryData, onComplete, onBack }) => {
  const conceptId = mysteryData?.concept || 'vanishing-composer';
  const concept = getConcept(conceptId);
  const ending = getEnding(conceptId, mysteryData?.ending);

  // Melodies can be an array (from creator) or object (from storage)
  // Normalize to array format
  const rawMelodies = mysteryData?.melodies;
  const melodies = Array.isArray(rawMelodies)
    ? rawMelodies
    : rawMelodies
      ? Object.values(rawMelodies)
      : [];

  const locations = ending?.locations || [];

  // Debug: log data on mount (only once)
  useEffect(() => {
    console.log('🎵 MelodyMysterySolver initialized:', {
      conceptId,
      endingId: mysteryData?.ending,
      hasEnding: !!ending,
      locationsCount: locations.length,
      melodiesCount: melodies.length,
      melodiesType: Array.isArray(rawMelodies) ? 'array' : typeof rawMelodies
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  // Game state
  const [gameState, setGameState] = useState(STATES.SCENE);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [playerGrids, setPlayerGrids] = useState(() =>
    locations.map(() => createEmptySimpleGrid())
  );
  const [solvedLocations, setSolvedLocations] = useState([]);
  const [listensRemaining, setListensRemaining] = useState(
    locations.map(() => 3)
  );
  const [hintsUsed, setHintsUsed] = useState(
    locations.map(() => 0)
  );
  const [wrongAttempts, setWrongAttempts] = useState(
    locations.map(() => 0)
  );
  const [revealedCols, setRevealedCols] = useState(
    locations.map(() => [])
  );
  const [locationScores, setLocationScores] = useState([]);
  const [inputError, setInputError] = useState(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingPlayer, setIsPlayingPlayer] = useState(false);
  const [hasPlayedSignal, setHasPlayedSignal] = useState(
    locations.map(() => false)
  );
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [typeInput, setTypeInput] = useState('');

  // Click feedback state
  const [clickMessage, setClickMessage] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Debug mode - show hotspot rectangles
  const [showHotspots, setShowHotspots] = useState(false);

  // Decoder display mode: 'puzzle' | 'decoded'
  const [decoderMode, setDecoderMode] = useState('puzzle');
  const [showDecodedInput, setShowDecodedInput] = useState(false);

  const playingRef = useRef(false);
  const sceneRef = useRef(null);
  const imageRef = useRef(null);

  const location = locations[currentLocationIndex];
  const targetMelody = melodies[currentLocationIndex];
  const playerGrid = playerGrids[currentLocationIndex];
  const isSolved = solvedLocations.includes(currentLocationIndex);
  const isLastLocation = currentLocationIndex === locations.length - 1;
  const currentScore = locationScores.find(s => s.location === currentLocationIndex)?.score;

  // Scene image using the new path structure
  const sceneImage = location ? getSceneImage(conceptId, location.id, location.nameSlug) : '';

  // Get the selected device ID from the melody data (or fall back to first selectable device)
  const selectedDeviceId = targetMelody?.selectedDevice?.id || targetMelody?.selectedDevice || location?.selectableDevices?.[0]?.id || null;

  // Find the full device object from selectableDevices
  const selectedDevice = location?.selectableDevices?.find(d => d.id === selectedDeviceId) || location?.selectableDevices?.[0] || null;

  // Get device image path
  const deviceImagePath = selectedDevice
    ? getDeviceImage(conceptId, location.id, selectedDevice.letter, selectedDevice.id)
    : '';

  // Generate device hotspot from the selected device
  const deviceHotspot = selectedDevice ? {
    id: 'device',
    x: selectedDevice.x,
    y: selectedDevice.y,
    w: selectedDevice.w,
    h: selectedDevice.h,
    isDevice: true
  } : null;

  // Initialize audio on mount
  useEffect(() => {
    initMelodySynth();
    return () => disposeSimpleSynth();
  }, []);

  // Handle grid toggle - only allow if signal has been played
  const handleGridToggle = (newGrid) => {
    if (gameState !== STATES.SOLVING) return;
    if (!hasPlayedSignal[currentLocationIndex]) return; // Must play signal first

    setPlayerGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocationIndex] = newGrid;
      return newGrids;
    });
  };

  // Play a grid with beat animation (uses device-specific sound)
  const playGridWithAnimation = async (grid, useDeviceSound = true) => {
    if (playingRef.current) return;
    playingRef.current = true;

    try {
      // Pass the device ID for unique sound per device
      const deviceId = useDeviceSound ? selectedDeviceId : null;

      await playSimpleGrid(grid, 120, (beat) => {
        if (playingRef.current) {
          setCurrentBeat(beat);
        }
      }, deviceId);
    } catch (error) {
      console.error('Error playing grid:', error);
    } finally {
      setCurrentBeat(-1);
      playingRef.current = false;
    }
  };

  // Play target melody
  const playTargetMelody = async () => {
    if (listensRemaining[currentLocationIndex] <= 0 || isPlayingTarget || playingRef.current) return;

    setListensRemaining(prev => {
      const newRemaining = [...prev];
      newRemaining[currentLocationIndex]--;
      return newRemaining;
    });

    // Mark signal as played for this location
    setHasPlayedSignal(prev => {
      const updated = [...prev];
      updated[currentLocationIndex] = true;
      return updated;
    });

    setIsPlayingTarget(true);
    try {
      await playGridWithAnimation(targetMelody.grid);
    } finally {
      setIsPlayingTarget(false);
    }
  };

  // Play player melody (uses same device sound for comparison)
  const playPlayerMelody = async () => {
    if (isPlayingPlayer || playingRef.current) return;
    setIsPlayingPlayer(true);
    try {
      await playGridWithAnimation(playerGrid, true);
    } finally {
      setIsPlayingPlayer(false);
    }
  };

  // Reveal hint - reveal one column
  const revealHint = () => {
    if (hintsUsed[currentLocationIndex] >= 2) return;

    const targetGrid = targetMelody.grid;
    const currentRevealed = revealedCols[currentLocationIndex] || [];

    let colToReveal = -1;
    for (let col = 0; col < GRID_COLS; col++) {
      if (!currentRevealed.includes(col)) {
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

      // Reveal the column in revealedCols
      setRevealedCols(prev => {
        const newRevealed = [...prev];
        newRevealed[currentLocationIndex] = [...(newRevealed[currentLocationIndex] || []), colToReveal];
        return newRevealed;
      });

      // Also update player grid to show the hint
      setPlayerGrids(prev => {
        const newGrids = [...prev];
        const newGrid = newGrids[currentLocationIndex].map(row => [...row]);
        for (let row = 0; row < GRID_ROWS; row++) {
          newGrid[row][colToReveal] = targetGrid[row][colToReveal];
        }
        newGrids[currentLocationIndex] = newGrid;
        return newGrids;
      });

      setHintsUsed(prev => {
        const newHints = [...prev];
        newHints[currentLocationIndex]++;
        return newHints;
      });
    }
  };

  // Clear grid
  const clearGrid = () => {
    playingRef.current = false;
    setIsPlayingPlayer(false);
    setIsPlayingTarget(false);
    setCurrentBeat(-1);
    setPlayerGrids(prev => {
      const newGrids = [...prev];
      newGrids[currentLocationIndex] = createEmptySimpleGrid();
      return newGrids;
    });
  };

  // Handle scene click - check hotspots
  // Convert screen coordinates to SVG viewBox coordinates (800x450)
  const handleSceneClick = (e) => {
    if (!sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();

    // Convert click position to SVG viewBox coordinates (800x450)
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 450;

    // Build hotspots list with DEVICES FIRST (higher priority)
    // Devices are checked before background hotspots so they always register clicks
    const allHotspots = [];

    // Add all selectable devices FIRST - they take priority
    location?.selectableDevices?.forEach(device => {
      allHotspots.push({
        id: device.id,
        x: device.x,
        y: device.y,
        w: device.w,
        h: device.h,
        isDevice: device.id === selectedDeviceId,
        isSelectableDevice: true,
        message: device.id === selectedDeviceId
          ? null
          : `A ${device.name.toLowerCase()}. Not the signal source...`
      });
    });

    // Add background hotspots AFTER devices (lower priority)
    (location?.hotspots || []).forEach(hotspot => {
      allHotspots.push(hotspot);
    });

    // Debug: log click position in SVG coordinates (800x450)
    console.log(`Click: (${x.toFixed(0)}, ${y.toFixed(0)}) px in 800x450`, {
      hotspots: allHotspots.map(h => `${h.id}: (${h.x},${h.y}) ${h.w}x${h.h}`)
    });

    // Check hotspots
    const clickedHotspot = allHotspots.find(h =>
      x >= h.x && x <= h.x + h.w &&
      y >= h.y && y <= h.y + h.h
    );

    // Set click position for message bubble (pixel values for positioning)
    setClickPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (!clickedHotspot) {
      // Keep message until next click (no auto-dismiss)
      setClickMessage("Nothing here...");
      return;
    }

    if (clickedHotspot.isDevice) {
      sounds.hint();
      setClickMessage(null);
      setGameState(STATES.DEVICE_FOUND);
    } else {
      // Keep message until next click (no auto-dismiss)
      setClickMessage(clickedHotspot.message);
    }
  };

  // Handle examine device - go directly to solving view
  const handleExamine = () => {
    sounds.click && sounds.click();
    setGameState(STATES.SOLVING);
  };

  // Handle decode attempt - require EXACT match like Beat Escape Room
  const handleDecode = () => {
    const targetGrid = targetMelody.grid;
    const hintsUsedCount = hintsUsed[currentLocationIndex];
    const currentWrongAttempts = wrongAttempts[currentLocationIndex];

    // Check for EXACT match only
    if (simpleGridsMatch(playerGrid, targetGrid)) {
      // Calculate percentage score: 100% - 15% per wrong attempt - 20% per hint
      let percentage = 100;
      percentage -= currentWrongAttempts * 15;
      percentage -= hintsUsedCount * 20;
      percentage = Math.max(25, percentage); // Minimum 25%

      // Convert percentage to points/stars
      const points = percentage;
      const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : 1;

      const finalScore = { points, stars, percentage };

      sounds.unlock();
      setSolvedLocations(prev => [...prev, currentLocationIndex]);
      setLocationScores(prev => [...prev, {
        location: currentLocationIndex,
        score: finalScore,
        wrongAttempts: currentWrongAttempts,
        hintsUsed: hintsUsedCount
      }]);
      // Switch decoder to show decoded message
      setDecoderMode('decoded');
    } else {
      // Wrong attempt
      sounds.wrongGuess();
      const newAttempts = currentWrongAttempts + 1;
      setWrongAttempts(prev => {
        const updated = [...prev];
        updated[currentLocationIndex] = newAttempts;
        return updated;
      });

      // Progressive hints: 4 wrong = beat 2, 8 wrong = beat 3
      // Beat 1 is always C (given), player must always answer beat 4
      const currentRevealed = revealedCols[currentLocationIndex] || [];

      // After 4 wrong attempts, reveal beat 2 (column 1)
      if (newAttempts >= 4 && !currentRevealed.includes(1)) {
        setInputError('SIGNAL MISMATCH - BEAT 2 REVEALED');
        setTimeout(() => {
          setInputError(null);
          // Reveal column 1 (beat 2)
          setRevealedCols(prev => {
            const newRevealed = [...prev];
            newRevealed[currentLocationIndex] = [...(newRevealed[currentLocationIndex] || []), 1];
            return newRevealed;
          });
          // Update player grid to show the correct answer for beat 2
          setPlayerGrids(prev => {
            const newGrids = [...prev];
            const newGrid = newGrids[currentLocationIndex].map(row => [...row]);
            for (let row = 0; row < GRID_ROWS; row++) {
              newGrid[row][1] = targetGrid[row][1];
            }
            newGrids[currentLocationIndex] = newGrid;
            return newGrids;
          });
          // Track hint usage for scoring
          setHintsUsed(prev => {
            const updated = [...prev];
            updated[currentLocationIndex] = (updated[currentLocationIndex] || 0) + 1;
            return updated;
          });
          sounds.hint();
        }, 1000);
      }
      // After 8 wrong attempts, reveal beat 3 (column 2)
      else if (newAttempts >= 8 && currentRevealed.includes(1) && !currentRevealed.includes(2)) {
        setInputError('SIGNAL MISMATCH - BEAT 3 REVEALED');
        setTimeout(() => {
          setInputError(null);
          // Reveal column 2 (beat 3)
          setRevealedCols(prev => {
            const newRevealed = [...prev];
            newRevealed[currentLocationIndex] = [...(newRevealed[currentLocationIndex] || []), 2];
            return newRevealed;
          });
          // Update player grid to show the correct answer for beat 3
          setPlayerGrids(prev => {
            const newGrids = [...prev];
            const newGrid = newGrids[currentLocationIndex].map(row => [...row]);
            for (let row = 0; row < GRID_ROWS; row++) {
              newGrid[row][2] = targetGrid[row][2];
            }
            newGrids[currentLocationIndex] = newGrid;
            return newGrids;
          });
          // Track hint usage for scoring
          setHintsUsed(prev => {
            const updated = [...prev];
            updated[currentLocationIndex] = (updated[currentLocationIndex] || 0) + 1;
            return updated;
          });
          sounds.hint();
        }, 1000);
      }
      // After 12 wrong attempts, reveal beat 4 (column 3)
      else if (newAttempts >= 12 && currentRevealed.includes(2) && !currentRevealed.includes(3)) {
        setInputError('SIGNAL MISMATCH - BEAT 4 REVEALED');
        setTimeout(() => {
          setInputError(null);
          // Reveal column 3 (beat 4)
          setRevealedCols(prev => {
            const newRevealed = [...prev];
            newRevealed[currentLocationIndex] = [...(newRevealed[currentLocationIndex] || []), 3];
            return newRevealed;
          });
          // Update player grid to show the correct answer for beat 4
          setPlayerGrids(prev => {
            const newGrids = [...prev];
            const newGrid = newGrids[currentLocationIndex].map(row => [...row]);
            for (let row = 0; row < GRID_ROWS; row++) {
              newGrid[row][3] = targetGrid[row][3];
            }
            newGrids[currentLocationIndex] = newGrid;
            return newGrids;
          });
          // Track hint usage for scoring
          setHintsUsed(prev => {
            const updated = [...prev];
            updated[currentLocationIndex] = (updated[currentLocationIndex] || 0) + 1;
            return updated;
          });
          sounds.hint();
        }, 1000);
      } else {
        setInputError('SIGNAL MISMATCH - TRY AGAIN');
        setTimeout(() => setInputError(null), 2000);
      }
    }
  };

  // Find next note column to reveal (leftmost unrevealed note)
  const findNextNoteToReveal = (targetGrid, revealedCols) => {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!revealedCols.includes(col)) {
        for (let row = 0; row < GRID_ROWS; row++) {
          if (targetGrid[row][col]) {
            return col;
          }
        }
      }
    }
    return -1;
  };

  // Handle continue after clue revealed - show input below decoded message
  const handleContinueAfterClue = () => {
    setShowDecodedInput(true);
    setTypeInput('');
    setInputError(null);
  };

  // Handle location input from decoder
  const handleDecoderSubmit = () => {
    // Check if this is the final answer
    if (isLastLocation) {
      if (validateFinalAnswer(typeInput, ending)) {
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
      } else {
        sounds.wrongGuess();
        setInputError('INVALID COORDINATES');
        setTimeout(() => setInputError(null), 3000);
      }
    } else {
      // Regular location answer
      if (validateLocationAnswer(typeInput, location)) {
        sounds.unlock();
        // Move to next location
        setCurrentLocationIndex(prev => prev + 1);
        setGameState(STATES.SCENE);
        setDecoderMode('puzzle');
        setShowDecodedInput(false);
        setTypeInput('');
        setInputError(null);
        setClickMessage(null);
        // Reset player grid for next location
        setPlayerGrids(prev => {
          const newGrids = [...prev];
          newGrids[currentLocationIndex + 1] = createEmptySimpleGrid();
          return newGrids;
        });
      } else {
        sounds.wrongGuess();
        setInputError('INVALID COORDINATES');
        setTimeout(() => setInputError(null), 3000);
      }
    }
  };

  const noteCount = countSimpleNotes(playerGrid);

  // ========================================
  // RENDER: Scene View (Point-and-Click) - Fullscreen Background
  // ========================================
  const renderScene = () => (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Fallback gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0c1929 0%, #1a1a2e 50%, #16213e 100%)'
        }}
      />

      {/* Scene container with SVG overlay for pixel-perfect hotspots */}
      <div
        ref={sceneRef}
        className="absolute inset-0"
      >
        {/* Background image */}
        <img
          ref={imageRef}
          src={sceneImage}
          alt={location?.name}
          className="absolute inset-0 w-full h-full object-fill select-none"
          draggable={false}
          onError={(e) => console.error('Failed to load scene image:', sceneImage)}
        />

        {/* SVG overlay - viewBox matches image dimensions (800x450) */}
        {/* Coordinates are in pixels, SVG scales them automatically */}
        <svg
          viewBox="0 0 800 450"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleSceneClick}
        >
          {/* Clickable device hotspots */}
          {location?.selectableDevices?.map((device) => (
            <rect
              key={`device-${device.id}`}
              x={device.x}
              y={device.y}
              width={device.w}
              height={device.h}
              fill={showHotspots
                ? (device.id === selectedDeviceId ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.3)')
                : 'transparent'
              }
              stroke={showHotspots ? (device.id === selectedDeviceId ? '#22c55e' : '#f59e0b') : 'none'}
              strokeWidth="3"
              className="cursor-pointer"
            />
          ))}

          {/* Background hotspots */}
          {location?.hotspots?.map((hotspot) => (
            <rect
              key={`hotspot-${hotspot.id}`}
              x={hotspot.x}
              y={hotspot.y}
              width={hotspot.w}
              height={hotspot.h}
              fill={showHotspots ? 'rgba(6, 182, 212, 0.2)' : 'transparent'}
              stroke={showHotspots ? '#06b6d4' : 'none'}
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Debug labels (outside SVG for text rendering) */}
        {showHotspots && location?.selectableDevices?.map((device) => (
          <div
            key={`label-${device.id}`}
            className="absolute pointer-events-none text-white text-xs font-bold bg-black/70 px-1 rounded"
            style={{
              left: `${(device.x + device.w / 2) / 8}%`,
              top: `${(device.y + device.h / 2) / 4.5}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {device.name}
          </div>
        ))}
      </div>

      {/* Click message bubble - styled like decoder terminal */}
      {clickMessage && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: Math.min(clickPosition.x + 15, window.innerWidth - 280),
            top: Math.max(clickPosition.y - 40, 120),
          }}
        >
          <div className="bg-black/95 border-2 border-amber-600/60 rounded-lg px-4 py-3 max-w-xs shadow-2xl"
               style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}>
            <div className="text-amber-500/60 text-[10px] font-mono tracking-[0.2em] mb-1">/// SCAN RESULT ///</div>
            <p className="text-amber-300 text-sm font-mono leading-relaxed">{clickMessage}</p>
          </div>
        </div>
      )}

      {/* Top overlay - Exit button and prompt left, Location info right */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-start justify-between">
            {/* Left side - Exit button and prompt */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white text-xs flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg font-mono tracking-wide w-fit"
              >
                <ChevronLeft className="w-3 h-3" />
                EXIT
              </button>

              {/* Search prompt - top left under exit */}
              <div className="bg-black/80 px-4 py-2 rounded-lg border border-amber-600/40 max-w-sm">
                <p className="text-amber-300 font-mono text-sm tracking-wide">{location?.scenePrompt}</p>
                <p className="text-amber-500/50 text-[10px] font-mono tracking-wider mt-1">CLICK TO INVESTIGATE</p>
              </div>
            </div>

            {/* Location info - top right */}
            <div className="text-right bg-black/60 px-4 py-2 rounded-lg">
              <p className="text-amber-400/80 text-xs font-mono">LOCATION {currentLocationIndex + 1}/{locations.length}</p>
              <p className="text-white font-bold font-mono">{location?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DEV: Skip panel for testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-50 bg-black/90 border border-yellow-500 rounded-lg p-2 flex gap-2 items-center">
          <span className="text-yellow-500 text-xs font-mono">DEV:</span>
          <button
            onClick={() => setShowHotspots(prev => !prev)}
            className={`px-2 py-1 rounded text-xs font-mono ${showHotspots ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            {showHotspots ? '👁 Hide' : '👁 Show'} Hotspots
          </button>
          <button
            onClick={() => setCurrentLocationIndex(prev => Math.max(0, prev - 1))}
            disabled={currentLocationIndex === 0}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs font-mono text-black"
          >
            ← Prev
          </button>
          <span className="text-yellow-400 text-xs font-mono">{currentLocationIndex + 1}/{locations.length}</span>
          <button
            onClick={() => setCurrentLocationIndex(prev => Math.min(locations.length - 1, prev + 1))}
            disabled={currentLocationIndex === locations.length - 1}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs font-mono text-black"
          >
            Next →
          </button>
          <button
            onClick={() => setGameState(STATES.DEVICE_FOUND)}
            className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-mono text-black"
          >
            Find Device
          </button>
        </div>
      )}
    </div>
  );

  // ========================================
  // RENDER: Device Found View (Glowing Effect) - Fullscreen
  // ========================================
  const renderDeviceFound = () => {
    // Use the dynamically generated deviceHotspot from selectedDevice
    return (
      <div className="h-full w-full relative overflow-hidden">
        {/* Fullscreen background image - object-fill to match hotspot coordinates */}
        <img
          src={sceneImage}
          alt={location?.name}
          className="absolute inset-0 w-full h-full object-fill select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Fallback gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, #0c1929 0%, #1a1a2e 50%, #16213e 100%)'
          }}
        />

        {/* Glowing overlay on device location - convert pixel coords to percentages */}
        {deviceHotspot && (
          <button
            className={`absolute rounded-lg cursor-pointer z-10 ${!isChromebook ? 'animate-pulse' : ''}`}
            style={{
              left: `${(deviceHotspot.x / 800) * 100}%`,
              top: `${(deviceHotspot.y / 450) * 100}%`,
              width: `${(deviceHotspot.w / 800) * 100}%`,
              height: `${(deviceHotspot.h / 450) * 100}%`,
              boxShadow: '0 0 40px #06b6d4, 0 0 80px rgba(6, 182, 212, 0.5), 0 0 120px rgba(6, 182, 212, 0.3)',
              border: '3px solid #06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
            }}
            onClick={handleExamine}
          />
        )}

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="px-6 py-4 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
              <MapPin className="w-5 h-5 text-cyan-400" />
              {location?.name}
            </h1>
          </div>
        </div>

        {/* Bottom prompt overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="px-6 py-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-center">
            <p className="text-cyan-300 font-semibold text-xl mb-4 drop-shadow-lg">You found something!</p>
            <button
              onClick={handleExamine}
              className={`px-8 py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 ${!isChromebook ? 'transition-all hover:scale-105' : ''}`}
              style={{
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Examine Device
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // RENDER: Combined Device + Decoder View
  // Decoder modes: 'puzzle' | 'decoded' | 'input'
  // ========================================
  const renderDeviceAndDecoder = () => {
    // Render decoder screen content based on mode
    const renderDecoderScreen = () => {
      if (decoderMode === 'decoded') {
        // Show decoded message with optional input below
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 font-mono">
            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                 style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)' }} />

            <div className="text-amber-400 text-xs tracking-[0.3em] mb-2">/// SIGNAL DECODED ///</div>
            <div className="w-full h-px bg-amber-600/50 mb-4" />

            <div className="text-amber-300 text-sm leading-relaxed uppercase tracking-wide">
              {/* Bold the answer keyword in the clue */}
              {location?.clue && location?.answer ? (
                (() => {
                  const clue = location.clue;
                  const answer = location.answer.toUpperCase();
                  const index = clue.toUpperCase().indexOf(answer);
                  if (index >= 0) {
                    return (
                      <>
                        {clue.substring(0, index)}
                        <span className="font-bold text-amber-100">{clue.substring(index, index + answer.length)}</span>
                        {clue.substring(index + answer.length)}
                      </>
                    );
                  }
                  return clue;
                })()
              ) : location?.clue}
            </div>

            <div className="w-full h-px bg-amber-600/50 mt-4 mb-3" />

            {!showDecodedInput ? (
              <button
                onClick={handleContinueAfterClue}
                className="text-amber-400 text-xs tracking-[0.2em] hover:text-amber-300 border border-amber-600/50 px-4 py-2 rounded hover:bg-amber-600/20 transition-colors"
              >
                [ CONTINUE ]
              </button>
            ) : (
              <div className="w-full space-y-2">
                <div className="text-amber-400 text-[10px] tracking-[0.3em]">
                  {isLastLocation ? '/// FINAL DESTINATION ///' : '/// TYPE THE LOCATION ///'}
                </div>

                <input
                  type="text"
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleDecoderSubmit()}
                  placeholder="TYPE LOCATION..."
                  className="w-full px-3 py-2 bg-black/50 border border-amber-600/50 rounded text-amber-300 text-center text-sm font-mono tracking-wider placeholder-amber-700/50 focus:outline-none focus:border-amber-400"
                  autoFocus
                />

                {inputError && (
                  <div className="text-red-400 text-[10px] tracking-wider">{inputError}</div>
                )}

                <button
                  onClick={handleDecoderSubmit}
                  disabled={!typeInput.trim()}
                  className={`text-xs tracking-[0.2em] border px-4 py-1.5 rounded transition-colors ${
                    typeInput.trim()
                      ? 'text-amber-400 border-amber-600/50 hover:text-amber-300 hover:bg-amber-600/20'
                      : 'text-amber-700 border-amber-800/50 cursor-not-allowed'
                  }`}
                >
                  [ TRANSMIT ]
                </button>
              </div>
            )}
          </div>
        );
      }

      // Default: puzzle mode - show melody grid
      const currentWrongAttempts = wrongAttempts[currentLocationIndex];
      const currentHintsUsed = hintsUsed[currentLocationIndex];
      const signalPlayed = hasPlayedSignal[currentLocationIndex];
      // Calculate current score percentage
      let currentPercentage = 100;
      currentPercentage -= currentWrongAttempts * 15;
      currentPercentage -= currentHintsUsed * 20;
      currentPercentage = Math.max(25, currentPercentage);

      return (
        <div className="h-full flex flex-col">
          {/* TOP: Attempts and Score - Beat Escape Room style */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-900/30">
            {/* Attempts - 4 circles that stay red once filled (don't reset) */}
            <div className="flex flex-col">
              <span className="text-amber-600/50 text-[10px] font-mono mb-1">ATTEMPTS</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => {
                  // Circles fill up to 4 and stay red - never reset
                  const fillCount = Math.min(currentWrongAttempts, 4);
                  return (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full transition-colors ${
                        fillCount >= i ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end">
              <span className="text-amber-600/50 text-[10px] font-mono mb-1">SCORE</span>
              <span className={`font-mono text-lg font-bold ${
                currentPercentage >= 80 ? 'text-green-400' :
                currentPercentage >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {currentPercentage}%
              </span>
            </div>
          </div>

          {/* MIDDLE: Grid */}
          <div className="flex-1 relative">
            {/* Overlay message if signal not played yet */}
            {!signalPlayed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded">
                <p className="text-amber-400 font-mono text-sm tracking-wide animate-pulse">
                  PLAY SIGNAL FIRST
                </p>
              </div>
            )}

            <SimpleMelodyGrid
              grid={playerGrid}
              onToggle={handleGridToggle}
              disabled={!signalPlayed}
              currentBeat={isPlayingTarget || isPlayingPlayer ? currentBeat : -1}
              revealedCols={revealedCols[currentLocationIndex] || []}
              targetGrid={targetMelody?.grid}
            />
            <p className="text-amber-600/70 mt-1 text-center text-xs font-mono">NOTES: {noteCount}/4</p>
          </div>

          {/* BOTTOM: Controls - Signal, My Melody, Back, Decode all in one row */}
          <div className="mt-2 pt-2 border-t border-amber-900/30">
            <div className="flex items-center justify-center gap-1.5">
              {/* Signal button with pulsing glow if not played yet */}
              <button
                onClick={playTargetMelody}
                disabled={listensRemaining[currentLocationIndex] <= 0 || isPlayingTarget || isPlayingPlayer}
                className={`flex items-center gap-1 px-2 py-1.5 rounded text-[9px] font-mono tracking-wide transition-all ${
                  listensRemaining[currentLocationIndex] > 0 && !isPlayingTarget && !isPlayingPlayer
                    ? 'bg-amber-600/30 border border-amber-500 text-amber-300 hover:bg-amber-600/50'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
                style={!signalPlayed && listensRemaining[currentLocationIndex] > 0 ? {
                  animation: 'signalPulse 1.5s ease-in-out infinite',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
                } : {}}
              >
                <Volume2 className="w-3 h-3" />
                {isPlayingTarget ? '...' : 'SIGNAL'}
              </button>

              {/* My Melody button */}
              <button
                onClick={playPlayerMelody}
                disabled={noteCount === 0 || isPlayingPlayer || !signalPlayed}
                className={`flex items-center gap-1 px-2 py-1.5 rounded text-[9px] font-mono tracking-wide transition-all ${
                  noteCount > 0 && !isPlayingPlayer && signalPlayed
                    ? 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3" />
                {isPlayingPlayer ? '...' : 'MINE'}
              </button>

              {/* Back button */}
              <button
                onClick={() => {
                  setGameState(STATES.SCENE);
                  setDecoderMode('puzzle');
                }}
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50 rounded text-[9px] font-mono tracking-wide"
              >
                <ChevronLeft className="w-3 h-3" />
                BACK
              </button>

              {/* Decode button */}
              <button
                onClick={handleDecode}
                disabled={noteCount < 3 || !signalPlayed}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-mono tracking-wide font-bold ${
                  noteCount >= 3 && signalPlayed
                    ? 'bg-amber-600/30 border border-amber-500 text-amber-300 hover:bg-amber-600/50'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                DECODE
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pulsing animation style */}
          <style>{`
            @keyframes signalPulse {
              0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
              50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.8); }
            }
          `}</style>
        </div>
      );
    };

    return (
      <div className="h-full flex flex-col text-white overflow-hidden bg-slate-950">
        {/* Noir-style gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, #0c1929 0%, #1a1a2e 50%, #16213e 100%)'
          }}
        />

        {/* Header - Compact */}
        <div className="px-4 py-2 border-b border-amber-900/30 bg-black/40">
          <div className="flex items-center justify-between">
            <div className="font-mono">
              <p className="text-xs text-amber-500/70 tracking-wider">{location?.name}</p>
              <h1 className="text-sm font-bold text-amber-400 tracking-wide">SIGNAL INTERCEPT</h1>
            </div>
            {decoderMode === 'puzzle' && (
              <div className="flex items-center gap-4">
                <span className="text-amber-500/70 text-xs font-mono">
                  LISTENS: <span className="text-amber-400">{listensRemaining[currentLocationIndex]}</span>
                </span>
                {/* Hints revealed indicator */}
                {hintsUsed[currentLocationIndex] > 0 && (
                  <span className="text-orange-400/70 text-xs font-mono flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    HINTS: {hintsUsed[currentLocationIndex]}/3
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main content - Device + Decoder side by side - Compact for Chromebook */}
        <div className="flex-1 flex items-center justify-center gap-4 p-3 overflow-hidden">

          {/* LEFT: Device image (pre-cropped) - same size as decoder */}
          <div className="flex-1 max-w-sm flex flex-col items-center">
            <div className="w-full rounded-xl overflow-hidden border-4 border-amber-500/50 shadow-2xl"
                 style={{
                   minHeight: '240px',
                   boxShadow: '0 0 60px rgba(245, 158, 11, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                 }}>
              {/* Pre-cropped device image */}
              {deviceImagePath ? (
                <img
                  src={deviceImagePath}
                  alt={selectedDevice?.name || 'Device'}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                  <div className="text-center">
                    <Volume2 className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                    <p className="text-amber-400 font-mono text-sm">{location?.deviceName}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-amber-500/60 text-xs mt-3 text-center font-mono tracking-wide">
              {selectedDevice?.name || location?.deviceName}
            </p>
          </div>

          {/* RIGHT: Decoder frame - matches device image size - Compact */}
          <div className="flex-1 max-w-sm flex flex-col items-center">
            <div className="decoder-frame bg-gradient-to-b from-stone-800 via-stone-900 to-black rounded-xl border-2 border-amber-800/60 shadow-2xl p-3 w-full"
                 style={{ boxShadow: '0 0 40px rgba(245, 158, 11, 0.1), inset 0 0 30px rgba(0,0,0,0.5)' }}>

              {/* Top bar with indicator light, label/error, and antenna */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div
                  className={`w-3 h-3 rounded-full ${!isChromebook ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: inputError ? '#ef4444' : decoderMode === 'puzzle' ? '#fbbf24' : '#22c55e',
                    boxShadow: `0 0 10px ${inputError ? '#ef4444' : decoderMode === 'puzzle' ? '#fbbf24' : '#22c55e'}`
                  }}
                />
                {inputError ? (
                  <span className="text-red-400 text-xs font-mono tracking-[0.15em] animate-pulse">{inputError}</span>
                ) : (
                  <span className="text-amber-600/60 text-xs font-mono tracking-[0.2em]">DECODER-7X</span>
                )}
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <div className="w-0.5 h-3 bg-amber-700 rounded-full" />
                </div>
              </div>

              {/* Screen bezel */}
              <div className="bg-black rounded-lg p-1.5 border border-amber-900/50">
                {/* CRT-style screen - compact for Chromebook 768px at 110% zoom */}
                <div className="bg-black rounded p-3 border border-amber-900/30 relative overflow-hidden"
                     style={{ boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.1)', minHeight: '240px' }}>
                  {renderDecoderScreen()}
                </div>
              </div>

              {/* Bottom knobs */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border border-stone-500" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border border-stone-500" />
                </div>
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-0.5 h-3 bg-stone-700 rounded-full" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border border-stone-500" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border border-stone-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // ========================================
  // RENDER: Clue Revealed View
  // ========================================
  const renderClueRevealed = () => (
    <div
      className="h-full flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: concept.colors.background }}
    >
      <div className="bg-slate-800/90 rounded-2xl p-8 max-w-lg w-full text-center border border-white/10">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-400 mb-4">Signal Decoded!</h2>

        {/* Score display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <Star
              key={i}
              className={`w-8 h-8 ${
                currentScore && i <= currentScore.stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-400 mb-2">+{currentScore?.points} points</p>

        {/* Clue */}
        <div
          className="bg-slate-700/80 rounded-xl p-6 my-6 border-l-4"
          style={{ borderColor: concept.colors.accent }}
        >
          <p className="text-xl font-semibold text-white">
            "{location?.clue && location?.answer ? (
              (() => {
                const clue = location.clue;
                const answer = location.answer.toUpperCase();
                const index = clue.toUpperCase().indexOf(answer);
                if (index >= 0) {
                  return (
                    <>
                      {clue.substring(0, index)}
                      <span className="font-bold text-yellow-300">{clue.substring(index, index + answer.length)}</span>
                      {clue.substring(index + answer.length)}
                    </>
                  );
                }
                return clue;
              })()
            ) : location?.clue}"
          </p>
        </div>

        <button
          onClick={handleContinueAfterClue}
          className={`w-full px-8 py-3 rounded-xl font-bold text-lg text-white ${!isChromebook ? 'transition-all hover:scale-105' : ''}`}
          style={{ backgroundColor: concept.colors.primary }}
        >
          {isLastLocation ? 'Solve the Mystery!' : 'Continue'}
          <ChevronRight className="w-5 h-5 inline ml-2" />
        </button>
      </div>
    </div>
  );

  // ========================================
  // RENDER: Type Location View
  // ========================================
  const renderTypeLocation = () => (
    <div
      className="h-full flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: concept.colors.background }}
    >
      <div className="bg-slate-800/90 rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: concept.colors.accent }} />
        <h2 className="text-2xl font-bold text-white mb-4">Where to next?</h2>

        {/* Show clue as reminder */}
        <div className="bg-slate-700/80 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400 mb-1">The clue said:</p>
          <p className="text-lg" style={{ color: concept.colors.accent }}>
            "{location?.clue && location?.answer ? (
              (() => {
                const clue = location.clue;
                const answer = location.answer.toUpperCase();
                const index = clue.toUpperCase().indexOf(answer);
                if (index >= 0) {
                  return (
                    <>
                      {clue.substring(0, index)}
                      <span className="font-bold text-yellow-300">{clue.substring(index, index + answer.length)}</span>
                      {clue.substring(index + answer.length)}
                    </>
                  );
                }
                return clue;
              })()
            ) : location?.clue}"
          </p>
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            type="text"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
            placeholder="Type the location name..."
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-center text-lg focus:outline-none focus:border-purple-500"
            autoFocus
          />
        </div>

        {inputError && (
          <p className="text-red-400 mb-4">{inputError}</p>
        )}

        <button
          onClick={handleTypeSubmit}
          disabled={!typeInput.trim()}
          className={`w-full px-6 py-3 rounded-xl font-bold text-lg text-white ${!isChromebook ? 'transition-all' : ''} ${
            typeInput.trim()
              ? 'hover:scale-105'
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{ backgroundColor: typeInput.trim() ? concept.colors.primary : '#475569' }}
        >
          Travel There
          <ChevronRight className="w-5 h-5 inline ml-2" />
        </button>
      </div>
    </div>
  );

  // ========================================
  // RENDER: Final Answer View
  // ========================================
  const renderFinalAnswer = () => (
    <div
      className="h-full flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: concept.colors.background }}
    >
      <div className="bg-slate-800/90 rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: `${concept.colors.primary}40` }}
        >
          <span className="text-4xl">{ending?.icon}</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          You've gathered all the clues!
        </h2>

        <p className="text-gray-300 mb-6">
          Based on everything you've discovered, where is the composer now?
        </p>

        {/* All clues recap */}
        <div className="bg-slate-700/60 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto text-left">
          {locations.map((loc, i) => (
            <p key={i} className="text-sm text-gray-400 mb-1">
              <span style={{ color: concept.colors.accent }}>{loc.name}:</span> {loc.clue}
            </p>
          ))}
        </div>

        {/* Final input */}
        <div className="mb-4">
          <input
            type="text"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
            placeholder="Type the final location..."
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-center text-lg focus:outline-none focus:border-purple-500"
            autoFocus
          />
        </div>

        {inputError && (
          <p className="text-red-400 mb-4">{inputError}</p>
        )}

        <button
          onClick={handleFinalSubmit}
          disabled={!typeInput.trim()}
          className={`w-full px-6 py-3 rounded-xl font-bold text-lg text-white ${!isChromebook ? 'transition-all' : ''} ${
            typeInput.trim()
              ? 'bg-green-600 hover:bg-green-500 hover:scale-105'
              : 'bg-slate-700 opacity-50 cursor-not-allowed'
          }`}
        >
          Solve the Mystery!
        </button>
      </div>
    </div>
  );

  // ========================================
  // Main render based on game state
  // ========================================

  // Error screen if missing required data
  if (!ending || locations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Mystery Not Ready</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          {!ending
            ? 'Could not load the mystery storyline. The data may be missing or corrupted.'
            : 'No locations found in this mystery.'}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Ending: {mysteryData?.ending || 'none'} | Melodies: {melodies.length}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (melodies.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
        <div className="text-6xl mb-4">🎵</div>
        <h1 className="text-2xl font-bold mb-2">No Melodies Created</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          This mystery doesn't have any melodies yet. Someone needs to create them first!
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  switch (gameState) {
    case STATES.SCENE:
      return renderScene();
    case STATES.DEVICE_FOUND:
      return renderDeviceFound();
    case STATES.EXAMINE:
    case STATES.SOLVING:
      return renderDeviceAndDecoder();
    default:
      return renderScene();
  }
};

export default MelodyMysterySolver;
