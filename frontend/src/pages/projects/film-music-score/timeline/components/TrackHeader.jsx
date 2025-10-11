// File: /src/pages/projects/film-music-score/timeline/components/TrackHeader.jsx

import React from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TrackHeader = ({ 
  trackIndex, 
  trackStates, 
  updateTrackState, 
  placedLoops, 
  hoveredTrack,
  onTrackHeaderClick,
  tutorialMode = false
}) => {
  const trackId = `track-${trackIndex}`;
  const trackState = trackStates[trackId] || {};
  const hasLoops = placedLoops.some(loop => loop.trackIndex === trackIndex);

  // Handle track header click
  const handleHeaderClick = (e) => {
    // Only trigger if clicking the main header area, not buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    
    if (onTrackHeaderClick) {
      console.log('🎯 Track header clicked in TrackHeader component:', trackIndex);
      onTrackHeaderClick(trackIndex);
    }
  };

  return (
    <div 
      className={`track-header w-40 bg-gray-800 border-r border-gray-600 border-b border-gray-700 ${
        hoveredTrack === trackIndex ? 'bg-gray-700' : ''
      } ${hasLoops ? 'ring-1 ring-blue-500/30' : ''} ${
        tutorialMode ? 'cursor-pointer' : ''
      }`}
      style={{ height: TIMELINE_CONSTANTS.TRACK_HEIGHT }}
      onClick={handleHeaderClick}
    >
      <div className="p-2">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white text-xs font-medium w-12">
            {trackState.name || `Track ${trackIndex + 1}`}
          </span>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newVolume = Math.max(0, (trackState.volume || 0.7) - 0.05);
                updateTrackState(trackId, { volume: newVolume });
              }}
              className="w-4 h-4 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white flex items-center justify-center transition-colors"
              title="Decrease volume"
            >
              ‹
            </button>
            
            <span className="text-xs text-gray-400 w-8 text-center">
              {Math.round((trackState.volume || 0.7) * 100)}%
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newVolume = Math.min(1, (trackState.volume || 0.7) + 0.05);
                updateTrackState(trackId, { volume: newVolume });
              }}
              className="w-4 h-4 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white flex items-center justify-center transition-colors"
              title="Increase volume"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateTrackState(trackId, { muted: !trackState.muted });
            }}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              trackState.muted 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            title="Mute"
          >
            M
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              updateTrackState(trackId, { solo: !trackState.solo });
            }}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              trackState.solo 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            title="Solo"
          >
            S
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackHeader;