// File: /src/pages/projects/film-music-score/timeline/components/LoopBlock.jsx
// REFACTORED: Pure visual component - NO mouse event handlers
// All interaction is handled by InteractionOverlay
// This eliminates cursor flickering on Chromebooks
// CHROMEBOOK OPTIMIZED: Waveforms removed for better performance on low-end devices

import React, { useEffect, useRef, useMemo } from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const LoopBlock = React.memo(({
  loop,
  timeToPixel,
  trackStates,
  selectedLoop,
  draggedLoop,
  isMultiSelected = false,
  // Visual-only props - no callbacks for mouse events
}) => {
  const originalDurationRef = useRef(null);

  // Track original duration on first render
  useEffect(() => {
    if (originalDurationRef.current === null && loop.duration > 0) {
      originalDurationRef.current = loop.duration;
    }
  }, [loop.duration]);

  const isSelected = selectedLoop === loop.id || isMultiSelected;
  const isDragged = draggedLoop?.id === loop.id;
  const trackState = trackStates[`track-${loop.trackIndex}`];

  // Calculate positions and dimensions
  const { leftPosition, width, topPosition } = useMemo(() => ({
    leftPosition: timeToPixel(loop.startTime),
    width: Math.max(1, timeToPixel(loop.endTime) - timeToPixel(loop.startTime)),
    topPosition: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT)
  }), [timeToPixel, loop.startTime, loop.endTime, loop.trackIndex]);

  const loopColor = loop.color || TIMELINE_CONSTANTS.CATEGORY_COLORS[loop.category]?.accent || '#3b82f6';

  const categoryColor = useMemo(() => {
    if (loop.color) {
      return {
        bg: loop.color + '33',
        accent: loop.color,
        text: '#ffffff'
      };
    }
    return TIMELINE_CONSTANTS.CATEGORY_COLORS[loop.category] || TIMELINE_CONSTANTS.CATEGORY_COLORS.Default;
  }, [loop.color, loop.category]);

  // Block height calculation
  const blockHeight = TIMELINE_CONSTANTS.TRACK_HEIGHT - 4;
  const cornerRadius = 4;

  // ============================================================================
  // RENDER - Pure visual, NO event handlers
  // ============================================================================

  return (
    <div
      className="loop-block absolute"
      data-loop-id={loop.id}
      data-track-index={loop.trackIndex}
      data-start-time={loop.startTime}
      data-end-time={loop.endTime}
      style={{
        // CHROMEBOOK OPTIMIZED: Use transform for positioning during drag (GPU-accelerated)
        // This moves composition to GPU instead of triggering layout/paint
        left: isDragged ? 0 : leftPosition,
        top: isDragged ? 0 : (topPosition + 2),
        width: width,
        height: blockHeight,
        backgroundColor: loopColor + '60',
        borderRadius: `${cornerRadius}px`,
        opacity: trackState?.muted ? 0.4 : (isDragged ? 0.8 : 1),
        // GPU-accelerated transform - use translate3d during drag for smooth movement
        transform: isDragged
          ? `translate3d(${leftPosition}px, ${topPosition + 2}px, 0) scale(1.02)`
          : 'scale(1)',
        // Tell browser to prepare GPU layer when dragging
        willChange: isDragged ? 'transform' : 'auto',
        // Disable transitions during drag for immediate response
        transition: isDragged ? 'none' : 'box-shadow 0.15s ease',
        boxShadow: isSelected
          ? '0 0 0 2px #60a5fa, 0 4px 12px rgba(96, 165, 250, 0.3)'
          : isDragged
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: isDragged ? 100 : (isSelected ? 30 : 20),
        // CRITICAL: No pointer events - overlay handles everything
        pointerEvents: 'none',
        // CHROMEBOOK FIX: Prevent cursor inheritance issues
        cursor: 'inherit',
        // Additional GPU hints for Chromebook
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* SVG Border with notches */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${blockHeight}`}
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none', cursor: 'inherit' }}
      >
        <path
          d={(() => {
            const notchSize = 4;
            const originalDuration = originalDurationRef.current || loop.duration;
            const currentDuration = loop.endTime - loop.startTime;
            const startOffset = loop.startOffset || 0;

            const totalOriginalDuration = currentDuration + startOffset;
            const fullLoopsForNotches = Math.floor(totalOriginalDuration / originalDuration);

            const notchPositions = [];
            for (let i = 1; i <= fullLoopsForNotches; i++) {
              const markerTimeInOriginal = i * originalDuration;
              if (markerTimeInOriginal > startOffset) {
                const markerTimeInVisible = markerTimeInOriginal - startOffset;
                if (markerTimeInVisible < currentDuration) {
                  const x = (markerTimeInVisible / currentDuration) * width;
                  notchPositions.push(x);
                }
              }
            }

            let pathData = `M ${cornerRadius},0`;

            for (const x of notchPositions) {
              pathData += ` L ${x - notchSize},0`;
              pathData += ` L ${x},${notchSize}`;
              pathData += ` L ${x + notchSize},0`;
            }

            pathData += ` L ${width - cornerRadius},0`;
            pathData += ` Q ${width},0 ${width},${cornerRadius}`;
            pathData += ` L ${width},${blockHeight - cornerRadius}`;
            pathData += ` Q ${width},${blockHeight} ${width - cornerRadius},${blockHeight}`;

            for (let i = notchPositions.length - 1; i >= 0; i--) {
              const x = notchPositions[i];
              pathData += ` L ${x + notchSize},${blockHeight}`;
              pathData += ` L ${x},${blockHeight - notchSize}`;
              pathData += ` L ${x - notchSize},${blockHeight}`;
            }

            pathData += ` L ${cornerRadius},${blockHeight}`;
            pathData += ` Q 0,${blockHeight} 0,${blockHeight - cornerRadius}`;
            pathData += ` L 0,${cornerRadius}`;
            pathData += ` Q 0,0 ${cornerRadius},0 Z`;

            return pathData;
          })()}
          fill="none"
          stroke={(() => {
            const hex = loopColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            if (isSelected) return '#60a5fa';
            return brightness > 128 ? '#00000080' : '#ffffff80';
          })()}
          strokeWidth={isSelected ? "2" : "1.5"}
          opacity={isSelected ? "1" : "0.8"}
        />
      </svg>

      {/* Separator lines for loop repeats */}
      {(() => {
        const originalDuration = originalDurationRef.current || loop.duration;
        const currentDuration = loop.endTime - loop.startTime;
        const startOffset = loop.startOffset || 0;

        const totalOriginalDuration = currentDuration + startOffset;
        const fullLoops = Math.floor(totalOriginalDuration / originalDuration);

        const markers = [];
        for (let i = 1; i <= fullLoops; i++) {
          const markerTimeInOriginal = i * originalDuration;
          if (markerTimeInOriginal > startOffset) {
            const markerTimeInVisible = markerTimeInOriginal - startOffset;
            if (markerTimeInVisible < currentDuration) {
              markers.push(markerTimeInVisible);
            }
          }
        }

        if (markers.length === 0) return null;

        return markers.map((markerTime, i) => {
          const x = (markerTime / currentDuration) * width;

          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${x}px`,
                top: '2px',
                bottom: '2px',
                width: '3px',
                transform: 'translateX(-1.5px)',
                backgroundColor: '#ffffff',
                opacity: 0.7,
                boxShadow: '0 0 6px #ffffff, 0 0 2px #ffffff',
                borderRadius: '1px',
                pointerEvents: 'none',
                cursor: 'inherit'
              }}
            />
          );
        });
      })()}

      {/* Selection highlight */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded"
          style={{
            border: '2px solid #60a5fa',
            boxShadow: '0 0 0 1px rgba(96, 165, 250, 0.3)',
            pointerEvents: 'none',
            cursor: 'inherit'
          }}
        />
      )}

      {/* Multi-select highlight */}
      {isMultiSelected && !isSelected && (
        <div
          className="absolute inset-0 rounded"
          style={{
            border: '2px dashed #60a5fa',
            pointerEvents: 'none',
            cursor: 'inherit'
          }}
        />
      )}

      {/* Loop info - name only */}
      <div
        className="absolute inset-0 p-2 flex items-center"
        style={{ pointerEvents: 'none', cursor: 'inherit' }}
      >
        <span
          className="text-xs font-medium truncate"
          style={{
            color: categoryColor.text,
            pointerEvents: 'none',
            cursor: 'inherit',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {loop.name}
        </span>
      </div>

      {/* Resize indicator (visual only - no interaction) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1 bg-blue-400 opacity-0 hover:opacity-60 transition-opacity"
        style={{ pointerEvents: 'none', cursor: 'inherit' }}
      />
    </div>
  );
});

LoopBlock.displayName = 'LoopBlock';

export default React.memo(LoopBlock);
