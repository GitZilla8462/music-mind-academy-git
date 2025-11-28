// File: VexFlowScore.jsx
// VexFlow notation renderer with smooth 60fps playhead
// Uses requestAnimationFrame for buttery smooth playback tracking

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { allNotes, notesByMeasure, layoutConfig, pieceInfo, MEASURE_DURATION } from '../data/bachCelloSuiteNotes';
import { themes, getRandomBloom } from '../data/themes';

const VexFlowScore = forwardRef(({ 
  audioRef,  // Reference to the audio element for direct time reading
  isPlaying = false,
  theme = 'garden',
  bloomedNotes = new Set(),
  onNoteClick,
}, ref) => {
  const containerRef = useRef(null);
  const playheadRef = useRef(null);  // Direct ref to playhead element
  const animationRef = useRef(null); // For requestAnimationFrame
  const [isLoaded, setIsLoaded] = useState(false);
  const [notePositions, setNotePositions] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const currentTheme = themes[theme] || themes.garden;

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getNotePositions: () => notePositions,
  }));

  // Load VexFlow script
  useEffect(() => {
    if (window.VexFlow || window.Vex) {
      console.log('✅ VexFlow already available');
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ VexFlow loaded');
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load VexFlow');
    };
    document.body.appendChild(script);
  }, []);

  // Render score when VexFlow is loaded
  useEffect(() => {
    if (isLoaded && containerRef.current) {
      renderScore();
    }
  }, [isLoaded]);

  // ============================================
  // SMOOTH PLAYHEAD - requestAnimationFrame loop
  // ============================================
  useEffect(() => {
    if (!isPlaying || !audioRef?.current || !playheadRef.current) {
      // Stop animation when not playing
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const { measuresPerSystem, staveWidth, staveHeight, startX, startY, clefWidth } = layoutConfig;

    const updatePlayhead = () => {
      if (!audioRef.current || !playheadRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      
      // Calculate which measure we're in
      const currentMeasure = Math.floor(currentTime / MEASURE_DURATION) + 1;
      const timeInMeasure = currentTime % MEASURE_DURATION;
      const progressInMeasure = timeInMeasure / MEASURE_DURATION;
      
      if (currentMeasure > 16) {
        playheadRef.current.style.opacity = '0';
        return;
      }
      
      // Which system (row) and position in system
      const system = Math.floor((currentMeasure - 1) / measuresPerSystem);
      const measureInSystem = (currentMeasure - 1) % measuresPerSystem;
      
      // Notes ALWAYS start after the clef on each system
      // The clef only appears at the start of each system but takes up space
      // So note area for all measures starts at: startX + clefWidth + (measureInSystem * staveWidth)
      const noteStartX = startX + clefWidth + (measureInSystem * staveWidth);
      const playheadX = noteStartX + (progressInMeasure * staveWidth);
      
      // Calculate y position (top to bottom of staff)
      const yTop = startY + (system * staveHeight);
      
      // Update playhead position directly (no React state!)
      playheadRef.current.style.left = `${playheadX}px`;
      playheadRef.current.style.top = `${yTop}px`;
      playheadRef.current.style.opacity = '1';
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(updatePlayhead);
    };

    // Start the animation loop
    animationRef.current = requestAnimationFrame(updatePlayhead);

    // Cleanup on unmount or when isPlaying changes
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, audioRef]);

  const renderScore = useCallback(() => {
    if (!containerRef.current || !window.Vex) return;

    const VF = window.Vex.Flow;
    const container = containerRef.current;
    
    // Clear existing content
    container.innerHTML = '';

    // Calculate dimensions
    const { measuresPerSystem, systems, staveWidth, staveHeight, startX, startY, clefWidth } = layoutConfig;
    const totalWidth = startX + clefWidth + (staveWidth * measuresPerSystem) + 20;
    const totalHeight = startY + (staveHeight * systems) + 40;

    setCanvasSize({ width: totalWidth, height: totalHeight });

    // Create renderer
    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();

    // Style settings
    const noteColor = currentTheme.noteColor;
    const staffColor = 'rgba(255,255,255,0.6)';

    const positions = [];

    // Render each system (row)
    for (let system = 0; system < systems; system++) {
      const yPos = startY + (system * staveHeight);
      
      // Render each measure in the system
      for (let measureInSystem = 0; measureInSystem < measuresPerSystem; measureInSystem++) {
        const measureNum = (system * measuresPerSystem) + measureInSystem + 1;
        const isFirstInSystem = measureInSystem === 0;
        
        // Calculate x position
        const xPos = startX + (isFirstInSystem ? 0 : clefWidth) + (measureInSystem * staveWidth);
        const currentStaveWidth = isFirstInSystem ? staveWidth + clefWidth : staveWidth;

        // Create stave
        const stave = new VF.Stave(xPos, yPos, currentStaveWidth);
        
        // Add clef only on first measure of each system
        if (isFirstInSystem) {
          stave.addClef('bass');
          if (system === 0) {
            stave.addTimeSignature('4/4');
          }
        }
        
        // Style the stave lines
        stave.setStyle({ strokeStyle: staffColor, fillStyle: staffColor });
        stave.setContext(context).draw();

        // Get notes for this measure
        const measureNotes = notesByMeasure[measureNum];
        if (!measureNotes || measureNotes.length === 0) continue;

        // Create VexFlow StaveNotes
        const vfNotes = measureNotes.map((noteData) => {
          const staveNote = new VF.StaveNote({
            keys: noteData.keys,
            duration: noteData.duration,
            clef: 'bass',
          });
          
          // Add accidentals if needed
          const key = noteData.keys[0];
          if (key.includes('#')) {
            staveNote.addModifier(new VF.Accidental('#'), 0);
          } else if (key.includes('b') && !key.startsWith('b/')) {
            staveNote.addModifier(new VF.Accidental('b'), 0);
          }

          // Set note color
          staveNote.setStyle({ 
            fillStyle: noteColor, 
            strokeStyle: noteColor 
          });
          
          return staveNote;
        });

        // Create beams for groups of 4 sixteenth notes
        const beams = [];
        for (let i = 0; i < vfNotes.length; i += 4) {
          const beamGroup = vfNotes.slice(i, Math.min(i + 4, vfNotes.length));
          if (beamGroup.length > 1) {
            try {
              const beam = new VF.Beam(beamGroup);
              beam.setStyle({ strokeStyle: noteColor, fillStyle: noteColor });
              beams.push(beam);
            } catch (e) {
              // Beaming might fail for some note combinations
            }
          }
        }

        // Create voice
        const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
        voice.setStrict(false);
        voice.addTickables(vfNotes);

        // Format and draw
        new VF.Formatter().joinVoices([voice]).format([voice], currentStaveWidth - 50);
        voice.draw(context, stave);

        // Draw beams
        beams.forEach(beam => {
          beam.setContext(context).draw();
        });

        // Store note positions for click detection
        vfNotes.forEach((vfNote, idx) => {
          const noteData = measureNotes[idx];
          try {
            const bb = vfNote.getBoundingBox();
            if (bb) {
              positions.push({
                id: noteData.id,
                x: bb.x,
                y: bb.y,
                w: bb.w,
                h: bb.h,
                noteData: noteData,
                measure: measureNum,
                system: system,
              });
            }
          } catch (e) {
            // getBoundingBox can fail sometimes
          }
        });
      }
    }

    setNotePositions(positions);
    console.log(`✅ Rendered ${positions.length} notes`);

  }, [currentTheme]);

  // Handle click on canvas to detect note clicks
  const handleCanvasClick = useCallback((e) => {
    if (!containerRef.current) return;
    
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find which note was clicked (with some padding for easier clicking)
    const padding = 10;
    const clickedNote = notePositions.find(pos => 
      x >= pos.x - padding && x <= pos.x + pos.w + padding &&
      y >= pos.y - padding && y <= pos.y + pos.h + padding
    );

    if (clickedNote && onNoteClick) {
      onNoteClick(clickedNote.noteData);
    }
  }, [notePositions, onNoteClick]);

  return (
    <div className="vexflow-score-wrapper" style={{ position: 'relative' }}>
      {/* Loading state */}
      {!isLoaded && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 500,
          color: 'white',
          fontSize: '18px'
        }}>
          🎼 Loading notation...
        </div>
      )}
      
      {/* VexFlow container */}
      <div 
        ref={containerRef} 
        className="vexflow-container"
        onClick={handleCanvasClick}
        style={{ 
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10, // Notes always visible on top of artwork
        }}
      />
      
      {/* Playhead - positioned directly via ref, not React state */}
      <div
        ref={playheadRef}
        className="playhead"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 3,
          height: 80,
          backgroundColor: currentTheme.activeNoteColor || '#fef08a',
          boxShadow: `0 0 12px ${currentTheme.activeNoteColor || '#fef08a'}, 0 0 24px ${currentTheme.activeNoteColor || '#fef08a'}`,
          borderRadius: 2,
          pointerEvents: 'none',
          zIndex: 20,
          opacity: 0,  // Hidden until playback starts
        }}
      />
      
      {/* Bloom decorations overlay */}
      {notePositions.map(pos => {
        if (!bloomedNotes.has(pos.id)) return null;
        const bloom = getRandomBloom(theme);
        return (
          <div
            key={`bloom-${pos.id}`}
            className={`bloom-decoration bloom-${currentTheme.animation}`}
            style={{
              position: 'absolute',
              left: pos.x + pos.w / 2 - 12,
              top: pos.y - 24,
              fontSize: '24px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            {bloom}
          </div>
        );
      })}
    </div>
  );
});

VexFlowScore.displayName = 'VexFlowScore';

export default VexFlowScore;