/**
 * FILE: monster-melody-maker/components/MelodyGrid.jsx
 * 
 * Simple 8x16 melody grid for composing
 * - 8 rows = 8 pitches (pentatonic scale)
 * - 16 columns = 16 steps
 * - Click to toggle notes on/off
 */

import React from 'react';
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
};

const MelodyGrid = ({ pattern, onChange, currentStep, isPlaying }) => {
  // Toggle a cell on/off
  const toggleCell = (row, col) => {
    const newPattern = pattern.map((r, ri) =>
      r.map((cell, ci) => (ri === row && ci === col ? !cell : cell))
    );
    onChange(newPattern);
  };

  // Apply a preset
  const applyPreset = (presetName) => {
    const presetFn = PRESETS[presetName];
    if (presetFn) {
      onChange(presetFn());
    }
  };

  // Get cell color based on row (high = warm, low = cool)
  const getCellHue = (row) => {
    // Row 0 (high) = 280 (purple), Row 7 (low) = 120 (green)
    return 280 - (row / 7) * 160;
  };

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
          {/* Playhead */}
          {isPlaying && currentStep >= 0 && (
            <div 
              className={styles.playhead}
              style={{ left: `${(currentStep / 16) * 100}%` }}
            />
          )}

          {/* Cells */}
          {pattern.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => {
                const hue = getCellHue(rowIndex);
                const isActive = cell;
                const isCurrent = isPlaying && colIndex === currentStep;
                const isBeat = colIndex % 4 === 0;

                return (
                  <button
                    key={colIndex}
                    className={`
                      ${styles.cell}
                      ${isActive ? styles.active : ''}
                      ${isCurrent ? styles.current : ''}
                      ${isBeat ? styles.beat : ''}
                    `}
                    style={{
                      '--cell-hue': hue,
                      '--cell-color': `hsl(${hue}, 70%, 55%)`,
                      '--cell-glow': `hsl(${hue}, 80%, 60%)`,
                    }}
                    onClick={() => toggleCell(rowIndex, colIndex)}
                  />
                );
              })}
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
};

export default MelodyGrid;