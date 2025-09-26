import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

// Drag detection constants
const DRAG_THRESHOLD = 5; // pixels - must move this much to start drag
const CLICK_MAX_DURATION = 200; // milliseconds - max time for a click

const LoopBlock = React.memo(({ 
  loop, 
  timeToPixel, 
  trackStates, 
  selectedLoop, 
  draggedLoop,
  onLoopMouseDown,
  onLoopSelect, 
  onLoopUpdate, 
  onLoopDelete
}) => {
  const [waveformData, setWaveformData] = useState(null);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [originalDuration, setOriginalDuration] = useState(loop.duration);
  const [waveformGenerated, setWaveformGenerated] = useState(false);
  
  // FIXED: Ensure originalDuration is properly set and maintained
  useEffect(() => {
    if (!originalDuration || originalDuration !== loop.duration) {
      setOriginalDuration(loop.duration);
    }
  }, [loop.duration, originalDuration]);
  
  const canvasRef = useRef(null);
  const waveformCacheRef = useRef(new Map());

  const isSelected = selectedLoop === loop.id;
  const isDragged = draggedLoop?.id === loop.id;
  const trackState = trackStates[`track-${loop.trackIndex}`];
  
  // OPTIMIZED: Memoize expensive calculations
  const { leftPosition, width, topPosition } = useMemo(() => ({
    leftPosition: timeToPixel(loop.startTime),
    width: timeToPixel(loop.endTime) - timeToPixel(loop.startTime),
    topPosition: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT + (loop.trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT)
  }), [timeToPixel, loop.startTime, loop.endTime, loop.trackIndex]);

  // Get category colors
  const categoryColor = TIMELINE_CONSTANTS.CATEGORY_COLORS[loop.category] || TIMELINE_CONSTANTS.CATEGORY_COLORS.Default;

  // FIXED: Generate waveform only once and cache it
  const generateWaveform = useCallback(async () => {
    // Check cache first
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
      console.log(`Generating waveform for: ${loop.name}`);
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(loop.file);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get the first channel (mono or left channel)
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of waveform points
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];
      
      // Calculate RMS (Root Mean Square) for each block to get average amplitude
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
      
      // Normalize waveform data
      const maxRms = Math.max(...waveform);
      const normalizedWaveform = waveform.map(value => value / maxRms);
      
      // Cache the waveform
      waveformCacheRef.current.set(cacheKey, normalizedWaveform);
      
      setWaveformData(normalizedWaveform);
      setWaveformGenerated(true);
      audioContext.close();
      
      console.log(`Waveform generated and cached for: ${loop.name}`);
    } catch (error) {
      console.error('Failed to generate waveform:', error);
      // Create a simple pattern as fallback
      const fallbackWaveform = Array.from({ length: 200 }, (_, i) => 
        Math.abs(Math.sin(i * 0.1)) * 0.5 + Math.random() * 0.3
      );
      
      // Cache the fallback too
      waveformCacheRef.current.set(loop.file, fallbackWaveform);
      setWaveformData(fallbackWaveform);
      setWaveformGenerated(true);
    } finally {
      setIsGeneratingWaveform(false);
    }
  }, [loop.file, loop.name, waveformGenerated, isGeneratingWaveform]);

  // FIXED: Stable drawing function that doesn't depend on changing props
  const drawWaveform = useCallback(() => {
    if (!waveformData || !canvasRef.current || width <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ensure canvas has valid dimensions
    if (canvas.width <= 0 || canvas.height <= 0) return;
    
    const { width: canvasWidth, height: canvasHeight } = canvas;
    
    // Clear canvas completely
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Save canvas state
    ctx.save();
    
    try {
      // Calculate how much of the waveform to show based on trimmed duration
      const currentDuration = loop.endTime - loop.startTime;
      const visibleRatio = currentDuration / originalDuration;
      const visibleSamples = Math.floor(waveformData.length * visibleRatio);
      
      if (visibleSamples <= 0) return;
      
      // Draw waveform with higher opacity and better contrast
      const baseOpacity = '80';
      const strokeOpacity = 'CC';
      
      ctx.fillStyle = categoryColor.accent + baseOpacity;
      ctx.strokeStyle = categoryColor.accent + strokeOpacity;
      ctx.lineWidth = 0.5;
      
      const barWidth = Math.max(0.5, canvasWidth / visibleSamples);
      
      // Draw background bars
      for (let i = 0; i < visibleSamples; i++) {
        const amplitude = waveformData[i];
        const enhancedAmplitude = Math.pow(amplitude, 0.6);
        const barHeight = Math.max(1, enhancedAmplitude * (canvasHeight - 6));
        const x = i * barWidth;
        const y = Math.max(0, (canvasHeight - barHeight) / 2);
        
        ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
        
        if (barHeight > 2) {
          ctx.strokeRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
        }
      }
      
      // Add peak highlights
      ctx.fillStyle = categoryColor.accent + 'FF';
      for (let i = 0; i < visibleSamples; i++) {
        const amplitude = waveformData[i];
        if (amplitude > 0.7) {
          const enhancedAmplitude = Math.pow(amplitude, 0.6);
          const barHeight = Math.max(1, enhancedAmplitude * (canvasHeight - 6));
          const x = i * barWidth;
          const y = Math.max(0, (canvasHeight - barHeight) / 2);
          const peakHeight = Math.max(2, barHeight * 0.3);
          
          ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), peakHeight);
        }
      }
    } catch (error) {
      console.error('Error drawing waveform:', error);
    } finally {
      ctx.restore();
    }
  }, [waveformData, width, loop.endTime, loop.startTime, originalDuration, categoryColor]);

  // Generate waveform when loop loads (only once)
  useEffect(() => {
    if (!waveformGenerated && !isGeneratingWaveform) {
      generateWaveform();
    }
  }, [generateWaveform, waveformGenerated, isGeneratingWaveform]);

  // FIXED: Don't redraw waveform or trigger audio updates while actively resizing
  useEffect(() => {
    if (waveformData && width > 0 && !isDragged && !isResizing) {
      // Only redraw when not actively manipulating the loop
      const timer = setTimeout(() => {
        drawWaveform();
      }, 100); // Longer delay to prevent spam during updates
      
      return () => clearTimeout(timer);
    }
  }, [waveformData, width, drawWaveform, isDragged, isResizing]);

  // Handle resize start
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`Starting resize for loop: ${loop.name}`);
    console.log(`Initial: startTime=${loop.startTime}, endTime=${loop.endTime}, duration=${loop.endTime - loop.startTime}`);
    
    setIsResizing(true);
    
    // Store original duration if not set
    if (!originalDuration || originalDuration === loop.duration) {
      setOriginalDuration(loop.duration);
      console.log(`Set original duration: ${loop.duration}`);
    }
  }, [loop.duration, loop.startTime, loop.endTime, loop.name, originalDuration]);

  // FIXED: Simplified resize logic that follows cursor directly
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      // Get the loop block element to calculate relative mouse position
      const loopElement = document.querySelector(`[data-loop-id="${loop.id}"]`);
      
      if (!loopElement) {
        console.warn('Could not find loop element for resize');
        return;
      }
      
      const loopRect = loopElement.getBoundingClientRect();
      const mouseX = e.clientX;
      
      // Calculate new width based on mouse position relative to loop start
      const newWidth = mouseX - loopRect.left;
      const minWidth = 20; // Minimum 20px width
      const maxWidth = timeToPixel(loop.startTime + originalDuration) - timeToPixel(loop.startTime);
      
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Convert width back to time duration
      const pixelsPerSecond = timeToPixel(1) - timeToPixel(0); // Get scale
      const newDuration = constrainedWidth / pixelsPerSecond;
      const newEndTime = loop.startTime + newDuration;
      
      // Only update if there's a meaningful change
      if (Math.abs(newEndTime - loop.endTime) > 0.05) {
        console.log(`Resizing: newWidth=${constrainedWidth}px, newDuration=${newDuration.toFixed(2)}s`);
        
        onLoopUpdate(loop.id, {
          endTime: newEndTime,
          duration: newDuration
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      console.log(`Finished resizing loop: ${loop.name}, final duration: ${(loop.endTime - loop.startTime).toFixed(2)}s`);
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
  }, [isResizing, loop, originalDuration, onLoopUpdate, timeToPixel]);

  // Handle delete
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    
    console.log(`Deleting loop: ${loop.name} (ID: ${loop.id})`);
    onLoopDelete(loop.id);
  }, [loop.id, loop.name, onLoopDelete]);

  // FIXED: Improved loop click handling - more reliable selection
  const handleLoopClick = useCallback((e) => {
    if (isResizing) return;
    if (e.target.closest('button') || e.target.closest('.resize-handle')) return;
    
    // Additional check: don't process click if a drag just ended
    if (Date.now() - (window.lastDragEndTime || 0) < 150) {
      console.log(`Ignoring click on ${loop.name} - recent drag detected`);
      return;
    }
    
    e.stopPropagation();
    console.log(`Processing click selection for ${loop.name}`);
    onLoopSelect(loop.id);
  }, [loop.id, loop.name, onLoopSelect, isResizing]);

  // FIXED: Improved mouse down handling with better click/drag separation
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.resize-handle')) {
      e.stopPropagation();
      return;
    }
    
    if (isResizing) return;

    // Store initial mouse position and time
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    let hasMoved = false;
    let dragStarted = false;
    let interactionCompleted = false;

    const handleMouseMove = (moveEvent) => {
      if (interactionCompleted) return; // Don't process if interaction is done
      
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // FIXED: Increase drag threshold to prevent accidental drags after clicks
      if (totalMovement >= (DRAG_THRESHOLD * 2) && !dragStarted) {
        hasMoved = true;
        dragStarted = true;
        interactionCompleted = true;
        console.log(`Starting drag for ${loop.name} - movement: ${totalMovement.toFixed(1)}px`);
        
        // Clean up listeners before starting drag
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Now start the actual drag
        onLoopMouseDown(e, loop);
      }
    };

    const handleMouseUp = (upEvent) => {
      if (interactionCompleted) return; // Don't process if already handled
      
      const clickDuration = Date.now() - startTime;
      interactionCompleted = true;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // FIXED: Only treat as click if no significant movement occurred
      if (!hasMoved && clickDuration < CLICK_MAX_DURATION) {
        console.log(`Click detected on ${loop.name} (${clickDuration}ms, minimal movement)`);
        onLoopSelect(loop.id);
        
        // Set a brief flag to prevent immediate subsequent drags
        window.lastClickTime = Date.now();
        
      } else if (!hasMoved && clickDuration >= CLICK_MAX_DURATION) {
        console.log(`Long press on ${loop.name} (${clickDuration}ms) - treating as click`);
        onLoopSelect(loop.id);
        window.lastClickTime = Date.now();
        
      } else if (hasMoved) {
        console.log(`Movement detected but not enough for drag: ${loop.name}`);
        // Still select the loop for small movements
        onLoopSelect(loop.id);
        window.lastClickTime = Date.now();
      }
    };

    // Check if this is too soon after a recent click (prevent double-processing)
    if (Date.now() - (window.lastClickTime || 0) < 200) {
      console.log(`Ignoring mousedown - too soon after recent click`);
      return;
    }

    // Add temporary listeners to detect movement
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent default to avoid text selection
    e.preventDefault();
  }, [onLoopMouseDown, loop, isResizing, onLoopSelect]);

  // Show drag state without scaling - just opacity and shadow
  const dragStyle = isDragged ? {
    opacity: 0.7,
    zIndex: 1000,
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    pointerEvents: 'none'
  } : {};

  return (
    <div
      className={`absolute rounded cursor-move transition-all duration-150 ${
        isSelected ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
      } ${trackState?.muted ? 'opacity-50' : ''} ${
        isDragged ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: leftPosition,
        top: topPosition + 8,
        width: width,
        height: TIMELINE_CONSTANTS.TRACK_HEIGHT - 16,
        backgroundColor: categoryColor.bg,
        borderColor: isSelected ? '#60a5fa' : categoryColor.accent,
        borderWidth: '1px',
        borderStyle: 'solid',
        ...dragStyle // Apply drag styling
      }}
      onMouseDown={handleMouseDown}
      onClick={handleLoopClick}
      data-loop-block="true"
      data-loop-id={loop.id}
    >
      {/* FIXED: Canvas with stable props to prevent unnecessary re-creation */}
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

      {/* Loop Info Overlay */}
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

        {/* Action buttons */}
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

      {/* FIXED: Improved resize handle - smaller, precise, goes to edge */}
      <div
        className={`resize-handle absolute top-0 bottom-0 cursor-col-resize transition-all ${
          isResizing 
            ? 'bg-red-500 w-2 opacity-100 right-0' 
            : 'bg-yellow-400 hover:bg-yellow-300 w-1 opacity-60 right-0'
        }`}
        onMouseDown={handleResizeStart}
        title="Drag to trim loop duration"
        data-resize-handle="right"
        style={{
          // Ensure it goes all the way to the right edge
          right: '0px',
          width: isResizing ? '8px' : '4px',
          zIndex: 1000
        }}
      >
        {/* Small visual indicator */}
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-l transition-colors ${
          isResizing ? 'bg-white' : 'bg-gray-800'
        }`}></div>
        
        {/* Debug info when resizing - positioned better */}
        {isResizing && (
          <div className="absolute -top-10 right-0 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isGeneratingWaveform && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="text-xs" style={{ color: categoryColor.text }}>
            Generating waveform...
          </div>
        </div>
      )}

      {/* Trimmed indicator - FIXED: Only show if actually trimmed with tolerance */}
      {(loop.endTime - loop.startTime) < (originalDuration - 0.1) && (
        <div 
          className="absolute top-0 right-6 text-xs px-1 rounded-b"
          style={{ 
            backgroundColor: categoryColor.accent, 
            color: categoryColor.text 
          }}
        >
          Trimmed
        </div>
      )}
    </div>
  );
});

LoopBlock.displayName = 'LoopBlock';

export default LoopBlock;