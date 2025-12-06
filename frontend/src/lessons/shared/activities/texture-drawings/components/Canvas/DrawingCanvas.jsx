/**
 * DrawingCanvas.jsx - Canvas with Object-Based Stickers
 * 
 * Supports render types:
 * - svg: PNG instrument icons
 * - text: Dynamic markings (pp, ff)
 * - text-italic: Tempo/expression markings
 * - crescendo/decrescendo: Hairpin shapes
 * - symbol: Musical symbols (clefs, accidentals)
 * - symbol-large: Articulation marks
 * - form-label: Section labels (A, B, C in circles)
 * - form-text: Form text (Intro, Coda, etc.)
 * - emoji: Default
 */

import React, { 
  useRef, 
  useState, 
  useEffect, 
  useCallback, 
  useImperativeHandle, 
  forwardRef 
} from 'react';
import { INSTRUMENT_ICONS } from '../../config/InstrumentIcons';

// ============================================================================
// CONSTANTS
// ============================================================================

// Tool type helpers - case insensitive matching
const isHandTool = (t) => t?.toLowerCase() === 'hand';
const isStickerTool = (t) => t?.toLowerCase() === 'sticker';
const isDrawingTool = (t) => ['brush', 'pencil', 'eraser'].includes(t?.toLowerCase());
const isEraserTool = (t) => t?.toLowerCase() === 'eraser';
const isPencilTool = (t) => t?.toLowerCase() === 'pencil';

// ============================================================================
// STICKER RENDERER
// ============================================================================

const StickerRenderer = ({ sticker, isSelected, onInteraction }) => {
  const { x, y, rotation, scale, data } = sticker;
  const baseSize = data?.size || 56;
  const size = baseSize * scale;
  const stickerColor = data?.color || '#000000';
  
  const handleMouseDown = (e, mode = 'move') => {
    e.preventDefault(); // Prevent native browser drag
    e.stopPropagation();
    onInteraction(e, sticker, mode);
  };

  const renderContent = () => {
    // SVG instrument icon (actually PNG)
    if (data?.render === 'svg' && data?.id) {
      const IconComponent = INSTRUMENT_ICONS[data.id];
      if (IconComponent) {
        return <IconComponent size={size} />;
      }
    }
    
    // Text dynamics (pp, ff, etc.)
    if (data?.render === 'text') {
      return (
        <span style={{
          fontFamily: 'Times New Roman, Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 'bold',
          fontSize: `${size * 0.6}px`,
          color: stickerColor,
          userSelect: 'none'
        }}>
          {data.symbol}
        </span>
      );
    }
    
    // Tempo/expression markings
    if (data?.render === 'text-italic') {
      return (
        <span style={{
          fontFamily: 'Times New Roman, Georgia, serif',
          fontStyle: 'italic',
          fontWeight: '600',
          fontSize: `${size * 0.35}px`,
          color: stickerColor,
          userSelect: 'none'
        }}>
          {data.symbol}
        </span>
      );
    }
    
    // Crescendo - hairpin opening to right
    if (data?.render === 'crescendo') {
      return (
        <svg width={size} height={size * 0.5} viewBox="0 0 60 30">
          <path d="M55 3 L5 15 L55 27" fill="none" stroke={stickerColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    // Decrescendo - hairpin opening to left
    if (data?.render === 'decrescendo') {
      return (
        <svg width={size} height={size * 0.5} viewBox="0 0 60 30">
          <path d="M5 3 L55 15 L5 27" fill="none" stroke={stickerColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    // Musical symbols (clefs, accidentals)
    if (data?.render === 'symbol') {
      return (
        <span style={{
          fontFamily: 'Noto Music, Symbola, serif',
          fontSize: `${size * 0.7}px`,
          color: stickerColor,
          userSelect: 'none'
        }}>
          {data.symbol}
        </span>
      );
    }
    
    // Large symbols for articulation
    if (data?.render === 'symbol-large') {
      return (
        <span style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: `${size * 0.8}px`,
          fontWeight: 'bold',
          color: stickerColor,
          userSelect: 'none'
        }}>
          {data.symbol}
        </span>
      );
    }
    
    // Form labels (A, B, C in circles)
    if (data?.render === 'form-label') {
      return (
        <div style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: `3px solid #1d4ed8`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <span style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: `${size * 0.45}px`,
            fontWeight: 'bold',
            color: '#ffffff',
            userSelect: 'none'
          }}>
            {data.symbol}
          </span>
        </div>
      );
    }
    
    // Form text (Intro, Coda, etc.)
    if (data?.render === 'form-text') {
      return (
        <div style={{
          padding: `${size * 0.1}px ${size * 0.2}px`,
          backgroundColor: '#fef3c7',
          border: `2px solid #f59e0b`,
          borderRadius: `${size * 0.15}px`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
        }}>
          <span style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: `${size * 0.3}px`,
            fontWeight: 'bold',
            color: '#92400e',
            userSelect: 'none',
            whiteSpace: 'nowrap'
          }}>
            {data.symbol}
          </span>
        </div>
      );
    }
    
    // Default: emoji
    return (
      <span style={{
        fontSize: `${size * 0.7}px`,
        userSelect: 'none'
      }}>
        {data?.symbol || '🎵'}
      </span>
    );
  };

  return (
    <div
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onTouchStart={(e) => handleMouseDown(e, 'move')}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${rotation}deg)`,
        cursor: 'move',
        borderRadius: '8px',
        border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none',
        transition: 'border 0.1s, background-color 0.1s, box-shadow 0.1s',
        zIndex: isSelected ? 100 : 10,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {renderContent()}
      
      {/* Control handles - only when selected */}
      {isSelected && (
        <>
          {/* Rotation handle - top */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
            onTouchStart={(e) => handleMouseDown(e, 'rotate')}
            style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '2px solid white',
              zIndex: 110,
              touchAction: 'none'
            }}
            title="Drag to rotate"
          >
            ↻
          </div>
          
          {/* Resize handle - bottom right */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
            onTouchStart={(e) => handleMouseDown(e, 'resize')}
            style={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              width: 20,
              height: 20,
              borderRadius: '4px',
              backgroundColor: '#10b981',
              cursor: 'nwse-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              border: '2px solid white',
              zIndex: 110,
              touchAction: 'none'
            }}
            title="Drag to resize"
          >
            ⤡
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// MAIN CANVAS
// ============================================================================

const DrawingCanvas = forwardRef(({
  width,
  height,
  instruments = [],
  tool = 'hand',
  color = '#000000',
  brushSize = 16,
  opacity = 1,
  selectedSticker = null,
  stickerSize = 56,
  onHistoryChange,
  onColorPick,
  onStickerPlaced
}, ref) => {
  
  // Canvas refs
  const drawingCanvasRef = useRef(null);
  const drawingCtxRef = useRef(null);
  const containerRef = useRef(null);
  
  // Sticker state
  const [stickers, setStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [nextStickerId, setNextStickerId] = useState(1);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef(null);
  
  // Drag state
  const dragRef = useRef(null);
  const [, forceUpdate] = useState(0);
  
  // History
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  
  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawingCtxRef.current = ctx;
    
    // All white background - no row shading
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    saveToHistory();
  }, [width, height, instruments.length]);
  
  // Update selected sticker color when color changes
  useEffect(() => {
    if (selectedStickerId && color) {
      setStickers(prev => prev.map(s => {
        if (s.id === selectedStickerId) {
          const render = s.data?.render;
          if (render === 'text' || render === 'text-italic' || render === 'symbol' || 
              render === 'symbol-large' || render === 'crescendo' || render === 'decrescendo') {
            return { ...s, data: { ...s.data, color } };
          }
        }
        return s;
      }));
    }
  }, [color, selectedStickerId]);
  
  // ========================================================================
  // HISTORY
  // ========================================================================
  
  const saveToHistory = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const state = {
      imageData: canvas.toDataURL(),
      stickers: JSON.parse(JSON.stringify(stickers))
    };
    
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(state);
    
    if (newHistory.length > 50) newHistory.shift();
    
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    
    onHistoryChange?.({
      canUndo: newHistory.length > 1,
      canRedo: false
    });
  }, [stickers, onHistoryChange]);
  
  const restoreState = (state) => {
    if (!state) return;
    
    const canvas = drawingCanvasRef.current;
    const ctx = drawingCtxRef.current;
    if (!canvas || !ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = state.imageData;
    
    setStickers(state.stickers || []);
    setSelectedStickerId(null);
  };
  
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    
    const newIndex = historyIndexRef.current - 1;
    const state = historyRef.current[newIndex];
    
    restoreState(state);
    historyIndexRef.current = newIndex;
    
    onHistoryChange?.({
      canUndo: newIndex > 0,
      canRedo: true
    });
  }, [onHistoryChange]);
  
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    
    const newIndex = historyIndexRef.current + 1;
    const state = historyRef.current[newIndex];
    
    restoreState(state);
    historyIndexRef.current = newIndex;
    
    onHistoryChange?.({
      canUndo: true,
      canRedo: newIndex < historyRef.current.length - 1
    });
  }, [onHistoryChange]);
  
  // ========================================================================
  // COORDINATE HELPERS
  // ========================================================================
  
  const getEventCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };
  
  const getCanvasPoint = (e) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const { clientX, clientY } = getEventCoords(e);
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };
  
  // ========================================================================
  // DRAWING
  // ========================================================================
  
  const startDrawing = (point) => {
    const ctx = drawingCtxRef.current;
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    if (isEraserTool(tool)) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    
    ctx.lineWidth = isPencilTool(tool) ? Math.max(1, brushSize / 4) : brushSize;
    ctx.globalAlpha = opacity;
    
    setIsDrawing(true);
    lastPointRef.current = point;
  };
  
  const continueDrawing = (point) => {
    if (!isDrawing || !lastPointRef.current) return;
    
    const ctx = drawingCtxRef.current;
    if (!ctx) return;
    
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    lastPointRef.current = point;
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = drawingCtxRef.current;
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
      setIsDrawing(false);
      lastPointRef.current = null;
      saveToHistory();
    }
  };
  
  // ========================================================================
  // STICKER PLACEMENT
  // ========================================================================
  
  const placeSticker = (point) => {
    if (!selectedSticker) return;
    
    const newSticker = {
      id: nextStickerId,
      type: 'sticker',
      x: point.x,
      y: point.y,
      rotation: 0,
      scale: 1,
      data: {
        ...selectedSticker,
        size: stickerSize,
        color: color
      }
    };
    
    setStickers(prev => [...prev, newSticker]);
    setNextStickerId(prev => prev + 1);
    setSelectedStickerId(newSticker.id);
    
    onStickerPlaced?.();
    
    setTimeout(saveToHistory, 50);
  };
  
  // ========================================================================
  // STICKER INTERACTION
  // ========================================================================
  
  const handleStickerInteraction = (e, sticker, mode) => {
    if (!isHandTool(tool)) return;
    
    e.stopPropagation();
    
    setSelectedStickerId(sticker.id);
    
    const { clientX, clientY } = getEventCoords(e);
    const canvas = drawingCanvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    
    if (!rect) return;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const centerX = rect.left + (sticker.x / scaleX);
    const centerY = rect.top + (sticker.y / scaleY);
    
    dragRef.current = {
      mode,
      stickerId: sticker.id,
      startX: clientX,
      startY: clientY,
      initialX: sticker.x,
      initialY: sticker.y,
      initialRotation: sticker.rotation,
      initialScale: sticker.scale,
      scaleX,
      scaleY,
      centerX,
      centerY,
      startAngle: Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI),
      startDistance: Math.max(30, Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)))
    };
    
    forceUpdate(n => n + 1);
  };
  
  // Global mouse/touch move handler
  useEffect(() => {
    const handleMove = (e) => {
      const drag = dragRef.current;
      
      if (drag) {
        const { clientX, clientY } = getEventCoords(e);
        
        if (drag.mode === 'move') {
          const dx = (clientX - drag.startX) * drag.scaleX;
          const dy = (clientY - drag.startY) * drag.scaleY;
          const newX = drag.initialX + dx;
          const newY = drag.initialY + dy;
          
          setStickers(prev => prev.map(s => 
            s.id === drag.stickerId 
              ? { ...s, x: newX, y: newY }
              : s
          ));
        } 
        else if (drag.mode === 'rotate') {
          const currentAngle = Math.atan2(
            clientY - drag.centerY, 
            clientX - drag.centerX
          ) * (180 / Math.PI);
          const deltaAngle = currentAngle - drag.startAngle;
          
          setStickers(prev => prev.map(s => 
            s.id === drag.stickerId 
              ? { ...s, rotation: drag.initialRotation + deltaAngle }
              : s
          ));
        }
        else if (drag.mode === 'resize') {
          const currentDist = Math.sqrt(
            Math.pow(clientX - drag.centerX, 2) + 
            Math.pow(clientY - drag.centerY, 2)
          );
          
          const scaleRatio = currentDist / drag.startDistance;
          const newScale = drag.initialScale * scaleRatio;
          const clampedScale = Math.max(0.3, Math.min(3, newScale));
          
          setStickers(prev => prev.map(s => 
            s.id === drag.stickerId 
              ? { ...s, scale: clampedScale }
              : s
          ));
        }
        return;
      }
      
      if (isDrawing && isDrawingTool(tool)) {
        const point = getCanvasPoint(e);
        continueDrawing(point);
      }
    };
    
    const handleEnd = () => {
      if (dragRef.current) {
        dragRef.current = null;
        forceUpdate(n => n + 1);
        saveToHistory();
      }
      stopDrawing();
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDrawing, tool, saveToHistory]);
  
  // ========================================================================
  // CANVAS MOUSE EVENTS
  // ========================================================================
  
  const handleCanvasMouseDown = (e) => {
    const point = getCanvasPoint(e);
    
    if (isStickerTool(tool)) {
      placeSticker(point);
    } else if (isDrawingTool(tool)) {
      startDrawing(point);
    }
  };
  
  const handleStickerLayerClick = (e) => {
    if (e.target === e.currentTarget && isHandTool(tool)) {
      setSelectedStickerId(null);
    }
  };
  
  // ========================================================================
  // KEYBOARD
  // ========================================================================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStickerId) {
        setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
        setSelectedStickerId(null);
        saveToHistory();
      }
      
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickerId, undo, redo, saveToHistory]);
  
  // ========================================================================
  // CLEAR LANE
  // ========================================================================
  
  const clearLane = (laneIndex) => {
    const rowHeight = height / instruments.length;
    const yStart = laneIndex * rowHeight;
    const yEnd = yStart + rowHeight;
    
    const ctx = drawingCtxRef.current;
    if (ctx) {
      ctx.clearRect(0, yStart, width, rowHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, yStart, width, rowHeight);
    }
    
    setStickers(prev => prev.filter(s => s.y < yStart || s.y > yEnd));
    saveToHistory();
  };
  
  // ========================================================================
  // EXPORT
  // ========================================================================
  
  const toDataURL = () => {
    const composite = document.createElement('canvas');
    composite.width = width;
    composite.height = height;
    const ctx = composite.getContext('2d');
    ctx.drawImage(drawingCanvasRef.current, 0, 0);
    return composite.toDataURL();
  };
  
  // ========================================================================
  // IMPERATIVE HANDLE
  // ========================================================================
  
  useImperativeHandle(ref, () => ({
    undo,
    redo,
    clearLane,
    toDataURL,
    getStickers: () => stickers,
  }));
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width, 
        height,
        overflow: 'visible'
      }}
    >
      <canvas
        ref={drawingCanvasRef}
        onMouseDown={handleCanvasMouseDown}
        onTouchStart={handleCanvasMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: isHandTool(tool) ? 'default' 
            : isStickerTool(tool) ? 'copy'
            : isEraserTool(tool) ? 'cell'
            : 'crosshair'
        }}
      />
      
      {/* Sticker Layer */}
      <div 
        onClick={handleStickerLayerClick}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && isHandTool(tool)) {
            setSelectedStickerId(null);
          }
        }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          overflow: 'visible',
          pointerEvents: isHandTool(tool) ? 'auto' : 'none'
        }}
      >
        {stickers.map(sticker => {
          // Convert canvas coordinates to screen coordinates for rendering
          const canvas = drawingCanvasRef.current;
          const rect = canvas?.getBoundingClientRect();
          const scaleX = canvas && rect ? canvas.width / rect.width : 1;
          const scaleY = canvas && rect ? canvas.height / rect.height : 1;
          
          const screenX = sticker.x / scaleX;
          const screenY = sticker.y / scaleY;
          
          const screenSticker = {
            ...sticker,
            x: screenX,
            y: screenY
          };
          
          return (
            <StickerRenderer
              key={sticker.id}
              sticker={screenSticker}
              isSelected={selectedStickerId === sticker.id}
              onInteraction={(e, s, mode) => handleStickerInteraction(e, sticker, mode)}
            />
          );
        })}
      </div>
      
      {selectedStickerId && isHandTool(tool) && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 200
        }}>
          <strong>Delete</strong> to remove • <strong>Drag</strong> to move • <strong style={{color: '#60a5fa'}}>↻</strong> to rotate • <strong style={{color: '#34d399'}}>⤡</strong> to resize
        </div>
      )}
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;