// BeatGrid.jsx - Reusable grid component for Beat Escape Room
// Used in both CREATE mode (design puzzles) and PLAY mode (solve puzzles)
// Supports themed assets for visual customization

import React from 'react';
import { INSTRUMENTS, GRID_CONSTRAINTS, playDrum } from './beatEscapeRoomConfig';
import { getThemeAssets, THEMES } from './beatEscapeRoomThemes';

const BeatGrid = ({
  pattern,
  onToggle,
  mode = 'create',       // 'create' | 'play'
  showConstraints = true,
  revealedRows = [],     // For hints in play mode
  targetPattern = null,  // For showing correct answer in hints
  disabled = false,
  className = '',
  size = 'normal',       // 'normal' | 'large'
  themeId = 'space-station',  // Theme for visual assets
  currentBeat = null,    // For playback animation
  useAssets = false      // Whether to use image assets or simple colors
}) => {
  const theme = THEMES[themeId] || THEMES['space-station'];
  const assets = getThemeAssets(themeId);

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');
  const handleCellClick = async (instrumentId, beatIndex) => {
    if (disabled) return;

    // Check if this cell is allowed based on constraints
    if (!GRID_CONSTRAINTS[instrumentId].includes(beatIndex)) return;

    // Check if this row is revealed (hint) - can't change revealed rows
    if (revealedRows.includes(instrumentId)) return;

    // Play the sound
    await playDrum(instrumentId);

    // Toggle the cell
    onToggle?.(instrumentId, beatIndex);
  };

  // Get cell image based on instrument and state
  const getCellImage = (instrumentId, isActive) => {
    if (!isActive) return assets.cellEmpty;
    switch (instrumentId) {
      case 'kick': return assets.cellKick;
      case 'snare': return assets.cellSnare;
      case 'hihat': return assets.cellHihat;
      default: return assets.cellEmpty;
    }
  };

  // Get instrument color from theme
  const getInstrumentColor = (instrumentId) => {
    return theme.colors[instrumentId] || instrument.color;
  };

  const renderCell = (instrument, beatIndex) => {
    const isAllowed = GRID_CONSTRAINTS[instrument.id].includes(beatIndex);
    const isActive = pattern[instrument.id][beatIndex];
    const isRevealed = revealedRows.includes(instrument.id);
    const isCurrentBeat = currentBeat === beatIndex;

    // If revealed (hint), show the target pattern instead
    const showAsActive = isRevealed && targetPattern
      ? targetPattern[instrument.id][beatIndex]
      : isActive;

    // For revealed rows, check if this cell should NOT be active (show red X)
    const isRevealedAsOff = isRevealed && targetPattern && !targetPattern[instrument.id][beatIndex] && isAllowed;

    const cellSize = size === 'large' ? 'w-16 h-16' : 'w-12 h-12';
    const instrumentColor = theme.colors[instrument.id] || instrument.color;

    // Use themed assets if available and enabled
    if (useAssets && theme.available) {
      return (
        <button
          key={beatIndex}
          disabled={disabled || !isAllowed || isRevealed}
          onClick={() => handleCellClick(instrument.id, beatIndex)}
          className={`
            ${cellSize} rounded-lg transition-all duration-150 relative overflow-hidden
            ${!isAllowed ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            ${isRevealed ? 'ring-2 ring-yellow-400' : ''}
            ${isCurrentBeat ? 'ring-2 ring-white/50' : ''}
          `}
          style={{
            backgroundImage: `url(${showAsActive ? getCellImage(instrument.id, true) : assets.cellEmpty})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Current beat overlay */}
          {isCurrentBeat && (
            <div className="absolute inset-0 rounded-lg bg-white/20 pointer-events-none" />
          )}
          {/* Disabled overlay */}
          {!isAllowed && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundImage: `url(${assets.cellDisabled})`,
                backgroundSize: 'cover',
              }}
            />
          )}
          {/* Red X for revealed cells that should be OFF */}
          {isRevealedAsOff && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-full h-full p-1" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </div>
          )}
        </button>
      );
    }

    // Default color-based rendering (with Chromebook optimization)
    return (
      <button
        key={beatIndex}
        disabled={disabled || !isAllowed || isRevealed}
        onClick={() => handleCellClick(instrument.id, beatIndex)}
        className={`
          ${cellSize} rounded-lg relative flex items-center justify-center
          ${!isChromebook ? 'transition-colors duration-150' : ''}
          ${!isAllowed ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${!isChromebook && isAllowed ? 'hover:scale-105' : ''}
          ${isRevealed ? 'ring-2 ring-cyan-400' : ''}
          ${!isChromebook && showAsActive ? 'shadow-lg' : ''}
          ${isCurrentBeat ? 'ring-2 ring-cyan-400/60' : ''}
        `}
        style={{
          backgroundColor: showAsActive ? instrumentColor : (isCurrentBeat ? '#52525b' : '#374151'),
          opacity: !isAllowed ? 0.2 : 1,
          boxShadow: !isChromebook && showAsActive ? `0 0 20px ${instrumentColor}50` : 'none',
        }}
      >
        {/* X mark for disabled cells */}
        {!isAllowed && showConstraints && (
          <span className="text-gray-600 text-lg font-bold">×</span>
        )}
        {/* Red X for revealed cells that should be OFF - styled to match game theme */}
        {isRevealedAsOff && (
          <svg
            className="absolute w-full h-full p-1.5 pointer-events-none"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))' }}
          >
            <line
              x1="4" y1="4" x2="20" y2="20"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 2px #ef4444)' }}
            />
            <line
              x1="20" y1="4" x2="4" y2="20"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 2px #ef4444)' }}
            />
          </svg>
        )}
      </button>
    );
  };

  // Check if we should show the decorative frame (only for themed mode)
  const showFrame = useAssets && theme.available;

  return (
    <div className={`beat-grid ${className}`}>
      {/* Grid with optional decorative frame */}
      <div className={`relative ${showFrame ? 'p-6' : ''}`}>
        {/* Solid background behind frame to prevent transparency showing through */}
        {showFrame && (
          <div
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: theme.colors.background || '#1e293b' }}
          />
        )}
        {/* Decorative frame overlay */}
        {showFrame && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${assets.gridFrame})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* Grid content */}
        <div className="relative z-10">
          {/* Beat labels */}
          <div className="flex items-center gap-2 mb-2">
            <div className={size === 'large' ? 'w-24' : 'w-20'} /> {/* Spacer for instrument labels */}
            {['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4'].map((label, i) => (
              <div
                key={label}
                className={`${size === 'large' ? 'w-16' : 'w-12'} text-center text-sm transition-all duration-150 ${
                  currentBeat === i
                    ? 'text-cyan-300 font-bold scale-110'
                    : 'text-gray-400 font-semibold'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Instrument rows */}
          {INSTRUMENTS.map(instrument => {
            const isRevealed = revealedRows.includes(instrument.id);
            const instrumentColor = theme.colors[instrument.id] || instrument.color;

            return (
              <div
                key={instrument.id}
                className={`flex items-center gap-2 mb-2 ${isRevealed ? 'bg-yellow-900/30 rounded-lg p-1 -ml-1' : ''}`}
              >
                {/* Instrument label */}
                <div
                  className={`${size === 'large' ? 'w-24' : 'w-20'} text-right pr-2 font-bold text-sm flex items-center justify-end gap-1`}
                  style={{ color: instrumentColor }}
                >
                  {isRevealed && <span className="text-yellow-400 text-xs">HINT</span>}
                  <span>{instrument.name}</span>
                </div>

                {/* Beat cells */}
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(beatIndex => renderCell(instrument, beatIndex))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend for constraints */}
      {showConstraints && mode === 'create' && (
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <p><span className="text-red-400">Kick</span>: Beats 1 & 3 only (downbeats)</p>
          <p><span className="text-orange-400">Snare</span>: Beats 2 & 4 only (backbeats)</p>
          <p><span className="text-green-400">Hi-Hat</span>: All beats allowed</p>
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

export default BeatGrid;
