// File: /src/pages/projects/film-music-score/timeline/components/TimeMarkers.jsx
// REFACTORED: Pure visual component with pointer-events: none
// Time markers with labels and hash marks

import React from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TimeMarkers = ({ duration, timeToPixel, showTimelineLabel = false }) => {
  const timeMarkers = [];
  const secondMarkers = [];
  
  // Major markers every 10 seconds
  for (let i = 0; i <= duration; i += TIMELINE_CONSTANTS.MARKER_INTERVAL) {
    const minutes = Math.floor(i / 60);
    const seconds = Math.floor(i % 60);
    
    timeMarkers.push(
      <div
        key={`major-${i}`}
        className="absolute flex flex-col items-center text-white"
        style={{ 
          left: timeToPixel(i) - 13,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="w-px h-3 bg-white opacity-80"
          style={{ pointerEvents: 'none' }}
        />
        <span 
          className="text-xs font-mono leading-none"
          style={{ pointerEvents: 'none' }}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Minor markers every 1 second (hash marks)
  for (let i = 0; i <= duration; i += 1) {
    // Skip if this would overlap with a major marker
    if (i % TIMELINE_CONSTANTS.MARKER_INTERVAL !== 0) {
      secondMarkers.push(
        <div
          key={`minor-${i}`}
          className="absolute"
          style={{ 
            left: timeToPixel(i),
            pointerEvents: 'none'
          }}
        >
          <div 
            className="w-px h-2 bg-white opacity-40"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      );
    }
  }

  return (
    <div style={{ pointerEvents: 'none' }}>
      {/* TIMELINE label - positioned at the very left, inline with time markers */}
      {showTimelineLabel && (
        <div
          className="absolute flex items-end text-white"
          style={{ 
            left: -60, 
            bottom: 0,
            pointerEvents: 'none'
          }}
        >
          <span 
            className="text-xs font-semibold"
            style={{ pointerEvents: 'none' }}
          >
            TIMELINE
          </span>
        </div>
      )}
      
      {/* Major time markers with labels */}
      {timeMarkers}
      
      {/* Minor second markers (hash marks) */}
      {secondMarkers}
    </div>
  );
};

export default TimeMarkers;