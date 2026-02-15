// CSS-based weather particle effects for the Listening Journey viewport
// Renders rain, snow, or wind particles as an animated overlay
// Lightweight — uses CSS animations, no canvas needed

import React, { useMemo } from 'react';

const PARTICLE_COUNT = { rain: 120, snow: 50, wind: 40 };

const WeatherOverlay = ({ weather, nightMode = false }) => {
  if (!weather || weather === 'none') {
    return nightMode ? <div className="absolute inset-0 bg-black/40 pointer-events-none z-[5] transition-colors duration-700" /> : null;
  }

  // Generate stable random particles (memoized so they don't re-randomize each render)
  const particles = useMemo(() => {
    const count = PARTICLE_COUNT[weather] || 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: weather === 'snow' ? 4 + Math.random() * 4 : weather === 'rain' ? 0.6 + Math.random() * 0.4 : 1.5 + Math.random() * 1.5,
      size: weather === 'snow' ? 3 + Math.random() * 5 : weather === 'rain' ? 1.5 + Math.random() * 2 : 2 + Math.random() * 2,
      opacity: weather === 'rain' ? 0.5 + Math.random() * 0.4 : 0.3 + Math.random() * 0.5,
      drift: weather === 'snow' ? -15 + Math.random() * 30 : weather === 'wind' ? 40 + Math.random() * 30 : 0,
    }));
  }, [weather]);

  return (
    <>
      {/* Night overlay */}
      {nightMode && <div className="absolute inset-0 bg-black/40 pointer-events-none z-[5] transition-colors duration-700" />}

      {/* Weather particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[6]">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute ${weather === 'rain' ? 'weather-rain' : weather === 'snow' ? 'weather-snow' : 'weather-wind'}`}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: p.opacity,
              '--drift': `${p.drift}px`,
              '--size': `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Inline styles for weather animations */}
      <style>{`
        .weather-rain {
          width: var(--size);
          height: 24px;
          background: linear-gradient(to bottom, transparent, rgba(174,194,224,0.95));
          border-radius: 0 0 2px 2px;
          top: -30px;
          animation: rain-fall linear infinite;
        }
        .weather-snow {
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.2));
          border-radius: 50%;
          top: -10px;
          animation: snow-fall linear infinite;
        }
        .weather-wind {
          width: 20px;
          height: var(--size);
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          border-radius: 4px;
          top: -10px;
          animation: wind-blow linear infinite;
        }
        @keyframes rain-fall {
          0% { transform: translateY(-20px) translateX(0); }
          100% { transform: translateY(calc(100vh + 20px)) translateX(var(--drift)); }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-10px) translateX(0); }
          50% { transform: translateY(50vh) translateX(var(--drift)); }
          100% { transform: translateY(calc(100vh + 10px)) translateX(calc(var(--drift) * -0.5)); }
        }
        @keyframes wind-blow {
          0% { transform: translateY(0) translateX(-40px); opacity: 0; }
          20% { opacity: var(--opacity, 0.4); }
          80% { opacity: var(--opacity, 0.4); }
          100% { transform: translateY(30px) translateX(calc(100vw + 40px)); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default WeatherOverlay;
