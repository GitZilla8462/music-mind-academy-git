// /timeline/TimelineStatusBar.jsx
import React from 'react';
import { Headphones } from 'lucide-react';

const TimelineStatusBar = ({ currentTime, duration, trackStates }) => {
  return (
    <div className="bg-gray-800 p-2 border-t border-gray-700 flex-shrink-0">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-gray-400">
          <span>Time: {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
          <span>•</span>
          <span>Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
          <span>•</span>
          <span className="flex items-center">
            <Headphones size={12} className="mr-1" />
            {Object.values(trackStates).filter(t => t.solo).length} solo
          </span>
          <span>•</span>
          <span className="text-blue-400">Use scrollbar below timeline to navigate horizontally</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-400">
          <span>Drag playhead to scrub • Click to seek • Drag loops to arrange</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineStatusBar;