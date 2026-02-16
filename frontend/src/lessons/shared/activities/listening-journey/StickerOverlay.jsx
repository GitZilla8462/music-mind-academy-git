// Renders sticker/text items that scroll with the parallax background
// Supports selection, drag-to-move, and resize in build mode

import React, { useRef, useEffect } from 'react';
import { INSTRUMENT_ICONS } from '../texture-drawings/config/InstrumentIcons';

let _nextItemId = Date.now();

const renderStickerContent = (item, scale = 1) => {
  const renderType = item.render || 'emoji';
  const s = scale;

  switch (renderType) {
    case 'svg': {
      const IconComponent = INSTRUMENT_ICONS[item.icon];
      return IconComponent
        ? <IconComponent size={48 * s} />
        : <span style={{ fontSize: `${30 * s}px` }}>{item.icon}</span>;
    }

    case 'text':
      return (
        <span
          className="drop-shadow-lg"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: `${28 * s}px`,
            color: '#ffffff',
          }}
        >
          {item.icon}
        </span>
      );

    case 'text-italic':
      return (
        <span
          className="drop-shadow-lg"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontStyle: 'italic',
            fontSize: `${22 * s}px`,
            color: '#ffffff',
          }}
        >
          {item.icon}
        </span>
      );

    case 'crescendo':
      return (
        <svg width={48 * s} height={24 * s} viewBox="0 0 48 24">
          <path d="M2 12 L46 2 M2 12 L46 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'decrescendo':
      return (
        <svg width={48 * s} height={24 * s} viewBox="0 0 48 24">
          <path d="M2 2 L46 12 M2 22 L46 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'symbol':
      return (
        <span
          className="drop-shadow-lg"
          style={{ fontFamily: '"Noto Music", "Symbola", serif', fontSize: `${32 * s}px`, color: '#ffffff' }}
        >
          {item.icon}
        </span>
      );

    case 'symbol-large':
      return (
        <span
          className="drop-shadow-lg"
          style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: `${36 * s}px`, color: '#ffffff' }}
        >
          {item.icon}
        </span>
      );

    case 'form-label':
      return (
        <div
          className="rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
          style={{ width: `${40 * s}px`, height: `${40 * s}px` }}
        >
          <span className="text-white font-bold" style={{ fontSize: `${18 * s}px` }}>{item.icon}</span>
        </div>
      );

    case 'form-text':
      return (
        <div className="rounded-lg bg-yellow-400 shadow-lg" style={{ padding: `${4 * s}px ${12 * s}px` }}>
          <span className="text-black font-bold" style={{ fontSize: `${14 * s}px` }}>{item.icon}</span>
        </div>
      );

    default:
      return (
        <span className="select-none drop-shadow-lg" style={{ fontSize: `${30 * s}px` }} title={item.name}>
          {item.icon}
        </span>
      );
  }
};

// Helper: clean up any active drag listeners stored in a ref
const cleanupDrag = (ref) => {
  if (ref.current) {
    window.removeEventListener('mousemove', ref.current.onMove);
    window.removeEventListener('mouseup', ref.current.onUp);
    ref.current = null;
  }
};

const StickerItem = ({ item, visible, scrollOffsetX, isSelected, onSelect, onUpdateItem, isBuildMode }) => {
  const { position, type } = item;
  const scale = item.scale || 1;
  const adjustedX = position.x + (scrollOffsetX || 0);
  const interactive = isBuildMode && visible;
  const dragRef = useRef(null);

  // Always clean up drag listeners on unmount
  useEffect(() => () => cleanupDrag(dragRef), []);

  const handleMouseDown = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault(); // prevent browser text-selection / image-drag

    onSelect(item.id);

    // Safety: clear any leftover drag from a previous interaction
    cleanupDrag(dragRef);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;
    const viewport = e.currentTarget.closest('[data-viewport="true"]');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    let dragging = false;

    const onMove = (me) => {
      me.preventDefault();
      if (!dragging && Math.abs(me.clientX - startMouseX) + Math.abs(me.clientY - startMouseY) > 3) {
        dragging = true;
      }
      if (dragging) {
        const dx = (me.clientX - startMouseX) / rect.width;
        const dy = (me.clientY - startMouseY) / rect.height;
        onUpdateItem(item.id, { position: { x: startPosX + dx, y: startPosY + dy } });
      }
    };

    const onUp = () => {
      cleanupDrag(dragRef);
    };

    dragRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const resizeRef = useRef(null);

  // Clean up resize listeners on unmount
  useEffect(() => () => cleanupDrag(resizeRef), []);

  const handleResizeDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    cleanupDrag(resizeRef);

    const startY = e.clientY;
    const startScale = scale;

    const onMove = (me) => {
      me.preventDefault();
      const dy = me.clientY - startY;
      onUpdateItem(item.id, { scale: Math.max(0.5, Math.min(5, startScale + dy / 60)) });
    };

    const onUp = () => {
      cleanupDrag(resizeRef);
    };

    resizeRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className={`absolute z-30 select-none ${interactive ? 'cursor-grab' : 'pointer-events-none'}`}
      style={{
        left: `${adjustedX * 100}%`,
        top: `${position.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        display: visible ? 'inline-block' : 'none',
        width: 'fit-content',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => { if (interactive) e.stopPropagation(); }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute -inset-1.5 border-2 border-blue-400 rounded-lg bg-blue-400/10 pointer-events-none" />
      )}

      {type === 'sticker' && renderStickerContent(item, scale)}

      {type === 'text' && (
        <div
          className="select-none drop-shadow-lg px-2 py-0.5 rounded whitespace-nowrap"
          style={{
            fontFamily: item.font || 'inherit',
            fontSize: `${(item.size || 18) * scale}px`,
            color: item.color || '#ffffff',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {item.content}
        </div>
      )}

      {/* Resize handle — green square at bottom-right */}
      {isSelected && (
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-sm cursor-nwse-resize z-40 pointer-events-auto"
          onMouseDown={handleResizeDown}
        />
      )}
    </div>
  );
};

const StickerOverlay = ({ items, currentTime, isPlaying, editMode, onRemoveItem, onUpdateItem, onAddItem, onSwitchToSelect, rawScrollOffset = 0, selectedItemId, onSelectItem, isBuildMode = false }) => {
  return (
    <>
      {items.map((item) => {
        const startTime = item.timestamp;
        const endTime = startTime + (item.duration || 999);
        const visible = currentTime >= startTime && currentTime < endTime;

        // Compute drift since sticker was placed (negative = scrolls left with background)
        const drift = item.placedAtOffset != null
          ? -(rawScrollOffset - item.placedAtOffset)
          : 0;

        // Entry animation: slide from right edge to click position at constant speed
        // Only animate in presentation/fullscreen — build mode shows stickers at their position
        const ENTRY_DURATION = 3.0;
        const timeSinceEntry = currentTime - startTime;
        let entryOffset = 0;
        if (item.entryOffsetX && !isBuildMode && timeSinceEntry >= 0 && timeSinceEntry < ENTRY_DURATION) {
          const progress = timeSinceEntry / ENTRY_DURATION;
          entryOffset = item.entryOffsetX * (1 - progress);
        }

        return (
          <StickerItem
            key={item.id}
            item={item}
            visible={visible}
            scrollOffsetX={drift + entryOffset}
            isSelected={selectedItemId === item.id}
            onSelect={onSelectItem}
            onUpdateItem={onUpdateItem}
            isBuildMode={isBuildMode}
          />
        );
      })}
    </>
  );
};

// Unique ID generator for stickers (avoids Date.now() collisions)
StickerOverlay.nextId = () => ++_nextItemId;

export default StickerOverlay;
