// InstrumentKeyboard.jsx
// Piano keyboard for the Film Music virtual instrument
// One octave (C4-C5), fills entire container
//
// Two visual modes:
//   1. No scale filter (allowedNotes = null): Traditional piano layout with white + black keys
//   2. Scale filter active: Non-scale notes are GONE. Only scale notes render as
//      large, equal-width, centered keys with big prominent letters.

import React, { useCallback } from 'react';
import { KEYBOARD_NOTES } from './instrumentConfig';

const BLACK_KEY_HEIGHT_RATIO = 0.6;
const BLACK_KEY_WIDTH_RATIO = 0.6;

const InstrumentKeyboard = ({ pressedKeys, onNoteStart, onNoteEnd, instrumentColor = '#3B82F6', glide = false, allowedNotes = null, noteLabels = null, highlightedKeys = null }) => {
  // Merge pressed + highlighted for visual state
  const isActive = (note) => pressedKeys.has(note) || (highlightedKeys && highlightedKeys.has(note));
  const isDraggingRef = React.useRef(false);

  const handlePointerDown = useCallback((note, e) => {
    e.preventDefault();
    onNoteStart(note);
  }, [onNoteStart]);

  const handlePointerUp = useCallback((note, e) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [onNoteEnd]);

  // ========================================
  // SCALE MODE: Only show allowed notes as big centered keys
  // ========================================
  if (allowedNotes) {
    const scaleNotes = KEYBOARD_NOTES.filter(n => allowedNotes.has(n.note));
    const count = scaleNotes.length;
    const maxKeyWidth = 120; // px

    // Display label: use noteLabels override (flats) if provided, else default label
    const getLabel = (n) => (noteLabels && noteLabels[n.note]) || n.label;

    return (
      <div className="w-full h-full flex items-center justify-center select-none px-4" style={{ touchAction: 'none' }}>
        <div className="flex gap-2 h-[85%]" style={{ maxWidth: `${count * maxKeyWidth + (count - 1) * 8}px`, width: '100%' }}>
          {scaleNotes.map((n) => {
            const active = isActive(n.note);
            const isBlack = n.isBlack;
            const label = getLabel(n);
            return (
              <div
                key={n.note}
                className="flex-1 rounded-xl flex flex-col items-center justify-end pb-3 cursor-pointer transition-all select-none"
                style={{
                  touchAction: 'none',
                  background: active
                    ? `linear-gradient(180deg, ${instrumentColor}EE 0%, ${instrumentColor} 100%)`
                    : isBlack
                    ? 'linear-gradient(180deg, #4B5563 0%, #374151 60%, #1F2937 100%)'
                    : 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 60%, #E5E7EB 100%)',
                  border: active
                    ? `2px solid ${instrumentColor}`
                    : isBlack
                    ? '2px solid #6B7280'
                    : '2px solid #D1D5DB',
                  boxShadow: active
                    ? `0 0 20px ${instrumentColor}50, inset 0 2px 4px rgba(0,0,0,0.2)`
                    : '0 4px 12px rgba(0,0,0,0.15), inset 0 -3px 0 rgba(0,0,0,0.08)',
                  transform: active ? 'scale(0.97) translateY(2px)' : 'scale(1)',
                }}
                onPointerDown={(e) => { isDraggingRef.current = true; handlePointerDown(n.note, e); }}
                onPointerUp={(e) => { isDraggingRef.current = false; handlePointerUp(n.note, e); }}
                onPointerEnter={(e) => {
                  if (glide && isDraggingRef.current) handlePointerDown(n.note, e);
                }}
                onPointerLeave={(e) => {
                  if (pressedKeys.has(n.note)) handlePointerUp(n.note, e);
                }}
              >
                <span
                  className="font-bold transition-colors"
                  style={{
                    fontSize: count <= 6 ? '2rem' : count <= 8 ? '1.5rem' : '1.25rem',
                    color: active ? '#FFF' : isBlack ? '#D1D5DB' : '#374151',
                  }}
                >
                  {label}
                </span>
                <span
                  className="font-mono uppercase mt-1 transition-colors"
                  style={{
                    fontSize: count <= 6 ? '0.875rem' : '0.75rem',
                    color: active ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                  }}
                >
                  {n.key}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================
  // CHROMATIC MODE: Traditional piano layout (default)
  // ========================================
  const whiteNotes = KEYBOARD_NOTES.filter(n => !n.isBlack);
  const blackNotes = KEYBOARD_NOTES.filter(n => n.isBlack);
  const whiteCount = whiteNotes.length;

  const getBlackKeyLeftPercent = (blackNote) => {
    const whiteIndex = whiteNotes.findIndex(w => {
      const wBase = w.note.replace(/\d/, '');
      const bBase = blackNote.note.replace('#', '').replace(/\d/, '');
      return wBase === bBase;
    });
    if (whiteIndex === -1) return 0;
    const whiteWidthPercent = 100 / whiteCount;
    const blackWidthPercent = whiteWidthPercent * BLACK_KEY_WIDTH_RATIO;
    return ((whiteIndex + 1) * whiteWidthPercent) - (blackWidthPercent / 2);
  };

  const whiteWidthPercent = 100 / whiteCount;
  const blackWidthPercent = whiteWidthPercent * BLACK_KEY_WIDTH_RATIO;

  return (
    <div className="w-full h-full relative select-none" style={{ touchAction: 'none' }}>
      {/* White keys */}
      {whiteNotes.map((n, i) => {
        const isPressed = isActive(n.note);
        return (
          <div
            key={n.note}
            className="absolute top-0 bottom-0 flex flex-col items-center justify-end cursor-pointer"
            style={{
              left: `${i * whiteWidthPercent}%`,
              width: `${whiteWidthPercent}%`,
              zIndex: 1,
            }}
            onPointerDown={(e) => { isDraggingRef.current = true; handlePointerDown(n.note, e); }}
            onPointerUp={(e) => { isDraggingRef.current = false; handlePointerUp(n.note, e); }}
            onPointerEnter={(e) => {
              if (glide && isDraggingRef.current) handlePointerDown(n.note, e);
            }}
            onPointerLeave={(e) => {
              if (pressedKeys.has(n.note)) handlePointerUp(n.note, e);
            }}
          >
            <div
              className="absolute inset-0 transition-all duration-50"
              style={{
                margin: '0 0.5px',
                background: isPressed
                  ? `linear-gradient(180deg, ${instrumentColor}DD 0%, ${instrumentColor} 100%)`
                  : 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 60%, #E5E7EB 100%)',
                boxShadow: isPressed
                  ? `inset 0 1px 3px rgba(0,0,0,0.2), 0 0 12px ${instrumentColor}40`
                  : '0 2px 4px rgba(0,0,0,0.15), inset 0 -2px 0 #D1D5DB',
                borderLeft: '1px solid #D1D5DB',
                borderRight: '1px solid #D1D5DB',
                borderBottom: isPressed ? '1px solid #B0B8C4' : '3px solid #B0B8C4',
              }}
            />
            <div className="relative z-10 pb-2 flex flex-col items-center">
              <span className="text-xs font-semibold" style={{ color: isPressed ? '#FFF' : '#6B7280' }}>
                {n.label}
              </span>
              <span
                className="text-[9px] font-mono mt-0.5 uppercase"
                style={{
                  color: isPressed ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                  backgroundColor: isPressed ? 'transparent' : 'rgba(0,0,0,0.05)',
                  padding: '1px 4px',
                  borderRadius: '3px',
                }}
              >
                {n.key}
              </span>
            </div>
          </div>
        );
      })}

      {/* Black keys */}
      {blackNotes.map((n) => {
        const isPressed = isActive(n.note);
        const left = getBlackKeyLeftPercent(n);
        return (
          <div
            key={n.note}
            className="absolute top-0 cursor-pointer"
            style={{
              left: `${left}%`,
              width: `${blackWidthPercent}%`,
              height: `${BLACK_KEY_HEIGHT_RATIO * 100}%`,
              zIndex: 2,
            }}
            onPointerDown={(e) => { isDraggingRef.current = true; handlePointerDown(n.note, e); }}
            onPointerUp={(e) => { isDraggingRef.current = false; handlePointerUp(n.note, e); }}
            onPointerEnter={(e) => {
              if (glide && isDraggingRef.current) handlePointerDown(n.note, e);
            }}
            onPointerLeave={(e) => {
              if (pressedKeys.has(n.note)) handlePointerUp(n.note, e);
            }}
          >
            <div
              className="absolute inset-0 rounded-b-md transition-all duration-50 flex flex-col items-center justify-end pb-1.5"
              style={{
                background: isPressed
                  ? `linear-gradient(180deg, ${instrumentColor} 0%, ${instrumentColor}CC 100%)`
                  : 'linear-gradient(180deg, #374151 0%, #1F2937 40%, #111827 100%)',
                boxShadow: isPressed
                  ? `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 10px ${instrumentColor}30`
                  : '0 3px 6px rgba(0,0,0,0.4), inset 0 -1px 0 #4B5563',
                borderBottom: isPressed ? '1px solid #000' : '2px solid #000000',
              }}
            >
              <span className="text-[8px] font-mono uppercase" style={{ color: isPressed ? 'rgba(255,255,255,0.8)' : '#6B7280' }}>
                {n.key}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstrumentKeyboard;
