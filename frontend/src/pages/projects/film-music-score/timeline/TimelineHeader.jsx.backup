import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { TIMELINE_CONSTANTS } from './constants/timelineConstants';

const TimelineHeader = ({ placedLoops, localZoom, onZoomChange, duration }) => {
  const zoomPresets = useMemo(() => [
    { label: 'Fit', value: 0.5 },
    { label: '50%', value: 0.5 },
    { label: '100%', value: 1.0 },
    { label: '200%', value: 2.0 },
    { label: '400%', value: 4.0 }
  ], []);

  return (
    <div className="bg-gray-800 p-3 border-b border-gray-700 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-semibold">Timeline</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Activity size={14} />
            <span>{placedLoops.length} loops</span>
            <span>•</span>
            <span>Zoom: {Math.round(localZoom * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1">
            <button
              onClick={() => onZoomChange(Math.max(0.25, localZoom * 0.8))}
              className="text-white hover:text-blue-400 transition-colors"
              title="Zoom out"
            >
              <span className="text-lg font-bold">−</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 w-8">25%</span>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={localZoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((localZoom - 0.25) / (4.0 - 0.25)) * 100}%, #4b5563 ${((localZoom - 0.25) / (4.0 - 0.25)) * 100}%, #4b5563 100%)`
                }}
                title={`Zoom: ${Math.round(localZoom * 100)}%`}
              />
              <span className="text-xs text-gray-400 w-10">400%</span>
            </div>
            
            <button
              onClick={() => onZoomChange(Math.min(4.0, localZoom * 1.25))}
              className="text-white hover:text-blue-400 transition-colors"
              title="Zoom in"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            {zoomPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => onZoomChange(preset.value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  Math.abs(localZoom - preset.value) < 0.05
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={`Zoom to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineHeader;