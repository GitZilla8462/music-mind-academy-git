// Sky layer — CSS gradient background with 1.5s transitions + star particles for Night/Cosmic/Aurora
// Does NOT scroll; transitions when section changes

import React, { useMemo } from 'react';
import { getSkyMoodById } from './config/skyMoods';

const STAR_COUNT = 40;

const StarParticles = () => {
  const stars = useMemo(() => {
    const result = [];
    // Deterministic positions for consistent rendering
    let seed = 12345;
    for (let i = 0; i < STAR_COUNT; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = ((seed - 1) / 2147483646) * 100;
      seed = (seed * 16807) % 2147483647;
      const y = ((seed - 1) / 2147483646) * 60; // top 60% only
      seed = (seed * 16807) % 2147483647;
      const size = 1 + ((seed - 1) / 2147483646) * 2;
      seed = (seed * 16807) % 2147483647;
      const delay = ((seed - 1) / 2147483646) * 4;
      seed = (seed * 16807) % 2147483647;
      const duration = 2 + ((seed - 1) / 2147483646) * 3;
      result.push({ x, y, size, delay, duration });
    }
    return result;
  }, []);

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
};

const SkyLayer = ({ skyId, dynamics = 'mf' }) => {
  const sky = getSkyMoodById(skyId);

  const brightnessFilter = {
    pp: 'brightness(0.5)',
    p: 'brightness(0.7)',
    mp: 'brightness(0.85)',
    mf: 'brightness(1)',
    f: 'brightness(1.15)',
    ff: 'brightness(1.3)'
  };

  return (
    <div
      className="absolute inset-0"
      style={{
        background: sky.gradient,
        filter: brightnessFilter[dynamics] || 'brightness(1)',
        transition: 'background 1.5s ease, filter 0.5s ease',
      }}
    >
      {sky.hasStars && <StarParticles />}
    </div>
  );
};

export default SkyLayer;
