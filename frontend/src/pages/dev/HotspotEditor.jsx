// Dev-only Hotspot Editor for Melody Mystery scenes
// Displays scene images at 800x450 with draggable/resizable hotspot boxes

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, RefreshCw, Eye, EyeOff, Download } from 'lucide-react';
import { STORYLINES, getSceneImage } from '../../lessons/shared/activities/melody-mystery/melodyMysteryConcepts';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const HotspotEditor = () => {
  const [currentScene, setCurrentScene] = useState(1);
  const [ending, setEnding] = useState('ranaway');
  const [copied, setCopied] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  // Get location data
  const storyline = STORYLINES['vanishing-composer'];
  const endingData = storyline?.endings?.[ending];
  const locations = endingData?.locations || [];
  const location = locations.find(loc => loc.id === currentScene);

  // Initialize devices state from location data
  const [devices, setDevices] = useState(() => {
    if (!location?.selectableDevices) return [];
    return location.selectableDevices.map(d => ({ ...d }));
  });

  // Update devices when scene changes
  // If devices have zero/tiny coords, generate centered defaults
  useEffect(() => {
    if (location?.selectableDevices) {
      const devices = location.selectableDevices.map((d, index) => {
        // Check if this device has default/unset coordinates
        const isUnset = d.x === 0 && d.y === 0 || (d.w < 50 && d.h < 50);

        if (isUnset) {
          // Generate centered, spaced-out defaults
          const cols = 3;
          const boxW = 120;
          const boxH = 100;
          const gapX = 80;
          const gapY = 60;
          const startX = (CANVAS_WIDTH - (cols * boxW + (cols - 1) * gapX)) / 2;
          const startY = (CANVAS_HEIGHT - (2 * boxH + gapY)) / 2;

          const col = index % cols;
          const row = Math.floor(index / cols);

          return {
            ...d,
            x: Math.round(startX + col * (boxW + gapX)),
            y: Math.round(startY + row * (boxH + gapY)),
            w: boxW,
            h: boxH,
          };
        }
        return { ...d };
      });
      setDevices(devices);
    } else {
      setDevices([]);
    }
  }, [currentScene, ending]);

  // Drag state
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOriginal, setDragOriginal] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const containerRef = useRef(null);

  // Get scene image path
  const sceneImage = location ? getSceneImage('vanishing-composer', location.id, location.nameSlug) : null;

  // Handle mouse down on a device box
  const handleMouseDown = (e, deviceId, corner = null) => {
    e.stopPropagation();
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setDragging({ id: deviceId, corner });
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOriginal({ x: device.x, y: device.y, w: device.w, h: device.h });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setDevices(prev => prev.map(device => {
      if (device.id !== dragging.id) return device;

      if (dragging.corner === null) {
        // Moving the entire box
        return {
          ...device,
          x: Math.max(0, Math.min(CANVAS_WIDTH - device.w, Math.round(dragOriginal.x + dx))),
          y: Math.max(0, Math.min(CANVAS_HEIGHT - device.h, Math.round(dragOriginal.y + dy))),
        };
      } else {
        // Resizing from a corner
        let newX = device.x;
        let newY = device.y;
        let newW = device.w;
        let newH = device.h;

        const corner = dragging.corner;

        if (corner.includes('e')) {
          newW = Math.max(20, Math.round(dragOriginal.w + dx));
        }
        if (corner.includes('w')) {
          const proposedW = Math.max(20, Math.round(dragOriginal.w - dx));
          newX = Math.max(0, Math.round(dragOriginal.x + dragOriginal.w - proposedW));
          newW = proposedW;
        }
        if (corner.includes('s')) {
          newH = Math.max(20, Math.round(dragOriginal.h + dy));
        }
        if (corner.includes('n')) {
          const proposedH = Math.max(20, Math.round(dragOriginal.h - dy));
          newY = Math.max(0, Math.round(dragOriginal.y + dragOriginal.h - proposedH));
          newH = proposedH;
        }

        // Clamp to canvas bounds
        if (newX + newW > CANVAS_WIDTH) newW = CANVAS_WIDTH - newX;
        if (newY + newH > CANVAS_HEIGHT) newH = CANVAS_HEIGHT - newY;

        return { ...device, x: newX, y: newY, w: newW, h: newH };
      }
    }));
  }, [dragging, dragStart, dragOriginal]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Copy selectableDevices to clipboard
  const copyToClipboard = async () => {
    const output = `selectableDevices: [
${devices.map(d => `              { id: '${d.id}', name: '${d.name}', letter: '${d.letter}', x: ${d.x}, y: ${d.y}, w: ${d.w}, h: ${d.h} },`).join('\n')}
            ],`;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download image with hotspots drawn on it
  const downloadHotspotsImage = () => {
    if (!sceneImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Load scene image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw scene image
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw hotspot boxes
      devices.forEach(device => {
        // Orange fill with transparency
        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.fillRect(device.x, device.y, device.w, device.h);

        // Orange border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(device.x, device.y, device.w, device.h);

        // Label background
        ctx.fillStyle = '#f59e0b';
        const label = `${device.letter.toUpperCase()}: ${device.name}`;
        ctx.font = 'bold 12px monospace';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(device.x, device.y - 18, textWidth + 8, 16);

        // Label text
        ctx.fillStyle = '#000';
        ctx.fillText(label, device.x + 4, device.y - 6);
      });

      // Download
      const link = document.createElement('a');
      link.download = `scene-${currentScene}-hotspots.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = sceneImage;
  };

  // Download all device crops as individual images
  const downloadDeviceCrops = () => {
    if (!sceneImage || devices.length === 0) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // First, draw image to 800x450 canvas to normalize dimensions
      const normalizedCanvas = document.createElement('canvas');
      normalizedCanvas.width = CANVAS_WIDTH;
      normalizedCanvas.height = CANVAS_HEIGHT;
      const normalizedCtx = normalizedCanvas.getContext('2d');
      normalizedCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Download each device as a cropped image
      devices.forEach((device, index) => {
        // Add padding around the crop (20% on each side)
        const padX = Math.round(device.w * 0.2);
        const padY = Math.round(device.h * 0.2);

        // Calculate crop area with padding, clamped to image bounds
        const cropX = Math.max(0, device.x - padX);
        const cropY = Math.max(0, device.y - padY);
        const cropW = Math.min(CANVAS_WIDTH - cropX, device.w + padX * 2);
        const cropH = Math.min(CANVAS_HEIGHT - cropY, device.h + padY * 2);

        // Create canvas for this device
        const canvas = document.createElement('canvas');
        // Scale up small crops to at least 300px wide for better quality
        const scale = Math.max(1, 300 / cropW);
        canvas.width = Math.round(cropW * scale);
        canvas.height = Math.round(cropH * scale);
        const ctx = canvas.getContext('2d');

        // Draw cropped region from normalized canvas
        ctx.drawImage(
          normalizedCanvas,
          cropX, cropY, cropW, cropH,  // Source rectangle
          0, 0, canvas.width, canvas.height  // Destination rectangle
        );

        // Download with proper naming convention
        const link = document.createElement('a');
        link.download = `device-${currentScene}${device.letter}-${device.id}.png`;
        link.href = canvas.toDataURL('image/png');

        // Stagger downloads to avoid browser blocking
        setTimeout(() => link.click(), index * 200);
      });
    };
    img.src = sceneImage;
  };

  // Download a single device crop
  const downloadSingleDeviceCrop = (device) => {
    if (!sceneImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // First, draw image to 800x450 canvas to normalize dimensions
      const normalizedCanvas = document.createElement('canvas');
      normalizedCanvas.width = CANVAS_WIDTH;
      normalizedCanvas.height = CANVAS_HEIGHT;
      const normalizedCtx = normalizedCanvas.getContext('2d');
      normalizedCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Add padding around the crop (20% on each side)
      const padX = Math.round(device.w * 0.2);
      const padY = Math.round(device.h * 0.2);

      // Calculate crop area with padding, clamped to image bounds
      const cropX = Math.max(0, device.x - padX);
      const cropY = Math.max(0, device.y - padY);
      const cropW = Math.min(CANVAS_WIDTH - cropX, device.w + padX * 2);
      const cropH = Math.min(CANVAS_HEIGHT - cropY, device.h + padY * 2);

      // Create canvas for this device
      const canvas = document.createElement('canvas');
      // Scale up small crops to at least 300px wide for better quality
      const scale = Math.max(1, 300 / cropW);
      canvas.width = Math.round(cropW * scale);
      canvas.height = Math.round(cropH * scale);
      const ctx = canvas.getContext('2d');

      // Draw cropped region from normalized canvas
      ctx.drawImage(
        normalizedCanvas,
        cropX, cropY, cropW, cropH,  // Source rectangle
        0, 0, canvas.width, canvas.height  // Destination rectangle
      );

      // Download with proper naming convention
      const link = document.createElement('a');
      link.download = `device-${currentScene}${device.letter}-${device.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = sceneImage;
  };

  // Reset to original values
  const resetDevices = () => {
    if (location?.selectableDevices) {
      setDevices(location.selectableDevices.map(d => ({ ...d })));
    }
  };

  // Navigate scenes
  const goToPrevScene = () => {
    if (currentScene > 1) setCurrentScene(currentScene - 1);
  };

  const goToNextScene = () => {
    if (currentScene < 6) setCurrentScene(currentScene + 1);
  };

  // Corner resize handle component
  const ResizeHandle = ({ corner, deviceId }) => {
    const positions = {
      'nw': { top: -4, left: -4, cursor: 'nw-resize' },
      'ne': { top: -4, right: -4, cursor: 'ne-resize' },
      'sw': { bottom: -4, left: -4, cursor: 'sw-resize' },
      'se': { bottom: -4, right: -4, cursor: 'se-resize' },
      'n': { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      's': { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      'e': { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
      'w': { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
    };

    return (
      <div
        className="absolute w-3 h-3 bg-white border-2 border-amber-500 rounded-sm z-20"
        style={{ ...positions[corner] }}
        onMouseDown={(e) => handleMouseDown(e, deviceId, corner)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Hotspot Editor (Dev Only)</h1>
        <p className="text-gray-400 text-sm">
          Drag boxes to move, drag corners/edges to resize. Copy the output to melodyMysteryConcepts.js
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between bg-gray-800 rounded-lg p-4">
        {/* Scene Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevScene}
            disabled={currentScene === 1}
            className={`p-2 rounded-lg ${currentScene === 1 ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="text-lg font-bold">Scene {currentScene}</div>
            <div className="text-sm text-gray-400">{location?.name || 'Unknown'}</div>
          </div>
          <button
            onClick={goToNextScene}
            disabled={currentScene === 6}
            className={`p-2 rounded-lg ${currentScene === 6 ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Ending Selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Story:</span>
          <select
            value={ending}
            onChange={(e) => setEnding(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ranaway">He Ran Away</option>
            <option value="kidnapped">He Was Kidnapped</option>
            <option value="arrested">He Was Arrested</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBackground(!showBackground)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            {showBackground ? <EyeOff size={16} /> : <Eye size={16} />}
            {showBackground ? 'Hide BG' : 'Show BG'}
          </button>
          <button
            onClick={resetDevices}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          <button
            onClick={downloadHotspotsImage}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold"
          >
            <Download size={16} />
            Hotspots PNG
          </button>
          <button
            onClick={downloadDeviceCrops}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold"
          >
            <Download size={16} />
            All Device Crops
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-semibold"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="max-w-5xl mx-auto">
        <div
          ref={containerRef}
          className="relative mx-auto border-2 border-gray-600 rounded-lg overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Scene Image */}
          {sceneImage && showBackground && (
            <img
              src={sceneImage}
              alt={`Scene ${currentScene}`}
              className="absolute inset-0 w-full h-full object-fill"
              draggable={false}
            />
          )}

          {/* Dark overlay when no background */}
          {!showBackground && (
            <div className="absolute inset-0 bg-gray-800" />
          )}

          {/* Grid overlay for reference */}
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          >
            {/* Vertical grid lines every 100px */}
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 100}
                y1={0}
                x2={i * 100}
                y2={CANVAS_HEIGHT}
                stroke="white"
                strokeWidth={1}
              />
            ))}
            {/* Horizontal grid lines every 100px */}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * 100}
                x2={CANVAS_WIDTH}
                y2={i * 100}
                stroke="white"
                strokeWidth={1}
              />
            ))}
          </svg>

          {/* Device Hotspots */}
          {devices.map((device) => (
            <div
              key={device.id}
              className="absolute border-2 border-amber-400 bg-amber-500/30 cursor-move select-none"
              style={{
                left: device.x,
                top: device.y,
                width: device.w,
                height: device.h,
              }}
              onMouseDown={(e) => handleMouseDown(e, device.id, null)}
            >
              {/* Device label with download button */}
              <div className="absolute -top-6 left-0 flex items-center gap-1">
                <div className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                  {device.letter.toUpperCase()}: {device.name}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSingleDeviceCrop(device);
                  }}
                  className="bg-green-500 hover:bg-green-400 text-black p-0.5 rounded"
                  title="Download this device crop"
                >
                  <Download size={12} />
                </button>
              </div>

              {/* Coordinates */}
              <div className="absolute -bottom-5 left-0 text-amber-300 text-xs font-mono whitespace-nowrap">
                x:{device.x} y:{device.y} w:{device.w} h:{device.h}
              </div>

              {/* Resize handles */}
              <ResizeHandle corner="nw" deviceId={device.id} />
              <ResizeHandle corner="ne" deviceId={device.id} />
              <ResizeHandle corner="sw" deviceId={device.id} />
              <ResizeHandle corner="se" deviceId={device.id} />
              <ResizeHandle corner="n" deviceId={device.id} />
              <ResizeHandle corner="s" deviceId={device.id} />
              <ResizeHandle corner="e" deviceId={device.id} />
              <ResizeHandle corner="w" deviceId={device.id} />
            </div>
          ))}
        </div>

        {/* Current Output Preview */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Code Output (for melodyMysteryConcepts.js):</h3>
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre">
{`selectableDevices: [
${devices.map(d => `  { id: '${d.id}', name: '${d.name}', letter: '${d.letter}', x: ${d.x}, y: ${d.y}, w: ${d.w}, h: ${d.h} },`).join('\n')}
],`}
          </pre>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
          <h3 className="font-semibold text-white mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Drag a hotspot box to move it</li>
            <li>Drag the white handles on corners/edges to resize</li>
            <li>Use "Hide BG" to see boxes without the scene image</li>
            <li>Click "Copy Code" to copy the selectableDevices array</li>
            <li>Paste into melodyMysteryConcepts.js, replacing the existing array</li>
            <li>Grid lines are every 100 pixels for reference</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HotspotEditor;
