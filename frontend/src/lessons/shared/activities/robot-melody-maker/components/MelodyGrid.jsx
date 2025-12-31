/**
 * FILE: robot-melody-maker/components/MelodyGrid.jsx
 *
 * Simple 8x16 melody grid for composing
 * - 8 rows = 8 pitches (pentatonic scale)
 * - 16 columns = 16 steps
 * - Click to toggle notes on/off
 *
 * ✅ OPTIMIZED: Uses GPU-accelerated transforms for smooth playhead
 */

import React, { memo, useCallback, useMemo } from 'react';
import styles from './MelodyGrid.module.css';

// Note labels for each row (high to low)
const NOTE_LABELS = ['High C', 'A', 'G', 'E', 'D', 'C', 'Low A', 'Low G'];

// Preset patterns
const PRESETS = {
  empty: () => Array(8).fill(null).map(() => Array(16).fill(false)),
  ascending: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    [7, 6, 5, 4, 3, 2, 1, 0].forEach((row, i) => {
      if (i * 2 < 16) p[row][i * 2] = true;
    });
    return p;
  },
  descending: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((row, i) => {
      if (i * 2 < 16) p[row][i * 2] = true;
    });
    return p;
  },
  wave: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    const wave = [4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3];
    wave.forEach((row, col) => {
      p[row][col] = true;
    });
    return p;
  },
  happy: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    const melody = [3, 3, 1, 1, 0, 0, 1, -1, 2, 2, 3, 3, 4, 4, 3, -1];
    melody.forEach((row, col) => {
      if (row >= 0) p[row][col] = true;
    });
    return p;
  },
  mystery: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    const melody = [0, 2, 1, 3, 2, 4, 3, 5, 4, 3, 2, 1, 0, -1, 0, -1];
    melody.forEach((row, col) => {
      if (row >= 0) p[row][col] = true;
    });
    return p;
  },
  random: () => {
    const p = Array(8).fill(null).map(() => Array(16).fill(false));
    // Generate 8-12 random notes
    const noteCount = Math.floor(Math.random() * 5) + 8;
    const usedCols = new Set();
    
    for (let i = 0; i < noteCount; i++) {
      // Pick a random column (avoid too many on same column)
      let col;
      let attempts = 0;
      do {
        col = Math.floor(Math.random() * 16);
        attempts++;
      } while (usedCols.has(col) && attempts < 20);
      
      usedCols.add(col);
      
      // Pick a random row (pitch)
      const row = Math.floor(Math.random() * 8);
      p[row][col] = true;
    }
    return p;
  },
};

// Memoized cell component to prevent re-renders
const GridCell = memo(({ rowIndex, colIndex, isActive, isBeat, hue, onToggle }) => (
  <button
    className={`
      ${styles.cell}
      ${isActive ? styles.active : ''}
      ${isBeat ? styles.beat : ''}
    `}
    style={{
      '--cell-hue': hue,
      '--cell-color': `hsl(${hue}, 70%, 55%)`,
      '--cell-glow': `hsl(${hue}, 80%, 60%)`,
    }}
    onClick={() => onToggle(rowIndex, colIndex)}
  />
));

GridCell.displayName = 'GridCell';

const MelodyGrid = memo(({ pattern, onChange }) => {
  // Toggle a cell on/off - memoized to prevent child re-renders
  const toggleCell = useCallback((row, col) => {
    // Compute new pattern using current pattern prop and pass it directly
    const newPattern = pattern.map((r, ri) =>
      r.map((cell, ci) => (ri === row && ci === col ? !cell : cell))
    );
    onChange(newPattern);
  }, [onChange, pattern]);

  // Apply a preset
  const applyPreset = useCallback((presetName) => {
    const presetFn = PRESETS[presetName];
    if (presetFn) {
      onChange(presetFn());
    }
  }, [onChange]);

  // Pre-calculate cell hues (never changes)
  const cellHues = useMemo(() =>
    Array.from({ length: 8 }, (_, row) => 280 - (row / 7) * 160),
    []
  );


  return (
    <div className={styles.container}>
      {/* Header with presets */}
      <div className={styles.header}>
        <h3 className={styles.title}>🎵 Melody Grid</h3>
        <div className={styles.presets}>
          <button onClick={() => applyPreset('empty')} className={styles.presetBtn} title="Clear all">
            🗑️
          </button>
          <button onClick={() => applyPreset('ascending')} className={styles.presetBtn} title="Ascending">
            📈
          </button>
          <button onClick={() => applyPreset('descending')} className={styles.presetBtn} title="Descending">
            📉
          </button>
          <button onClick={() => applyPreset('wave')} className={styles.presetBtn} title="Wave">
            🌊
          </button>
          <button onClick={() => applyPreset('happy')} className={styles.presetBtn} title="Happy">
            😊
          </button>
          <button onClick={() => applyPreset('mystery')} className={styles.presetBtn} title="Mystery">
            🔮
          </button>
          <button onClick={() => applyPreset('random')} className={styles.presetBtn} title="Random">
            🎲
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.gridWrapper}>
        {/* Note labels */}
        <div className={styles.noteLabels}>
          {NOTE_LABELS.map((label, i) => (
            <div key={i} className={styles.noteLabel}>
              {label}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className={styles.grid}>
          {/* Cells - using memoized GridCell for performance */}
          {pattern.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => (
                <GridCell
                  key={colIndex}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  isActive={cell}
                  isBeat={colIndex % 4 === 0}
                  hue={cellHues[rowIndex]}
                  onToggle={toggleCell}
                />
              ))}
            </div>
          ))}

          {/* Beat markers */}
          <div className={styles.beatMarkers}>
            {[0, 4, 8, 12].map((beat) => (
              <div 
                key={beat} 
                className={styles.beatMarker}
                style={{ left: `${(beat / 16) * 100}%` }}
              >
                {beat / 4 + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

MelodyGrid.displayName = 'MelodyGrid';

export default MelodyGrid;