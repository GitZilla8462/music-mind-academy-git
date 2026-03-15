// Parallax environment — image layers that scroll at different speeds
// Each layer is a PNG strip rendered 3x wide for seamless tiling
// Sky-pack layers use CSS background-image tiling for proper height scaling

import React from 'react';
import { getEnvironmentById } from './config/environments';

const ParallaxEnvironment = ({ sceneId, midgroundOffset = 0 }) => {
  const env = getEnvironmentById(sceneId);

  // Plain color background — no layers or sky image
  if (env.type === 'color') {
    return (
      <div className="absolute inset-0" style={{ backgroundColor: env.backgroundColor }} />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky image — static, fills viewport */}
      {env.sky && (
        <img
          src={env.sky}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* Scrolling parallax layers */}
      {env.layers.map((layer, idx) => {
        const translateX = -((midgroundOffset * layer.speed) % 1.0) * 33.333;

        // Sky-pack layers: use CSS background tiling for seamless height scaling
        if (layer.bgTile) {
          return (
            <div
              key={idx}
              className="absolute inset-0"
              style={{
                width: '300%',
                willChange: 'transform',
                transform: `translateX(${translateX}%)`,
                backgroundImage: `url(${layer.src})`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 70%',
                backgroundPosition: 'bottom',
              }}
            />
          );
        }

        // Original layers: 3x image copies for tiling
        return (
          <div
            key={idx}
            className="absolute inset-0"
            style={{
              width: '300%',
              willChange: 'transform',
              transform: `translateX(${translateX}%)`,
            }}
          >
            {[0, 1, 2].map((copyIdx) => (
              <img
                key={copyIdx}
                src={layer.src}
                alt=""
                className="absolute"
                style={{
                  width: '33.334%',
                  left: `${copyIdx * 33.333}%`,
                  bottom: layer.bottom || '0',
                  ...(layer.fit ? { maxHeight: '100%', objectFit: 'contain', objectPosition: 'bottom' } : {}),
                }}
                draggable={false}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ParallaxEnvironment;
