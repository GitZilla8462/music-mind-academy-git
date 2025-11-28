// File: /src/lessons/shared/activities/layer-lab/components/MiniTrack.jsx
// Compact track view for the sidebar

import React from 'react';

const MiniTrack = ({ 
  track, 
  grid, 
  isSelected, 
  isMuted, 
  currentBeat,
  isPlaying,
  onSelect, 
  onToggleMute,
  onRemove,
  canRemove 
}) => {
  // Check if track has any notes
  const hasNotes = grid?.some(row => row.some(cell => cell));
  
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: isSelected 
          ? `linear-gradient(135deg, ${track.bgColor}, ${track.color}22)`
          : track.bgColor,
        border: isSelected 
          ? `2px solid ${track.color}` 
          : '2px solid transparent',
        cursor: 'pointer',
        opacity: isMuted ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {/* Track Icon & Name */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        width: '50px',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '20px' }}>{track.icon}</span>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 600,
          color: track.color,
          marginTop: '2px'
        }}>
          {track.name}
        </span>
      </div>

      {/* Mini Grid Visualization */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '1px',
        height: '32px',
        alignItems: 'center'
      }}>
        {Array(16).fill(null).map((_, col) => {
          // Check if any row has a note at this column
          const hasNoteAtCol = grid?.some(row => row[col]);
          const isCurrentBeat = isPlaying && currentBeat === col;
          
          return (
            <div
              key={col}
              style={{
                flex: 1,
                height: hasNoteAtCol ? '100%' : '40%',
                borderRadius: '2px',
                background: hasNoteAtCol 
                  ? track.color 
                  : 'rgba(255,255,255,0.1)',
                opacity: isCurrentBeat ? 1 : 0.7,
                transition: 'all 0.1s ease',
                border: isCurrentBeat ? '1px solid white' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2px',
        flexShrink: 0
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          style={{
            width: '24px',
            height: '20px',
            border: 'none',
            borderRadius: '4px',
            background: isMuted ? '#FF6B6B' : 'rgba(255,255,255,0.2)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              width: '24px',
              height: '20px',
              border: 'none',
              borderRadius: '4px',
              background: 'rgba(255,0,0,0.3)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove Track"
          >
            ✕
          </button>
        )}
      </div>

      {/* Active indicator */}
      {hasNotes && !isMuted && (
        <div style={{
          position: 'absolute',
          right: '4px',
          top: '4px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: track.color,
          boxShadow: `0 0 6px ${track.color}`
        }} />
      )}
    </div>
  );
};

export default MiniTrack;