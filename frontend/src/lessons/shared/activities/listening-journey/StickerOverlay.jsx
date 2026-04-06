// Renders sticker/text items that scroll with the parallax background
// Supports selection, drag-to-move, and resize in build mode

import React, { useRef, useEffect } from 'react';
import { INSTRUMENT_ICONS } from '../texture-drawings/config/InstrumentIcons';

let _nextItemId = Date.now();

// Timestamp of last drag/resize end — viewport click suppresses placement if too recent
export let lastDragEndTime = 0;

const renderStickerContent = (item, scale = 1) => {
  const renderType = item.render || 'emoji';
  const s = scale;
  const c = item.color || '#000000';

  switch (renderType) {
    case 'svg': {
      const IconComponent = INSTRUMENT_ICONS[item.icon];
      return IconComponent
        ? <IconComponent size={48 * s} color={c} />
        : <span style={{ fontSize: `${30 * s}px`, color: c }}>{item.icon}</span>;
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
            color: c,
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
            color: c,
          }}
        >
          {item.icon}
        </span>
      );

    case 'crescendo':
      return (
        <svg width={48 * s} height={24 * s} viewBox="0 0 48 24">
          <path d="M2 12 L46 2 M2 12 L46 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'decrescendo':
      return (
        <svg width={48 * s} height={24 * s} viewBox="0 0 48 24">
          <path d="M2 2 L46 12 M2 22 L46 12" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'symbol':
      return (
        <span
          className="drop-shadow-lg"
          style={{ fontFamily: '"Noto Music", "Symbola", serif', fontSize: `${32 * s}px`, color: c }}
        >
          {item.icon}
        </span>
      );

    case 'symbol-large':
      return (
        <span
          className="drop-shadow-lg"
          style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: `${36 * s}px`, color: c }}
        >
          {item.icon}
        </span>
      );

    case 'form-label':
      return (
        <div
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{ width: `${40 * s}px`, height: `${40 * s}px`, backgroundColor: item.color || '#3B82F6' }}
        >
          <span className="text-white font-bold" style={{ fontSize: `${18 * s}px` }}>{item.icon}</span>
        </div>
      );

    case 'form-text':
      return (
        <div className="rounded-lg shadow-lg" style={{ padding: `${4 * s}px ${12 * s}px`, backgroundColor: item.color || '#6B7280' }}>
          <span className="text-white font-bold" style={{ fontSize: `${14 * s}px` }}>{item.icon}</span>
        </div>
      );

    default:
      return (
        <span className="select-none drop-shadow-lg" style={{ fontSize: `${30 * s}px`, color: c }} title={item.name}>
          {item.icon}
        </span>
      );
  }
};

// Helper: clean up any active drag listeners stored in a ref
const cleanupDrag = (ref) => {
  if (ref.current) {
    window.removeEventListener('pointermove', ref.current.onMove);
    window.removeEventListener('pointerup', ref.current.onUp);
    window.removeEventListener('pointercancel', ref.current.onUp);
    ref.current = null;
  }
};

const StickerItemInner = ({ item, visible, scrollOffsetX, isSelected, isSingleSelected, onSelect, onUpdateItem, onUpdateItems, isBuildMode, selectedItemIds, allItems }) => {
  const { position, type } = item;
  const scale = item.scale || 1;
  const rotation = item.rotation || 0;
  const adjustedX = position.x + (scrollOffsetX || 0);
  const interactive = isBuildMode && visible;
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const rotateRef = useRef(null);

  // Always clean up drag/resize/rotate listeners on unmount (hooks must run before any early return)
  useEffect(() => () => cleanupDrag(dragRef), []);
  useEffect(() => () => cleanupDrag(resizeRef), []);
  useEffect(() => () => cleanupDrag(rotateRef), []);

  const handleMouseDown = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault(); // prevent browser text-selection / image-drag

    // If this item is already part of a multi-selection, keep the group selected;
    // otherwise select just this item.
    const isPartOfMultiSelect = isSelected && selectedItemIds && selectedItemIds.size > 1;
    if (!isPartOfMultiSelect) {
      onSelect(item.id);
    }

    // Safety: clear any leftover drag from a previous interaction
    cleanupDrag(dragRef);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const viewport = e.currentTarget.closest('[data-viewport="true"]');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    let dragging = false;

    // Capture start positions for all selected items (group drag)
    const dragGroup = isPartOfMultiSelect && allItems && onUpdateItems
      ? allItems.filter(i => selectedItemIds.has(i.id)).map(i => ({ id: i.id, startX: i.position.x, startY: i.position.y }))
      : [{ id: item.id, startX: position.x, startY: position.y }];

    const onMove = (me) => {
      me.preventDefault();
      if (!dragging && Math.abs(me.clientX - startMouseX) + Math.abs(me.clientY - startMouseY) > 3) {
        dragging = true;
      }
      if (dragging) {
        const dx = (me.clientX - startMouseX) / rect.width;
        const dy = (me.clientY - startMouseY) / rect.height;
        if (dragGroup.length > 1 && onUpdateItems) {
          // Group drag: move all selected stickers together
          const updates = dragGroup.map(g => ({
            id: g.id,
            updates: { position: { x: g.startX + dx, y: g.startY + dy } }
          }));
          onUpdateItems(updates);
        } else {
          onUpdateItem(dragGroup[0].id, { position: { x: dragGroup[0].startX + dx, y: dragGroup[0].startY + dy } });
        }
      }
    };

    const onUp = () => {
      lastDragEndTime = Date.now();
      cleanupDrag(dragRef);
    };

    dragRef.current = { onMove, onUp };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

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
      lastDragEndTime = Date.now();
      cleanupDrag(resizeRef);
    };

    resizeRef.current = { onMove, onUp };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const handleRotateDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    cleanupDrag(rotateRef);

    const el = e.currentTarget.closest('[data-sticker-root]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRotation = rotation;

    const onMove = (me) => {
      me.preventDefault();
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      let newRotation = startRotation + (angle - startAngle);
      // Snap to 0° when within 5° (makes it easy to reset)
      if (Math.abs(newRotation % 360) < 5 || Math.abs(newRotation % 360) > 355) {
        newRotation = Math.round(newRotation / 360) * 360;
      }
      onUpdateItem(item.id, { rotation: newRotation });
    };

    const onUp = () => {
      lastDragEndTime = Date.now();
      cleanupDrag(rotateRef);
    };

    rotateRef.current = { onMove, onUp };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      data-sticker-root
      className={`absolute z-30 select-none ${interactive ? 'cursor-grab' : 'pointer-events-none'}`}
      style={{
        left: `${adjustedX * 100}%`,
        top: `${position.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        willChange: 'transform',
        display: visible ? 'inline-block' : 'none',
        width: 'fit-content',
        touchAction: interactive ? 'none' : undefined,
      }}
      onPointerDown={handleMouseDown}
      onClick={(e) => { if (interactive) e.stopPropagation(); }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute -inset-1.5 border-2 border-blue-400 rounded-lg bg-blue-400/10 pointer-events-none" />
      )}

      {type === 'sticker' && item._collected && (
        <div className="relative" style={{ animation: 'collected-fadeout 0.8s ease-out forwards' }}>
          {/* Burst ring animation */}
          <div
            className={`absolute -inset-3 rounded-full ${item.isDecoy ? 'bg-red-500/40 ring-2 ring-red-400' : 'bg-emerald-500/40 ring-2 ring-emerald-400'}`}
            style={{ animation: 'sticker-burst 0.6s ease-out forwards' }}
          />
          {renderStickerContent(item, scale)}
          {/* Points badge */}
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[11px] font-black whitespace-nowrap ${
              item.isDecoy ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            }`}
            style={{ animation: 'points-float 1s ease-out forwards' }}
          >
            {item.isDecoy ? '-5' : '+10'}
          </div>
          <style>{`
            @keyframes sticker-burst {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(2); opacity: 0; }
            }
            @keyframes points-float {
              0% { transform: translateX(-50%) translateY(0); opacity: 1; }
              100% { transform: translateX(-50%) translateY(-24px); opacity: 0; }
            }
            @keyframes collected-fadeout {
              0% { opacity: 1; transform: scale(1); }
              60% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 0; transform: scale(0.5); }
            }
          `}</style>
        </div>
      )}
      {type === 'sticker' && !item._collected && (
        <div className="relative">
          {/* Build-mode ring: green = points, red = decoy */}
          {isBuildMode && (
            <div
              className={`absolute -inset-3 rounded-full pointer-events-none border-3 ${
                item.isDecoy
                  ? 'border-red-500'
                  : 'border-emerald-500'
              }`}
              style={{ borderWidth: '3px' }}
            />
          )}
          {renderStickerContent(item, scale)}
        </div>
      )}

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
          className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-sm cursor-nwse-resize z-40 pointer-events-auto"
          style={{ touchAction: 'none', minWidth: '44px', minHeight: '44px', margin: '-10px' }}
          onPointerDown={handleResizeDown}
        />
      )}
      {/* Rotate handle — blue circle at top-right */}
      {isSelected && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full z-40 pointer-events-auto flex items-center justify-center"
          style={{ cursor: 'grab', touchAction: 'none', minWidth: '44px', minHeight: '44px', margin: '-10px' }}
          onPointerDown={handleRotateDown}
          title="Rotate"
        >
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M13 3 A6 6 0 1 0 14 8" />
            <path d="M11 1 L13 3 L11 5" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Memoize StickerItem — only re-renders when its own props change
const StickerItem = React.memo(StickerItemInner);

const StickerOverlay = ({ items, currentTime, isPlaying, editMode, onRemoveItem, onUpdateItem, onUpdateItems, onAddItem, onSwitchToSelect, rawScrollOffset = 0, selectedItemIds = new Set(), onSelectItem, isBuildMode = false, gameMode = false, collectedIds = new Set() }) => {
  const singleSelected = selectedItemIds.size === 1;
  // Track when stickers were collected so we can stop rendering after animation (1s)
  const collectedTimesRef = useRef(new Map());
  const now = performance.now();

  return (
    <>
      {items.map((item) => {
        // Compute drift since sticker was placed (negative = scrolls left with background)
        const drift = item.placedAtOffset != null
          ? -(rawScrollOffset - item.placedAtOffset)
          : 0;

        const adjustedX = item.position.x + drift;

        // Cull off-screen stickers — skip rendering entirely
        if (!selectedItemIds.has(item.id) && (adjustedX < -0.15 || adjustedX > 1.15)) return null;

        // In game mode (not build): collected stickers get a flash + disappear
        const isCollected = gameMode && !isBuildMode && collectedIds.has(item.id);

        // Skip rendering collected stickers after their animation finishes (1s)
        if (isCollected) {
          if (!collectedTimesRef.current.has(item.id)) {
            collectedTimesRef.current.set(item.id, now);
          } else if (now - collectedTimesRef.current.get(item.id) > 1000) {
            return null; // animation done, skip entirely
          }
        }

        return (
          <StickerItem
            key={item.id}
            item={isCollected ? { ...item, _collected: true } : item}
            visible={true}
            scrollOffsetX={drift}
            isSelected={selectedItemIds.has(item.id)}
            isSingleSelected={singleSelected}
            onSelect={onSelectItem}
            onUpdateItem={onUpdateItem}
            onUpdateItems={onUpdateItems}
            isBuildMode={isBuildMode}
            selectedItemIds={selectedItemIds}
            allItems={items}
          />
        );
      })}
    </>
  );
};

// Unique ID generator for stickers (avoids Date.now() collisions)
StickerOverlay.nextId = () => ++_nextItemId;

export default StickerOverlay;
