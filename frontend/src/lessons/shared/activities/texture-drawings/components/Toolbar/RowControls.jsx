/**
 * RowControls.jsx - Row Time Labels and Clear Buttons
 * 
 * Layout per row:
 * - Colored bar on left
 * - Time range stacked:
 *     0:00-
 *     0:29
 * - Trash icon below time
 * - NOW indicator when playing
 */

import React, { useState } from 'react';

const RowControls = ({
  rows,
  currentRow,
  isPlaying,
  rowHeight,
  onClearRow
}) => {
  const [confirmClear, setConfirmClear] = useState(null);

  const handleClearClick = (index) => {
    if (confirmClear === index) {
      onClearRow?.(index);
      setConfirmClear(null);
    } else {
      setConfirmClear(index);
      setTimeout(() => setConfirmClear(null), 3000);
    }
  };

  // Format time from seconds to M:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      width: '80px',
      backgroundColor: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {rows.map((row, index) => {
        const isActive = index === currentRow && isPlaying;
        const isConfirming = confirmClear === index;
        // Calculate start and end time for this row (30 seconds per row)
        const startTime = index * 30;
        const endTime = startTime + 29;

        return (
          <div
            key={row.id}
            style={{
              height: rowHeight,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isActive ? '#fef3c7' : '#ffffff',
              transition: 'background-color 0.15s ease',
              position: 'relative'
            }}
          >
            {/* Colored bar indicator */}
            <div style={{
              width: '4px',
              height: '80%',
              backgroundColor: row.color,
              borderRadius: '2px',
              flexShrink: 0
            }} />

            {/* Time + Trash stacked vertically */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              {/* Time range stacked */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: 1.1
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#1e293b',
                  fontFamily: 'monospace'
                }}>
                  {formatTime(startTime)}-
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#1e293b',
                  fontFamily: 'monospace'
                }}>
                  {formatTime(endTime)}
                </span>
              </div>

              {/* NOW indicator - shows when playing */}
              {isActive && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  animation: 'pulse 1s infinite'
                }}>
                  <span style={{ fontSize: '7px' }}>▶</span> NOW
                </span>
              )}

              {/* Clear/Trash Button - below time */}
              <button
                onClick={() => handleClearClick(index)}
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isConfirming ? '#ef4444' : '#f1f5f9',
                  color: isConfirming ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
                title={isConfirming ? 'Click again to confirm' : 'Clear this row'}
              >
                {isConfirming ? '✓' : '🗑️'}
              </button>
            </div>
          </div>
        );
      })}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default RowControls;