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
      {/* Triangle playhead in the header */}
      {isInHeader && (
        <div 
          className={`absolute top-0 -left-4 transition-transform ${
            isDraggingPlayhead ? 'scale-125' : ''
          }`}
          style={{ pointerEvents: 'none' }}
        >
          <div className="relative">
            <div 
              className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg opacity-80"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))',
                pointerEvents: 'none'
              }}
            />
          </div>
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