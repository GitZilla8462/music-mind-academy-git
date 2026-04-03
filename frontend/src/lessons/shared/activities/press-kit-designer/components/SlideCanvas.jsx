// SlideCanvas — Google Slides-style free-form slide editor.
// Features: fixed top toolbar, text alignment, font picker, full color palette,
// single-click text editing, 8 resize handles, z-order, undo/redo.
// Canvas: 960x540 internal coordinates (16:9), scales to container.
// Optimized for 1366x768 Chromebooks with touch support.

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Plus, Type, Image as ImageIcon, Trash2, Copy,
  Undo2, Redo2, ChevronUp, ChevronDown,
  Bold, Italic, ChevronDown as DropdownIcon,
  Music, Play, Pause, SkipBack, SkipForward, Search,
} from 'lucide-react';
import { getPalette } from '../palettes';
import { ARTIST_DATABASE } from '../../artist-discovery/artistDatabase';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANVAS_W = 960;
const CANVAS_H = 540;

const FONT_SIZES = [
  { label: '12', value: 12 },
  { label: '16', value: 16 },
  { label: '20', value: 20 },
  { label: '24', value: 24 },
  { label: '32', value: 32 },
  { label: '40', value: 40 },
  { label: '48', value: 48 },
  { label: '64', value: 64 },
];

const FONT_FAMILIES = [
  { label: 'Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: '"JetBrains Mono", "Fira Code", monospace' },
  { label: 'Display', value: '"Space Grotesk", system-ui, sans-serif' },
];

const TEXT_COLORS = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#000000',
  '#fbbf24', '#f97316', '#ef4444', '#f43f5e',
  '#a855f7', '#3b82f6', '#06b6d4', '#10b981',
  '#84cc16',
];

const MAX_UNDO = 50;

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
          textAlign: obj.textAlign || 'left',
          lineHeight: 1.3,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          width: obj.width ? obj.width * scale : undefined,
        }}
      >
        {obj.text || 'Click to edit'}
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
  if (obj.type === 'audio') {
    return <AudioClipWidget obj={obj} scale={scale} />;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Audio Clip Widget — renders on the slide canvas, plays a clip on click
// ---------------------------------------------------------------------------

function AudioClipWidget({ obj, scale }) {
  const [playing, setPlaying] = useState(false);
  const audioElRef = useRef(null);
  const timerRef = useRef(null);
  const [currentSec, setCurrentSec] = useState(0);

  const clipStart = obj.clipStart || 0;
  const clipEnd = obj.clipEnd || (clipStart + 15);
  const clipDuration = clipEnd - clipStart;

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
    setPlaying(false);
    setCurrentSec(0);
  };

  // Cleanup on unmount
  useEffect(() => cleanup, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (playing) {
      cleanup();
      return;
    }
    const audio = new Audio(obj.audioUrl);
    audio.currentTime = clipStart;
    audioElRef.current = audio;
    audio.play().catch(() => { cleanup(); });
    setPlaying(true);
    setCurrentSec(0);

    timerRef.current = setInterval(() => {
      if (!audioElRef.current) return;
      const elapsed = audioElRef.current.currentTime - clipStart;
      setCurrentSec(Math.min(elapsed, clipDuration));
      if (audioElRef.current.currentTime >= clipEnd) {
        cleanup();
      }
    }, 100);
  };

  const w = (obj.width || 280) * scale;
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div
      style={{
        width: w,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10 * scale,
        padding: `${8 * scale}px ${12 * scale}px`,
        border: '1px solid rgba(255,255,255,0.12)',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
        {/* Play/Pause */}
        <div
          role="button"
          onMouseDown={togglePlay}
          style={{
            width: 32 * scale,
            height: 32 * scale,
            borderRadius: '50%',
            background: playing ? 'rgba(255,255,255,0.2)' : '#4285f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {playing
            ? <Pause size={14 * scale} color="#fff" fill="#fff" />
            : <Play size={14 * scale} color="#fff" fill="#fff" style={{ marginLeft: 2 * scale }} />
          }
        </div>

        {/* Track info + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11 * scale,
            fontWeight: 600,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {obj.trackTitle || 'Audio Clip'}
          </div>
          <div style={{
            fontSize: 9 * scale,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 1 * scale,
          }}>
            {fmtTime(clipStart)} – {fmtTime(clipEnd)} ({Math.round(clipDuration)}s clip)
          </div>
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: 3 * scale,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2 * scale,
            marginTop: 3 * scale,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${clipDuration > 0 ? (currentSec / clipDuration) * 100 : 0}%`,
              height: '100%',
              background: '#4285f4',
              borderRadius: 2 * scale,
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resize Handles (8 handles like Google Slides)
// ---------------------------------------------------------------------------

const HANDLE_POSITIONS = [
  { id: 'tl', cursor: 'nwse-resize', style: { top: -4, left: -4 } },
  { id: 'tc', cursor: 'ns-resize',   style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'tr', cursor: 'nesw-resize', style: { top: -4, right: -4 } },
  { id: 'ml', cursor: 'ew-resize',   style: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
  { id: 'mr', cursor: 'ew-resize',   style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
  { id: 'bl', cursor: 'nesw-resize', style: { bottom: -4, left: -4 } },
  { id: 'bc', cursor: 'ns-resize',   style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'br', cursor: 'nwse-resize', style: { bottom: -4, right: -4 } },
];

function ResizeHandles({ onDragStart, objId, objType }) {
  // Text: no top/bottom center handles (text auto-fits height). All others: full 8 handles.
  const handles = objType === 'text'
    ? HANDLE_POSITIONS.filter(h => h.id !== 'tc' && h.id !== 'bc')
    : HANDLE_POSITIONS;

  return handles.map(h => (
    <div
      key={h.id}
      onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, objId, 'resize', h.id); }}
      onTouchStart={(e) => { e.stopPropagation(); onDragStart(e, objId, 'resize', h.id); }}
      style={{
        position: 'absolute',
        ...h.style,
        width: 8,
        height: 8,
        borderRadius: 2,
        background: '#fbbf24',
        border: '1px solid rgba(0,0,0,0.3)',
        cursor: h.cursor,
        touchAction: 'none',
        zIndex: 10,
      }}
    />
  ));
}

// ---------------------------------------------------------------------------
// Single Object Wrapper
// ---------------------------------------------------------------------------

function CanvasObject({ obj, isSelected, isEditing, scale, onSelect, onDragStart, onEdit, onSaveText, onCancelEdit, zIndex }) {
  const s = scale;
  const x = obj.x * s;
  const y = obj.y * s;
  const editRef = useRef(null);
  const wasSelectedRef = useRef(false); // track if already selected before this click

  // Focus and place cursor when entering edit mode
  useEffect(() => {
    if (!isEditing || !editRef.current) return;
    const el = editRef.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [isEditing]);

  const handleSave = () => {
    const el = editRef.current;
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    onSaveText(obj.id, text);
  };

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); wasSelectedRef.current = isSelected; onSelect(obj.id); if (!isEditing) onDragStart(e, obj.id, 'move'); }}
      onTouchStart={(e) => { e.stopPropagation(); wasSelectedRef.current = isSelected; onSelect(obj.id); if (!isEditing) onDragStart(e, obj.id, 'move'); }}
      onClick={(e) => { e.stopPropagation(); if (obj.type === 'text' && !isEditing) onEdit(obj.id); }}
      draggable={false}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
        cursor: isEditing ? 'text' : 'move',
        border: isSelected ? '2px solid #4285f4' : '2px solid transparent',
        borderRadius: 2,
        padding: 2,
        zIndex: isEditing ? 200 : zIndex,
        touchAction: 'none',
        userSelect: isEditing ? 'text' : 'none',
        WebkitUserSelect: isEditing ? 'text' : 'none',
      }}
    >
      {isEditing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            // Don't exit edit mode if focus moved to another element inside the same canvas object
            // (e.g. toolbar button) — only save when focus truly leaves
            const related = e.relatedTarget;
            if (related && e.currentTarget.parentElement?.contains(related)) return;
            handleSave();
          }}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Escape') { e.preventDefault(); handleSave(); }
          }}
          style={{
            fontSize: (obj.fontSize || 24) * s,
            color: obj.color || '#ffffff',
            fontFamily: obj.fontFamily || 'Inter, system-ui, sans-serif',
            fontWeight: obj.bold ? 'bold' : 'normal',
            fontStyle: obj.italic ? 'italic' : 'normal',
            textAlign: obj.textAlign || 'left',
            lineHeight: 1.3,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            outline: 'none',
            minWidth: 40,
            minHeight: (obj.fontSize || 24) * s,
            width: obj.width ? obj.width * s : undefined,
            caretColor: '#4285f4',
          }}
          dangerouslySetInnerHTML={{ __html: (obj.text || '').replace(/\n/g, '<br>') }}
        />
      ) : (
        renderSlideObject(obj, s)
      )}
      {isSelected && <ResizeHandles onDragStart={onDragStart} objId={obj.id} objType={obj.type} />}
    </div>
  );
}

// InlineTextEditor removed — editing is now inline within CanvasObject

// ---------------------------------------------------------------------------
// Fixed Top Toolbar (Google Slides style)
// ---------------------------------------------------------------------------

function FixedToolbar({
  selectedObj, onUpdate, onDelete, onDuplicate,
  onUndo, onRedo, canUndo, canRedo,
  onBringForward, onSendBack,
  accentColor, onAddText, onAddImage, onAddAudio,
  paletteId, genre, onPaletteChange,
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'font' | 'size' | 'color' | 'palette'
  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const isText = selectedObj?.type === 'text';
  const allColors = accentColor
    ? [accentColor, ...TEXT_COLORS.filter(c => c !== accentColor)]
    : TEXT_COLORS;

  const btnBase = 'flex items-center justify-center rounded transition-colors min-h-[30px] min-w-[30px]';
  const btnInactive = `${btnBase} text-white/50 hover:text-white/80 hover:bg-white/10`;
  const btnActive = `${btnBase} bg-blue-500/20 text-blue-400`;
  const btnDisabled = `${btnBase} text-white/15 cursor-not-allowed`;
  const sep = <div className="w-px h-5 bg-white/10 mx-1" />;

  const currentFont = FONT_FAMILIES.find(f => f.value === selectedObj?.fontFamily) || FONT_FAMILIES[0];
  const currentSize = selectedObj?.fontSize || 24;

  // Palette colors for background picker
  const PALETTE_OPTIONS = [
    { id: 'genre', label: 'Genre', bg: '#0f1419' },
    { id: 'midnight', label: 'Midnight', bg: '#0f172a' },
    { id: 'sunset', label: 'Sunset', bg: '#1c1917' },
    { id: 'arctic', label: 'Arctic', bg: '#0c1421' },
    { id: 'neon', label: 'Neon', bg: '#0a0a0a' },
    { id: 'earth', label: 'Earth', bg: '#1a1814' },
    { id: 'coral', label: 'Coral', bg: '#1a1018' },
  ];

  return (
    <div
      ref={dropdownRef}
      className="flex items-center gap-0.5 px-2 py-1.5 bg-[#1a1f2e] border-b border-white/10 rounded-t-lg overflow-x-auto"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Undo / Redo */}
      <button onClick={onUndo} disabled={!canUndo} className={canUndo ? btnInactive : btnDisabled} title="Undo (Ctrl+Z)">
        <Undo2 size={14} />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={canRedo ? btnInactive : btnDisabled} title="Redo (Ctrl+Shift+Z)">
        <Redo2 size={14} />
      </button>

      {sep}

      {/* Add buttons */}
      <button onClick={onAddText} className={btnInactive} title="Add Text">
        <Type size={13} />
      </button>
      <button onClick={onAddImage} className={btnInactive} title="Add Image">
        <ImageIcon size={13} />
      </button>
      <button onClick={onAddAudio} className={btnInactive} title="Add Audio">
        <Music size={13} />
      </button>

      {sep}

      {/* Background/palette picker */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'palette' ? null : 'palette')}
          className={`${btnInactive} px-1.5 gap-1 text-[11px]`}
          title="Slide Background"
        >
          <div className="w-4 h-4 rounded ring-1 ring-white/20" style={{ background: PALETTE_OPTIONS.find(p => p.id === paletteId)?.bg || '#0f172a' }} />
          <span className="hidden sm:inline">Theme</span>
        </button>
        {openMenu === 'palette' && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1f2e] border border-white/15 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
            {PALETTE_OPTIONS.map(p => (
              <button
                key={p.id}
                onClick={() => { onPaletteChange(p.id); setOpenMenu(null); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-white/10 transition-colors ${
                  paletteId === p.id ? 'text-amber-400' : 'text-white/70'
                }`}
              >
                <div className="w-4 h-4 rounded ring-1 ring-white/20" style={{ background: p.bg }} />
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text formatting — only when text selected */}
      {isText && (
        <>
          {sep}

          {/* Font */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'font' ? null : 'font')}
              className={`${btnInactive} px-1.5 gap-0.5 text-[11px] font-medium`}
              style={{ fontFamily: currentFont.value, minWidth: 50 }}
            >
              {currentFont.label} <DropdownIcon size={10} />
            </button>
            {openMenu === 'font' && (
              <div className="absolute top-full left-0 mt-1 bg-[#1a1f2e] border border-white/15 rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
                {FONT_FAMILIES.map(f => (
                  <button
                    key={f.value}
                    onClick={() => { onUpdate(selectedObj.id, { fontFamily: f.value }); setOpenMenu(null); }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-white/10 ${selectedObj?.fontFamily === f.value ? 'text-blue-400' : 'text-white/70'}`}
                    style={{ fontFamily: f.value }}
                  >{f.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Size */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'size' ? null : 'size')}
              className={`${btnInactive} px-1.5 gap-0.5 text-[11px] font-medium min-w-[32px]`}
            >
              {currentSize} <DropdownIcon size={10} />
            </button>
            {openMenu === 'size' && (
              <div className="absolute top-full left-0 mt-1 bg-[#1a1f2e] border border-white/15 rounded-lg shadow-xl z-50 py-1 min-w-[60px]">
                {FONT_SIZES.map(fs => (
                  <button
                    key={fs.value}
                    onClick={() => { onUpdate(selectedObj.id, { fontSize: fs.value }); setOpenMenu(null); }}
                    className={`w-full text-left px-3 py-1 text-[12px] hover:bg-white/10 ${currentSize === fs.value ? 'text-blue-400' : 'text-white/70'}`}
                  >{fs.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Bold / Italic */}
          <button onClick={() => onUpdate(selectedObj.id, { bold: !selectedObj.bold })} className={selectedObj?.bold ? btnActive : btnInactive} title="Bold">
            <Bold size={14} />
          </button>
          <button onClick={() => onUpdate(selectedObj.id, { italic: !selectedObj.italic })} className={selectedObj?.italic ? btnActive : btnInactive} title="Italic">
            <Italic size={14} />
          </button>

          {/* Text color — Google Slides style */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
              className={`${btnInactive} px-1.5 gap-1`}
              title="Text Color"
            >
              <div className="flex flex-col items-center">
                <span className="text-[13px] font-bold" style={{ color: selectedObj?.color || '#fff' }}>A</span>
                <div className="w-5 h-1 rounded-sm -mt-0.5" style={{ background: selectedObj?.color || '#fff' }} />
              </div>
              <DropdownIcon size={10} />
            </button>
            {openMenu === 'color' && (
              <div className="absolute top-full right-0 mt-1 bg-[#1e2433] border border-white/15 rounded-lg shadow-2xl z-50 p-3 w-[200px]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-2">Text Color</p>
                <div className="grid grid-cols-7 gap-[6px]">
                  {allColors.map(c => (
                    <button
                      key={c}
                      onClick={() => { onUpdate(selectedObj.id, { color: c }); setOpenMenu(null); }}
                      className="group relative"
                    >
                      <div
                        className={`w-[22px] h-[22px] rounded-sm border transition-all ${
                          selectedObj?.color === c
                            ? 'border-blue-400 ring-1 ring-blue-400'
                            : 'border-white/10 group-hover:border-white/40'
                        }`}
                        style={{ background: c }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Object actions — right side */}
      {selectedObj && (
        <div className="flex items-center gap-0.5">
          <button onClick={() => onDuplicate(selectedObj.id)} className={btnInactive} title="Duplicate">
            <Copy size={13} />
          </button>
          <button onClick={() => onDelete(selectedObj.id)} className={`${btnBase} text-red-400/60 hover:text-red-400 hover:bg-red-500/10`} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audio Trim Panel — dual-handle range slider for selecting clip range
// ---------------------------------------------------------------------------

function AudioTrimPanel({ obj, onUpdate }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const [playPos, setPlayPos] = useState(0);
  const trackBarRef = useRef(null);

  const clipStart = obj.clipStart || 0;
  const clipEnd = obj.clipEnd || 15;
  // Estimate track duration from audio (load once)
  const [trackDuration, setTrackDuration] = useState(Math.max(clipEnd + 30, 120));

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = obj.audioUrl;
    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTrackDuration(audio.duration);
      }
    };
    return () => { audio.src = ''; };
  }, [obj.audioUrl]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setPlayPos(0);
  };

  useEffect(() => cleanup, []);

  const togglePreview = () => {
    if (playing) { cleanup(); return; }
    const audio = new Audio(obj.audioUrl);
    audio.currentTime = clipStart;
    audioRef.current = audio;
    audio.play().catch(() => { cleanup(); });
    setPlaying(true);
    timerRef.current = setInterval(() => {
      if (!audioRef.current) return;
      setPlayPos(audioRef.current.currentTime);
      if (audioRef.current.currentTime >= clipEnd) cleanup();
    }, 50);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const clipDuration = clipEnd - clipStart;

  // Handle drag on the track bar
  const handleBarInteraction = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    const bar = trackBarRef.current;
    if (!bar) return;

    const update = (clientX) => {
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = Math.round(fraction * trackDuration);

      if (handle === 'start') {
        onUpdate(obj.id, { clipStart: Math.min(time, clipEnd - 1) });
      } else {
        onUpdate(obj.id, { clipEnd: Math.max(time, clipStart + 1) });
      }
    };

    update(e.clientX || e.touches?.[0]?.clientX);

    const onMove = (ev) => update(ev.clientX || ev.touches?.[0]?.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const startPct = (clipStart / trackDuration) * 100;
  const endPct = (clipEnd / trackDuration) * 100;
  const playPct = playing ? (playPos / trackDuration) * 100 : 0;

  return (
    <div
      className="mt-1 px-3 py-2 bg-[#1a1f2e] rounded-lg border border-white/10"
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          role="button"
          onClick={togglePreview}
          className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
        >
          {playing
            ? <Pause size={12} color="#fff" fill="#fff" />
            : <Play size={12} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-white/70 font-medium truncate">{obj.trackTitle}</div>
          <div className="text-[10px] text-white/40">
            Clip: {fmtTime(clipStart)} – {fmtTime(clipEnd)} ({Math.round(clipDuration)}s)
          </div>
        </div>
      </div>

      {/* Range slider track */}
      <div className="relative" style={{ height: 28 }}>
        {/* Full track background */}
        <div
          ref={trackBarRef}
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full cursor-pointer"
          style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}
        />

        {/* Selected range highlight */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
            height: 6,
            background: 'rgba(66, 133, 244, 0.4)',
          }}
        />

        {/* Playhead */}
        {playing && (
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${playPct}%`, width: 2, background: '#fff', borderRadius: 1 }}
          />
        )}

        {/* Start handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${startPct}%` }}
          onMouseDown={e => handleBarInteraction(e, 'start')}
          onTouchStart={e => handleBarInteraction(e, 'start')}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
        </div>

        {/* End handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${endPct}%` }}
          onMouseDown={e => handleBarInteraction(e, 'end')}
          onTouchStart={e => handleBarInteraction(e, 'end')}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-[9px] text-white/30 mt-0.5">
        <span>0:00</span>
        <span>{fmtTime(trackDuration)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TrackPickerModal — searchable track selection from all artists
// ---------------------------------------------------------------------------

const TrackPickerModal = ({ artistTracks, onSelect, onClose }) => {
  const [query, setQuery] = useState('');

  // Build flat list: artist's tracks first, then all others
  const allTracks = useMemo(() => {
    const artistUrls = new Set(artistTracks.map(t => t.audioUrl));
    const others = [];
    ARTIST_DATABASE.forEach(artist => {
      (artist.tracks || []).forEach(track => {
        if (!artistUrls.has(track.audioUrl)) {
          others.push({ ...track, artistName: artist.name });
        }
      });
    });
    return [
      ...artistTracks.map(t => ({ ...t, artistName: 'Your Artist', isOwn: true })),
      ...others,
    ];
  }, [artistTracks]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allTracks;
    const q = query.toLowerCase();
    return allTracks.filter(t =>
      t.title.toLowerCase().includes(q) || t.artistName.toLowerCase().includes(q)
    );
  }, [allTracks, query]);

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center rounded-lg" onClick={onClose}>
      <div className="bg-[#1a1f2e] border border-white/15 rounded-xl p-4 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-sm mb-3">Choose a Track</h3>
        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-white/10 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25"
          />
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-white/30 text-xs text-center py-4">No tracks found</p>
          )}
          {filtered.map((track, i) => (
            <button
              key={`${track.audioUrl}-${i}`}
              onClick={() => onSelect(track)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${track.isOwn ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                <Music size={14} className={track.isOwn ? 'text-amber-400' : 'text-blue-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{track.title}</div>
                <div className="text-white/40 text-xs">{track.artistName} · {track.duration}</div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 px-3 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SlideCanvas (main component)
// ---------------------------------------------------------------------------

const SlideCanvas = ({ objects = [], paletteId, genre, onChange, readOnly = false, artistTracks = [], onSelectionChange, onPaletteChange }) => {
  const containerRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const dragRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [selRect, setSelRect] = useState(null); // { x, y, w, h } for marquee selection
  const justMarqueedRef = useRef(false);

  // Helpers for selection
  const selectOne = (id) => setSelectedIds(new Set([id]));
  const selectNone = () => setSelectedIds(new Set());
  const selectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;

  // Notify parent of selection changes (single object for sidebar panel)
  useEffect(() => {
    const obj = selectedId ? (objects.find(o => o.id === selectedId) || null) : null;
    onSelectionChange?.(obj);
  }, [selectedId, objects, onSelectionChange]);

  // Undo/redo stacks
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [undoCount, setUndoCount] = useState(0); // triggers re-render for button state
  const [redoCount, setRedoCount] = useState(0);
  const lastSnapshotRef = useRef(null);

  const palette = getPalette(paletteId || 'genre', genre || '');
  const scale = containerSize.w > 0 ? containerSize.w / CANVAS_W : 1;

  // Snapshot for undo — called before any change
  const pushUndo = useCallback((currentObjects) => {
    const snap = JSON.stringify(currentObjects);
    // Don't push duplicate
    if (snap === lastSnapshotRef.current) return;
    undoStack.current.push(JSON.parse(snap));
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
    lastSnapshotRef.current = snap;
    setUndoCount(undoStack.current.length);
    setRedoCount(0);
  }, []);

  // Wrap onChange to track undo
  const handleChange = useCallback((newObjects, skipUndo = false) => {
    if (!skipUndo) pushUndo(objects);
    onChange(newObjects);
  }, [objects, onChange, pushUndo]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(JSON.parse(JSON.stringify(objects)));
    const prev = undoStack.current.pop();
    lastSnapshotRef.current = JSON.stringify(prev);
    onChange(prev);
    setUndoCount(undoStack.current.length);
    setRedoCount(redoStack.current.length);
  }, [objects, onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(JSON.parse(JSON.stringify(objects)));
    const next = redoStack.current.pop();
    lastSnapshotRef.current = JSON.stringify(next);
    onChange(next);
    setUndoCount(undoStack.current.length);
    setRedoCount(redoStack.current.length);
  }, [objects, onChange]);

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

  const handleDragStart = useCallback((e, objId, mode, handleId) => {
    if (readOnly) return;
    const pos = getPointerPos(e);
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;

    // Push undo before drag begins
    pushUndo(objects);

    dragRef.current = {
      mode,
      handleId,
      objId,
      startX: pos.x,
      startY: pos.y,
      initialX: obj.x,
      initialY: obj.y,
      initialFontSize: obj.fontSize || 24,
      initialWidth: obj.width || 200,
      initialHeight: obj.height || 150,
      // Store initial positions of all other selected objects for group move
      otherInitials: Object.fromEntries(
        objects.filter(o => selectedIds.has(o.id) && o.id !== objId).map(o => [o.id, { x: o.x, y: o.y }])
      ),
    };

    const handleMove = (ev) => {
      ev.preventDefault();
      const drag = dragRef.current;
      if (!drag) return;
      const p = getPointerPos(ev);
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;

      if (drag.mode === 'move') {
        // Move all selected objects together
        const updated = objects.map(o => {
          if (o.id === drag.objId) return { ...o, x: drag.initialX + dx, y: drag.initialY + dy };
          if (selectedIds.has(o.id) && o.id !== drag.objId) {
            const init = drag.otherInitials?.[o.id];
            if (init) return { ...o, x: init.x + dx, y: init.y + dy };
          }
          return o;
        });
        onChange(updated); // skip undo push during drag (already pushed at start)
      } else if (drag.mode === 'resize') {
        const updated = objects.map(o => {
          if (o.id !== drag.objId) return o;

          if (o.type === 'text') {
            const hid = drag.handleId;
            // Side handles: adjust width only
            if (hid === 'ml' || hid === 'mr') {
              const newW = Math.max(60, drag.initialWidth + (hid === 'mr' ? dx : -dx));
              const newX = hid === 'ml' ? drag.initialX + dx : o.x;
              return { ...o, width: newW, x: newX };
            }
            // Top/bottom center: adjust font size smoothly
            if (hid === 'tc' || hid === 'bc') {
              const expandDy = hid === 'bc' ? dy : -dy;
              const newSize = Math.max(12, Math.min(96, drag.initialFontSize + expandDy * 0.1));
              return { ...o, fontSize: newSize };
            }
            // Corner handles: scale both width and font size proportionally
            const expandDx = hid.includes('r') ? dx : -dx;
            const expandDy = hid.includes('b') ? dy : -dy;
            const scale = Math.max(0.3, 1 + (expandDx + expandDy) / 400);
            const newW = Math.max(60, drag.initialWidth * scale);
            const newSize = Math.max(12, Math.min(96, drag.initialFontSize * scale));
            return { ...o, width: newW, fontSize: newSize };
          }

          if (o.type === 'image') {
            const hid = drag.handleId;
            const aspect = drag.initialWidth / drag.initialHeight;
            let newW, newH;

            if (hid === 'ml' || hid === 'mr') {
              // Side: scale by width, keep aspect ratio
              newW = Math.max(40, drag.initialWidth + (hid === 'mr' ? dx : -dx));
              newH = newW / aspect;
            } else if (hid === 'tc' || hid === 'bc') {
              // Top/bottom: scale by height, keep aspect ratio
              newH = Math.max(40, drag.initialHeight + (hid === 'bc' ? dy : -dy));
              newW = newH * aspect;
            } else {
              // Corner: use both axes, keep aspect ratio
              const expandDx = hid.includes('r') ? dx : -dx;
              const expandDy = hid.includes('b') ? dy : -dy;
              const factor = Math.max(0.2, Math.min(4, 1 + (expandDx + expandDy) / 300));
              newW = drag.initialWidth * factor;
              newH = drag.initialHeight * factor;
            }

            return { ...o, width: Math.round(newW), height: Math.round(newH) };
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
  }, [objects, onChange, readOnly, scale, pushUndo, selectedIds]);

  // Deselect on canvas background click — only fires from the bg element itself
  const handleCanvasClick = (e) => {
    // Only deselect if clicking the canvas container or the explicit bg element
    if (e.target !== containerRef.current && !e.target.dataset.canvasBg) return;
    if (justMarqueedRef.current) {
      justMarqueedRef.current = false;
      return;
    }
    if (!dragRef.current) {
      selectNone();
      setEditingId(null);
    }
  };

  // Marquee drag-select on empty canvas
  const handleCanvasMouseDown = (e) => {
    if (readOnly) return;
    // Only start marquee from the canvas background, not from objects
    const el = e.target;
    if (el !== containerRef.current && !el.dataset.canvasBg) return;
    const pos = getPointerPos(e);
    const startX = pos.x;
    const startY = pos.y;
    setSelRect({ x: startX, y: startY, w: 0, h: 0 });
    selectNone();
    setEditingId(null);

    const onMove = (ev) => {
      ev.preventDefault();
      const p = getPointerPos(ev);
      setSelRect({
        x: Math.min(startX, p.x),
        y: Math.min(startY, p.y),
        w: Math.abs(p.x - startX),
        h: Math.abs(p.y - startY),
      });
    };

    const onUp = () => {
      justMarqueedRef.current = true;
      setSelRect(prev => {
        if (prev && prev.w > 5 && prev.h > 5) {
          const ids = new Set();
          objects.forEach(obj => {
            // Estimate object bounds
            const textLen = obj.type === 'text' ? (obj.text || '').length : 0;
            const lines = obj.type === 'text' ? Math.max(1, (obj.text || '').split('\n').length) : 1;
            const ow = obj.width || (obj.type === 'text' ? Math.max(textLen * (obj.fontSize || 24) * 0.55, 80) : obj.type === 'audio' ? 280 : 200);
            const oh = obj.height || (obj.type === 'text' ? (obj.fontSize || 24) * lines * 1.4 : 150);
            const objRight = obj.x + ow;
            const objBottom = obj.y + oh;
            const selRight = prev.x + prev.w;
            const selBottom = prev.y + prev.h;
            // Select if any overlap (not just top-left corner inside)
            if (obj.x < selRight && objRight > prev.x &&
                obj.y < selBottom && objBottom > prev.y) {
              ids.add(obj.id);
            }
          });
          if (ids.size > 0) setSelectedIds(ids);
        }
        return null;
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (editingId) return;

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedIds(new Set(objects.map(o => o.id)));
        return;
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        pushUndo(objects);
        onChange(objects.filter(o => !selectedIds.has(o.id)));
        selectNone();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIds, editingId, objects, onChange, handleUndo, handleRedo, pushUndo]);

  // ---------------------------------------------------------------------------
  // Object CRUD
  // ---------------------------------------------------------------------------
  const addText = () => {
    pushUndo(objects);
    const obj = {
      id: genId(),
      type: 'text',
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 20,
      width: 200,
      text: 'New Text',
      fontSize: 24,
      color: '#ffffff',
      bold: false,
      italic: false,
      textAlign: 'left',
      fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: objects.length + 1,
    };
    onChange([...objects, obj]);
    selectOne(obj.id);
  };

  const addImage = (imageData) => {
    pushUndo(objects);
    const obj = {
      id: genId(),
      type: 'image',
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 75,
      width: 200,
      height: 150,
      url: imageData.url || imageData.thumbnailUrl,
      attribution: imageData.attribution || '',
      zIndex: objects.length + 1,
    };
    onChange([...objects, obj]);
    selectOne(obj.id);
  };

  // Audio clip — shows track picker if artist has tracks, otherwise no-op
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  const addAudioFromTrack = (track) => {
    pushUndo(objects);
    const obj = {
      id: genId(),
      type: 'audio',
      x: CANVAS_W / 2 - 140,
      y: CANVAS_H / 2 - 25,
      width: 280,
      audioUrl: track.audioUrl,
      trackTitle: track.title,
      clipStart: 0,
      clipEnd: 15,
      zIndex: objects.length + 1,
    };
    onChange([...objects, obj]);
    selectOne(obj.id);
    setShowTrackPicker(false);
  };

  const updateObject = (id, updates) => {
    pushUndo(objects);
    onChange(objects.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteObject = (id) => {
    pushUndo(objects);
    onChange(objects.filter(o => o.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const duplicateObject = (id) => {
    pushUndo(objects);
    const src = objects.find(o => o.id === id);
    if (!src) return;
    const dup = { ...src, id: genId(), x: src.x + 20, y: src.y + 20, zIndex: objects.length + 1 };
    onChange([...objects, dup]);
    selectOne(dup.id);
  };

  const bringForward = (id) => {
    pushUndo(objects);
    const maxZ = Math.max(...objects.map(o => o.zIndex || 0));
    onChange(objects.map(o => o.id === id ? { ...o, zIndex: maxZ + 1 } : o));
  };

  const sendBack = (id) => {
    pushUndo(objects);
    const minZ = Math.min(...objects.map(o => o.zIndex || 0));
    onChange(objects.map(o => o.id === id ? { ...o, zIndex: minZ - 1 } : o));
  };

  const saveText = (id, text) => {
    pushUndo(objects);
    onChange(objects.map(o => o.id === id ? { ...o, text } : o));
    setEditingId(null);
  };

  const handleAddImage = () => {
    const event = new CustomEvent('press-kit-add-image', { detail: { callback: addImage } });
    window.dispatchEvent(event);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const selectedObj = objects.find(o => o.id === selectedId);
  // Sort by zIndex for rendering order
  const sortedObjects = [...objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div className="relative w-full">
      {/* Fixed Top Toolbar */}
      {!readOnly && (
        <FixedToolbar
          selectedObj={selectedObj}
          onUpdate={updateObject}
          onDelete={deleteObject}
          onDuplicate={duplicateObject}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoCount > 0}
          canRedo={redoCount > 0}
          onBringForward={bringForward}
          onSendBack={sendBack}
          accentColor={palette.accent}
          onAddText={addText}
          onAddImage={handleAddImage}
          onAddAudio={() => setShowTrackPicker(true)}
          paletteId={paletteId}
          genre={genre}
          onPaletteChange={onPaletteChange}
        />
      )}

      {/* Track Picker Modal — searchable across all artists */}
      {showTrackPicker && (
        <TrackPickerModal
          artistTracks={artistTracks}
          onSelect={addAudioFromTrack}
          onClose={() => setShowTrackPicker(false)}
        />
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
          background: palette.bg,
          touchAction: 'none',
          borderRadius: readOnly ? 8 : '0 0 8px 8px',
        }}
      >
        {/* Clickable background for marquee drag */}
        <div data-canvas-bg="true" className="absolute inset-0" />

        {/* Background gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${palette.accent}11 0%, transparent 70%)`,
          }}
        />

        {/* Objects — rendered in z-order */}
        {sortedObjects.map(obj => (
            <CanvasObject
              key={obj.id}
              obj={obj}
              isSelected={selectedIds.has(obj.id)}
              isEditing={editingId === obj.id}
              scale={scale}
              onSelect={readOnly ? () => {} : selectOne}
              onDragStart={handleDragStart}
              onSaveText={saveText}
              onCancelEdit={() => setEditingId(null)}
              onEdit={readOnly ? () => {} : setEditingId}
              zIndex={obj.zIndex || 0}
            />
        ))}

        {/* Empty state hint */}
        {objects.length === 0 && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/15 text-sm">Click Add Text or Add Image in the toolbar above</p>
          </div>
        )}

        {/* Selection rectangle */}
        {selRect && selRect.w > 2 && selRect.h > 2 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: selRect.x * scale,
              top: selRect.y * scale,
              width: selRect.w * scale,
              height: selRect.h * scale,
              border: '1px dashed #4285f4',
              background: 'rgba(66, 133, 244, 0.08)',
              zIndex: 300,
            }}
          />
        )}
      </div>

    </div>
  );
};

export { CANVAS_W, CANVAS_H, AudioTrimPanel };
export default SlideCanvas;
