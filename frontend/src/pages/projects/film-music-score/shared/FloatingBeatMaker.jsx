// File: FloatingBeatMaker.jsx
// Floating, draggable, resizable Beat Maker modal using react-rnd
// Floats on top of video area without affecting layout

import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { GripHorizontal, Minimize2, Maximize2 } from 'lucide-react';
import BeatMakerPanel from './BeatMakerPanel';

// Detect Chromebook for smaller sizing
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

const FloatingBeatMaker = ({
  isOpen,
  onClose,
  onAddToProject,
  customLoopCount = 0
}) => {
  // Default size - smaller for Chromebook (1366x768)
  const defaultSize = isChromebook
    ? { width: 880, height: 520 }
    : { width: 900, height: 620 };

  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState({ x: 100, y: 20 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevSize, setPrevSize] = useState(null);

  // Minimum and maximum constraints - smaller for Chromebook
  const minWidth = isChromebook ? 600 : 700;
  const minHeight = isChromebook ? 420 : 500;
  const maxWidth = isChromebook ? 1000 : 1200;
  const maxHeight = isChromebook ? 700 : 850;

  // Reset position when opening
  useEffect(() => {
    if (isOpen) {
      // Position it nicely in the viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center horizontally, position near top so whole modal is visible
      const x = Math.max(20, (viewportWidth - size.width) / 2);
      const y = isChromebook ? 10 : Math.max(40, (viewportHeight - size.height) / 2 - 50);

      setPosition({ x, y });
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    if (isMinimized) {
      if (prevSize) {
        setSize(prevSize);
      }
      setIsMinimized(false);
    } else {
      setPrevSize({ ...size });
      setSize({ width: size.width, height: 44 });
      setIsMinimized(true);
    }
  };

  if (!isOpen) return null;

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10)
        });
        setPosition(position);
      }}
      minWidth={minWidth}
      minHeight={isMinimized ? 44 : minHeight}
      maxWidth={maxWidth}
      maxHeight={isMinimized ? 44 : maxHeight}
      bounds="window"
      dragHandleClassName="drag-handle"
      enableResizing={!isMinimized}
      style={{
        zIndex: 1000,
        position: 'fixed',
        cursor: isChromebook ? 'none' : undefined
      }}
    >
      <div className="h-full flex flex-col bg-gray-900 rounded-lg shadow-2xl border border-gray-600 overflow-hidden">
        {/* Custom Drag Handle Header */}
        <div
          className={`drag-handle flex-shrink-0 bg-gray-800 border-b border-gray-700 px-3 py-2 select-none ${isChromebook ? '' : 'cursor-move'}`}
          style={isChromebook ? { cursor: 'none' } : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripHorizontal size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-white">Beat Maker</h2>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize/Maximize button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 hover:bg-red-600 rounded transition-colors text-gray-400 hover:text-white"
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Beat Maker Content - Hidden when minimized */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <BeatMakerPanelContent
              onClose={onClose}
              onAddToProject={onAddToProject}
              customLoopCount={customLoopCount}
            />
          </div>
        )}
      </div>
    </Rnd>
  );
};

// Content component - shows full BeatMakerPanel with all controls
const BeatMakerPanelContent = ({ onClose, onAddToProject, customLoopCount }) => {
  return (
    <div className="h-full">
      <BeatMakerPanel
        onClose={onClose}
        onAddToProject={onAddToProject}
        customLoopCount={customLoopCount}
        hideCloseButton  // We have our own close button in the floating header
      />
    </div>
  );
};

export default FloatingBeatMaker;
