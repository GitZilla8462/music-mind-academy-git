// Static Timeline Preview
// src/components/shared/StaticTimelinePreview.jsx
// Renders a read-only visual of composition loop blocks on a timeline
// Extracted from FullScreenPreview.jsx — no audio, no video, no transport

import React from 'react';

const StaticTimelinePreview = ({
  placedLoops = [],
  duration = 60,
  height = 120,
  theme = 'light',
  className = ''
}) => {
  if (!placedLoops.length || !duration) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100 border border-gray-200'
        } ${className}`}
        style={{ height }}
      >
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          No composition data
        </span>
      </div>
    );
  }

  // Calculate track layout
  const trackIndices = [...new Set(placedLoops.map(loop => loop.trackIndex || 0))].sort((a, b) => a - b);
  const maxTrack = Math.max(...trackIndices, 0);
  const totalTracks = Math.max(4, maxTrack + 1);
  const trackHeight = height / totalTracks;

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'
      } ${className}`}
      style={{ height }}
    >
      {/* Track row backgrounds */}
      {Array.from({ length: totalTracks }).map((_, i) => (
        <div
          key={i}
          className={`absolute left-0 right-0 ${
            isDark
              ? (i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50')
              : (i % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100/70')
          }`}
          style={{
            top: i * trackHeight,
            height: trackHeight,
            borderBottom: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`
          }}
        />
      ))}

      {/* Loop blocks */}
      {placedLoops.map((loop, idx) => {
        const startTime = loop.startTime || 0;
        const endTime = loop.endTime || (startTime + (loop.duration || 2));
        const leftPercent = (startTime / duration) * 100;
        const widthPercent = ((endTime - startTime) / duration) * 100;
        const trackIdx = loop.trackIndex || 0;

        return (
          <div
            key={loop.id || idx}
            className="absolute rounded overflow-hidden"
            style={{
              left: `${leftPercent}%`,
              width: `${Math.max(widthPercent, 0.5)}%`,
              top: trackIdx * trackHeight + 2,
              height: trackHeight - 4,
              backgroundColor: loop.color || '#3b82f6',
              opacity: 0.9
            }}
          >
            {trackHeight >= 16 && (
              <div className="px-1 py-0.5 text-[9px] text-white truncate font-medium leading-tight">
                {loop.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StaticTimelinePreview;
