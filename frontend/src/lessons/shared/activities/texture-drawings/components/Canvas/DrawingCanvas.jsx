/**
 * DrawingCanvas.jsx - Main Canvas Component
 * 
 * Handles:
 * - Mouse and touch events
 * - Coordinates drawing operations
 * - Integrates with all engines (brush, shape, fill, lane clipping)
 * - Preview overlays for shapes
 */

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { DrawingEngine } from '../../engine/DrawingEngine.js';
import { BrushEngine } from '../../engine/BrushEngine.js';
import { ShapeEngine } from '../../engine/ShapeEngine.js';
import { FillEngine } from '../../engine/FillEngine.js';
import { LaneManager } from '../../engine/LaneClipping.js';
import { TOOL_TYPES, isShapeTool, isBrushTool } from '../../config/tools.js';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  },
  canvasWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'auto',
    padding: '0'
  },
  canvas: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto'
  },
  previewCanvas: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    left: 0
  },
  laneLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100px',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column'
  },
  laneLabel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
    borderLeft: '3px solid',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)'
  }
};

// ============================================================================
// DRAWING CANVAS COMPONENT
// ============================================================================

const DrawingCanvas = forwardRef(({
  width = 880,
  height = 400,
  instruments = [],
  tool = TOOL_TYPES.BRUSH,
  color = '#FFFFFF',
  brushSize = 8,
  opacity = 1,
  selectedSticker = null,
  stickerSize = 32,
  shapeOptions = {},
  onHistoryChange,
  onColorPick
}, ref) => {
  // Refs
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Engines
  const drawingEngineRef = useRef(null);
  const brushEngineRef = useRef(null);
  const shapeEngineRef = useRef(null);
  const fillEngineRef = useRef(null);
  const laneManagerRef = useRef(null);
  const activeLaneRef = useRef(null); // Track locked lane during stroke

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [shapeStart, setShapeStart] = useState(null);
  const [activeLane, setActiveLane] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use height from props - parent calculates based on container size
  const canvasHeight = height;

  // ========================================================================
  // INITIALIZATION - Only runs once when we have valid, reasonable dimensions
  // ========================================================================

  const hasInitializedRef = useRef(false);
  const initialDimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    // Guard: Don't initialize if canvas isn't ready or no instruments
    if (!canvas || instruments.length === 0) return;
    
    // Guard: Don't initialize with zero/tiny dimensions
    if (!canvasHeight || !width || canvasHeight < 100 || width < 100) return;
    
    // IMPORTANT: Only initialize when dimensions are reasonable
    // Each lane should be at least 80px tall for good usability
    const minLaneHeight = 80;
    const minTotalHeight = instruments.length * minLaneHeight;
    if (canvasHeight < minTotalHeight) return;
    
    // Only initialize ONCE with the first valid dimensions
    if (hasInitializedRef.current) return;
    
    // Store the initial dimensions
    initialDimensionsRef.current = { width, height: canvasHeight };
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = canvasHeight;
    
    if (previewCanvas) {
      previewCanvas.width = width;
      previewCanvas.height = canvasHeight;
    }

    const ctx = canvas.getContext('2d');
    const previewCtx = previewCanvas?.getContext('2d');

    // Initialize engines
    drawingEngineRef.current = new DrawingEngine(canvas, {
      backgroundColor: '#ffffff'
    });
    
    brushEngineRef.current = new BrushEngine(ctx);
    shapeEngineRef.current = new ShapeEngine(ctx);
    fillEngineRef.current = new FillEngine(ctx, canvas);
    laneManagerRef.current = new LaneManager(canvas, ctx, instruments);

    // Draw initial state with lanes
    if (laneManagerRef.current) {
      laneManagerRef.current.drawLaneBackgrounds('#ffffff');
    }
    if (drawingEngineRef.current) {
      drawingEngineRef.current.saveState();
    }

    hasInitializedRef.current = true;
    setIsInitialized(true);
    updateHistoryState();

  }, [width, canvasHeight, instruments]);

  // Update lane manager when instruments change
  useEffect(() => {
    if (laneManagerRef.current && isInitialized && instruments.length > 0) {
      laneManagerRef.current.setInstruments(instruments);
    }
  }, [instruments, isInitialized]);

  // ========================================================================
  // IMPERATIVE HANDLE (for parent access)
  // ========================================================================

  useImperativeHandle(ref, () => ({
    undo: () => {
      const result = drawingEngineRef.current?.undo();
      updateHistoryState();
      return result;
    },
    redo: () => {
      const result = drawingEngineRef.current?.redo();
      updateHistoryState();
      return result;
    },
    clear: () => {
      if (laneManagerRef.current) {
        laneManagerRef.current.drawLaneBackgrounds('#ffffff');
      }
      drawingEngineRef.current?.saveState();
      updateHistoryState();
    },
    clearLane: (laneIndex) => {
      // Clear just one lane by filling it with white
      if (laneManagerRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const lane = laneManagerRef.current.getLaneByIndex(laneIndex);
        if (lane && ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, lane.top, canvasRef.current.width, lane.height);
          // Redraw the lane divider line below this lane (if not last lane)
          if (laneIndex < instruments.length - 1) {
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, lane.bottom);
            ctx.lineTo(canvasRef.current.width, lane.bottom);
            ctx.stroke();
          }
          drawingEngineRef.current?.saveState();
          updateHistoryState();
        }
      }
    },
    toDataURL: () => drawingEngineRef.current?.toDataURL(),
    getHistoryInfo: () => drawingEngineRef.current?.getHistoryInfo()
  }));

  // ========================================================================
  // HELPERS
  // ========================================================================

  const updateHistoryState = () => {
    const info = drawingEngineRef.current?.getHistoryInfo();
    onHistoryChange?.(info);
  };

  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const getCursor = () => {
    switch (tool) {
      case TOOL_TYPES.EYEDROPPER:
        return 'crosshair';
      case TOOL_TYPES.FILL:
        return 'cell';
      case TOOL_TYPES.STICKER:
        return 'copy';
      case TOOL_TYPES.ERASER:
        // Create a custom cursor for eraser - grey circle that's visible on white
        const size = Math.max(brushSize, 12);
        const canvas = document.createElement('canvas');
        canvas.width = size + 4;
        canvas.height = size + 4;
        const ctx = canvas.getContext('2d');
        // Draw grey outline circle
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc((size + 4) / 2, (size + 4) / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        // Light fill
        ctx.fillStyle = 'rgba(229, 231, 235, 0.5)';
        ctx.fill();
        return `url(${canvas.toDataURL()}) ${(size + 4) / 2} ${(size + 4) / 2}, crosshair`;
      default:
        return 'crosshair';
    }
  };

  // ========================================================================
  // DRAWING OPERATIONS - Use activeLaneRef to lock drawing to starting lane
  // ========================================================================

  const drawBrushStroke = (fromX, fromY, toX, toY) => {
    if (!laneManagerRef.current || !brushEngineRef.current) return;
    
    // Use the locked activeLaneRef (set on pointer down), not current position
    // This prevents drawing across lane boundaries
    const lockedLane = activeLaneRef.current;
    if (lockedLane === null) return;
    
    const lane = laneManagerRef.current.getLaneByIndex(lockedLane);
    if (!lane) return;

    // Begin lane clipping
    laneManagerRef.current.beginClip(lockedLane);

    // Draw using brush engine
    brushEngineRef.current.drawStroke(fromX, fromY, toX, toY, {
      tool,
      color,
      size: brushSize,
      opacity
    });

    // End clipping
    laneManagerRef.current.endClip();
  };

  const drawEraser = (fromX, fromY, toX, toY) => {
    if (!laneManagerRef.current || !brushEngineRef.current) return;
    
    // Use the locked activeLaneRef (set on pointer down), not current position
    const lockedLane = activeLaneRef.current;
    if (lockedLane === null) return;
    
    const lane = laneManagerRef.current.getLaneByIndex(lockedLane);
    if (!lane) return;

    laneManagerRef.current.beginClip(lockedLane);

    // Get lane background color for erasing
    const bgColor = laneManagerRef.current.getLaneBackgroundForErase(lockedLane, toY);
    brushEngineRef.current.drawEraser(fromX, fromY, toX, toY, brushSize, bgColor);

    laneManagerRef.current.endClip();
  };

  const placeSticker = (x, y) => {
    if (!selectedSticker || !laneManagerRef.current) return;

    const lane = laneManagerRef.current.getLaneAtY(y);
    if (!lane) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    laneManagerRef.current.beginClip(lane.index);

    ctx.font = `${stickerSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = opacity;
    ctx.fillText(selectedSticker, x, y);
    ctx.globalAlpha = 1;

    laneManagerRef.current.endClip();
  };

  const doFill = (x, y) => {
    if (!fillEngineRef.current) return;
    
    const result = fillEngineRef.current.floodFill(x, y, color, {
      tolerance: 32
    });
    
    if (result) {
      drawingEngineRef.current?.saveState();
      updateHistoryState();
    }
  };

  const pickColor = (x, y) => {
    const colorInfo = drawingEngineRef.current?.getPixelColor(x, y);
    if (colorInfo) {
      onColorPick?.(colorInfo.hex);
    }
  };

  const finishShape = (startX, startY, endX, endY) => {
    if (!laneManagerRef.current || !shapeEngineRef.current) return;
    
    const lane = laneManagerRef.current.getLaneAtY(startY);
    if (!lane) return;

    laneManagerRef.current.beginClip(lane.index);

    shapeEngineRef.current.drawShape(tool, startX, startY, endX, endY, {
      strokeColor: color,
      fillColor: color + '60', // 40% opacity fill
      strokeWidth: brushSize / 2,
      opacity,
      filled: true,
      ...shapeOptions
    });

    laneManagerRef.current.endClip();
  };

  const updateShapePreview = (startX, startY, endX, endY) => {
    const previewCtx = previewCanvasRef.current?.getContext('2d');
    if (!previewCtx) return;

    // Clear preview canvas
    previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

    // Draw preview shape
    const previewEngine = new ShapeEngine(previewCtx);
    previewEngine.drawPreview(tool, startX, startY, endX, endY, {
      strokeColor: color,
      strokeWidth: brushSize / 2,
      opacity: 0.6
    });
  };

  const clearShapePreview = () => {
    const previewCtx = previewCanvasRef.current?.getContext('2d');
    if (previewCtx) {
      previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    
    // Guard: Don't handle if not initialized
    if (!isInitialized || !laneManagerRef.current) return;
    
    const pos = getCanvasCoords(e);

    // Lock to the lane where stroke starts - this prevents crossing lanes
    const lane = laneManagerRef.current.getLaneAtY(pos.y);
    const laneIndex = lane?.index ?? null;
    setActiveLane(laneIndex);
    activeLaneRef.current = laneIndex; // Lock the lane in ref for drawing functions

    // Handle different tools
    if (tool === TOOL_TYPES.EYEDROPPER) {
      pickColor(pos.x, pos.y);
      return;
    }

    if (tool === TOOL_TYPES.FILL) {
      doFill(pos.x, pos.y);
      return;
    }

    if (tool === TOOL_TYPES.STICKER) {
      placeSticker(pos.x, pos.y);
      drawingEngineRef.current?.saveState();
      updateHistoryState();
      return;
    }

    if (isShapeTool(tool)) {
      setShapeStart(pos);
      setIsDrawing(true);
      return;
    }

    // Brush tools
    setIsDrawing(true);
    setLastPos(pos);
    brushEngineRef.current?.beginStroke(pos.x, pos.y);

    // Draw single point
    if (tool === TOOL_TYPES.ERASER) {
      drawEraser(pos.x, pos.y, pos.x, pos.y);
    } else {
      drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    }
  }, [tool, color, brushSize, opacity, selectedSticker, stickerSize, getCanvasCoords, isInitialized]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getCanvasCoords(e);

    if (isShapeTool(tool) && shapeStart) {
      updateShapePreview(shapeStart.x, shapeStart.y, pos.x, pos.y);
      return;
    }

    // Brush drawing
    if (tool === TOOL_TYPES.ERASER) {
      drawEraser(lastPos.x, lastPos.y, pos.x, pos.y);
    } else if (isBrushTool(tool)) {
      drawBrushStroke(lastPos.x, lastPos.y, pos.x, pos.y);
    }

    setLastPos(pos);
  }, [isDrawing, tool, shapeStart, lastPos, getCanvasCoords]);

  const handlePointerUp = useCallback((e) => {
    if (!isDrawing) return;

    const pos = getCanvasCoords(e);

    if (isShapeTool(tool) && shapeStart) {
      finishShape(shapeStart.x, shapeStart.y, pos.x, pos.y);
      clearShapePreview();
      setShapeStart(null);
    }

    brushEngineRef.current?.endStroke();
    setIsDrawing(false);
    setActiveLane(null);
    activeLaneRef.current = null; // Clear the locked lane

    // Save state after stroke
    drawingEngineRef.current?.saveState();
    updateHistoryState();
  }, [isDrawing, tool, shapeStart, getCanvasCoords]);

  const handlePointerLeave = useCallback(() => {
    if (isDrawing) {
      brushEngineRef.current?.endStroke();
      setIsDrawing(false);
      setActiveLane(null);
      activeLaneRef.current = null; // Clear the locked lane
      clearShapePreview();
      setShapeStart(null);

      drawingEngineRef.current?.saveState();
      updateHistoryState();
    }
  }, [isDrawing]);

  // ========================================================================
  // RENDER
  // ========================================================================

  // Show loading state if no instruments
  if (instruments.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#666' }}>
          Loading canvas...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Canvas Wrapper - no lane labels, speakers provide that info */}
      <div style={styles.canvasWrapper}>
        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            cursor: getCursor()
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Preview Canvas (for shapes) */}
        <canvas
          ref={previewCanvasRef}
          style={{
            ...styles.previewCanvas,
            mixBlendMode: 'screen'
          }}
        />
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;