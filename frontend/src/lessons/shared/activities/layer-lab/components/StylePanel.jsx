// File: /src/lessons/shared/activities/layer-lab/components/StylePanel.jsx
// Style presets and musical settings panel

import React, { useState } from 'react';
import { STYLE_PRESETS, CHORD_PROGRESSIONS, SCALES, DRUM_KITS } from '../trackConfig';

const StylePanel = ({
  currentPreset,
  currentProgression,
  currentScale,
  currentBpm,
  onPresetSelect,
  onProgressionChange,
  onScaleChange,
  onBpmChange,
  onGenerateAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '8px'
    }}>
      {/* Collapsed Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🎨</span>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            Style: {STYLE_PRESETS[currentPreset]?.name || 'Custom'}
          </span>
          <span style={{ 
            fontSize: '11px', 
            color: 'rgba(255,255,255,0.5)',
            padding: '2px 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px'
          }}>
            {currentBpm} BPM • {SCALES[currentScale]?.name} • {CHORD_PROGRESSIONS[currentProgression]?.name}
          </span>
        </div>
        <span style={{ 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* Style Presets */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '8px',
              fontWeight: 600
            }}>
              🎭 STYLE PRESETS
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}>
              {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onPresetSelect(key)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: currentPreset === key 
                      ? '2px solid #FFD700' 
                      : '1px solid rgba(255,255,255,0.2)',
                    background: currentPreset === key 
                      ? 'rgba(255,215,0,0.2)' 
                      : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{preset.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>{preset.name}</div>
                  <div style={{ fontSize: '9px', opacity: 0.6 }}>{preset.bpm} BPM</div>
                </button>
              ))}
            </div>
          </div>

          {/* Musical Settings Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Scale */}
            <div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.6)', 
                marginBottom: '6px' 
              }}>
                🎵 Scale
              </div>
              <select
                value={currentScale}
                onChange={(e) => onScaleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(SCALES).map(([key, scale]) => (
                  <option key={key} value={key}>
                    {scale.name} - {scale.mood}
                  </option>
                ))}
              </select>
            </div>

            {/* Chord Progression */}
            <div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.6)', 
                marginBottom: '6px' 
              }}>
                🎹 Chord Progression
              </div>
              <select
                value={currentProgression}
                onChange={(e) => onProgressionChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(CHORD_PROGRESSIONS).map(([key, prog]) => (
                  <option key={key} value={key}>
                    {prog.icon} {prog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BPM */}
            <div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.6)', 
                marginBottom: '6px' 
              }}>
                ⏱️ Tempo: {currentBpm} BPM
              </div>
              <input
                type="range"
                min="60"
                max="160"
                value={currentBpm}
                onChange={(e) => onBpmChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#FFD700'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.4)'
              }}>
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Generate All Button */}
          <button
            onClick={onGenerateAll}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #9B59B6, #3498DB)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ✨ Generate All Tracks
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              (fits current style)
            </span>
          </button>

          {/* Current Chord Display */}
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            {CHORD_PROGRESSIONS[currentProgression]?.chords.map((chord, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 700,
                  color: '#FFD700'
                }}>
                  {chord.name}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>
                  Bar {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePanel;