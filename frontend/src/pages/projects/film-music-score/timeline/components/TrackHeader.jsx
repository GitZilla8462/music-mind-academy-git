// File: /src/pages/projects/film-music-score/timeline/components/TrackHeader.jsx
// FIXED: Changed width from w-40 to w-48 to eliminate gap

import React from 'react';
import { VolumeX, Headphones } from 'lucide-react';
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

  // Check if this track is effectively muted (either explicitly or due to another track being soloed)
  const anyOtherTrackSoloed = Object.entries(trackStates).some(
    ([id, state]) => id !== trackId && state.solo
  );
  const isEffectivelyMuted = trackState.muted || (anyOtherTrackSoloed && !trackState.solo);

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
      className={`track-header bg-gray-800 border-r border-gray-600 border-b border-gray-700 ${
        hoveredTrack === trackIndex ? 'bg-gray-700' : ''
      } ${hasLoops ? 'ring-1 ring-blue-500/30' : ''} ${
        tutorialMode ? 'cursor-pointer' : ''
      }`}
      style={{ width: '154px', height: TIMELINE_CONSTANTS.TRACK_HEIGHT }}
      onClick={handleHeaderClick}
    >
      <div className="px-2 py-1.5">
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="text-white text-[10px] font-medium w-11 flex-shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {trackState.name || `Track ${trackIndex + 1}`}
          </span>
          
          <div className="flex items-center space-x-0.5 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newVolume = Math.max(0, (trackState.volume || 0.7) - 0.05);
                updateTrackState(trackId, { volume: newVolume });
              }}
              className="w-4 h-4 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white flex items-center justify-center transition-colors flex-shrink-0"
              title="Decrease volume"
            >
              ‹
            </button>
            
            <span className="text-xs text-gray-400 w-7 text-center flex-shrink-0">
              {Math.round((trackState.volume || 0.7) * 100)}%
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newVolume = Math.min(1, (trackState.volume || 0.7) + 0.05);
                updateTrackState(trackId, { volume: newVolume });
              }}
              className="w-4 h-4 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white flex items-center justify-center transition-colors flex-shrink-0"
              title="Increase volume"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Mute and solo are mutually exclusive - turn off solo when muting
              updateTrackState(trackId, { muted: !trackState.muted, solo: false });
            }}
            className={`rounded transition-colors flex-shrink-0 flex items-center justify-center ${
              isEffectivelyMuted
                ? 'bg-red-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            style={{ width: '18px', height: '18px' }}
            title={isEffectivelyMuted && !trackState.muted ? "Muted (another track is soloed)" : "Mute this track"}
          >
            <VolumeX size={12} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Mute and solo are mutually exclusive - turn off mute when soloing
              updateTrackState(trackId, { solo: !trackState.solo, muted: false });
            }}
            className={`rounded transition-colors flex-shrink-0 flex items-center justify-center ${
              trackState.solo
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            style={{ width: '18px', height: '18px' }}
            title="Solo - hear only this track"
          >
            <Headphones size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackHeader;