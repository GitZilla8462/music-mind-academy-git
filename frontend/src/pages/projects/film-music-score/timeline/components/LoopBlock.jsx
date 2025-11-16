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
  videoDuration,
  onLoopMouseDown,
  onLoopSelect, 
  onLoopUpdate,
  onLoopResize,
  onLoopDelete,
  isMultiSelected = false  // NEW: Multi-selection visual indicator
}) => {
  const [waveformData, setWaveformData] = useState(null);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [waveformGenerated, setWaveformGenerated] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const originalDurationRef = useRef(null);
  const canvasRef = useRef(null);
  const waveformCacheRef = useRef(new Map());
  const contextMenuRef = useRef(null);

  // Track original duration on first render
  useEffect(() => {
    if (originalDurationRef.current === null && loop.duration > 0) {
      originalDurationRef.current = loop.duration;
      console.log(`Stored original duration for ${loop.name}: ${loop.duration}s`);
    }
  }, [loop.duration, loop.name]);

  const isSelected = selectedLoop === loop.id;
  const isDragged = draggedLoop?.id === loop.id;
  const trackState = trackStates[`track-${loop.trackIndex}`];
  
  // Calculate positions and dimensions
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

  // Calculate loop repeats for notch display
  const { numRepeats, actualRepeats, fullLoops, hasPartialLoop } = useMemo(() => {
    const originalDuration = originalDurationRef.current || loop.duration;
    const currentDuration = loop.endTime - loop.startTime;
    const actualRepeats = currentDuration / originalDuration;
    const repeats = Math.ceil(actualRepeats);
    
    const fullLoopsCount = Math.floor(actualRepeats);
    const hasPartialLoop = (currentDuration % originalDuration) > 0.01;
    
    return { 
      numRepeats: Math.max(1, repeats),
      actualRepeats: Math.max(1, actualRepeats),
      fullLoops: fullLoopsCount,
      hasPartialLoop
    };
  }, [loop.endTime, loop.startTime, loop.duration]);

  // ============================================================================
  // IMPROVED WAVEFORM GENERATION - Uses RMS for better visualization
  // ============================================================================
  
  const generateWaveform = useCallback(async () => {
    const cacheKey = loop.file;
    
    // Check cache first
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
      const samples = 200; // Fixed sample count for consistency
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];
      
      // Use RMS (Root Mean Square) for better waveform representation
      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        const end = Math.min(start + blockSize, channelData.length);
        let sum = 0;
        
        // Calculate RMS for this segment
        for (let j = start; j < end; j++) {
          sum += channelData[j] * channelData[j];
        }
        
        const rms = Math.sqrt(sum / (end - start));
        waveform.push(rms);
      }
      
      // Normalize to 0-1 range
      const maxRms = Math.max(...waveform);
      const normalizedWaveform = waveform.map(value => value / maxRms);
      
      // Cache the waveform
      waveformCacheRef.current.set(cacheKey, normalizedWaveform);
      setWaveformData(normalizedWaveform);
      setWaveformGenerated(true);
      
      console.log(`✅ Waveform: ${loop.name} - ${samples} samples (RMS normalized)`);
      
      audioContext.close();
    } catch (error) {
      console.error(`❌ Waveform failed: ${loop.name}:`, error);
      
      // Fallback to sine-based waveform
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
  // PROFESSIONAL GARAGEBAND-STYLE WAVEFORM DRAWING
  // ============================================================================
  
  const drawWaveform = useCallback(() => {
    if (!waveformData || !canvasRef.current || width <= 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width <= 0 || canvas.height <= 0) return;
    
    const { width: canvasWidth, height: canvasHeight } = canvas;
    const originalDuration = originalDurationRef.current || loop.duration;
    const currentDuration = loop.endTime - loop.startTime;
    const startOffset = loop.startOffset || 0; // Where in the audio we start
    
    // Calculate how the loop repeats
    const fullLoops = Math.floor(currentDuration / originalDuration);
    const partialLoop = (currentDuration % originalDuration);
    const totalSections = fullLoops + (partialLoop > 0.01 ? 1 : 0);

    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    try {
      const centerY = canvasHeight / 2;
      
      // Draw each loop repeat section
      for (let repeat = 0; repeat < totalSections; repeat++) {
        const isPartialRepeat = (repeat === fullLoops && partialLoop > 0.01);
        const repeatDuration = isPartialRepeat ? partialLoop : originalDuration;
        const repeatWidth = (repeatDuration / currentDuration) * canvasWidth;
        const offsetX = (repeat * originalDuration / currentDuration) * canvasWidth;
        
        // Calculate which portion of waveform to show for this repeat
        // Each repeat shows the SAME trimmed portion (from startOffset)
        const startPercent = startOffset / originalDuration;
        const startSample = Math.floor(startPercent * waveformData.length);
        const samplesForThisRepeat = Math.ceil((repeatDuration / originalDuration) * waveformData.length);
        
        const barWidth = Math.max(1.5, repeatWidth / samplesForThisRepeat);
        const barSpacing = Math.max(0.5, barWidth * 0.1);
        
        for (let i = 0; i < samplesForThisRepeat; i++) {
          // Map to correct position in waveform (starting from startSample)
          const waveformIndex = (startSample + i) % waveformData.length;
          const amplitude = waveformData[waveformIndex];
          
          const enhancedAmplitude = Math.pow(amplitude, 0.7);
          const maxBarHeight = canvasHeight - 8;
          const barHeight = Math.max(2, enhancedAmplitude * maxBarHeight);
          
          const x = offsetX + (i * barWidth);
          
          if (x >= canvasWidth) break;
          
          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);
          gradient.addColorStop(0, loopColor + 'BB');
          gradient.addColorStop(0.5, loopColor + 'FF');
          gradient.addColorStop(1, loopColor + 'BB');
          
          ctx.fillStyle = gradient;
          
          const halfHeight = barHeight / 2;
          ctx.fillRect(
            x,
            centerY - halfHeight,
            Math.max(1, barWidth - barSpacing),
            barHeight
          );
        }
      }
      
    } catch (error) {
      console.error('Error drawing waveform:', error);
    } finally {
      ctx.restore();
    }
  }, [waveformData, width, loop.endTime, loop.startTime, loop.duration, loop.startOffset, loopColor]);

  useEffect(() => {
    if (waveformData && width > 0 && !isDragged && !isResizing) {
      const timer = setTimeout(() => {
        drawWaveform();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [waveformData, width, drawWaveform, isDragged, isResizing]);

  // ============================================================================
  // RESIZE HANDLERS
  // ============================================================================

  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const pixelsPerSecond = timeToPixel(1) - timeToPixel(0);
      const loopElement = document.querySelector(`[data-loop-id="${loop.id}"]`);
      if (!loopElement) return;
      
      let scrollContainer = loopElement.parentElement;
      while (scrollContainer && !scrollContainer.classList.contains('overflow-auto')) {
        scrollContainer = scrollContainer.parentElement;
        if (scrollContainer === document.body) {
          scrollContainer = null;
          break;
        }
      }
      
      const scrollLeft = scrollContainer?.scrollLeft || 0;
      const timelineContent = loopElement.parentElement;
      if (!timelineContent) return;
      
      const contentRect = timelineContent.getBoundingClientRect();
      const mouseXRelativeToContent = e.clientX - contentRect.left + scrollLeft;
      const mouseTime = mouseXRelativeToContent / pixelsPerSecond;
      
      if (resizeDirection === 'right') {
        const newDuration = mouseTime - loop.startTime;
        const minDuration = 0.1;
        const maxDuration = videoDuration - loop.startTime;
        const constrainedDuration = Math.max(minDuration, Math.min(maxDuration, newDuration));
        const newEndTime = loop.startTime + constrainedDuration;
        
        if (Math.abs(newEndTime - loop.endTime) > 0.1) {
          onLoopUpdate(loop.id, { endTime: newEndTime });
          if (onLoopResize) {
            onLoopResize(loop.id, constrainedDuration);
          }
        }
      } else if (resizeDirection === 'left') {
        // Calculate new start time (user is dragging left edge)
        const newStartTime = Math.max(0, mouseTime);
        
        // CRITICAL: Keep the right edge (endTime) FIXED
        // Don't change loop.endTime at all
        const fixedEndTime = loop.endTime;
        
        // Calculate how much we're trimming from the left
        const startTimeChange = newStartTime - loop.startTime;
        
        // Calculate new duration (from new start to fixed end)
        const newDuration = fixedEndTime - newStartTime;
        const minDuration = 0.1;
        
        if (newDuration >= minDuration && newStartTime >= 0 && Math.abs(startTimeChange) > 0.1) {
          // Calculate the start offset in the audio file
          // This tracks where in the original audio we should start playing
          const currentStartOffset = loop.startOffset || 0;
          const newStartOffset = currentStartOffset + startTimeChange;
          
          // Update ONLY the startTime and startOffset
          // Do NOT update endTime - it stays fixed!
          onLoopUpdate(loop.id, { 
            startTime: newStartTime,
            startOffset: newStartOffset  // Where in audio file to start
            // endTime is NOT updated - stays fixed!
          });
          
          if (onLoopResize) {
            onLoopResize(loop.id, newDuration);
          }
        }
      }
    };

    const handleMouseUp = () => {
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
  }, [isResizing, resizeDirection, loop, onLoopUpdate, onLoopResize, timeToPixel, videoDuration]);

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    onLoopDelete(loop.id);
    setShowContextMenu(false);
  }, [loop.id, onLoopDelete]);

  // ============================================================================
  // CONTEXT MENU HANDLERS (GarageBand-style right-click)
  // ============================================================================

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the loop if not already selected
    if (!isSelected) {
      onLoopSelect(loop.id);
    }
    
    // Position the context menu at the mouse cursor
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    setShowContextMenu(true);
  }, [isSelected, onLoopSelect, loop.id]);

  // Close context menu when clicking outside
  useEffect(() => {
    if (!showContextMenu) return;

    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showContextMenu]);

  // ============================================================================
  // DELETE KEY HANDLER - Works on all devices (PC, Mac, Chromebook)
  // ============================================================================
  useEffect(() => {
    console.log('🔍 Loop selection state:', {
      loopName: loop.name,
      isSelected,
      loopId: loop.id
    });

    if (!isSelected) return;

    console.log('✅ Delete key listener ACTIVE for:', loop.name);

    const handleKeyDown = (e) => {
      console.log('⌨️ Key pressed:', {
        key: e.key,
        code: e.code,
        loopName: loop.name,
        isSelected,
        target: e.target.tagName
      });

      // Delete or Backspace key when this loop is selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent default backspace navigation
        e.preventDefault();
        console.log('🗑️ DELETE TRIGGERED for loop:', loop.name);
        onLoopDelete(loop.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('👂 Keydown listener added for:', loop.name);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('👋 Keydown listener removed for:', loop.name);
    };
  }, [isSelected, loop.id, loop.name, onLoopDelete]);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.resize-handle')) {
      e.stopPropagation();
      return;
    }
    
    if (isResizing) return;

    if (!isSelected) {
      console.log('🖱️ SELECTING loop:', loop.name, loop.id);
      onLoopSelect(loop.id);
    } else {
      console.log('🖱️ Loop already selected:', loop.name);
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

  // ============================================================================
  // RENDER
  // ============================================================================

  const dragStyle = isDragged ? {
    opacity: 0.7,
    zIndex: 1000,
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    pointerEvents: 'none'
  } : {};

  return (
    <div
      className={`loop-block absolute cursor-move transition-all duration-150 ${
        trackState?.muted ? 'opacity-50' : ''
      } ${
        isDragged ? 'opacity-60' : ''
      } ${
        isResizing ? 'z-50' : 'z-10'
      } ${
        isMultiSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''
      }`}
      style={{
        left: `${leftPosition}px`,
        top: `${topPosition + 8}px`,
        width: `${width}px`,
        height: `${TIMELINE_CONSTANTS.TRACK_HEIGHT - 16}px`,
        backgroundColor: isMultiSelected ? categoryColor.accent + '40' : categoryColor.bg,
        borderRadius: '4px',
        overflow: 'hidden',
        ...dragStyle
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      data-loop-id={loop.id}
    >
      {/* Logic Pro Style - Rounded Rectangle with Smart-Contrast Notches */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <path
          d={(() => {
            const originalDuration = originalDurationRef.current || loop.duration;
            const currentDuration = loop.endTime - loop.startTime;
            const startOffset = loop.startOffset || 0;
            const blockHeight = TIMELINE_CONSTANTS.TRACK_HEIGHT - 16;
            const cornerRadius = 4;
            const notchSize = 4;
            
            // Calculate where the loop markers should be based on ORIGINAL positions
            const totalOriginalDuration = currentDuration + startOffset;
            const fullLoops = Math.floor(totalOriginalDuration / originalDuration);
            
            // Find which markers are visible (after startOffset, before end)
            const visibleMarkers = [];
            for (let i = 1; i <= fullLoops; i++) {
              const markerTimeInOriginal = i * originalDuration;
              
              if (markerTimeInOriginal > startOffset && markerTimeInOriginal < (startOffset + currentDuration)) {
                const markerTimeInVisible = markerTimeInOriginal - startOffset;
                visibleMarkers.push(markerTimeInVisible);
              }
            }
            
            // Start with top-left rounded corner
            let pathData = `M ${cornerRadius},0`;
            
            // Top edge with notches at FIXED positions
            if (visibleMarkers.length > 0) {
              for (let i = 0; i < visibleMarkers.length; i++) {
                const markerTime = visibleMarkers[i];
                const x = (markerTime / currentDuration) * width;
                
                pathData += ` L ${x - notchSize},0`;
                pathData += ` L ${x},${notchSize}`;
                pathData += ` L ${x + notchSize},0`;
              }
            }
            
            // Top-right corner
            pathData += ` L ${width - cornerRadius},0`;
            pathData += ` Q ${width},0 ${width},${cornerRadius}`;
            
            // Right edge
            pathData += ` L ${width},${blockHeight - cornerRadius}`;
            
            // Bottom-right corner
            pathData += ` Q ${width},${blockHeight} ${width - cornerRadius},${blockHeight}`;
            
            // Bottom edge with notches (reverse order)
            if (visibleMarkers.length > 0) {
              for (let i = visibleMarkers.length - 1; i >= 0; i--) {
                const markerTime = visibleMarkers[i];
                const x = (markerTime / currentDuration) * width;
                
                pathData += ` L ${x + notchSize},${blockHeight}`;
                pathData += ` L ${x},${blockHeight - notchSize}`;
                pathData += ` L ${x - notchSize},${blockHeight}`;
              }
            }
            
            // Bottom-left corner
            pathData += ` L ${cornerRadius},${blockHeight}`;
            pathData += ` Q 0,${blockHeight} 0,${blockHeight - cornerRadius}`;
            
            // Left edge
            pathData += ` L 0,${cornerRadius}`;
            
            // Close path back to top-left corner
            pathData += ` Q 0,0 ${cornerRadius},0 Z`;
            
            return pathData;
          })()}
          fill="none"
          stroke={(() => {
            // Smart contrast: Calculate if loop color is light or dark
            const hex = loopColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // Calculate perceived brightness (0-255)
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            // If selected, use blue
            if (isSelected) return '#60a5fa';
            
            // Use white for dark colors, dark for light colors
            return brightness > 128 ? '#00000080' : '#ffffff80';
          })()}
          strokeWidth={isSelected ? "2" : "1.5"}
          opacity={isSelected ? "1" : "0.8"}
        />
      </svg>

      {/* CLEAR VERTICAL SEPARATOR LINES - Highly Visible Loop Repeat Markers */}
      {(() => {
        const originalDuration = originalDurationRef.current || loop.duration;
        const currentDuration = loop.endTime - loop.startTime;
        const startOffset = loop.startOffset || 0;
        
        // Calculate how many complete loops fit in the ORIGINAL timeline (before trimming)
        // This determines where the markers were originally placed
        const totalOriginalDuration = currentDuration + startOffset;
        const fullLoops = Math.floor(totalOriginalDuration / originalDuration);
        const hasPartialLoop = (totalOriginalDuration % originalDuration) > 0.01;
        
        // We want to show markers at the ORIGINAL loop boundaries
        // But only the ones that are visible (after the startOffset)
        const markers = [];
        
        for (let i = 1; i <= fullLoops; i++) {
          const markerTimeInOriginal = i * originalDuration;
          
          // Only show marker if it's after the startOffset (visible portion)
          if (markerTimeInOriginal > startOffset) {
            // Calculate position in the visible timeline
            const markerTimeInVisible = markerTimeInOriginal - startOffset;
            
            // Only show if it's within the current duration (before the end)
            if (markerTimeInVisible < currentDuration) {
              markers.push(markerTimeInVisible);
            }
          }
        }
        
        if (markers.length === 0) return null;
        
        // Calculate if loop color is light or dark for smart contrast
        const hex = loopColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Choose contrasting color
        const separatorColor = brightness > 128 ? '#000000' : '#ffffff';
        
        return markers.map((markerTime, i) => {
          const x = (markerTime / currentDuration) * width;
          
          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${x}px`,
                top: '2px',
                bottom: '2px',
                width: '2px',
                transform: 'translateX(-1px)',
                backgroundColor: separatorColor,
                opacity: 0.5,
                boxShadow: `0 0 4px ${separatorColor}`,
                borderRadius: '1px'
              }}
            />
          );
        });
      })()}

      {/* Selection Highlight */}
      {isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none rounded"
          style={{
            border: '2px solid #60a5fa',
            boxShadow: '0 0 0 1px rgba(96, 165, 250, 0.3)'
          }}
        />
      )}

      {/* Waveform Canvas */}
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

      {/* Loop Info - Just name and duration, no delete button */}
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
      </div>

      {/* Context Menu - Delete Only */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-1 z-[9999]"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '140px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
            title="Delete this loop (or press Delete key)"
          >
            <Trash2 size={14} />
            <span>Delete Loop</span>
          </button>
        </div>
      )}

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
        title="Drag to resize loop"
        data-resize-handle="right"
        style={{
          width: isResizing && resizeDirection === 'right' ? '8px' : '4px',
          zIndex: 1000
        }}
      >
        {isResizing && resizeDirection === 'right' && (
          <div className="absolute -top-10 right-0 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
            {Math.round((loop.endTime - loop.startTime) * 10) / 10}s ({numRepeats}x)
          </div>
        )}
      </div>

      {/* Loading Indicator */}
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