// File: /src/lessons/shared/activities/layer-lab/components/PlaybackControls.jsx
// Transport controls and playback UI

import React from 'react';

const PlaybackControls = ({
  isPlaying,
  currentBeat,
  bpm,
  activeLayerCount,
  onTogglePlay,
  onBpmChange
}) => {
  // Get texture description
  const getTextureDescription = () => {
    if (activeLayerCount === 0) return { text: 'Empty', color: '#666' };
    if (activeLayerCount === 1) return { text: 'Thin', color: '#4ECDC4' };
    if (activeLayerCount === 2) return { text: 'Medium', color: '#FFD700' };
    if (activeLayerCount === 3) return { text: 'Thick', color: '#FF9800' };
    return { text: 'Full', color: '#FF6B6B' };
  };

  const texture = getTextureDescription();

  return (
    <div style={{
      padding: '12px 20px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      flexShrink: 0
    }}>
      {/* Texture Meter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '20px'
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Texture:</span>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: i <= activeLayerCount
                  ? `hsl(${40 + (i - 1) * 20}, 80%, 55%)`
                  : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                boxShadow: i <= activeLayerCount 
                  ? `0 0 8px hsl(${40 + (i - 1) * 20}, 80%, 55%)` 
                  : 'none'
              }}
            />
          ))}
        </div>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 700,
          color: texture.color
        }}>
          {texture.text}
        </span>
      </div>

      {/* BPM Control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={() => onBpmChange(Math.max(60, bpm - 5))}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          −
        </button>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '8px',
          minWidth: '70px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{bpm}</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>BPM</div>
        </div>
        <button
          onClick={() => onBpmChange(Math.min(160, bpm + 5))}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
      </div>

      {/* Play Button */}
      <button
        onClick={onTogglePlay}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: 'none',
          background: isPlaying
            ? 'linear-gradient(135deg, #FF6B6B, #ee5a5a)'
            : 'linear-gradient(135deg, #4ECDC4, #44a08d)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPlaying
            ? '0 4px 25px rgba(255, 107, 107, 0.5)'
            : '0 4px 25px rgba(78, 205, 196, 0.5)',
          transition: 'all 0.2s ease'
        }}
      >
        {isPlaying ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Beat Indicator */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 1, 2, 3].map(measure => (
            <div
              key={measure}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: Math.floor(currentBeat / 4) === measure && isPlaying
                  ? '#FFD700'
                  : 'rgba(255,255,255,0.15)',
                boxShadow: Math.floor(currentBeat / 4) === measure && isPlaying
                  ? '0 0 10px #FFD700'
                  : 'none',
                transition: 'all 0.1s ease'
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
          Bar {Math.floor(currentBeat / 4) + 1}
        </span>
      </div>

      {/* Loop indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)'
      }}>
        🔁 Loop
      </div>
    </div>
  );
};

export default PlaybackControls;