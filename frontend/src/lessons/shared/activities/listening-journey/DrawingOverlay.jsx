// DrawingOverlay — Transparent freehand drawing canvas for the Listening Journey viewport
// Supports brush, pencil, and eraser tools via BrushEngine
// Sits between the parallax scene and sticker layer

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { BrushEngine } from '../texture-drawings/engine/BrushEngine';

const DrawingOverlay = forwardRef(({
  isActive = false,
  tool = 'brush',
  color = '#ffffff',
  brushSize = 8,
  opacity = 1,
  initialData = null,
}, ref) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const engineRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPtRef = useRef(null);
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Canvas setup & resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const { width: w, height: h } = container.getBoundingClientRect();
      if (w === 0 || h === 0) return;

      // Save current content before resize
      let savedContent = null;
      if (sizeRef.current.w > 0) {
        try { savedContent = canvas.toDataURL(); } catch (e) { /* ignore */ }
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;
      engineRef.current = new BrushEngine(ctx);
      sizeRef.current = { w, h };

      // Restore: saved content first, or initial data on first resize
      const toLoad = savedContent || initialData;
      if (toLoad) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, w, h);
        img.src = toLoad;
      }
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save initial history entry after canvas is ready
  useEffect(() => {
    const t = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && canvas.width > 0) {
        historyRef.current = [canvas.toDataURL()];
        historyIdxRef.current = 0;
      }
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const data = canvas.toDataURL();
    const arr = historyRef.current.slice(0, historyIdxRef.current + 1);
    arr.push(data);
    if (arr.length > 30) arr.shift();
    historyRef.current = arr;
    historyIdxRef.current = arr.length - 1;
  }, []);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }, []);

  const handleDown = useCallback((e) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    drawingRef.current = true;
    const pt = getPoint(e);
    lastPtRef.current = pt;
    const engine = engineRef.current;
    if (!engine) return;
    if (tool === 'eraser') {
      engine.drawEraser(pt.x, pt.y, pt.x + 0.1, pt.y + 0.1, brushSize);
    } else {
      engine.drawStroke(pt.x, pt.y, pt.x + 0.1, pt.y + 0.1, { tool, color, size: brushSize, opacity });
    }
  }, [isActive, tool, color, brushSize, opacity, getPoint]);

  const handleMove = useCallback((e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pt = getPoint(e);
    const last = lastPtRef.current;
    if (!last) return;
    const engine = engineRef.current;
    if (!engine) return;
    if (tool === 'eraser') {
      engine.drawEraser(last.x, last.y, pt.x, pt.y, brushSize);
    } else {
      engine.drawStroke(last.x, last.y, pt.x, pt.y, { tool, color, size: brushSize, opacity });
    }
    lastPtRef.current = pt;
  }, [tool, color, brushSize, opacity, getPoint]);

  const handleUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPtRef.current = null;
    saveHistory();
  }, [saveHistory]);

  // Global move/up so strokes continue outside the canvas element
  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [handleMove, handleUp]);

  // Imperative API for parent component
  useImperativeHandle(ref, () => ({
    undo() {
      if (historyIdxRef.current <= 0) return;
      historyIdxRef.current--;
      const data = historyRef.current[historyIdxRef.current];
      const ctx = ctxRef.current;
      const { w, h } = sizeRef.current;
      if (!ctx || !data) return;
      const img = new Image();
      img.onload = () => { ctx.clearRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); };
      img.src = data;
    },
    clear() {
      const ctx = ctxRef.current;
      const { w, h } = sizeRef.current;
      if (ctx) ctx.clearRect(0, 0, w, h);
      saveHistory();
    },
    getDataURL() {
      const canvas = canvasRef.current;
      return canvas && canvas.width > 0 ? canvas.toDataURL() : null;
    },
    loadFromDataURL(dataUrl) {
      if (!dataUrl) return;
      const ctx = ctxRef.current;
      const { w, h } = sizeRef.current;
      if (!ctx) return;
      const img = new Image();
      img.onload = () => { ctx.clearRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); saveHistory(); };
      img.src = dataUrl;
    },
  }), [saveHistory]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 top-0"
      style={{
        zIndex: isActive ? 35 : 15,
        pointerEvents: isActive ? 'auto' : 'none',
        cursor: isActive ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default',
      }}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
    />
  );
});

DrawingOverlay.displayName = 'DrawingOverlay';
export default DrawingOverlay;
