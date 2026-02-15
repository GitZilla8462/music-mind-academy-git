// Foreground ground strip — bottom 12%, scrolls at 1.0x speed
// Layered: top edge highlight, dirt band, textured surface, grass tufts (for grass type)

import React, { useMemo } from 'react';
import { getGroundTypeById } from './config/groundTypes';

// Seeded deterministic grass tufts / ground details
const generateDetails = (groundId, count) => {
  let seed = 77777;
  const details = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = ((seed - 1) / 2147483646) * 100;
    seed = (seed * 16807) % 2147483647;
    const h = 4 + ((seed - 1) / 2147483646) * 10;
    seed = (seed * 16807) % 2147483647;
    const lean = -8 + ((seed - 1) / 2147483646) * 16;
    details.push({ x, h, lean });
  }
  return details;
};

const GroundLayer = ({ groundId, foregroundOffset = 0 }) => {
  const ground = getGroundTypeById(groundId);
  const translateX = -(foregroundOffset % 1.0) * 33.333;

  const showTufts = groundId === 'grass' || groundId === 'sand';
  const tufts = useMemo(() => showTufts ? generateDetails(groundId, 60) : [], [groundId, showTufts]);

  const tuftColor = groundId === 'grass' ? '#4A8C3F' : '#B8962E';

  return (
    <div className="absolute bottom-0 left-0 right-0" style={{ height: '12%' }}>
      {/* Top edge — bright highlight line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-10"
        style={{ backgroundColor: ground.topEdge, transition: 'background-color 1.5s ease' }}
      />

      {/* Dirt/substrate band (top 30%) — slightly lighter */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '30%',
          width: '300%',
          willChange: 'transform',
          transform: `translateX(${translateX}%)`,
          backgroundColor: ground.topEdge,
          opacity: 0.5,
          transition: 'background-color 1.5s ease',
        }}
      />

      {/* Main scrolling ground surface */}
      <div
        className="absolute inset-0"
        style={{
          width: '300%',
          willChange: 'transform',
          transform: `translateX(${translateX}%)`,
          background: ground.texture,
          backgroundColor: ground.background,
          transition: 'background-color 1.5s ease',
        }}
      />

      {/* Grass tufts / sand wisps on top */}
      {showTufts && (
        <div
          className="absolute top-0 left-0 right-0 overflow-hidden"
          style={{
            height: '50%',
            width: '300%',
            willChange: 'transform',
            transform: `translateX(${translateX}%) translateY(-60%)`,
          }}
        >
          {/* Render 3 copies for seamless loop */}
          {[0, 1, 2].map(copy => (
            <div key={copy} className="absolute top-0 h-full" style={{ width: '33.333%', left: `${copy * 33.333}%` }}>
              {tufts.map((t, i) => (
                <div
                  key={i}
                  className="absolute bottom-0"
                  style={{
                    left: `${t.x}%`,
                    width: '2px',
                    height: `${t.h}px`,
                    backgroundColor: tuftColor,
                    transform: `rotate(${t.lean}deg)`,
                    transformOrigin: 'bottom center',
                    borderRadius: '1px 1px 0 0',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroundLayer;
