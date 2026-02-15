// Composes all layers: ParallaxEnvironment (includes sky) -> Weather -> Character -> overlays
// For image-based environments, ParallaxEnvironment handles everything (sky + layers)

import React from 'react';
import ParallaxEnvironment from './ParallaxEnvironment';
import SpriteCharacterRenderer from './SpriteCharacterRenderer';
import WeatherOverlay from './WeatherOverlay';

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
  children,
}) => {
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onViewportClick({ x, y });
  };

  return (
    <div
      data-viewport="true"
      className={`relative w-full h-full rounded-2xl ${
        editMode === 'sticker' || editMode === 'text' ? 'cursor-crosshair' : ''
      }`}
      onClick={handleClick}
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
    </div>
  );
};

export default JourneyViewport;
