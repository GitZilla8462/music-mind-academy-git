// /timeline/components/TrackHeader.jsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const TrackHeader = ({ 
  trackIndex, 
  trackStates, 
  updateTrackState, 
  placedLoops, 
  hoveredTrack 
}) => {
  const trackId = `track-${trackIndex}`;
  const trackState = trackStates[trackId] || {};
  const hasLoops = placedLoops.some(loop => loop.trackIndex === trackIndex);

  return (
    <div 
      className={`w-48 bg-gray-800 border-r border-gray-600 border-b border-gray-700 ${
        hoveredTrack === trackIndex ? 'bg-gray-700' : ''
      } ${hasLoops ? 'ring-1 ring-blue-500/30' : ''}`}
      style={{ height: TIMELINE_CONSTANTS.TRACK_HEIGHT }}
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 flex-1">
            <span className="text-white text-xs font-medium w-12">
              {trackState.name || `Track ${trackIndex + 1}`}
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
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
                onClick={() => {
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

          <button
            onClick={() => updateTrackState(trackId, { visible: !trackState.visible })}
            className={`p-0.5 rounded transition-colors ${
              trackState.visible ? 'text-gray-400 hover:text-white' : 'text-red-400'
            }`}
            title={trackState.visible ? 'Hide' : 'Show'}
          >
            {trackState.visible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => updateTrackState(trackId, { muted: !trackState.muted })}
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
            onClick={() => updateTrackState(trackId, { solo: !trackState.solo })}
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