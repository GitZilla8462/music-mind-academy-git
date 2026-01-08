// File: /src/pages/projects/film-music-score/timeline/components/TimelineGrid.jsx
// CHROMEBOOK OPTIMIZED: Single SVG element instead of 60+ DIVs
// Reduces DOM nodes by 98%, improves render performance significantly

import React, { useMemo } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TimelineGrid = React.memo(({ duration, timeToPixel }) => {
  // Calculate grid height once
  const gridHeight = TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT +
    TIMELINE_CONSTANTS.NUM_TRACKS * TIMELINE_CONSTANTS.TRACK_HEIGHT;

  // Generate SVG path for all grid lines in one string
  // This creates 1 DOM node instead of 60+ nodes
  const { majorPath, minorPath, svgWidth } = useMemo(() => {
    let major = '';
    let minor = '';
    let maxX = 0;

    for (let i = 0; i <= duration; i += 1) {
      const x = timeToPixel(i);
      maxX = Math.max(maxX, x);
      const isMajor = i % TIMELINE_CONSTANTS.MARKER_INTERVAL === 0;

      // SVG path: M = move to, V = vertical line to
      const linePath = `M ${x} 0 V ${gridHeight} `;

      if (isMajor) {
        major += linePath;
      } else {
        minor += linePath;
      }
    }

    return { majorPath: major, minorPath: minor, svgWidth: maxX + 50 };
  }, [duration, timeToPixel, gridHeight]);

  return (
    <svg
      className="absolute inset-0 z-10"
      width={svgWidth}
      height={gridHeight}
      style={{ pointerEvents: 'none' }}
    >
      {/* Minor grid lines (every second) - lighter */}
      <path
        d={minorPath}
        stroke="#374151"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
      {/* Major grid lines (every 10 seconds) - darker */}
      <path
        d={majorPath}
        stroke="#4B5563"
        strokeWidth="1"
        opacity="0.6"
        fill="none"
      />
    </svg>
  );
});

TimelineGrid.displayName = 'TimelineGrid';

export default TimelineGrid;
