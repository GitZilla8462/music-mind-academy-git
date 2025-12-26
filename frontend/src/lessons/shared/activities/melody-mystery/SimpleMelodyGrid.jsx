// SimpleMelodyGrid.jsx - 3x4 melody grid with Beat Maker styling
// 3 rows (C, D, E) x 4 columns
// Column 1: C only, Columns 2-4: C, D, E
// Matches Beat Maker Escape Room tile styling exactly

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// Note configuration - C is bottom, E is top (like piano)
const NOTES = [
  { id: 'E4', name: 'E', color: '#10B981', row: 0 },  // Green - top
  { id: 'D4', name: 'D', color: '#F59E0B', row: 1 },  // Orange - middle
  { id: 'C4', name: 'C', color: '#EF4444', row: 2 },  // Red - bottom
];

const GRID_ROWS = 3;
const GRID_COLS = 4;

// Column constraints: which rows are available per column
// Column 0: only C (row 2), Columns 1-3: all notes (rows 0, 1, 2)
const COLUMN_CONSTRAINTS = {
  0: [2],        // Only C
  1: [0, 1, 2],  // E, D, C
  2: [0, 1, 2],  // E, D, C
  3: [0, 1, 2],  // E, D, C
};

// Create empty grid
export const createEmptySimpleGrid = () => {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
};

// Toggle cell with one-note-per-column constraint
export const toggleSimpleCell = (grid, row, col) => {
  const newGrid = grid.map(r => [...r]);

  // Check if this row is allowed in this column
  if (!COLUMN_CONSTRAINTS[col]?.includes(row)) {
    return grid; // Not allowed, return unchanged
  }

  // If clicking on an already-active cell, just turn it off
  if (newGrid[row][col]) {
    newGrid[row][col] = false;
    return newGrid;
  }

  // Clear entire column first, then activate clicked cell
  for (let r = 0; r < GRID_ROWS; r++) {
    newGrid[r][col] = false;
  }
  newGrid[row][col] = true;

  return newGrid;
};

// Count active notes
export const countSimpleNotes = (grid) => {
  let count = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col]) count++;
    }
  }
  return count;
};

// Get contour (melodic shape) as array of row indices per column
export const getSimpleContour = (grid) => {
  const contour = [];
  for (let col = 0; col < GRID_COLS; col++) {
    let foundRow = -1;
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        foundRow = row;
        break;
      }
    }
    contour.push(foundRow);
  }
  return contour;
};

// Check if grids match exactly
export const simpleGridsMatch = (grid1, grid2) => {
  if (!grid1 || !grid2) return false;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid1[row][col] !== grid2[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Compare contours - returns percentage match
export const compareSimpleContours = (grid1, grid2) => {
  const contour1 = getSimpleContour(grid1);
  const contour2 = getSimpleContour(grid2);

  let matches = 0;
  let total = 0;

  for (let col = 0; col < GRID_COLS; col++) {
    if (contour1[col] !== -1 && contour2[col] !== -1) {
      total++;
      if (contour1[col] === contour2[col]) {
        matches++;
      }
    } else if (contour1[col] !== -1 || contour2[col] !== -1) {
      total++;
    }
  }

  return total > 0 ? (matches / total) * 100 : 0;
};

// Calculate score with partial credit
export const calculateSimpleScore = (userGrid, targetGrid) => {
  if (simpleGridsMatch(userGrid, targetGrid)) {
    return { points: 100, stars: 3, message: 'Perfect!' };
  }

  const contourMatch = compareSimpleContours(userGrid, targetGrid);

  if (contourMatch >= 80) {
    return { points: 75, stars: 2, message: 'Great contour!' };
  } else if (contourMatch >= 50) {
    return { points: 50, stars: 1, message: 'Getting there!' };
  } else {
    return { points: 25, stars: 0, message: 'Keep trying!' };
  }
};

// Audio synth singleton
let synth = null;
let audioInitialized = false;

const initAudio = async () => {
  if (audioInitialized) return;

  await Tone.start();
  synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
  }).toDestination();

  audioInitialized = true;
};

const playNote = async (noteId) => {
  if (!audioInitialized) await initAudio();
  synth?.triggerAttackRelease(noteId, '8n');
};

// Play entire grid
export const playSimpleGrid = async (grid, bpm = 120, onBeatChange) => {
  if (!audioInitialized) await initAudio();

  const interval = (60 / bpm) * 1000 / 2; // 8th notes

  for (let col = 0; col < GRID_COLS; col++) {
    if (onBeatChange) onBeatChange(col);

    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        synth?.triggerAttackRelease(NOTES[row].id, '8n');
        break; // One note per column
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (onBeatChange) onBeatChange(-1);
};

// Cleanup synth
export const disposeSimpleSynth = () => {
  try {
    synth?.dispose();
  } catch (e) { /* ignore */ }
  synth = null;
  audioInitialized = false;
};

const SimpleMelodyGrid = ({
  grid,
  onToggle,
  disabled = false,
  currentBeat = -1,  // For playback animation
  showLabels = true,
  className = '',
}) => {
  const [triggeredCells, setTriggeredCells] = useState({});

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  // Handle cell click
  const handleCellClick = async (row, col) => {
    if (disabled) return;

    // Check if allowed
    if (!COLUMN_CONSTRAINTS[col]?.includes(row)) return;

    // Play note
    await playNote(NOTES[row].id);

    // Toggle cell
    if (onToggle) {
      const newGrid = toggleSimpleCell(grid, row, col);
      onToggle(newGrid);
    }
  };

  // Trigger animation when currentBeat changes
  useEffect(() => {
    if (currentBeat >= 0 && currentBeat < GRID_COLS) {
      // Find which cell is active in this column
      for (let row = 0; row < GRID_ROWS; row++) {
        if (grid[row][currentBeat]) {
          setTriggeredCells({ [`${row}-${currentBeat}`]: true });
          setTimeout(() => setTriggeredCells({}), 80);
          break;
        }
      }
    }
  }, [currentBeat, grid]);

  const renderCell = (row, col) => {
    const note = NOTES[row];
    const isActive = grid[row][col];
    const isCurrentBeat = currentBeat === col;
    const isTriggered = triggeredCells[`${row}-${col}`];
    const isAllowed = COLUMN_CONSTRAINTS[col]?.includes(row);

    // If not allowed in this column, render empty/hidden cell
    if (!isAllowed) {
      return (
        <div
          key={`${row}-${col}`}
          className="flex-1 aspect-square"
          style={{ visibility: 'hidden' }}
        />
      );
    }

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={disabled}
        className={`
          flex-1 aspect-square rounded-lg relative flex items-center justify-center
          ${!isChromebook ? 'transition-all duration-75' : ''}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isCurrentBeat ? 'ring-2 ring-white' : ''}
        `}
        style={{
          backgroundColor: isActive ? note.color : '#475569',
          boxShadow: isActive && isTriggered
            ? `0 0 20px ${note.color}, 0 0 40px ${note.color}`
            : isActive
              ? `0 0 8px ${note.color}40`
              : 'none',
          transform: isActive && isTriggered ? 'scale(1.1)' : 'scale(1)',
          minHeight: '48px',
          minWidth: '48px',
          opacity: disabled && !isActive ? 0.5 : 1,
        }}
      >
        {/* White dot indicator when active - matches Beat Maker */}
        {isActive && (
          <div
            className="w-2.5 h-2.5 rounded-full bg-white"
            style={{ opacity: isTriggered ? 1 : 0.7 }}
          />
        )}
      </button>
    );
  };

  return (
    <div className={`simple-melody-grid ${className}`}>
      {/* Beat column labels */}
      {showLabels && (
        <div className="flex items-center gap-1 mb-2">
          <div className="w-10" /> {/* Spacer for note labels */}
          {Array.from({ length: GRID_COLS }, (_, col) => (
            <div
              key={col}
              className={`flex-1 text-center text-sm font-bold ${
                currentBeat === col
                  ? 'text-white scale-110'
                  : col === 0
                    ? 'text-green-400'
                    : 'text-gray-400'
              }`}
              style={{
                minWidth: '48px',
                transition: !isChromebook ? 'all 150ms' : 'none',
              }}
            >
              {col + 1}
            </div>
          ))}
        </div>
      )}

      {/* Grid rows */}
      <div className="space-y-1">
        {NOTES.map((note, row) => (
          <div key={note.id} className="flex items-center gap-1">
            {/* Note label */}
            {showLabels && (
              <div
                className="w-10 text-right pr-2 font-bold text-sm"
                style={{ color: note.color }}
              >
                {note.name}
              </div>
            )}

            {/* Beat cells */}
            <div className="flex gap-1 flex-1">
              {Array.from({ length: GRID_COLS }, (_, col) => renderCell(row, col))}
            </div>
          </div>
        ))}
      </div>

      {/* Playback indicator bar */}
      <div className="flex items-center gap-1 mt-3">
        {showLabels && <div className="w-10" />}
        <div className="flex gap-1 flex-1">
          {Array.from({ length: GRID_COLS }, (_, col) => (
            <div
              key={col}
              className="flex-1 h-1.5 rounded-full"
              style={{
                backgroundColor: currentBeat === col ? '#ffffff' : '#334155',
                boxShadow: currentBeat === col ? '0 0 8px #ffffff' : 'none',
                minWidth: '48px',
                transition: !isChromebook ? 'all 150ms' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Column 1 instruction */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>Beat 1 starts on C • Beats 2-4 can be C, D, or E</p>
      </div>
    </div>
  );
};

export default SimpleMelodyGrid;
export { NOTES, GRID_ROWS, GRID_COLS, COLUMN_CONSTRAINTS };
