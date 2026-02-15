// Parallax scroll position — derived from currentTime + section tempos
// Computes deterministic offset so scrubbing/seeking moves the parallax correctly
// During playback, currentTime updates via rAF so animation stays smooth

import { useMemo } from 'react';
import { getTempoById } from '../characterAnimations';

// Base rate: copies-per-second at speed=1.0 (andante)
const BASE_RATE = 0.15;

// Scroll speed is tempo-only — movement affects character animation, not parallax
const getSectionScrollSpeed = (section) => {
  return getTempoById(section.tempo).speed;
};

// Compute raw midground scroll offset at a given time (non-hook, callable anywhere)
export const getScrollOffsetAtTime = (time, sections) => {
  if (!sections || sections.length === 0) return 0;
  let totalOffset = 0;
  for (const section of sections) {
    if (time <= section.startTime) break;
    const elapsed = Math.min(time, section.endTime) - section.startTime;
    const speed = getSectionScrollSpeed(section);
    totalOffset += BASE_RATE * speed * elapsed;
  }
  return totalOffset * 0.5;
};

const useParallaxScroll = (currentTime, sections) => {
  return useMemo(() => {
    if (!sections || sections.length === 0) {
      return { midgroundOffset: 0, foregroundOffset: 0, rawMidgroundOffset: 0 };
    }

    const mid = getScrollOffsetAtTime(currentTime, sections);

    return {
      midgroundOffset: mid,        // raw value — each layer modulos independently
      foregroundOffset: mid * 2.0, // not currently used in rendering
      rawMidgroundOffset: mid,
    };
  }, [currentTime, sections]);
};

export default useParallaxScroll;
