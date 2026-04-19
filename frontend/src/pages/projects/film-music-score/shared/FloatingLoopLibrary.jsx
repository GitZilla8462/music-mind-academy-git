// File: FloatingLoopLibrary.jsx
// Floating, draggable Loop Library panel using react-rnd
// Wraps existing LoopLibrary component as a floating modal
// Used when loop library should not take permanent sidebar space

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { GripHorizontal, Minimize2, Maximize2 } from 'lucide-react';
import LoopLibrary from './LoopLibrary';

const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS') ||
  (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
);

const FloatingLoopLibrary = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  onLoopPreview,
  onLoopDragStart,
  restrictToCategory,
  lockedMood,
  showSoundEffects,
  currentlyPlayingLoopId,
  customLoops = [],
  onDeleteCustomLoop,
  onEditCustomLoop,
}) => {
  const defaultSize = isChromebook
    ? { width: 320, height: 500 }
    : { width: 350, height: 580 };

  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState({ x: 20, y: 60 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevSize, setPrevSize] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 20, y: 60 });
      setIsMinimized(false);
    }
  }, [isOpen]);

  const toggleMinimize = () => {
    if (isMinimized) {
      if (prevSize) setSize(prevSize);
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
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10)
        });
        setPosition(pos);
      }}
      minWidth={280}
      minHeight={isMinimized ? 44 : 300}
      maxWidth={500}
      maxHeight={isMinimized ? 44 : 800}
      bounds="window"
      dragHandleClassName="drag-handle"
      enableResizing={!isMinimized}
      style={{
        zIndex: 999,
        position: 'fixed',
        cursor: isChromebook ? 'none' : undefined
      }}
    >
      <div className="h-full flex flex-col bg-gray-900 rounded-lg shadow-2xl border border-gray-600 overflow-hidden">
        {/* Drag Handle */}
        <div
          className={`drag-handle flex-shrink-0 bg-gray-800 border-b border-gray-700 px-3 py-2 select-none ${isChromebook ? '' : 'cursor-move'}`}
          style={{ touchAction: 'none', WebkitTouchCallout: 'none', ...(isChromebook ? { cursor: 'none' } : {}) }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripHorizontal size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-white">Loop Library</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 hover:bg-red-600 rounded transition-colors text-gray-400 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loop Library Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <LoopLibrary
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              onLoopPreview={onLoopPreview}
              onLoopDragStart={onLoopDragStart}
              restrictToCategory={restrictToCategory}
              lockedMood={lockedMood}
              showSoundEffects={showSoundEffects}
              currentlyPlayingLoopId={currentlyPlayingLoopId}
              customLoops={customLoops}
              onDeleteCustomLoop={onDeleteCustomLoop}
              onEditCustomLoop={onEditCustomLoop}
            />
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default FloatingLoopLibrary;
