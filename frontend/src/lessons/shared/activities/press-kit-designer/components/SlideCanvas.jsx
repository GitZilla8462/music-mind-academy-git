// SlideCanvas — free-form slide editor with draggable text and image objects.
// Adapted from DrawingCanvas pattern (texture-drawings) for press kit slides.
// Supports: drag, resize, text editing, font size, color, image placement.
// Optimized for 1366x768 Chromebooks with touch support.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Type, Image as ImageIcon, Trash2, Copy } from 'lucide-react';
import { getPalette } from '../palettes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANVAS_W = 960;  // internal coordinate space (16:9)
const CANVAS_H = 540;

const FONT_SIZES = [
  { label: 'S',  value: 16 },
  { label: 'M',  value: 24 },
  { label: 'L',  value: 32 },
  { label: 'XL', value: 48 },
  { label: 'XXL', value: 64 },
];

const TEXT_COLORS = [
  '#ffffff', '#f1f5f9', '#fbbf24', '#f97316', '#ef4444',
  '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#000000',
];

function genId() { return `obj-${Math.random().toString(36).slice(2, 10)}`; }

// ---------------------------------------------------------------------------
// Object Renderer (static — used in both editor and presentation)
// ---------------------------------------------------------------------------

export function renderSlideObject(obj, scale = 1) {
  if (obj.type === 'text') {
    return (
      <div
        style={{
          fontSize: (obj.fontSize || 24) * scale,
          color: obj.color || '#ffffff',
          fontFamily: obj.fontFamily || 'Inter, system-ui, sans-serif',
          fontWeight: obj.bold ? 'bold' : 'normal',
          fontStyle: obj.italic ? 'italic' : 'normal',
          lineHeight: 1.3,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {obj.text || 'Double-click to edit'}
      </div>
    );
  }
  if (obj.type === 'image') {
    return (
      <img
        src={obj.url}
        alt=""
        draggable={false}
        style={{
          width: (obj.width || 200) * scale,
          height: (obj.height || 150) * scale,
          objectFit: 'cover',
          borderRadius: 6 * scale,
          pointerEvents: 'none',
        }}
      />
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Single Object Wrapper (handles selection, drag, resize)
// ---------------------------------------------------------------------------

function CanvasObject({ obj, isSelected, scale, onSelect, onDragStart, onEdit }) {
  const s = scale;
  const x = obj.x * s;
  const y = obj.y * s;

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); onSelect(obj.id); onDragStart(e, obj.id, 'move'); }}
      onTouchStart={(e) => { e.stopPropagation(); onSelect(obj.id); onDragStart(e, obj.id, 'move'); }}
      onClick={(e) => { e.stopPropagation(); }}
      onDoubleClick={() => obj.type === 'text' && onEdit(obj.id)}
      draggable={false}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
        cursor: 'move',
        border: isSelected ? '2px solid #fbbf24' : '2px solid transparent',
        borderRadius: 4,
        backgroundColor: isSelected ? 'rgba(251,191,36,0.08)' : 'transparent',
        padding: 2,
        zIndex: isSelected ? 100 : 10,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {renderSlideObject(obj, s)}

      {/* Resize handle */}
      {isSelected && (
        <div
          onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, obj.id, 'resize'); }}
          onTouchStart={(e) => { e.stopPropagation(); onDragStart(e, obj.id, 'resize'); }}
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 12,
            height: 12,
            borderRadius: 3,
            background: '#fbbf24',
            cursor: 'nwse-resize',
            touchAction: 'none',
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Text Editor
// ---------------------------------------------------------------------------

function InlineTextEditor({ obj, scale, onSave, onCancel }) {
  const [text, setText] = useState(obj.text || '');
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const save = () => {
    onSave(obj.id, text);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: obj.x * scale,
        top: obj.y * scale,
        zIndex: 200,
      }}
    >
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Escape') onCancel(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } }}
        style={{
          fontSize: (obj.fontSize || 24) * scale,
          color: obj.color || '#ffffff',
          fontFamily: obj.fontFamily || 'Inter, system-ui, sans-serif',
          fontWeight: obj.bold ? 'bold' : 'normal',
          fontStyle: obj.italic ? 'italic' : 'normal',
          lineHeight: 1.3,
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid #fbbf24',
          borderRadius: 4,
          padding: '2px 4px',
          outline: 'none',
          resize: 'both',
          minWidth: 100,
          minHeight: 30,
        }}
        className="text-white"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Object Toolbar (appears when object is selected)
// ---------------------------------------------------------------------------

function ObjectToolbar({ obj, scale, onUpdate, onDelete, onDuplicate }) {
  if (!obj) return null;

  const y = obj.y * scale - (obj.type === 'text' ? 72 : 40);
  // Clamp left so toolbar doesn't go off-screen right
  const maxLeft = (CANVAS_W * scale) - 240;
  const left = Math.min(Math.max(4, obj.x * scale), maxLeft);

  return (
    <div
      className="absolute flex flex-col gap-0.5 rounded-lg shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        left,
        top: Math.max(4, y),
        zIndex: 150,
        background: '#1a1f2e',
        border: '1px solid rgba(255,255,255,0.15)',
        maxWidth: 280,
      }}
    >
      {obj.type === 'text' && (
        <div className="flex items-center gap-1 px-1.5 py-1 flex-wrap">
          {/* Font size */}
          {FONT_SIZES.map(fs => (
            <button
              key={fs.value}
              onClick={() => onUpdate(obj.id, { fontSize: fs.value })}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold min-w-[22px] min-h-[22px] transition-colors ${
                obj.fontSize === fs.value ? 'bg-amber-500/30 text-amber-400' : 'text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              {fs.label}
            </button>
          ))}
          <div className="w-px h-3.5 bg-white/10" />
          <button
            onClick={() => onUpdate(obj.id, { bold: !obj.bold })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold min-h-[22px] ${obj.bold ? 'bg-amber-500/30 text-amber-400' : 'text-white/40 hover:text-white/70'}`}
          >
            B
          </button>
          <button
            onClick={() => onUpdate(obj.id, { italic: !obj.italic })}
            className={`px-1.5 py-0.5 rounded text-[10px] italic min-h-[22px] ${obj.italic ? 'bg-amber-500/30 text-amber-400' : 'text-white/40 hover:text-white/70'}`}
          >
            I
          </button>
          <div className="w-px h-3.5 bg-white/10" />
          {TEXT_COLORS.slice(0, 6).map(c => (
            <button
              key={c}
              onClick={() => onUpdate(obj.id, { color: c })}
              className={`w-3.5 h-3.5 rounded-full transition-all ${obj.color === c ? 'ring-2 ring-amber-400 scale-110' : 'ring-1 ring-white/10'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
      {/* Action buttons row */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 border-t border-white/[0.06]">
        <button onClick={() => onDuplicate(obj.id)} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 rounded hover:bg-white/10" title="Duplicate">
          <Copy size={10} /> Duplicate
        </button>
        <button onClick={() => onDelete(obj.id)} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-red-400/60 hover:text-red-400 rounded hover:bg-red-500/10" title="Delete">
          <Trash2 size={10} /> Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SlideCanvas (main component)
// ---------------------------------------------------------------------------

const SlideCanvas = ({ objects = [], paletteId, genre, onChange, readOnly = false }) => {
  const containerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const dragRef = useRef(null);
  const justInteractedRef = useRef(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const palette = getPalette(paletteId || 'genre', genre || '');
  const scale = containerSize.w > 0 ? containerSize.w / CANVAS_W : 1;

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.width * (CANVAS_H / CANVAS_W) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // Drag handling
  // ---------------------------------------------------------------------------
  const getPointerPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const touch = e.touches?.[0] || e;
    return {
      x: (touch.clientX - rect.left) / scale,
      y: (touch.clientY - rect.top) / scale,
    };
  };

  const handleDragStart = useCallback((e, objId, mode) => {
    if (readOnly) return;
    const pos = getPointerPos(e);
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;

    dragRef.current = {
      mode,
      objId,
      startX: pos.x,
      startY: pos.y,
      initialX: obj.x,
      initialY: obj.y,
      initialFontSize: obj.fontSize || 24,
      initialWidth: obj.width || 200,
      initialHeight: obj.height || 150,
    };

    const handleMove = (ev) => {
      ev.preventDefault();
      const drag = dragRef.current;
      if (!drag) return;
      const p = getPointerPos(ev);
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;

      if (drag.mode === 'move') {
        const updated = objects.map(o =>
          o.id === drag.objId ? { ...o, x: drag.initialX + dx, y: drag.initialY + dy } : o
        );
        onChange(updated);
      } else if (drag.mode === 'resize') {
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sign = dx + dy > 0 ? 1 : -1;
        const updated = objects.map(o => {
          if (o.id !== drag.objId) return o;
          if (o.type === 'text') {
            const newSize = Math.max(12, Math.min(96, drag.initialFontSize + sign * distance * 0.3));
            return { ...o, fontSize: Math.round(newSize) };
          }
          if (o.type === 'image') {
            const factor = Math.max(0.3, Math.min(3, 1 + sign * distance / 200));
            return {
              ...o,
              width: Math.round(drag.initialWidth * factor),
              height: Math.round(drag.initialHeight * factor),
            };
          }
          return o;
        });
        onChange(updated);
      }
    };

    const handleEnd = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }, [objects, onChange, readOnly, scale]);

  // Deselect on canvas click
  const handleCanvasClick = () => {
    if (!dragRef.current) setSelectedId(null);
  };

  // Keyboard delete
  useEffect(() => {
    const handleKey = (e) => {
      if (editingId) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onChange(objects.filter(o => o.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedId, editingId, objects, onChange]);

  // ---------------------------------------------------------------------------
  // Object CRUD
  // ---------------------------------------------------------------------------
  const addText = () => {
    const obj = {
      id: genId(),
      type: 'text',
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 20,
      text: 'New Text',
      fontSize: 24,
      color: '#ffffff',
      bold: false,
      italic: false,
      fontFamily: 'Inter, system-ui, sans-serif',
    };
    onChange([...objects, obj]);
    setSelectedId(obj.id);
  };

  const addImage = (imageData) => {
    const obj = {
      id: genId(),
      type: 'image',
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 75,
      width: 200,
      height: 150,
      url: imageData.url || imageData.thumbnailUrl,
      attribution: imageData.attribution || '',
    };
    onChange([...objects, obj]);
    setSelectedId(obj.id);
  };

  const updateObject = (id, updates) => {
    onChange(objects.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteObject = (id) => {
    onChange(objects.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateObject = (id) => {
    const src = objects.find(o => o.id === id);
    if (!src) return;
    const dup = { ...src, id: genId(), x: src.x + 20, y: src.y + 20 };
    onChange([...objects, dup]);
    setSelectedId(dup.id);
  };

  const saveText = (id, text) => {
    updateObject(id, { text });
    setEditingId(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const selectedObj = objects.find(o => o.id === selectedId);

  return (
    <div className="relative w-full">
      {/* Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full overflow-hidden rounded-lg"
        style={{
          aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
          background: palette.bg,
          touchAction: 'none',
        }}
      >
        {/* Background gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${palette.accent}11 0%, transparent 70%)`,
          }}
        />

        {/* Object toolbar */}
        {selectedObj && !editingId && !readOnly && (
          <ObjectToolbar
            obj={selectedObj}
            scale={scale}
            onUpdate={updateObject}
            onDelete={deleteObject}
            onDuplicate={duplicateObject}
          />
        )}

        {/* Objects */}
        {objects.map(obj => (
          editingId === obj.id ? (
            <InlineTextEditor
              key={obj.id}
              obj={obj}
              scale={scale}
              onSave={saveText}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <CanvasObject
              key={obj.id}
              obj={obj}
              isSelected={selectedId === obj.id}
              scale={scale}
              onSelect={readOnly ? () => {} : setSelectedId}
              onDragStart={handleDragStart}
              onEdit={readOnly ? () => {} : setEditingId}
            />
          )
        ))}

        {/* Empty state hint */}
        {objects.length === 0 && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/15 text-sm">Add text or images below to start designing</p>
          </div>
        )}
      </div>

      {/* Add buttons below canvas */}
      {!readOnly && (
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <button
            onClick={addText}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-medium bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white/80 transition-colors min-h-[28px]"
          >
            <Type size={11} /> Add Text
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('press-kit-add-image', { detail: { callback: addImage } });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-medium bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white/80 transition-colors min-h-[28px]"
          >
            <ImageIcon size={11} /> Add Image
          </button>
        </div>
      )}
    </div>
  );
};

export { CANVAS_W, CANVAS_H };
export default SlideCanvas;
