// /timeline/components/TimeMarkers.jsx - Enhanced with second-level grid
import React from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TimeMarkers = ({ duration, timeToPixel }) => {
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
        style={{ left: timeToPixel(i) - 13 }}
      >
        <div className="w-px h-3 bg-white opacity-80" />
        <span className="text-xs font-mono mt-1 leading-none">
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
          style={{ left: timeToPixel(i) }}
        >
          <div className="w-px h-2 bg-white opacity-40" />
        </div>
      );
    }
  }

  return (
    <>
      {/* Major time markers with labels */}
      {timeMarkers}
      {/* Minor second markers (hash marks) */}
      {secondMarkers}
    </>
  );
};

export default TimeMarkers;