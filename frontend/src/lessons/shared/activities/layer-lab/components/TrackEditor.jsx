// File: /src/lessons/shared/activities/layer-lab/components/TrackEditor.jsx
// Full-size track editor with grid and controls

import React from 'react';
import { INSTRUMENT_SOUNDS, DRUM_KITS, SCALES } from '../trackConfig';

const TrackEditor = ({
  track,
  grid,
  currentBeat,
  isPlaying,
  isMuted,
  selectedSound,
  selectedKit,
  scale,
  onCellToggle,
  onGeneratePattern,
  onClear,
  onToggleMute,
  onSoundChange,
  onKitChange
}) => {
  const isDrumTrack = track.id === 'rhythm' || track.id === 'percussion';
  
  // Get row labels based on track type
  const getRowLabel = (rowIndex) => {
    if (isDrumTrack) {
      return track.drumLabels?.[rowIndex] || `Row ${rowIndex + 1}`;
    }
    
    // For melodic tracks, show scale notes (inverted so high at top)
    const scaleNotes = SCALES[scale]?.notes || SCALES.pentatonic.notes;
    const noteIndex = (track.rows - 1) - rowIndex;
    return scaleNotes[noteIndex % scaleNotes.length] + (track.octave + Math.floor(noteIndex / scaleNotes.length));
  };

  // Get sound options
  const soundOptions = isDrumTrack 
    ? Object.entries(DRUM_KITS)
    : Object.entries(INSTRUMENT_SOUNDS[track.id.replace('2', '')] || INSTRUMENT_SOUNDS.melody);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Track Header */}
      <div style={{
        padding: '12px 16px',
        background: track.bgColor,
        borderBottom: `2px solid ${track.color}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{track.icon}</span>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              color: track.color,
              fontWeight: 700
            }}>
              {track.name}
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.6)' 
            }}>
              {track.description}
            </p>
          </div>
        </div>

        {/* Sound Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {isDrumTrack ? 'Kit:' : 'Sound:'}
          </span>
          <select
            value={isDrumTrack ? selectedKit : selectedSound}
            onChange={(e) => isDrumTrack ? onKitChange(e.target.value) : onSoundChange(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${track.color}`,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {soundOptions.map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon || ''} {config.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onGeneratePattern}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🎲 Dice Roll
          </button>
          <button
            onClick={onClear}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Clear
          </button>
          <button
            onClick={onToggleMute}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isMuted ? '#FF6B6B' : 'rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isMuted ? '🔇 Muted' : '🔊 On'}
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Beat Markers */}
        <div style={{
          display: 'flex',
          marginLeft: '60px',
          marginBottom: '8px'
        }}>
          {Array(16).fill(null).map((_, col) => (
            <div
              key={col}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                color: col % 4 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                fontWeight: col % 4 === 0 ? 600 : 400
              }}
            >
              {col % 4 === 0 ? Math.floor(col / 4) + 1 : '·'}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {grid?.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Row Label */}
              <div style={{
                width: '56px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'right',
                paddingRight: '8px',
                fontFamily: 'monospace',
                flexShrink: 0
              }}>
                {getRowLabel(rowIdx)}
              </div>

              {/* Cells */}
              {row.map((cell, colIdx) => {
                const isCurrentBeat = isPlaying && currentBeat === colIdx;
                const isMeasureStart = colIdx % 4 === 0;
                
                return (
                  <div
                    key={colIdx}
                    onClick={() => onCellToggle(rowIdx, colIdx)}
                    style={{
                      flex: 1,
                      height: track.rows <= 4 ? '28px' : '22px',
                      margin: '1px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: cell
                        ? track.color
                        : isMeasureStart
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(255,255,255,0.05)',
                      border: isCurrentBeat
                        ? '2px solid rgba(255,255,255,0.9)'
                        : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: cell 
                        ? `0 0 12px ${track.color}66, inset 0 1px 0 rgba(255,255,255,0.3)` 
                        : 'none',
                      transition: 'all 0.1s ease',
                      transform: isCurrentBeat && cell ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Track Tips */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.2)',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>💡 Click cells to add/remove notes</span>
        <span>🎲 Dice Roll generates patterns that fit the chord progression</span>
      </div>
    </div>
  );
};

export default TrackEditor;