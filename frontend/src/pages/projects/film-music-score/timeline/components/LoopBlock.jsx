// File: /src/pages/projects/film-music-score/timeline/components/LoopBlock.jsx
// REFACTORED: Pure visual component - NO mouse event handlers
// All interaction is handled by InteractionOverlay
// This eliminates cursor flickering on Chromebooks

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [waveformData, setWaveformData] = useState(null);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);
  const [waveformGenerated, setWaveformGenerated] = useState(false);
  
  const originalDurationRef = useRef(null);
  const canvasRef = useRef(null);
  const waveformCacheRef = useRef(new Map());

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

  // Calculate loop repeats for notch display
  const { numRepeats } = useMemo(() => {
    const originalDuration = originalDurationRef.current || loop.duration;
    const currentDuration = loop.endTime - loop.startTime;
    const actualRepeats = currentDuration / originalDuration;
    const repeats = Math.ceil(actualRepeats);
    
    return { 
      numRepeats: Math.max(1, repeats)
    };
  }, [loop.endTime, loop.startTime, loop.duration]);

  // ============================================================================
  // WAVEFORM GENERATION
  // ============================================================================
  
  const generateWaveform = useCallback(async () => {
    const cacheKey = loop.file;
    
    if (waveformCacheRef.current.has(cacheKey)) {
      const cachedWaveform = waveformCacheRef.current.get(cacheKey);
      setWaveformData(cachedWaveform);
      setWaveformGenerated(true);
      return;
    }

    if (waveformGenerated || isGeneratingWaveform) return;
    
    setIsGeneratingWaveform(true);
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(loop.file);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 100; // CHROMEBOOK: Reduced from 200 for better performance
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];
      
      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        const end = Math.min(start + blockSize, channelData.length);
        let sum = 0;
        
        for (let j = start; j < end; j++) {
          sum += channelData[j] * channelData[j];
        }
        
        const rms = Math.sqrt(sum / (end - start));
        waveform.push(rms);
      }
      
      const maxRms = Math.max(...waveform);
      const normalizedWaveform = waveform.map(value => value / maxRms);
      
      waveformCacheRef.current.set(cacheKey, normalizedWaveform);
      setWaveformData(normalizedWaveform);
      setWaveformGenerated(true);
      
      audioContext.close();
    } catch (error) {
      console.error(`❌ Waveform failed: ${loop.name}:`, error);
      
      const fallbackWaveform = Array.from({ length: 200 }, (_, i) => 
        Math.abs(Math.sin(i * 0.1)) * 0.5 + Math.random() * 0.3
      );
      
      waveformCacheRef.current.set(loop.file, fallbackWaveform);
      setWaveformData(fallbackWaveform);
      setWaveformGenerated(true);
    } finally {
      setIsGeneratingWaveform(false);
    }
  }, [loop.file, loop.name, waveformGenerated, isGeneratingWaveform]);

  useEffect(() => {
    if (!waveformGenerated && !isGeneratingWaveform) {
      generateWaveform();
    }
  }, [generateWaveform, waveformGenerated, isGeneratingWaveform]);

  // ============================================================================
  // WAVEFORM DRAWING
  // ============================================================================
  
  const drawWaveform = useCallback(() => {
    if (!waveformData || !canvasRef.current || width <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width <= 0 || canvas.height <= 0) return;
    
    const { width: canvasWidth, height: canvasHeight } = canvas;
    const originalDuration = originalDurationRef.current || loop.duration;
    const currentDuration = loop.endTime - loop.startTime;
    const startOffset = loop.startOffset || 0;
    
    const fullLoops = Math.floor(currentDuration / originalDuration);
    const partialLoop = (currentDuration % originalDuration);
    const totalSections = fullLoops + (partialLoop > 0.01 ? 1 : 0);

    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    try {
      const centerY = canvasHeight / 2;
      
      for (let repeat = 0; repeat < totalSections; repeat++) {
        const isPartialRepeat = (repeat === fullLoops && partialLoop > 0.01);
        const repeatDuration = isPartialRepeat ? partialLoop : originalDuration;
        const repeatWidth = (repeatDuration / currentDuration) * canvasWidth;
        const offsetX = (repeat * originalDuration / currentDuration) * canvasWidth;
        
        const startPercent = startOffset / originalDuration;
        const endPercent = isPartialRepeat 
          ? (startOffset + partialLoop) / originalDuration
          : (startOffset + originalDuration) / originalDuration;
        
        const startSample = Math.floor(startPercent * waveformData.length) % waveformData.length;
        const endSample = Math.ceil(endPercent * waveformData.length);
        const sampleRange = endSample - startSample;
        
        ctx.beginPath();
        
        const barCount = Math.max(20, Math.floor(repeatWidth / 3));
        const barWidth = repeatWidth / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const sampleIndex = (startSample + Math.floor((i / barCount) * sampleRange)) % waveformData.length;
          const amplitude = waveformData[sampleIndex] || 0;
          const barHeight = Math.max(2, amplitude * (canvasHeight * 0.8));
          
          const x = offsetX + (i * barWidth);
          const y = centerY - barHeight / 2;
          
          ctx.rect(x, y, Math.max(1, barWidth - 1), barHeight);
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, categoryColor.accent + 'CC');
        gradient.addColorStop(0.5, categoryColor.accent + 'FF');
        gradient.addColorStop(1, categoryColor.accent + 'CC');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    } catch (error) {
      console.error('Error drawing waveform:', error);
    }

    ctx.restore();
  }, [waveformData, width, loop.duration, loop.endTime, loop.startTime, loop.startOffset, categoryColor.accent]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Block height calculation
  const blockHeight = TIMELINE_CONSTANTS.TRACK_HEIGHT - 4;
  const cornerRadius = 4;

  // ============================================================================
  // RENDER - Pure visual, NO event handlers
  // ============================================================================

  return (
    <div
      className="loop-block absolute transition-shadow"
      data-loop-id={loop.id}
      data-track-index={loop.trackIndex}
      data-start-time={loop.startTime}
      data-end-time={loop.endTime}
      style={{
        left: leftPosition,
        top: topPosition + 2,
        width: width,
        height: blockHeight,
        backgroundColor: loopColor + '40',
        borderRadius: `${cornerRadius}px`,
        opacity: trackState?.muted ? 0.4 : (isDragged ? 0.8 : 1),
        transform: isDragged ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected 
          ? '0 0 0 2px #60a5fa, 0 4px 12px rgba(96, 165, 250, 0.3)' 
          : isDragged 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: isDragged ? 100 : (isSelected ? 30 : 20),
        // CRITICAL: No pointer events - overlay handles everything
        pointerEvents: 'none',
        // CHROMEBOOK FIX: Prevent cursor inheritance issues
        cursor: 'inherit'
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

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={Math.max(1, width)} 
        height={Math.max(1, TIMELINE_CONSTANTS.TRACK_HEIGHT - 16)}
        className="absolute inset-0"
        style={{ 
          opacity: 0.9,
          width: `${width}px`,
          height: `${TIMELINE_CONSTANTS.TRACK_HEIGHT - 16}px`,
          pointerEvents: 'none',
          cursor: 'inherit'
        }}
      />

      {/* Loop info - name and duration */}
      <div 
        className="absolute inset-0 p-2 flex items-center justify-between"
        style={{ pointerEvents: 'none', cursor: 'inherit' }}
      >
        <div className="flex flex-col min-w-0" style={{ pointerEvents: 'none', cursor: 'inherit' }}>
          <span 
            className="text-xs font-medium truncate"
            style={{ color: categoryColor.text, pointerEvents: 'none', cursor: 'inherit' }}
          >
            {loop.name}
          </span>
          <span 
            className="text-xs opacity-75 truncate"
            style={{ color: categoryColor.text, pointerEvents: 'none', cursor: 'inherit' }}
          >
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s
          </span>
        </div>
      </div>

      {/* Resize indicator (visual only - no interaction) */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-1 bg-blue-400 opacity-0 hover:opacity-60 transition-opacity"
        style={{ pointerEvents: 'none', cursor: 'inherit' }}
      />

      {/* Loading indicator */}
      {isGeneratingWaveform && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
          style={{ pointerEvents: 'none', cursor: 'inherit' }}
        >
          <div className="text-xs" style={{ color: categoryColor.text, cursor: 'inherit' }}>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
});

LoopBlock.displayName = 'LoopBlock';

export default React.memo(LoopBlock);
