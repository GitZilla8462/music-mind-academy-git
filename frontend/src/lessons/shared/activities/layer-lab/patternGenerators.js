// File: /src/lessons/shared/activities/layer-lab/patternGenerators.js
// Smart pattern generation that follows musical rules

import { CHORD_PROGRESSIONS, SCALES, GRID_COLS } from './trackConfig';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get scale notes for a given scale and octave
export const getScaleNotes = (scaleName, octave) => {
  const scale = SCALES[scaleName] || SCALES.pentatonic;
  return scale.notes.map(note => note + octave);
};

// Get chord notes from a chord definition
export const getChordNotes = (chord, octave = 4) => {
  const rootNote = SCALES.major.notes[chord.root % 7];
  
  if (chord.type === 'major') {
    return [
      rootNote + octave,
      SCALES.major.notes[(chord.root + 2) % 7] + octave,
      SCALES.major.notes[(chord.root + 4) % 7] + octave
    ];
  } else {
    // Minor chord - flatten the third
    return [
      rootNote + octave,
      SCALES.minor.notes[(chord.root + 2) % 7] + octave,
      SCALES.major.notes[(chord.root + 4) % 7] + octave
    ];
  }
};

// Map note to row index (inverted so high notes at top)
const noteToRow = (noteIndex, totalRows) => {
  return (totalRows - 1) - (noteIndex % totalRows);
};

// ============================================================================
// MELODY PATTERN GENERATOR
// ============================================================================

export const generateMelodyPattern = (rows, cols, options = {}) => {
  const { 
    progression = 'pop',
    density = 0.6,  // 0-1, how many notes
    jumpiness = 0.2 // 0-1, how much it jumps around
  } = options;
  
  const pattern = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const chords = CHORD_PROGRESSIONS[progression]?.chords || CHORD_PROGRESSIONS.pop.chords;
  
  let currentNote = Math.floor(rows / 2);
  
  for (let col = 0; col < cols; col++) {
    const measureIndex = Math.floor(col / 4) % chords.length;
    const chord = chords[measureIndex];
    
    // Bias towards chord tones
    const chordRoot = chord.root % rows;
    const chordTones = [chordRoot, (chordRoot + 2) % rows, (chordRoot + 4) % rows];
    
    if (Math.random() < density) {
      // On strong beats, prefer chord tones
      if (col % 4 === 0 || col % 4 === 2) {
        if (Math.random() < 0.7) {
          currentNote = chordTones[Math.floor(Math.random() * chordTones.length)];
        }
      }
      
      pattern[noteToRow(currentNote, rows)][col] = true;
      
      // Move to next note
      if (Math.random() < jumpiness) {
        // Big jump
        currentNote = Math.floor(Math.random() * rows);
      } else {
        // Step motion
        const step = Math.random() < 0.5 ? -1 : 1;
        currentNote = Math.max(0, Math.min(rows - 1, currentNote + step));
      }
    }
  }
  
  return pattern;
};

// ============================================================================
// HARMONY PATTERN GENERATOR
// ============================================================================

export const generateHarmonyPattern = (rows, cols, options = {}) => {
  const { 
    progression = 'pop',
    style = 'sustained', // 'sustained', 'rhythmic', 'arpeggiated'
    voicing = 'close' // 'close', 'spread'
  } = options;
  
  const pattern = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const chords = CHORD_PROGRESSIONS[progression]?.chords || CHORD_PROGRESSIONS.pop.chords;
  
  for (let measure = 0; measure < 4; measure++) {
    const chord = chords[measure % chords.length];
    const startCol = measure * 4;
    
    // Get chord tones
    const root = chord.root % rows;
    const third = (chord.root + 2) % rows;
    const fifth = (chord.root + 4) % rows;
    
    const chordTones = voicing === 'close' 
      ? [root, third, fifth]
      : [root, fifth]; // Spread voicing uses fewer notes
    
    switch (style) {
      case 'sustained':
        // Hold notes for most of the measure
        chordTones.forEach(tone => {
          for (let i = 0; i < 3; i++) {
            if (startCol + i < cols) {
              pattern[noteToRow(tone, rows)][startCol + i] = true;
            }
          }
        });
        break;
        
      case 'rhythmic':
        // Play on beats 1 and 3
        chordTones.forEach(tone => {
          pattern[noteToRow(tone, rows)][startCol] = true;
          if (startCol + 2 < cols) {
            pattern[noteToRow(tone, rows)][startCol + 2] = true;
          }
        });
        break;
        
      case 'arpeggiated':
        // Roll through chord tones
        chordTones.forEach((tone, i) => {
          const col = startCol + i;
          if (col < cols) {
            pattern[noteToRow(tone, rows)][col] = true;
          }
        });
        // Repeat pattern
        chordTones.forEach((tone, i) => {
          const col = startCol + 3 - i;
          if (col < cols && col >= startCol) {
            pattern[noteToRow(tone, rows)][col] = true;
          }
        });
        break;
    }
  }
  
  return pattern;
};

// ============================================================================
// RHYTHM PATTERN GENERATOR
// ============================================================================

export const generateRhythmPattern = (rows, cols, options = {}) => {
  const { 
    style = 'basic', // 'basic', 'driving', 'sparse', 'complex', 'halftime'
    swing = false
  } = options;
  
  const pattern = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  // Row indices: 0=Hi-Hat, 1=Snare, 2=Kick, 3=Tom
  const HIHAT = 0, SNARE = 1, KICK = 2, TOM = 3;
  
  switch (style) {
    case 'basic':
      for (let col = 0; col < cols; col++) {
        // Hi-hat on every beat
        if (col % 2 === 0) pattern[HIHAT][col] = true;
        // Snare on 2 and 4
        if (col % 4 === 2) pattern[SNARE][col] = true;
        // Kick on 1 and 3
        if (col % 4 === 0) pattern[KICK][col] = true;
      }
      break;
      
    case 'driving':
      for (let col = 0; col < cols; col++) {
        // Hi-hat on every 8th
        pattern[HIHAT][col] = true;
        // Snare on 2 and 4
        if (col % 4 === 2) pattern[SNARE][col] = true;
        // Kick pattern with syncopation
        if (col % 4 === 0 || col % 8 === 3) pattern[KICK][col] = true;
      }
      break;
      
    case 'sparse':
      for (let col = 0; col < cols; col++) {
        // Minimal hi-hat
        if (col % 4 === 0) pattern[HIHAT][col] = true;
        // Snare only on 4
        if (col === 6 || col === 14) pattern[SNARE][col] = true;
        // Kick on 1
        if (col % 8 === 0) pattern[KICK][col] = true;
      }
      break;
      
    case 'complex':
      for (let col = 0; col < cols; col++) {
        // Busy hi-hat
        if (col % 2 === 0 || Math.random() < 0.3) pattern[HIHAT][col] = true;
        // Snare with ghost notes
        if (col % 4 === 2) pattern[SNARE][col] = true;
        if ((col % 4 === 1 || col % 4 === 3) && Math.random() < 0.3) pattern[SNARE][col] = true;
        // Syncopated kick
        if (col % 4 === 0 || (col % 2 === 1 && Math.random() < 0.4)) pattern[KICK][col] = true;
        // Tom fills
        if ((col === 7 || col === 15) && Math.random() < 0.6) {
          pattern[TOM][col] = true;
          if (col > 0) pattern[TOM][col - 1] = Math.random() < 0.5;
        }
      }
      break;
      
    case 'halftime':
      for (let col = 0; col < cols; col++) {
        // Half-time feel
        if (col % 2 === 0) pattern[HIHAT][col] = true;
        // Snare on 3 only
        if (col % 8 === 4) pattern[SNARE][col] = true;
        // Kick on 1
        if (col % 8 === 0) pattern[KICK][col] = true;
      }
      break;
  }
  
  // Add swing feel
  if (swing) {
    // Shift some off-beat notes slightly (simulated by adding notes)
    for (let col = 1; col < cols; col += 2) {
      if (pattern[HIHAT][col - 1] && !pattern[HIHAT][col]) {
        pattern[HIHAT][col] = Math.random() < 0.5;
      }
    }
  }
  
  return pattern;
};

// ============================================================================
// BASS PATTERN GENERATOR
// ============================================================================

export const generateBassPattern = (rows, cols, options = {}) => {
  const { 
    progression = 'pop',
    style = 'root', // 'root', 'walking', 'octave', 'rhythmic'
  } = options;
  
  const pattern = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const chords = CHORD_PROGRESSIONS[progression]?.chords || CHORD_PROGRESSIONS.pop.chords;
  
  for (let measure = 0; measure < 4; measure++) {
    const chord = chords[measure % chords.length];
    const startCol = measure * 4;
    const root = chord.root % rows;
    const fifth = (chord.root + 4) % rows;
    
    switch (style) {
      case 'root':
        // Just play root on beat 1 and 3
        pattern[noteToRow(root, rows)][startCol] = true;
        if (startCol + 2 < cols) {
          pattern[noteToRow(root, rows)][startCol + 2] = true;
        }
        break;
        
      case 'walking':
        // Walking bass line
        pattern[noteToRow(root, rows)][startCol] = true;
        if (startCol + 1 < cols) {
          pattern[noteToRow((root + 2) % rows, rows)][startCol + 1] = true;
        }
        if (startCol + 2 < cols) {
          pattern[noteToRow(fifth, rows)][startCol + 2] = true;
        }
        if (startCol + 3 < cols) {
          // Approach note to next chord
          const nextChord = chords[(measure + 1) % chords.length];
          const approachNote = (nextChord.root - 1 + rows) % rows;
          pattern[noteToRow(approachNote, rows)][startCol + 3] = true;
        }
        break;
        
      case 'octave':
        // Octave pattern
        pattern[noteToRow(root, rows)][startCol] = true;
        if (startCol + 2 < cols) {
          pattern[noteToRow((root + rows - 1) % rows, rows)][startCol + 2] = true;
        }
        break;
        
      case 'rhythmic':
        // Syncopated bass
        pattern[noteToRow(root, rows)][startCol] = true;
        if (startCol + 1 < cols && Math.random() < 0.5) {
          pattern[noteToRow(root, rows)][startCol + 1] = true;
        }
        if (startCol + 2 < cols) {
          pattern[noteToRow(root, rows)][startCol + 2] = true;
        }
        if (startCol + 3 < cols && Math.random() < 0.7) {
          pattern[noteToRow(fifth, rows)][startCol + 3] = true;
        }
        break;
    }
  }
  
  return pattern;
};

// ============================================================================
// PERCUSSION PATTERN GENERATOR
// ============================================================================

export const generatePercussionPattern = (rows, cols, options = {}) => {
  const { style = 'basic' } = options;
  
  const pattern = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  // Row indices: 0=Shaker, 1=Clap, 2=Cowbell, 3=Conga
  const SHAKER = 0, CLAP = 1, COWBELL = 2, CONGA = 3;
  
  switch (style) {
    case 'basic':
      for (let col = 0; col < cols; col++) {
        // Shaker on off-beats
        if (col % 2 === 1) pattern[SHAKER][col] = true;
        // Clap with snare
        if (col % 4 === 2) pattern[CLAP][col] = true;
      }
      break;
      
    case 'latin':
      for (let col = 0; col < cols; col++) {
        // Clave-like pattern
        if ([0, 3, 6, 10, 12].includes(col % 16)) pattern[COWBELL][col] = true;
        // Conga pattern
        if (col % 4 === 0 || col % 4 === 3) pattern[CONGA][col] = true;
        // Shaker
        pattern[SHAKER][col] = Math.random() < 0.7;
      }
      break;
      
    case 'fills':
      // Mostly empty with occasional fills
      for (let col = 0; col < cols; col++) {
        if (col >= 14) {
          // Fill at end
          pattern[CONGA][col] = true;
          if (col === 15) pattern[CLAP][col] = true;
        }
      }
      break;
  }
  
  return pattern;
};

// ============================================================================
// GENERATE ALL PATTERNS WITH PRESET
// ============================================================================

export const generateAllPatternsForStyle = (preset, trackStates) => {
  const patterns = {};
  
  Object.keys(trackStates).forEach(trackId => {
    const track = trackStates[trackId];
    if (!track.enabled) return;
    
    const rows = track.rows;
    
    switch (trackId) {
      case 'melody':
      case 'melody2':
        patterns[trackId] = generateMelodyPattern(rows, GRID_COLS, {
          progression: preset.progression,
          density: preset.name === 'Chill' ? 0.4 : 0.6,
          jumpiness: preset.name === 'Hype' ? 0.4 : 0.2
        });
        break;
        
      case 'harmony':
      case 'harmony2':
        patterns[trackId] = generateHarmonyPattern(rows, GRID_COLS, {
          progression: preset.progression,
          style: preset.name === 'Chill' ? 'sustained' : 
                 preset.name === 'Hype' ? 'rhythmic' : 'sustained'
        });
        break;
        
      case 'rhythm':
        patterns[trackId] = generateRhythmPattern(rows, GRID_COLS, {
          style: preset.name === 'Chill' ? 'sparse' :
                 preset.name === 'Hype' ? 'driving' :
                 preset.name === 'Jazz' ? 'complex' : 'basic'
        });
        break;
        
      case 'percussion':
        patterns[trackId] = generatePercussionPattern(rows, GRID_COLS, {
          style: preset.name === 'Tropical' ? 'latin' : 'basic'
        });
        break;
        
      case 'bass':
      case 'bass2':
        patterns[trackId] = generateBassPattern(rows, GRID_COLS, {
          progression: preset.progression,
          style: preset.name === 'Jazz' ? 'walking' :
                 preset.name === 'Hype' ? 'rhythmic' : 'root'
        });
        break;
    }
  });
  
  return patterns;
};