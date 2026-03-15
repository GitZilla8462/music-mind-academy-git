// Sprite character renderer — strip-based sprites (idle, walk, run PNG strips)
// Supports movement override per section (crawl, walk, run, sprint)

import React, { useMemo } from 'react';
import { getTempoById, getDynamicsById, getMovementById } from './characterAnimations';

const SpriteCharacterRenderer = ({
  sprites,
  frameSize = 32,
  frameHeight,
  displayScale = 1,
  tempo = 'andante',
  dynamics = 'mf',
  movement,
  isPlaying = false,
  isHurt = false,
}) => {
  const fh = frameHeight || frameSize;
  const tempoData = getTempoById(tempo);
  const dynamicsData = getDynamicsById(dynamics);
  const movementData = movement ? getMovementById(movement) : null;
  const characterScale = (0.85 + (dynamicsData.scale - 0.6) * 0.3) * displayScale;

  // Pick animation state — hurt overrides, then movement, then tempo-based
  const animState = useMemo(() => {
    if (isHurt && sprites.hurt) return 'hurt';
    if (!isPlaying) return 'idle';
    if (movementData) return movementData.anim;
    if (tempoData.speed <= 1.5) return 'walk';
    return 'run';
  }, [isPlaying, tempoData.speed, movementData, isHurt, sprites.hurt]);

  const cycleDuration = useMemo(() => {
    if (!isPlaying) return 0.8; // idle speed
    if (movementData) return movementData.cycleDuration;
    const base = 0.6;
    return base / tempoData.speed;
  }, [isPlaying, tempoData.speed, movementData]);

  const strip = sprites[animState] || sprites.walk;
  const targetHeight = 96;
  const scale = targetHeight / fh;
  const displayW = Math.round(frameSize * scale);
  const displayH = Math.round(fh * scale);
  const stripWidth = strip.frames * displayW;
  const animName = `strip-${animState}-${strip.frames}`;

  // Only animate when playing — paused = static first frame
  const shouldAnimate = isPlaying;

  // Hurt flash: 4 red pulses over the hurt duration
  // 4 red flashes over 600ms → each cycle 150ms
  const hurtFlashAnim = isHurt ? 'hurt-flash 0.15s steps(1) infinite' : 'none';

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          from { background-position-x: 0px; }
          to { background-position-x: -${stripWidth}px; }
        }
        @keyframes hurt-flash {
          0%, 49% { filter: brightness(1) sepia(1) saturate(5) hue-rotate(-10deg); }
          50%, 100% { filter: brightness(1) sepia(0) saturate(1) hue-rotate(0deg); }
        }
      `}</style>
      <div
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: `url(${strip.src})`,
          backgroundSize: `${stripWidth}px ${displayH}px`,
          backgroundRepeat: 'no-repeat',
          backgroundPositionX: '0px',
          imageRendering: 'pixelated',
          transform: `scale(${characterScale})`,
          transition: 'transform 0.5s ease',
          animation: [
            shouldAnimate ? `${animName} ${cycleDuration}s steps(${strip.frames}) infinite` : 'none',
            hurtFlashAnim,
          ].filter(a => a !== 'none').join(', ') || 'none',
        }}
      />
    </>
  );
};

export default SpriteCharacterRenderer;
