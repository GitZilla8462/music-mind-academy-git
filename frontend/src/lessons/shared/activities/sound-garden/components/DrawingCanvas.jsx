// File: DrawingCanvas.jsx
// Drawing canvas overlay for brush strokes and stickers
// Sits on top of VexFlow notation

import React, { useRef, useState, useCallback, useEffect } from 'react';

const DrawingCanvas = ({
  width,
  height,
  activeTool,
  brushColor,
  brushSize,
  brushStyle,
  activeSticker,
  strokes,
  setStrokes,
  stickers,
  setStickers,
  addToHistory,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // Get pointer position relative to canvas
  const getPointerPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Start drawing
  const handlePointerDown = useCallback((e) => {
    if (activeTool === 'sticker') {
      // Place sticker
      const pos = getPointerPosition(e);
      const newSticker = {
        id: Date.now(),
        emoji: activeSticker,
        x: pos.x,
        y: pos.y,
      };
      setStickers(prev => [...prev, newSticker]);
      addToHistory({ type: 'sticker', id: newSticker.id });
    } else if (activeTool === 'brush' || activeTool === 'eraser') {
      setIsDrawing(true);
      const pos = getPointerPosition(e);
      setCurrentPath([pos]);
    }
  }, [activeTool, activeSticker, getPointerPosition, setStickers, addToHistory]);

  // Continue drawing
  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || (activeTool !== 'brush' && activeTool !== 'eraser')) return;
    
    const pos = getPointerPosition(e);
    setCurrentPath(prev => [...prev, pos]);
  }, [isDrawing, activeTool, getPointerPosition]);

  // End drawing
  const handlePointerUp = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }

    if (activeTool === 'eraser') {
      // For eraser, find and remove strokes that intersect with path
      const eraserSize = brushSize * 3;
      setStrokes(prev => prev.filter(stroke => {
        // Check if any point of eraser path is near this stroke
        for (const eraserPoint of currentPath) {
          for (const strokePoint of stroke.points) {
            const dist = Math.sqrt(
              Math.pow(eraserPoint.x - strokePoint.x, 2) +
              Math.pow(eraserPoint.y - strokePoint.y, 2)
            );
            if (dist < eraserSize) {
              return false; // Remove this stroke
            }
          }
        }
        return true; // Keep this stroke
      }));
    } else {
      // Create new stroke
      const newStroke = {
        id: Date.now(),
        color: brushColor,
        size: brushSize,
        style: brushStyle,
        points: [...currentPath],
      };
      setStrokes(prev => [...prev, newStroke]);
      addToHistory({ type: 'stroke', id: newStroke.id });
    }

    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, activeTool, brushColor, brushSize, brushStyle, setStrokes, addToHistory]);

  // Convert points to SVG path string
  const pointsToPath = (points) => {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      // Use quadratic curves for smoother lines
      if (i < points.length - 1) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
      } else {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    return d;
  };

  // Get style attributes for a stroke
  const getStrokeStyle = (stroke) => {
    const base = {
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };

    switch (stroke.style) {
      case 'marker':
        return {
          ...base,
          stroke: stroke.color,
          strokeWidth: stroke.size * 1.5,
          opacity: 0.5,
        };
      case 'glow':
        return {
          ...base,
          stroke: stroke.color,
          strokeWidth: stroke.size,
          filter: `drop-shadow(0 0 ${stroke.size}px ${stroke.color})`,
        };
      case 'dotted':
        return {
          ...base,
          stroke: stroke.color,
          strokeWidth: stroke.size,
          strokeDasharray: `${stroke.size} ${stroke.size * 2}`,
        };
      case 'spray':
        // Spray effect handled differently - multiple small dots
        return {
          ...base,
          stroke: stroke.color,
          strokeWidth: 1,
          opacity: 0.7,
        };
      case 'rainbow':
        // Rainbow handled with gradient
        return {
          ...base,
          stroke: 'url(#rainbow-gradient)',
          strokeWidth: stroke.size,
        };
      default: // solid
        return {
          ...base,
          stroke: stroke.color,
          strokeWidth: stroke.size,
        };
    }
  };

  // Generate spray dots along path
  const generateSprayDots = (points, size) => {
    const dots = [];
    const density = size * 2;
    
    for (const point of points) {
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * size * 1.5;
        dots.push({
          x: point.x + Math.cos(angle) * radius,
          y: point.y + Math.sin(angle) * radius,
          r: Math.random() * 2 + 0.5,
        });
      }
    }
    
    return dots;
  };

  // Get cursor style based on tool
  const getCursor = () => {
    switch (activeTool) {
      case 'brush':
      case 'eraser':
        return 'crosshair';
      case 'sticker':
        return 'copy';
      default:
        return 'default';
    }
  };

  return (
    <svg
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: getCursor(),
        pointerEvents: activeTool === 'bloom' ? 'none' : 'all',
        zIndex: 5, // Behind notes (z-index 10) so notation stays visible
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Rainbow gradient definition */}
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="17%" stopColor="#ff8000" />
          <stop offset="33%" stopColor="#ffff00" />
          <stop offset="50%" stopColor="#00ff00" />
          <stop offset="67%" stopColor="#0080ff" />
          <stop offset="83%" stopColor="#8000ff" />
          <stop offset="100%" stopColor="#ff0080" />
        </linearGradient>
      </defs>

      {/* Render saved strokes */}
      {strokes.map(stroke => {
        if (stroke.style === 'spray') {
          // Render spray as dots
          const dots = generateSprayDots(stroke.points, stroke.size);
          return (
            <g key={stroke.id}>
              {dots.map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.r}
                  fill={stroke.color}
                  opacity={0.7}
                />
              ))}
            </g>
          );
        }
        
        return (
          <path
            key={stroke.id}
            d={pointsToPath(stroke.points)}
            {...getStrokeStyle(stroke)}
          />
        );
      })}

      {/* Render current drawing path */}
      {isDrawing && currentPath.length > 1 && activeTool === 'brush' && (
        <path
          d={pointsToPath(currentPath)}
          {...getStrokeStyle({ color: brushColor, size: brushSize, style: brushStyle })}
        />
      )}

      {/* Eraser preview */}
      {isDrawing && currentPath.length > 0 && activeTool === 'eraser' && (
        <circle
          cx={currentPath[currentPath.length - 1].x}
          cy={currentPath[currentPath.length - 1].y}
          r={brushSize * 1.5}
          fill="rgba(255,255,255,0.3)"
          stroke="white"
          strokeWidth={1}
        />
      )}

      {/* Render stickers */}
      {stickers.map(sticker => (
        <text
          key={sticker.id}
          x={sticker.x}
          y={sticker.y}
          fontSize={32}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ 
            pointerEvents: 'none',
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
          }}
          className="sticker-drop"
        >
          {sticker.emoji}
        </text>
      ))}
    </svg>
  );
};

export default DrawingCanvas;