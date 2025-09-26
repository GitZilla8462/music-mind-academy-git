// /timeline/components/Playhead.jsx - Modified with triangle playhead
import React from 'react';

const Playhead = ({ 
  currentTime, 
  timeToPixel, 
  isDraggingPlayhead, 
  onPlayheadMouseDown,
  isInHeader = false 
}) => {
  return (
    <div
      className={`absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 transition-shadow ${
        isDraggingPlayhead ? 'shadow-lg shadow-red-500/50' : ''
      }`}
      style={{ left: timeToPixel(currentTime) }}
    >
      {/* Triangle playhead in the header */}
      {isInHeader && (
        <div 
          className={`absolute top-0 -left-4 cursor-col-resize transition-transform hover:scale-110 ${
            isDraggingPlayhead ? 'scale-125' : ''
          }`}
          onMouseDown={onPlayheadMouseDown}
          title="Drag to scrub timeline"
        >
          {/* Triangle shape pointing down */}
          <div className="relative">
            <div 
              className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg opacity-80"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Draggable area for main timeline (invisible but functional) */}
      {!isInHeader && (
        <div 
          className="absolute -top-2 -left-3 w-6 h-6 cursor-col-resize opacity-0"
          onMouseDown={onPlayheadMouseDown}
          title="Drag to scrub timeline"
        />
      )}
      
      {!isInHeader && (
        <div className="absolute top-0 left-0.5 w-px bg-red-300/50 h-full pointer-events-none" />
      )}
    </div>
  );
};

export default Playhead;