// File: /src/lessons/shared/components/CanvaImageSlide.jsx
// Displays fullscreen Canva presentation slides (exported as PNG)
// FIXED: Proper React error handling instead of DOM manipulation

import React, { useState } from 'react';

const CanvaImageSlide = ({ imagePath, sessionCode }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Fullscreen Canva Image */}
      {!imageError ? (
        <img 
          src={imagePath}
          alt="Lesson slide"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          onError={() => {
            console.error('❌ Failed to load image:', imagePath);
            setImageError(true);
          }}
        />
      ) : (
        /* Error fallback - shown if image doesn't load */
        <div style={{
          color: 'white',
          textAlign: 'center',
          padding: '40px',
          maxWidth: '600px'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️ Image Not Found</h2>
          <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '16px' }}>
            Missing: {imagePath}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Please export this slide from Canva and place it in the correct folder.
          </p>
        </div>
      )}
    </div>
  );
};

export default CanvaImageSlide;