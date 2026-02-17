// Composes all layers: ParallaxEnvironment (includes sky) -> Weather -> Character -> overlays

import React, { useRef, useCallback } from 'react';
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
}) => {
  const dragRef = useRef(null);

  if (!section || !section.scene) {
    const sectionInfo = section?.label ? `${section.label} Section — ${section.sectionLabel}` : null;
    return (
      <div className="relative w-full h-full bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3">
        <p className="text-white/30 text-4xl">{'\uD83C\uDFAC'}</p>
        {sectionInfo ? (
          <>
            <p className="text-white/50 text-lg font-bold" style={{ color: section.color }}>{sectionInfo}</p>
            <p className="text-white/40 text-base">Drag a scene onto this section in the timeline below</p>
          </>
        ) : (
          <>
            <p className="text-white/40 text-lg font-medium">Add a scene below to start building</p>
            <p className="text-white/25 text-sm">Click or drag a scene from the palette onto the timeline</p>
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

        {/* Character (center-bottom for ground characters, higher for flying) */}
        {character && character.type !== 'none' && (
          <div className="absolute z-10" style={{ bottom: character.flying ? '45%' : '8%', left: '50%', transform: 'translateX(-50%)' }}>
            <SpriteCharacterRenderer
              sprites={character.sprites}
              frameSize={character.frameSize}
              frameHeight={character.frameHeight}
              displayScale={character.displayScale || 1}
              tempo={section.tempo}
              dynamics={section.dynamics}
              movement={section.movement}
              isPlaying={isPlaying}
            />
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
    </div>
  );
};

export default JourneyViewport;
