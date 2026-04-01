// Composes all layers: ParallaxEnvironment (includes sky) -> Weather -> Character -> overlays

import React, { useRef, useCallback, useState, useEffect } from 'react';
import ParallaxEnvironment from './ParallaxEnvironment';
import SpriteCharacterRenderer from './SpriteCharacterRenderer';
import WeatherOverlay from './WeatherOverlay';
import { lastDragEndTime } from './StickerOverlay';

const JourneyViewport = ({
  section,
  character,
  isPlaying,
  midgroundOffset,
  foregroundOffset,
  items = [],
  currentTime = 0,
  onViewportClick,
  editMode,
  isBuildMode,
  marquee,
  onMarqueeChange,
  onMarqueeEnd,
  children,
  // Game mode props
  gameMode = false,
  birdY = 0.35,
  birdX = 0.12,
  onBirdYChange,
  onBirdXChange,
  score = 0,
  collectedIds = new Set(),
  isHurt = false,
}) => {
  const dragRef = useRef(null);

  // Arrow key control for flying characters — always active when bird is present
  const keysRef = useRef(new Set());

  useEffect(() => {
    if (!character?.flying || !onBirdYChange) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const WASD_MAP = { w: 'ArrowUp', s: 'ArrowDown', a: 'ArrowLeft', d: 'ArrowRight',
                         W: 'ArrowUp', S: 'ArrowDown', A: 'ArrowLeft', D: 'ArrowRight' };
      const mapped = WASD_MAP[e.key] || (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) ? e.key : null);
      if (mapped) {
        e.preventDefault();
        keysRef.current.add(mapped);
      }
    };
    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const WASD_MAP = { w: 'ArrowUp', s: 'ArrowDown', a: 'ArrowLeft', d: 'ArrowRight',
                         W: 'ArrowUp', S: 'ArrowDown', A: 'ArrowLeft', D: 'ArrowRight' };
      keysRef.current.delete(WASD_MAP[e.key] || e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysRef.current.clear();
    };
  }, [character?.flying, onBirdYChange]);

  // Smooth RAF movement loop — runs independently of key listeners
  useEffect(() => {
    if (!character?.flying || !onBirdYChange) return;

    const SPEED = 0.006; // normalized units per frame — smooth gliding bird movement
    let lastTime = performance.now();
    let animId;

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3); // normalize to ~60fps, cap at 3x
      lastTime = now;
      const keys = keysRef.current;
      let dy = 0;
      let dx = 0;
      if (keys.has('ArrowUp')) dy -= SPEED * dt;
      if (keys.has('ArrowDown')) dy += SPEED * dt;
      if (keys.has('ArrowLeft')) dx -= SPEED * dt;
      if (keys.has('ArrowRight')) dx += SPEED * dt;
      if (dy !== 0) {
        onBirdYChange(prev => Math.max(0.05, Math.min(0.85, prev + dy)));
      }
      if (dx !== 0 && onBirdXChange) {
        onBirdXChange(prev => Math.max(0.03, Math.min(0.35, prev + dx)));
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [character?.flying, onBirdYChange, onBirdXChange]);

  if (!section || !section.scene) {
    const sectionInfo = section?.label ? `${section.label} Section — ${section.sectionLabel}` : null;
    return (
      <div className="relative w-full h-full bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 px-4">
        <p className="text-white/30 text-2xl sm:text-4xl">{'\uD83C\uDFAC'}</p>
        {sectionInfo ? (
          <>
            <p className="text-white/50 text-sm sm:text-lg font-bold text-center" style={{ color: section.color }}>{sectionInfo}</p>
            <p className="text-white/40 text-xs sm:text-base text-center">Drag a scene onto this section in the timeline below</p>
          </>
        ) : (
          <>
            <p className="text-white/40 text-sm sm:text-lg font-medium text-center">Add a scene below to start building</p>
            <p className="text-white/25 text-xs sm:text-sm text-center">Click or drag a scene from the palette onto the timeline</p>
          </>
        )}
      </div>
    );
  }

  const handleClick = (e) => {
    if (!onViewportClick) return;
    // Suppress click if a sticker drag/resize just ended (prevents accidental placement)
    if (Date.now() - lastDragEndTime < 200) return;
    // Suppress click if marquee just finished (prevents placement after drag-select)
    if (dragRef.current?.wasMarquee) {
      dragRef.current.wasMarquee = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onViewportClick({ x, y });
  };

  const handleMouseDown = (e) => {
    if (!isBuildMode || !onMarqueeChange) return;
    // Only start marquee on left-click on the viewport itself (not on stickers)
    if (e.button !== 0) return;
    if (e.target.closest('.z-30')) return; // clicked on a sticker

    const vpEl = e.currentTarget;
    const rect = vpEl.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / rect.width;
    const startY = (e.clientY - rect.top) / rect.height;

    let dragged = false;

    const onMove = (me) => {
      const cx = (me.clientX - rect.left) / rect.width;
      const cy = (me.clientY - rect.top) / rect.height;
      if (!dragged && (Math.abs(me.clientX - e.clientX) + Math.abs(me.clientY - e.clientY)) > 5) {
        dragged = true;
      }
      if (dragged) {
        onMarqueeChange({ startX, startY, endX: cx, endY: cy });
      }
    };

    const onUp = (me) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragged) {
        const cx = (me.clientX - rect.left) / rect.width;
        const cy = (me.clientY - rect.top) / rect.height;
        if (onMarqueeEnd) onMarqueeEnd({ startX, startY, endX: cx, endY: cy });
        onMarqueeChange(null);
        // Flag so the subsequent click event is suppressed
        dragRef.current = { wasMarquee: true };
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Marquee rectangle rendering
  const marqueeStyle = marquee ? (() => {
    const left = Math.min(marquee.startX, marquee.endX) * 100;
    const top = Math.min(marquee.startY, marquee.endY) * 100;
    const width = Math.abs(marquee.endX - marquee.startX) * 100;
    const height = Math.abs(marquee.endY - marquee.startY) * 100;
    return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
  })() : null;

  return (
    <div
      data-viewport="true"
      className={`relative w-full h-full rounded-2xl ${
        editMode === 'sticker' || editMode === 'text' ? 'cursor-crosshair' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Scene container — overflow-hidden clips environment/character to viewport */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {/* All visual layers (sky + parallax) */}
        <ParallaxEnvironment
          sceneId={section.scene}
          midgroundOffset={midgroundOffset}
        />

        {/* Weather + night mode overlay */}
        <WeatherOverlay
          weather={section.weather || 'none'}
          nightMode={section.nightMode || false}
        />

        {/* Character — flying birds on left side (arrow-key controlled), ground characters centered */}
        {character && character.type !== 'none' && (
          <div
            className="absolute z-10"
            style={character.flying
              ? { top: `${birdY * 100}%`, left: `${birdX * 100}%`, willChange: 'top, left' }
              : { bottom: '8%', left: '50%', transform: 'translateX(-50%)' }
            }
          >
            <div className="scale-[0.7] sm:scale-[0.85] lg:scale-100 origin-bottom">
              <SpriteCharacterRenderer
                sprites={character.sprites}
                frameSize={character.frameSize}
                frameHeight={character.frameHeight}
                displayScale={character.displayScale || 1}
                tempo={section.tempo}
                dynamics={character.flying ? 'mf' : section.dynamics}
                movement="walk"
                isPlaying={character.flying ? true : isPlaying}
                isHurt={isHurt}
              />
            </div>
          </div>
        )}

      </div>

      {/* Sticker layer — clipped to viewport so stickers don't overlap sidebar/guide */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {children}
      </div>

      {/* Marquee selection rectangle */}
      {marqueeStyle && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-400/15 rounded-sm pointer-events-none z-40"
          style={marqueeStyle}
        />
      )}

      {/* Game mode score overlay */}
      {gameMode && (
        <div className="absolute top-3 right-3 z-50 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
            <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Score</div>
            <div className={`text-2xl font-black tabular-nums ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {score}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JourneyViewport;
