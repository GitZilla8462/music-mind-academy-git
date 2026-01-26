// File: /src/pages/projects/film-music-score/timeline/components/TrackHeader.jsx
// FIXED: Changed width from w-40 to w-48 to eliminate gap
// UPDATED: Added fade button with popup for track-level fade in/out

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Headphones, TrendingDown } from 'lucide-react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';
import TrackFadePopup from './TrackFadePopup';

const TrackHeader = ({
  trackIndex,
  trackStates,
  updateTrackState,
  placedLoops,
  hoveredTrack,
  onTrackHeaderClick,
  tutorialMode = false
}) => {
  const [showFadePopup, setShowFadePopup] = useState(false);
  const fadeButtonRef = useRef(null);
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

          {/* Volume icon + bars - 5 segments for 20%, 40%, 60%, 80%, 100% */}
          <div className="flex items-center gap-1 flex-1" title={`Volume: ${Math.round((trackState.volume || 0.7) * 100)}%`}>
            <Volume2 size={12} className="text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-0.5 flex-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => {
              const currentVolume = trackState.volume ?? 0.7;
              const isFilled = currentVolume >= level - 0.1;
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrackState(trackId, { volume: level });
                  }}
                  className={`flex-1 h-3 rounded-sm ${
                    isFilled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  style={{ minWidth: '8px' }}
                  title={`Set volume to ${level * 100}%`}
                />
              );
            })}
            </div>
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

          {/* Fade button */}
          <button
            ref={fadeButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              // Only open, don't toggle - let clicking outside close it
              if (!showFadePopup) {
                setShowFadePopup(true);
              }
            }}
            className={`rounded transition-colors flex-shrink-0 flex items-center justify-center ${
              (trackState.fadeIn > 0 || trackState.fadeOut > 0)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            style={{ width: '18px', height: '18px' }}
            title="Fade in/out settings"
          >
            <TrendingDown size={12} />
          </button>
        </div>
      </div>

      {/* Fade popup */}
      {showFadePopup && fadeButtonRef.current && (() => {
        const buttonRect = fadeButtonRef.current.getBoundingClientRect();
        const popupHeight = 180; // Approximate popup height
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Show above if not enough room below, otherwise show below
        const showAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow;

        return (
          <TrackFadePopup
            trackId={trackId}
            trackState={trackState}
            onUpdate={updateTrackState}
            onClose={() => setShowFadePopup(false)}
            position={{
              x: buttonRect.left,
              y: showAbove ? buttonRect.top - popupHeight - 5 : buttonRect.bottom + 5
            }}
          />
        );
      })()}
    </div>
  );
};

export default TrackHeader;