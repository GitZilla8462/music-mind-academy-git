// TrackFadePopup.jsx - Popup for track-level fade in/out controls
// Appears when clicking the fade button in the track header

import React, { useCallback, useEffect, useRef } from 'react';

const TrackFadePopup = ({
  trackId,
  trackState,
  onUpdate,
  onClose,
  position // { x, y } screen coordinates
}) => {
  const popupRef = useRef(null);

  const fadeIn = trackState?.fadeIn || 0;
  const fadeOut = trackState?.fadeOut || 0;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Delay adding listener to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleFadeInChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    onUpdate(trackId, { fadeIn: value });
  }, [trackId, onUpdate]);

  const handleFadeOutChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    onUpdate(trackId, { fadeOut: value });
  }, [trackId, onUpdate]);

  const applyPreset = useCallback((fadeInVal, fadeOutVal) => {
    onUpdate(trackId, { fadeIn: fadeInVal, fadeOut: fadeOutVal });
  }, [trackId, onUpdate]);

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds === 0) return 'Off';
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3"
      style={{
        left: position?.x || 100,
        top: position?.y || 100,
        minWidth: '180px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="text-xs font-medium text-gray-400 mb-2">
        Track Fades
      </div>

      {/* Fade In Control */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-300">Fade In</label>
          <span className="text-xs text-blue-400 font-mono">{formatTime(fadeIn)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={fadeIn}
          onChange={handleFadeInChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Fade Out Control */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-300">Fade Out</label>
          <span className="text-xs text-blue-400 font-mono">{formatTime(fadeOut)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={fadeOut}
          onChange={handleFadeOutChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Quick preset buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => applyPreset(0, 0)}
          className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
            fadeIn === 0 && fadeOut === 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          None
        </button>
        <button
          onClick={() => applyPreset(0.5, 0.5)}
          className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
            fadeIn === 0.5 && fadeOut === 0.5
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          Soft
        </button>
        <button
          onClick={() => applyPreset(1.5, 1.5)}
          className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
            fadeIn === 1.5 && fadeOut === 1.5
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          Smooth
        </button>
      </div>
    </div>
  );
};

export default TrackFadePopup;
