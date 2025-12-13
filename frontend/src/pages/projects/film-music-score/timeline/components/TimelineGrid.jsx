// File: /src/pages/projects/film-music-score/timeline/components/TimelineGrid.jsx
// REFACTORED: Pure visual component with pointer-events: none
// Vertical grid lines for audio tracks

import React from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TimelineGrid = ({ duration, timeToPixel }) => {
  const gridLines = [];
  
  // Create vertical grid lines for every second
  for (let i = 0; i <= duration; i += 1) {
    const x = timeToPixel(i);
    const isMajor = i % TIMELINE_CONSTANTS.MARKER_INTERVAL === 0; // Every 10 seconds
    
    gridLines.push(
      <div
        key={`grid-${i}`}
        className={`absolute ${
          isMajor 
            ? 'border-l border-gray-600 opacity-60' 
            : 'border-l border-gray-700 opacity-30'
        }`}
        style={{
          left: x,
          top: 0,
          height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + TIMELINE_CONSTANTS.NUM_TRACKS * TIMELINE_CONSTANTS.TRACK_HEIGHT,
          pointerEvents: 'none'
        }}
      />
    );
  }

  return (
    <div 
      className="absolute inset-0 z-10"
      style={{ pointerEvents: 'none' }}
    >
      {gridLines}
    </div>
  );
};

export default TimelineGrid;