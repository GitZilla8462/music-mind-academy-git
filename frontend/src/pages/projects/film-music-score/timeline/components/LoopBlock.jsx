import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

// Drag detection constants
const DRAG_THRESHOLD = 5;
const CLICK_MAX_DURATION = 200;

const LoopBlock = React.memo(({ 
  loop, 
  timeToPixel, 
  trackStates, 
  selectedLoop, 
  draggedLoop,
  onLoopMouseDown,
  onLoopSelect, 
  onLoopUpdate,
  onLoopResize,
  onLoopDelete
}) => {
  const [waveformData, setWaveformData] = useState(null);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [waveformGenerated, setWaveformGenerated] = useState(false);
  
  const originalDurationRef = useRef(null);
  
  useEffect(() => {
    if (originalDurationRef.current === null && loop.duration > 0) {
      originalDurationRef.current = loop.duration;
      console.log(`Stored original duration for ${loop.name}: ${loop.duration}s`);
    }
  }, [loop.duration, loop.name]);
  
  const canvasRef = useRef(null);
  const waveformCacheRef = useRef(new Map());

  const isSelected = selectedLoop === loop.id;
  const isDragged = draggedLoop?.id === loop.id;
  const trackState = trackStates[`track-${loop.trackIndex}`];
  
  const { leftPosition, width, topPosition } = useMemo(() => ({
    leftPosition: timeToPixel(loop.startTime),
    width: timeToPixel(loop.endTime) - timeToPixel(loop.startTime),
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

  const numRepeats = useMemo(() => {
    const originalDuration = originalDurationRef.current || loop.duration;
    const currentDuration = loop.endTime - loop.startTime;
    const repeats = Math.ceil(currentDuration / originalDuration);
    return Math.max(1, repeats);
  }, [loop.endTime, loop.startTime, loop.duration]);

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
      const samples = 200;
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
      console.error('Failed to generate waveform:', error);
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

  const drawWaveform = useCallback(() => {
    if (!waveformData || !canvasRef.current || width <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width <= 0 || canvas.height <= 0) return;
    
    const { width: canvasWidth, height: canvasHeight } = canvas;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    
    try {
      const originalDuration = originalDurationRef.current || loop.duration;
      const currentDuration = loop.endTime - loop.startTime;
      const repeats = Math.max(1, Math.ceil(currentDuration / originalDuration));
      
      const baseOpacity = '60';
      const strokeOpacity = 'AA';
      const notchRadius = 6;
      
      ctx.fillStyle = loopColor + baseOpacity;
      ctx.strokeStyle = loopColor + strokeOpacity;
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      
      if (repeats > 1) {
        for (let i = 1; i < repeats; i++) {
          const sectionWidth = canvasWidth / repeats;
          const x = sectionWidth * i;
          
          ctx.moveTo(x + notchRadius, 0);
          ctx.arc(x, 0, notchRadius, 0, Math.PI, true);
          
          ctx.moveTo(x + notchRadius, canvasHeight);
          ctx.arc(x, canvasHeight, notchRadius, 0, Math.PI, false);
        }
      }
      
      ctx.clip();
      
      for (let repeat = 0; repeat < repeats; repeat++) {
        const offsetX = (canvasWidth / repeats) * repeat;
        const repeatWidth = canvasWidth / repeats;
        const barWidth = Math.max(0.5, repeatWidth / waveformData.length);
        
        for (let i = 0; i < waveformData.length; i++) {
          const amplitude = waveformData[i];
          const enhancedAmplitude = Math.pow(amplitude, 0.6);
          const barHeight = Math.max(1, enhancedAmplitude * (canvasHeight - 6));
          const x = offsetX + (i * barWidth);
          const y = Math.max(0, (canvasHeight - barHeight) / 2);
          
          if (x >= canvasWidth) break;
          
          ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
          
          if (barHeight > 2) {
            ctx.strokeRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
          }
        }
        
        if (repeat > 0 && repeats > 1) {
          ctx.strokeStyle = loopColor + 'DD';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const sectionWidth = canvasWidth / repeats;
          const x = sectionWidth * repeat;
          ctx.moveTo(x, notchRadius + 2);
          ctx.lineTo(x, canvasHeight - notchRadius - 2);
          ctx.stroke();
          
          ctx.strokeStyle = loopColor + strokeOpacity;
          ctx.lineWidth = 0.5;
        }
      }
      
      ctx.fillStyle = loopColor + 'FF';
      for (let repeat = 0; repeat < repeats; repeat++) {
        const offsetX = (canvasWidth / repeats) * repeat;
        const repeatWidth = canvasWidth / repeats;
        const barWidth = Math.max(0.5, repeatWidth / waveformData.length);
        
        for (let i = 0; i < waveformData.length; i++) {
          const amplitude = waveformData[i];
          if (amplitude > 0.7) {
            const enhancedAmplitude = Math.pow(amplitude, 0.6);
            const barHeight = Math.max(1, enhancedAmplitude * (canvasHeight - 6));
            const x = offsetX + (i * barWidth);
            const y = Math.max(0, (canvasHeight - barHeight) / 2);
            const peakHeight = Math.max(2, barHeight * 0.3);
            
            if (x >= canvasWidth) break;
            
            ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), peakHeight);
          }
        }
      }
    } catch (error) {
      console.error('Error drawing waveform:', error);
    } finally {
      ctx.restore();
    }
  }, [waveformData, width, loop.endTime, loop.startTime, loop.duration, loop.name, loopColor]);

  useEffect(() => {
    if (!waveformGenerated && !isGeneratingWaveform) {
      generateWaveform();
    }
  }, [generateWaveform, waveformGenerated, isGeneratingWaveform]);

  useEffect(() => {
    if (waveformData && width > 0 && !isDragged && !isResizing) {
      const timer = setTimeout(() => {
        drawWaveform();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [waveformData, width, drawWaveform, isDragged, isResizing]);

  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    console.log(`Starting ${direction} resize for ${loop.name}`);
  }, [loop.name]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const loopElement = document.querySelector(`[data-loop-id="${loop.id}"]`);
      if (!loopElement) return;
      
      const loopRect = loopElement.getBoundingClientRect();
      const mouseX = e.clientX;
      const pixelsPerSecond = timeToPixel(1) - timeToPixel(0);
      const originalDuration = originalDurationRef.current || loop.duration;
      
      if (resizeDirection === 'right') {
        // FIXED: Allow both extending AND shrinking from the right edge
        const newWidth = mouseX - loopRect.left;
        const minWidth = pixelsPerSecond * originalDuration; // Minimum one loop duration
        const constrainedWidth = Math.max(minWidth, newWidth);
        const newDuration = constrainedWidth / pixelsPerSecond;
        
        // Snap to nearest multiple of original duration
        const numRepeats = Math.max(1, Math.round(newDuration / originalDuration));
        const snappedDuration = numRepeats * originalDuration;
        const newEndTime = loop.startTime + snappedDuration;
        
        // FIXED: Update on any change, allowing both shrinking and extending
        if (Math.abs(newEndTime - loop.endTime) > 0.01) {
          onLoopUpdate(loop.id, {
            endTime: newEndTime
          });
          
          if (onLoopResize) {
            onLoopResize(loop.id, snappedDuration);
          }
        }
      } else if (resizeDirection === 'left') {
        // Shrinking from the left edge
        const currentWidth = loopRect.right - mouseX;
        const minWidth = pixelsPerSecond * originalDuration;
        const constrainedWidth = Math.max(minWidth, currentWidth);
        const newDuration = constrainedWidth / pixelsPerSecond;
        
        // Snap to nearest multiple of original duration
        const numRepeats = Math.max(1, Math.round(newDuration / originalDuration));
        const snappedDuration = numRepeats * originalDuration;
        
        // Calculate new start time
        const newStartTime = loop.endTime - snappedDuration;
        
        if (Math.abs(newStartTime - loop.startTime) > 0.01 && newStartTime >= 0) {
          onLoopUpdate(loop.id, {
            startTime: newStartTime
          });
          
          if (onLoopResize) {
            onLoopResize(loop.id, snappedDuration);
          }
        }
      }
    };

    const handleMouseUp = () => {
      console.log(`Finished ${resizeDirection} resize`);
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resizeDirection, loop, onLoopUpdate, onLoopResize, timeToPixel]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    onLoopDelete(loop.id);
  }, [loop.id, onLoopDelete]);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.resize-handle')) {
      e.stopPropagation();
      return;
    }
    
    if (isResizing) return;

    if (!isSelected) {
      onLoopSelect(loop.id);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;
    let dragStarted = false;
    let interactionCompleted = false;

    const handleMouseMove = (moveEvent) => {
      if (interactionCompleted) return;
      
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (totalMovement >= (DRAG_THRESHOLD * 2) && !dragStarted) {
        hasMoved = true;
        dragStarted = true;
        interactionCompleted = true;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        onLoopMouseDown(e, loop);
      }
    };

    const handleMouseUp = () => {
      if (interactionCompleted) return;
      interactionCompleted = true;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  }, [onLoopMouseDown, loop, isResizing, onLoopSelect, isSelected]);

  const dragStyle = isDragged ? {
    opacity: 0.7,
    zIndex: 1000,
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    pointerEvents: 'none'
  } : {};

  return (
    <div
      className={`absolute cursor-move transition-all duration-150 ${
        trackState?.muted ? 'opacity-50' : ''
      } ${
        isDragged ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: leftPosition,
        top: topPosition + 8,
        width: width,
        height: TIMELINE_CONSTANTS.TRACK_HEIGHT - 16,
        ...dragStyle
      }}
      onMouseDown={handleMouseDown}
      data-loop-block="true"
      data-loop-id={loop.id}
    >
      <svg
        width={width}
        height={TIMELINE_CONSTANTS.TRACK_HEIGHT - 16}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <mask id={`notch-mask-${loop.id}`}>
            <rect width={width} height={TIMELINE_CONSTANTS.TRACK_HEIGHT - 16} fill="white" />
            {numRepeats > 1 && Array.from({ length: numRepeats - 1 }).map((_, index) => {
              const sectionWidth = width / numRepeats;
              const x = sectionWidth * (index + 1);
              const notchRadius = 6;
              
              return (
                <g key={index}>
                  <circle cx={x} cy={0} r={notchRadius} fill="black" />
                  <circle cx={x} cy={TIMELINE_CONSTANTS.TRACK_HEIGHT - 16} r={notchRadius} fill="black" />
                </g>
              );
            })}
          </mask>
        </defs>
        
        <rect
          width={width}
          height={TIMELINE_CONSTANTS.TRACK_HEIGHT - 16}
          fill={categoryColor.bg}
          mask={`url(#notch-mask-${loop.id})`}
          rx="4"
        />
        
        <path
          d={(() => {
            const h = TIMELINE_CONSTANTS.TRACK_HEIGHT - 16;
            const r = 4;
            const notchRadius = 6;
            const sectionWidth = width / numRepeats;
            
            let path = `M ${r} 0`;
            
            for (let i = 1; i < numRepeats; i++) {
              const x = sectionWidth * i;
              path += ` L ${x - notchRadius} 0`;
              path += ` A ${notchRadius} ${notchRadius} 0 0 1 ${x + notchRadius} 0`;
            }
            
            path += ` L ${width - r} 0 Q ${width} 0 ${width} ${r}`;
            path += ` L ${width} ${h - r}`;
            path += ` Q ${width} ${h} ${width - r} ${h}`;
            
            for (let i = numRepeats - 1; i > 0; i--) {
              const x = sectionWidth * i;
              path += ` L ${x + notchRadius} ${h}`;
              path += ` A ${notchRadius} ${notchRadius} 0 0 1 ${x - notchRadius} ${h}`;
            }
            
            path += ` L ${r} ${h} Q 0 ${h} 0 ${h - r}`;
            path += ` L 0 ${r}`;
            path += ` Q 0 0 ${r} 0`;
            path += ' Z';
            
            return path;
          })()}
          fill="none"
          stroke={isSelected ? '#60a5fa' : categoryColor.accent}
          strokeWidth="2"
        />
        
        {numRepeats > 1 && Array.from({ length: numRepeats - 1 }).map((_, index) => {
          const sectionWidth = width / numRepeats;
          const x = sectionWidth * (index + 1);
          const notchRadius = 6;
          
          return (
            <line
              key={index}
              x1={x}
              y1={notchRadius + 2}
              x2={x}
              y2={(TIMELINE_CONSTANTS.TRACK_HEIGHT - 16) - notchRadius - 2}
              stroke={categoryColor.accent}
              strokeWidth="2"
              opacity="0.5"
            />
          );
        })}
      </svg>

      {isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none rounded"
          style={{
            border: '2px solid #60a5fa',
            boxShadow: '0 0 0 1px rgba(96, 165, 250, 0.3)'
          }}
        />
      )}

      <canvas
        ref={canvasRef}
        width={Math.max(1, width)} 
        height={Math.max(1, TIMELINE_CONSTANTS.TRACK_HEIGHT - 16)}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: 0.9,
          width: `${width}px`,
          height: `${TIMELINE_CONSTANTS.TRACK_HEIGHT - 16}px`
        }}
      />

      <div className="absolute inset-0 p-2 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col min-w-0">
          <span 
            className="text-xs font-medium truncate"
            style={{ color: categoryColor.text }}
          >
            {loop.name}
          </span>
          <span 
            className="text-xs opacity-75 truncate"
            style={{ color: categoryColor.text }}
          >
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s
          </span>
        </div>

        {isSelected && (
          <div className="flex items-center space-x-1 pointer-events-auto z-50">
            <button
              onClick={handleDelete}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg border border-red-500 hover:border-red-400"
              title="Delete loop"
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* LEFT RESIZE HANDLE */}
      <div
        className={`resize-handle absolute top-0 bottom-0 left-0 cursor-col-resize transition-all ${
          isResizing && resizeDirection === 'left'
            ? 'bg-blue-500 w-2 opacity-100' 
            : 'bg-blue-400 hover:bg-blue-300 w-1 opacity-60'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'left')}
        title="Drag left to shrink loop"
        data-resize-handle="left"
        style={{
          width: isResizing && resizeDirection === 'left' ? '8px' : '4px',
          zIndex: 1000
        }}
      >
        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-r transition-colors ${
          isResizing && resizeDirection === 'left' ? 'bg-white' : 'bg-gray-800'
        }`}></div>
        
        {isResizing && resizeDirection === 'left' && (
          <div className="absolute -top-10 left-0 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s ({numRepeats}x)
          </div>
        )}
      </div>

      {/* RIGHT RESIZE HANDLE */}
      <div
        className={`resize-handle absolute top-0 bottom-0 right-0 cursor-col-resize transition-all ${
          isResizing && resizeDirection === 'right'
            ? 'bg-blue-500 w-2 opacity-100' 
            : 'bg-blue-400 hover:bg-blue-300 w-1 opacity-60'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'right')}
        title="Drag to resize loop (snaps to repeats)"
        data-resize-handle="right"
        style={{
          width: isResizing && resizeDirection === 'right' ? '8px' : '4px',
          zIndex: 1000
        }}
      >
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-l transition-colors ${
          isResizing && resizeDirection === 'right' ? 'bg-white' : 'bg-gray-800'
        }`}></div>
        
        {isResizing && resizeDirection === 'right' && (
          <div className="absolute -top-10 right-0 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s ({numRepeats}x)
          </div>
        )}
      </div>

      {isGeneratingWaveform && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="text-xs" style={{ color: categoryColor.text }}>
            Generating waveform...
          </div>
        </div>
      )}
    </div>
  );
});

LoopBlock.displayName = 'LoopBlock';

export default LoopBlock;