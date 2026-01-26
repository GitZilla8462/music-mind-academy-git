// FadeControlsPopup.jsx - Simple popup for fade in/out controls when a loop is selected
// Shows two sliders: Fade In and Fade Out duration (0-3 seconds)

import React, { useCallback } from 'react';
import { X } from 'lucide-react';

const FadeControlsPopup = ({
  loop,
  onUpdate,
  onClose,
  position // { x, y } screen coordinates
}) => {
  if (!loop) return null;

  const fadeIn = loop.fadeIn || 0;
  const fadeOut = loop.fadeOut || 0;

  const handleFadeInChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    onUpdate(loop.id, { fadeIn: value });
  }, [loop.id, onUpdate]);

  const handleFadeOutChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    onUpdate(loop.id, { fadeOut: value });
  }, [loop.id, onUpdate]);

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds === 0) return 'Off';
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3"
      style={{
        left: position?.x || 100,
        top: position?.y || 100,
        minWidth: '200px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white truncate pr-2" style={{ maxWidth: '150px' }}>
          {loop.name}
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Fade In Control */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Fade In</label>
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
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Fade Out</label>
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
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="flex gap-1">
          <button
            onClick={() => {
              onUpdate(loop.id, { fadeIn: 0, fadeOut: 0 });
            }}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            None
          </button>
          <button
            onClick={() => {
              onUpdate(loop.id, { fadeIn: 0.5, fadeOut: 0.5 });
            }}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            Soft
          </button>
          <button
            onClick={() => {
              onUpdate(loop.id, { fadeIn: 1.5, fadeOut: 1.5 });
            }}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            Smooth
          </button>
        </div>
      </div>
    </div>
  );
};

export default FadeControlsPopup;
