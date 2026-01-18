// File: /src/pages/projects/film-music-score/timeline/components/Playhead.jsx
// REFACTORED: Pure visual component - NO mouse event handlers
// All interaction is handled by InteractionOverlay

import React from 'react';

const Playhead = ({ 
  currentTime, 
  timeToPixel, 
  isDraggingPlayhead, 
  onPlayheadMouseDown,  // Kept for API compatibility but not used
  isInHeader = false 
}) => {
  return (
    <div
      className={`absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 transition-shadow ${
        isDraggingPlayhead ? 'shadow-lg shadow-red-500/50' : ''
      }`}
      style={{ 
        left: timeToPixel(currentTime),
        pointerEvents: 'none'  // CRITICAL: No pointer events
      }}
      data-playhead="true"
    >
      {/* Diamond playhead in the header */}
      {isInHeader && (
        <div
          className={`absolute top-[3px] -left-[6px] transition-transform ${
            isDraggingPlayhead ? 'scale-110' : ''
          }`}
          style={{ pointerEvents: 'none' }}
        >
          {/* Diamond shape - rotated square */}
          <div
            className="w-3.5 h-3.5 bg-red-500 rotate-45"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      )}
      
      {/* Glow effect on main timeline */}
      {!isInHeader && (
        <div 
          className="absolute top-0 left-0.5 w-px bg-red-300/50 h-full"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </div>
  );
};

export default Playhead;