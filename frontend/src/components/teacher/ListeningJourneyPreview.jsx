// Listening Journey Preview — read-only present-mode view of student work
// Used in ActivityGradingView to show the full animated scene + essay
// Dynamically imported to avoid bundling LJ components with ClassDetailPage

import React, { useRef, useMemo } from 'react';
import JourneyViewport from '../../lessons/shared/activities/listening-journey/JourneyViewport';
import StickerOverlay from '../../lessons/shared/activities/listening-journey/StickerOverlay';
import DrawingOverlay from '../../lessons/shared/activities/listening-journey/DrawingOverlay';
import EssayPanel from '../../lessons/shared/activities/listening-journey/EssayPanel';
import JourneyTimeline from '../../lessons/shared/activities/listening-journey/JourneyTimeline';
import useJourneyPlayback from '../../lessons/shared/activities/listening-journey/hooks/useJourneyPlayback';
import useParallaxScroll from '../../lessons/shared/activities/listening-journey/hooks/useParallaxScroll';

// Map lessonId → audio config
const AUDIO_CONFIG = {
  'll-lesson1': { audioPath: '/audio/classical/vivaldi-spring.mp3', volume: 1.0, title: 'Spring — Vivaldi' },
  'll-lesson2': { audioPath: '/audio/classical/brahms-hungarian-dance-5.mp3', volume: 1.0, title: 'Hungarian Dance No. 5 — Brahms' },
  'll-lesson3': { audioPath: '/audio/classical/grieg-mountain-king.mp3', volume: 0.5, title: 'In the Hall of the Mountain King — Grieg' },
  'll-lesson4': { audioPath: '/audio/classical/grieg-mountain-king.mp3', volume: 0.5, title: 'Capstone Piece' },
  'll-lesson5': { audioPath: '/audio/classical/grieg-mountain-king.mp3', volume: 0.5, title: 'Capstone Piece' },
};
const DEFAULT_AUDIO = { audioPath: '/audio/classical/brahms-hungarian-dance-5.mp3', volume: 1.0, title: 'Listening Journey' };

const EMPTY_SET = new Set();
const noop = () => {};

const ListeningJourneyPreview = ({ workData, submittedAt }) => {
  const drawingRef = useRef(null);
  const {
    sections = [],
    character = null,
    items = [],
    guideData = {},
    essayData,
    drawingData
  } = workData.data || {};

  // Prefer audio metadata saved in work data (supports L4/L5 capstone pieces),
  // fall back to lessonId map for older saves
  const audioConfig = useMemo(() => {
    if (workData.data?.audioPath) {
      return {
        audioPath: workData.data.audioPath,
        volume: workData.data.audioVolume || 1.0,
        title: workData.data.pieceTitle || 'Listening Journey'
      };
    }
    return AUDIO_CONFIG[workData.lessonId] || DEFAULT_AUDIO;
  }, [workData]);
  const totalDuration = useMemo(
    () => sections.length > 0 ? sections[sections.length - 1].endTime : 173,
    [sections]
  );

  const {
    isPlaying, currentTime, currentSection,
    togglePlay, seekTo, rewind
  } = useJourneyPlayback(audioConfig.audioPath, totalDuration, sections, audioConfig.volume);

  const { midgroundOffset, rawMidgroundOffset } = useParallaxScroll(currentTime, sections);

  const activeSection = currentSection || sections[0];

  if (!activeSection) return null;

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      {/* Viewport + Essay */}
      <div className="flex-1 flex min-h-0">
        {/* Viewport */}
        <div className="flex-1 p-2 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <JourneyViewport
              section={activeSection}
              character={character}
              isPlaying={isPlaying}
              midgroundOffset={midgroundOffset}
              foregroundOffset={midgroundOffset * 2}
              items={items}
              currentTime={currentTime}
              editMode="select"
              isBuildMode={false}
              marquee={null}
              onMarqueeChange={noop}
              onMarqueeEnd={noop}
            >
              <DrawingOverlay
                ref={drawingRef}
                isActive={false}
                tool="brush"
                color="#ffffff"
                brushSize={8}
                initialData={drawingData}
              />
              <StickerOverlay
                items={items}
                currentTime={currentTime}
                isPlaying={isPlaying}
                editMode="select"
                rawScrollOffset={rawMidgroundOffset}
                selectedItemIds={EMPTY_SET}
                isBuildMode={false}
              />
            </JourneyViewport>
          </div>
        </div>

        {/* Essay panel */}
        <EssayPanel
          sections={sections}
          guideData={guideData}
          pieceTitle={audioConfig.title}
          character={character}
          items={items}
        />
      </div>

      {/* Timeline */}
      <JourneyTimeline
        sections={sections}
        items={items}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
        onRewind={rewind}
        onOpenPicker={noop}
        onAddScene={noop}
        onRemoveSection={null}
        onResizeBoundary={null}
        onExtendLastEdge={null}
        onUpdateItem={noop}
        onRemoveItem={noop}
        presetMode={false}
        hideScenes={true}
      />
    </div>
  );
};

export default ListeningJourneyPreview;
