// Floating drag preview that follows the pointer during library-to-timeline drag.
// Rendered once in MusicComposer, self-manages visibility via CursorContext.
// Uses position:fixed + transform for GPU-accelerated movement.

import React, { useRef, useEffect, useState } from 'react';
import { useCursor } from './CursorContext';

const LibraryDragPreview = () => {
  const { libraryDragActive, getLibraryDragData, getLibraryDragPos } = useCursor();
  const elRef = useRef(null);
  const rafRef = useRef(null);
  const [loopData, setLoopData] = useState(null);

  // Grab loop data when drag starts
  useEffect(() => {
    if (libraryDragActive) {
      setLoopData(getLibraryDragData());
    } else {
      setLoopData(null);
    }
  }, [libraryDragActive, getLibraryDragData]);

  // Animate position with RAF for smooth following
  useEffect(() => {
    if (!libraryDragActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      const pos = getLibraryDragPos();
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${pos.x + 12}px, ${pos.y - 20}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [libraryDragActive, getLibraryDragPos]);

  if (!libraryDragActive || !loopData) return null;

  return (
    <div
      ref={elRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          background: '#1f2937',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          maxWidth: 160,
        }}
      >
        <span
          style={{
            backgroundColor: loopData.color || '#6b7280',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 4px',
            borderRadius: 3,
            lineHeight: 1,
          }}
        >
          {loopData.instrument || loopData.category || 'Loop'}
        </span>
        <span
          style={{
            color: '#e5e7eb',
            fontSize: 11,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {loopData.name}
        </span>
      </div>
    </div>
  );
};

export default LibraryDragPreview;
