// InstrumentKeyboard.jsx
// Piano keyboard for the Film Music virtual instrument
// One octave (C4-C5), computer keys A-K + W/E/T/Y/U for sharps
// Professional styling with realistic key shapes and gradients

import React, { useCallback } from 'react';
import { KEYBOARD_NOTES } from './instrumentConfig';

const WHITE_KEY_WIDTH = 48;
const BLACK_KEY_WIDTH = 28;
const WHITE_KEY_HEIGHT = 130;
const BLACK_KEY_HEIGHT = 80;

const InstrumentKeyboard = ({ pressedKeys, onNoteStart, onNoteEnd, instrumentColor = '#3B82F6' }) => {
  const whiteNotes = KEYBOARD_NOTES.filter(n => !n.isBlack);
  const blackNotes = KEYBOARD_NOTES.filter(n => n.isBlack);

  const handlePointerDown = useCallback((note, e) => {
    e.preventDefault();
    onNoteStart(note);
  }, [onNoteStart]);

  const handlePointerUp = useCallback((note, e) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [onNoteEnd]);

  // Black key positions between white keys
  const getBlackKeyLeft = (blackNote) => {
    const whiteIndex = whiteNotes.findIndex(w => {
      const wBase = w.note.replace(/\d/, '');
      const bBase = blackNote.note.replace('#', '').replace(/\d/, '');
      return wBase === bBase;
    });
    if (whiteIndex === -1) return 0;
    return (whiteIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
  };

  const totalWidth = whiteNotes.length * WHITE_KEY_WIDTH;

  return (
    <div className="flex justify-center select-none" style={{ touchAction: 'none' }}>
      <div
        className="relative rounded-b-lg overflow-hidden"
        style={{ width: totalWidth, height: WHITE_KEY_HEIGHT }}
      >
        {/* White keys */}
        {whiteNotes.map((n, i) => {
          const isPressed = pressedKeys.has(n.note);
          return (
            <div
              key={n.note}
              className="absolute flex flex-col items-center justify-end cursor-pointer"
              style={{
                left: i * WHITE_KEY_WIDTH,
                width: WHITE_KEY_WIDTH,
                height: WHITE_KEY_HEIGHT,
                zIndex: 1,
              }}
              onPointerDown={(e) => handlePointerDown(n.note, e)}
              onPointerUp={(e) => handlePointerUp(n.note, e)}
              onPointerLeave={(e) => {
                if (pressedKeys.has(n.note)) handlePointerUp(n.note, e);
              }}
            >
              {/* Key body */}
              <div
                className="absolute inset-0 rounded-b-md transition-all duration-50"
                style={{
                  margin: '0 1px',
                  background: isPressed
                    ? `linear-gradient(180deg, ${instrumentColor}DD 0%, ${instrumentColor} 100%)`
                    : 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 60%, #E5E7EB 100%)',
                  boxShadow: isPressed
                    ? `inset 0 1px 3px rgba(0,0,0,0.2), 0 0 12px ${instrumentColor}40`
                    : '0 2px 4px rgba(0,0,0,0.15), inset 0 -2px 0 #D1D5DB',
                  transform: isPressed ? 'translateY(2px)' : 'none',
                  borderLeft: '1px solid #D1D5DB',
                  borderRight: '1px solid #D1D5DB',
                  borderBottom: isPressed ? 'none' : '3px solid #B0B8C4',
                }}
              />
              {/* Labels */}
              <div className="relative z-10 pb-2.5 flex flex-col items-center">
                <span
                  className="text-xs font-semibold"
                  style={{ color: isPressed ? '#FFFFFF' : '#6B7280' }}
                >
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
          const left = getBlackKeyLeft(n);
          return (
            <div
              key={n.note}
              className="absolute cursor-pointer"
              style={{
                left,
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT,
                zIndex: 2,
              }}
              onPointerDown={(e) => handlePointerDown(n.note, e)}
              onPointerUp={(e) => handlePointerUp(n.note, e)}
              onPointerLeave={(e) => {
                if (pressedKeys.has(n.note)) handlePointerUp(n.note, e);
              }}
            >
              {/* Key body */}
              <div
                className="absolute inset-0 rounded-b-md transition-all duration-50 flex flex-col items-center justify-end pb-1.5"
                style={{
                  background: isPressed
                    ? `linear-gradient(180deg, ${instrumentColor} 0%, ${instrumentColor}CC 100%)`
                    : 'linear-gradient(180deg, #374151 0%, #1F2937 40%, #111827 100%)',
                  boxShadow: isPressed
                    ? `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 10px ${instrumentColor}30`
                    : '0 3px 6px rgba(0,0,0,0.4), inset 0 -1px 0 #4B5563',
                  transform: isPressed ? 'translateY(2px)' : 'none',
                  borderBottom: isPressed ? 'none' : '2px solid #000000',
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
    </div>
  );
};

export default InstrumentKeyboard;
