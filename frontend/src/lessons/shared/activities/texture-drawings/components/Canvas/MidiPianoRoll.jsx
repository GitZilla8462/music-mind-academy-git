/**
 * MidiPianoRoll.jsx - MIDI Visualization Component
 * 
 * Renders piano roll style note blocks as a background layer.
 * Receives MIDI data from parent (via MidiEngine).
 */

import React from 'react';

const MidiPianoRoll = ({ 
  midiEngine,       // MidiEngine instance with loaded data
  instruments,      // Array of instrument configs
  width,            // Canvas width
  height,           // Canvas height  
  duration,         // Total duration in seconds
  visibleTracks = {}, // Object mapping instrument IDs to visibility boolean
  midiDisplayOffset = 0 // Offset to shift MIDI notes (negative = shift left/earlier)
}) => {
  // Debug: log first note position once
  const hasLoggedRef = React.useRef(false);
  
  if (!midiEngine || !midiEngine.isLoaded) return null;
  
  if (!hasLoggedRef.current && width > 0) {
    hasLoggedRef.current = true;
    const trackInfo = midiEngine.getTrackInfo(instruments[0]?.id);
    if (trackInfo && trackInfo.notes.length > 0) {
      const firstNote = trackInfo.notes[0];
      const adjustedTime = firstNote.time + midiDisplayOffset;
      const firstNoteX = Math.max(0, (adjustedTime / duration) * width);
      console.log('🎵 MIDI First Note Position (with offset):');
      console.log(`   Original note time: ${firstNote.time.toFixed(2)}s`);
      console.log(`   midiDisplayOffset: ${midiDisplayOffset}s`);
      console.log(`   Adjusted time: ${adjustedTime.toFixed(2)}s`);
      console.log(`   First note X: ${firstNoteX.toFixed(1)}px`);
      
      // Log first 5 notes
      console.log('🎵 First 5 notes:');
      trackInfo.notes.slice(0, 5).forEach((n, i) => {
        const adj = n.time + midiDisplayOffset;
        console.log(`   Note ${i}: time=${n.time.toFixed(2)}s → adjusted=${adj.toFixed(2)}s, duration=${n.duration.toFixed(2)}s`);
      });
    }
  }
  
  // Check if any tracks are visible
  const hasVisibleTracks = Object.values(visibleTracks).some(v => v);
  if (!hasVisibleTracks) return null;

  // Calculate lane height
  const laneHeight = height / instruments.length;

  // Render notes for each instrument lane
  const renderLane = (inst, laneIndex) => {
    if (!visibleTracks[inst.id]) return null;
    
    const trackInfo = midiEngine.getTrackInfo(inst.id);
    if (!trackInfo || !trackInfo.notes.length) return null;
    
    const { notes, minPitch, maxPitch } = trackInfo;
    const laneTop = laneIndex * laneHeight;
    const pitchRange = maxPitch - minPitch || 1;
    
    // Padding within lane
    const verticalPadding = laneHeight * 0.1;
    const usableHeight = laneHeight - (verticalPadding * 2);
    
    return notes.map((note, i) => {
      // Calculate horizontal position (time -> x) with offset applied
      const adjustedTime = note.time + midiDisplayOffset;
      
      // Skip notes that end before time 0
      const adjustedEndTime = adjustedTime + note.duration;
      if (adjustedEndTime < 0) return null;
      
      // Clamp x to 0 if note starts before 0 but extends into visible area
      const x = Math.max(0, (adjustedTime / duration) * width);
      
      // Adjust width if note started before 0
      let noteWidth;
      if (adjustedTime < 0) {
        // Note started before 0, so reduce width by the hidden portion
        const visibleDuration = adjustedEndTime;
        noteWidth = Math.max((visibleDuration / duration) * width, 2);
      } else {
        noteWidth = Math.max((note.duration / duration) * width, 2);
      }
      
      // Calculate vertical position (pitch -> y within lane)
      const pitchRatio = (note.pitch - minPitch) / pitchRange;
      const y = laneTop + verticalPadding + (1 - pitchRatio) * usableHeight;
      
      // Note height
      const noteHeight = Math.max(usableHeight / Math.min(pitchRange, 24), 3);
      
      return (
        <rect
          key={`${inst.id}-${i}`}
          x={x}
          y={y - noteHeight / 2}
          width={noteWidth}
          height={noteHeight}
          rx={2}
          fill="#6b7280"
          opacity={0.35}
        />
      );
    });
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 1 }}
    >
      {instruments.map((inst, i) => (
        <g key={inst.id}>
          {renderLane(inst, i)}
        </g>
      ))}
    </svg>
  );
};

export default MidiPianoRoll;