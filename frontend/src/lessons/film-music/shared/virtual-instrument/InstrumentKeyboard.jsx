// InstrumentKeyboard.jsx
// Piano keyboard for the Film Music virtual instrument
// One octave (C4-C5), fills entire container — no black gaps

import React, { useCallback } from 'react';
import { KEYBOARD_NOTES } from './instrumentConfig';

const BLACK_KEY_HEIGHT_RATIO = 0.6;
const BLACK_KEY_WIDTH_RATIO = 0.6; // black key width as ratio of white key width

const InstrumentKeyboard = ({ pressedKeys, onNoteStart, onNoteEnd, instrumentColor = '#3B82F6', glide = false }) => {
  const isDraggingRef = React.useRef(false);
  const whiteNotes = KEYBOARD_NOTES.filter(n => !n.isBlack);
  const blackNotes = KEYBOARD_NOTES.filter(n => n.isBlack);
  const whiteCount = whiteNotes.length;

  const handlePointerDown = useCallback((note, e) => {
    e.preventDefault();
    onNoteStart(note);
  }, [onNoteStart]);

  const handlePointerUp = useCallback((note, e) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [onNoteEnd]);

  // Black key position: sits between its natural and the next white key
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
        const isPressed = pressedKeys.has(n.note);
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
        const isPressed = pressedKeys.has(n.note);
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
