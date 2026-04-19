// DrumPadGrid.jsx
// 3x3 drum pad grid for the Film Music virtual instrument
// Number keys 1-9 trigger pads, mouse/touch supported
// Professional MPC-style design

import React, { useCallback } from 'react';
import { DRUM_PADS } from './instrumentConfig';

const DrumPadGrid = ({ activePads, onPadHit }) => {
  const handlePointerDown = useCallback((padId, e) => {
    e.preventDefault();
    onPadHit(padId);
  }, [onPadHit]);

  return (
    <div className="flex justify-center select-none" style={{ touchAction: 'none' }}>
      <div className="grid grid-cols-3 gap-1.5 p-1">
        {DRUM_PADS.map((pad) => {
          const isActive = activePads.has(pad.id);
          return (
            <div
              key={pad.id}
              className="relative cursor-pointer"
              style={{ width: 64, height: 64 }}
              onPointerDown={(e) => handlePointerDown(pad.id, e)}
            >
              {/* Pad body */}
              <div
                className="absolute inset-0 rounded-xl flex flex-col items-center justify-center transition-all duration-75"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${pad.color} 0%, ${pad.color}BB 100%)`
                    : `linear-gradient(135deg, ${pad.color}20 0%, ${pad.color}10 100%)`,
                  border: `2px solid ${isActive ? pad.color : pad.color + '60'}`,
                  boxShadow: isActive
                    ? `0 0 20px ${pad.color}50, inset 0 1px 2px rgba(255,255,255,0.1)`
                    : `0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  transform: isActive ? 'scale(0.95)' : 'none',
                }}
              >
                <span className="text-white font-semibold text-xs">{pad.name}</span>
                <span
                  className="text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.8)' : pad.color + 'AA',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
                  }}
                >
                  {pad.key}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DrumPadGrid;
