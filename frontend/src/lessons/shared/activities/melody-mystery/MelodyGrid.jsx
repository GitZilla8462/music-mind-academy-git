// MelodyGrid.jsx - Reusable 5x8 melody grid component
// 5 rows (pitches A, G, E, D, C) x 8 columns (beats)
// CRITICAL: Only ONE note allowed per column

import React from 'react';
import {
  MELODY_NOTES,
  GRID_ROWS,
  GRID_COLS,
  toggleCellWithConstraint,
  playNote,
  getContour
} from './melodyMysteryConfig';
import { getConcept } from './melodyMysteryConcepts';

const MelodyGrid = ({
  grid,
  onToggle,
  mode = 'create',           // 'create' | 'play'
  showContour = false,       // Draw line connecting notes
  revealedCols = [],         // For hints in play mode (array of column indices)
  targetGrid = null,         // For showing correct answer in hints
  disabled = false,
  className = '',
  size = 'normal',           // 'normal' | 'large' | 'compact'
  conceptId = 'vanishing-composer',
  currentBeat = null,        // For playback animation (column index)
}) => {
  const concept = getConcept(conceptId);

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  const handleCellClick = async (row, col) => {
    if (disabled) return;

    // Check if this column is revealed (hint) - can't change revealed columns
    if (revealedCols.includes(col)) return;

    // Play the note sound
    await playNote(MELODY_NOTES[row].id);

    // Toggle the cell (with one-note-per-column constraint)
    if (onToggle) {
      const newGrid = toggleCellWithConstraint(grid, row, col);
      onToggle(newGrid);
    }
  };

  // Get cell sizes based on size prop
  const getCellSize = () => {
    switch (size) {
      case 'large': return 'w-12 h-12 md:w-14 md:h-14';
      case 'compact': return 'w-8 h-8';
      default: return 'w-10 h-10 md:w-12 md:h-12';
    }
  };

  // Get label width based on size
  const getLabelWidth = () => {
    switch (size) {
      case 'large': return 'w-12';
      case 'compact': return 'w-8';
      default: return 'w-10';
    }
  };

  const cellSize = getCellSize();
  const labelWidth = getLabelWidth();

  // Calculate contour path for SVG overlay
  const renderContourLine = () => {
    if (!showContour) return null;

    const contour = getContour(grid);
    const points = [];

    contour.forEach((row, col) => {
      if (row !== -1) {
        // Calculate center of cell (approximate)
        const x = col * 52 + 26; // Assuming ~52px per cell with gap
        const y = row * 52 + 26;
        points.push({ x, y });
      }
    });

    if (points.length < 2) return null;

    const pathD = points.map((p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ');

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d={pathD}
          fill="none"
          stroke={concept.colors.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    );
  };

  const renderCell = (row, col) => {
    const note = MELODY_NOTES[row];
    const isActive = grid[row][col];
    const isRevealed = revealedCols.includes(col);
    const isCurrentBeat = currentBeat === col;

    // If revealed (hint), show the target grid instead
    const showAsActive = isRevealed && targetGrid
      ? targetGrid[row][col]
      : isActive;

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={disabled || isRevealed}
        className={`
          ${cellSize} rounded-lg relative flex items-center justify-center
          ${!isChromebook ? 'transition-all duration-150' : ''}
          ${disabled || isRevealed ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${!isChromebook && !disabled && !isRevealed ? 'hover:scale-105' : ''}
          ${isRevealed ? 'ring-2 ring-yellow-400' : ''}
          ${isCurrentBeat ? 'ring-2 ring-white/60' : ''}
        `}
        style={{
          backgroundColor: showAsActive ? note.color : (isCurrentBeat ? '#52525b' : '#374151'),
          opacity: disabled && !showAsActive ? 0.5 : 1,
          boxShadow: !isChromebook && showAsActive ? `0 0 20px ${note.color}50` : 'none',
        }}
      >
        {/* Show note letter when active */}
        {showAsActive && (
          <span
            className="font-bold text-white text-sm"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {note.name}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`melody-grid relative ${className}`}>
      {/* Beat column labels */}
      <div className="flex items-center gap-1 mb-2">
        <div className={labelWidth} /> {/* Spacer for note labels */}
        {Array.from({ length: GRID_COLS }, (_, col) => (
          <div
            key={col}
            className={`${cellSize} text-center text-xs transition-all duration-150 flex items-center justify-center ${
              currentBeat === col
                ? 'text-cyan-300 font-bold scale-110'
                : 'text-gray-400 font-semibold'
            }`}
          >
            {col + 1}
          </div>
        ))}
      </div>

      {/* Grid rows (pitches) */}
      <div className="relative">
        {MELODY_NOTES.map((note, row) => {
          const hasHintInRow = revealedCols.some(col => targetGrid?.[row]?.[col]);

          return (
            <div
              key={note.id}
              className={`flex items-center gap-1 mb-1 ${
                hasHintInRow ? 'bg-yellow-900/30 rounded-lg p-0.5 -ml-0.5' : ''
              }`}
            >
              {/* Note label */}
              <div
                className={`${labelWidth} text-right pr-1 font-bold text-sm flex items-center justify-end`}
                style={{ color: note.color }}
              >
                {note.name}
              </div>

              {/* Beat cells */}
              <div className="flex gap-1">
                {Array.from({ length: GRID_COLS }, (_, col) => renderCell(row, col))}
              </div>
            </div>
          );
        })}

        {/* Contour line overlay */}
        {renderContourLine()}
      </div>

      {/* Legend for create mode */}
      {mode === 'create' && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          <p>Click to place notes. Only one note per column allowed.</p>
          <p className="mt-1">
            <span className="font-semibold text-purple-400">A</span> = high,{' '}
            <span className="font-semibold text-red-400">C</span> = low
          </p>
        </div>
      )}

      {/* Vocabulary reinforcement for play mode */}
      {mode === 'play' && (
        <div className="mt-3 text-xs text-center">
          <p className="text-purple-300">
            Recreate the <span className="font-bold text-white">MELODY</span> by matching the{' '}
            <span className="font-bold text-white">CONTOUR</span>
          </p>
        </div>
      )}

      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .grid-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MelodyGrid;
