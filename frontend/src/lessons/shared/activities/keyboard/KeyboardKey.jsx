// KeyboardKey.jsx
// Professional piano key component with realistic styling

import React from 'react';

const KeyboardKey = ({ note, isWhite, label, computerKey, isPressed, onPress, onRelease }) => {
  
  // White key styling
  const whiteKeyStyle = {
    width: '40px',
    height: '150px',
    background: isPressed 
      ? 'linear-gradient(180deg, #d0d0d0 0%, #e8e8e8 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 95%, #e0e0e0 100%)',
    border: '1px solid #aaa',
    borderRadius: '0 0 4px 4px',
    boxShadow: isPressed 
      ? 'inset 0 3px 8px rgba(0,0,0,0.25), inset 0 1px 2px rgba(0,0,0,0.15)'
      : '0 3px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)',
    transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 0 10px 0',
    transition: 'all 0.05s ease',
    userSelect: 'none',
    zIndex: 1
  };

  // Black key styling
  const blackKeyStyle = {
    width: '26px',
    height: '95px',
    background: isPressed
      ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
      : 'linear-gradient(180deg, #000 0%, #1a1a1a 90%, #000 100%)',
    border: '1px solid #000',
    borderRadius: '0 0 3px 3px',
    boxShadow: isPressed
      ? 'inset 0 2px 6px rgba(0,0,0,0.6)'
      : '0 4px 8px rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.3)',
    transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 0 6px 0',
    transition: 'all 0.05s ease',
    zIndex: 2,
    userSelect: 'none'
  };

  const baseStyle = isWhite ? whiteKeyStyle : blackKeyStyle;

  return (
    <div
      style={baseStyle}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={(e) => {
        e.preventDefault();
        onPress();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onRelease();
      }}
    >
      {/* Note label */}
      <div style={{
        fontSize: isWhite ? '11px' : '9px',
        fontWeight: '600',
        color: isWhite ? '#666' : '#aaa',
        marginBottom: '4px',
        textShadow: isWhite ? 'none' : '0 1px 1px rgba(0,0,0,0.5)'
      }}>
        {label}
      </div>
      
      {/* Computer key hint */}
      <div style={{
        fontSize: isWhite ? '10px' : '8px',
        color: isWhite ? '#999' : '#777',
        backgroundColor: isWhite ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
        padding: '2px 5px',
        borderRadius: '3px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        border: isWhite ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)'
      }}>
        {computerKey}
      </div>
    </div>
  );
};

export default KeyboardKey;