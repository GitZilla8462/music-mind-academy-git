// File: bachCelloSuiteNotes.js
// Bach Cello Suite No. 1 in G Major, BWV 1007 - Prelude
// First 16 bars of actual notation data for VexFlow

// Tempo and timing constants
export const TEMPO = 66; // BPM - slightly slower for students
export const QUARTER_NOTE_DURATION = 60 / TEMPO; // ~0.909 seconds
export const SIXTEENTH_NOTE_DURATION = QUARTER_NOTE_DURATION / 4; // ~0.227 seconds
export const MEASURE_DURATION = QUARTER_NOTE_DURATION * 4; // ~3.636 seconds

// Piece metadata
export const pieceInfo = {
  title: "Cello Suite No. 1 in G Major",
  subtitle: "Prelude",
  composer: "Johann Sebastian Bach",
  bwv: "BWV 1007",
  year: "c. 1720",
  key: "G Major",
  timeSignature: "4/4",
  clef: "bass",
  totalMeasures: 16,
  totalNotes: 256, // 16 notes per measure × 16 measures
};

// Helper to calculate note start time
function noteTime(measure, noteIndex) {
  return (measure - 1) * MEASURE_DURATION + noteIndex * SIXTEENTH_NOTE_DURATION;
}

// Generate all notes for 16 measures
// Each measure has 16 sixteenth notes
// Format: { id, keys (VexFlow format), duration, measure, beat, timeStart }

const generateMeasureNotes = (measureNum, pattern) => {
  return pattern.map((pitch, idx) => ({
    id: (measureNum - 1) * 16 + idx,
    keys: [pitch],
    duration: '16',
    measure: measureNum,
    beat: Math.floor(idx / 4) + 1,
    subdivision: (idx % 4) + 1,
    timeStart: noteTime(measureNum, idx),
    timeEnd: noteTime(measureNum, idx) + SIXTEENTH_NOTE_DURATION,
  }));
};

// Actual Bach Cello Suite No. 1 Prelude notes (first 16 measures)
// Pattern: Bass note, then arpeggio pattern repeated

// Measure 1: G major arpeggio (G-D-B-A pattern)
const m1 = ['g/2', 'd/3', 'b/3', 'a/3', 'b/3', 'd/3', 'b/3', 'd/3',
            'g/2', 'd/3', 'b/3', 'a/3', 'b/3', 'd/3', 'b/3', 'd/3'];

// Measure 2: G major continued (G-E-C-B pattern) 
const m2 = ['g/2', 'e/3', 'c/4', 'b/3', 'c/4', 'e/3', 'c/4', 'e/3',
            'g/2', 'e/3', 'c/4', 'b/3', 'c/4', 'e/3', 'c/4', 'e/3'];

// Measure 3: D7 (F#-C-B pattern)
const m3 = ['g/2', 'f#/3', 'c/4', 'b/3', 'c/4', 'f#/3', 'c/4', 'f#/3',
            'g/2', 'f#/3', 'c/4', 'b/3', 'c/4', 'f#/3', 'c/4', 'f#/3'];

// Measure 4: G major (G-G-B-A pattern)
const m4 = ['g/2', 'g/3', 'b/3', 'a/3', 'b/3', 'g/3', 'b/3', 'g/3',
            'g/2', 'g/3', 'b/3', 'a/3', 'b/3', 'g/3', 'b/3', 'g/3'];

// Measure 5: C major / Am7 (E-A-G-F# pattern moving to C#)
const m5 = ['e/2', 'a/2', 'g/3', 'f#/3', 'g/3', 'a/2', 'g/3', 'a/2',
            'e/2', 'a/2', 'g/3', 'f#/3', 'g/3', 'a/2', 'g/3', 'a/2'];

// Measure 6: D major (D-A-D-C# trill pattern)
const m6 = ['d/2', 'a/2', 'd/3', 'c#/3', 'd/3', 'a/2', 'd/3', 'a/2',
            'd/2', 'a/2', 'd/3', 'c#/3', 'd/3', 'a/2', 'd/3', 'a/2'];

// Measure 7: G major (D-B-G-F# pattern)  
const m7 = ['d/2', 'b/2', 'g/3', 'f#/3', 'g/3', 'b/2', 'g/3', 'b/2',
            'd/2', 'b/2', 'g/3', 'f#/3', 'g/3', 'b/2', 'g/3', 'b/2'];

// Measure 8: D major resolution (D-D-F#-E pattern)
const m8 = ['d/2', 'd/3', 'f#/3', 'e/3', 'f#/3', 'd/3', 'f#/3', 'd/3',
            'd/2', 'd/3', 'f#/3', 'e/3', 'f#/3', 'd/3', 'f#/3', 'd/3'];

// Measure 9: D dominant (D-C#-A-G pattern)
const m9 = ['d/2', 'c#/3', 'a/3', 'g/3', 'a/3', 'c#/3', 'a/3', 'c#/3',
            'd/2', 'c#/3', 'a/3', 'g/3', 'a/3', 'c#/3', 'a/3', 'c#/3'];

// Measure 10: D7 (D-D-A-F# pattern)
const m10 = ['d/2', 'd/3', 'a/3', 'f#/3', 'a/3', 'd/3', 'a/3', 'd/3',
             'd/2', 'd/3', 'a/3', 'f#/3', 'a/3', 'd/3', 'a/3', 'd/3'];

// Measure 11: Diminished (E-G#-D-C pattern)
const m11 = ['e/2', 'g#/2', 'd/3', 'c/3', 'd/3', 'g#/2', 'd/3', 'g#/2',
             'e/2', 'g#/2', 'd/3', 'c/3', 'd/3', 'g#/2', 'd/3', 'g#/2'];

// Measure 12: A minor (A-E-C-B pattern)
const m12 = ['a/2', 'e/3', 'c/4', 'b/3', 'c/4', 'e/3', 'c/4', 'e/3',
             'a/2', 'e/3', 'c/4', 'b/3', 'c/4', 'e/3', 'c/4', 'e/3'];

// Measure 13: Diminished (D#-F#-C-B pattern)  
const m13 = ['d#/2', 'f#/2', 'c/3', 'b/2', 'c/3', 'f#/2', 'c/3', 'f#/2',
             'd#/2', 'f#/2', 'c/3', 'b/2', 'c/3', 'f#/2', 'c/3', 'f#/2'];

// Measure 14: E minor (E-G-B-A pattern)
const m14 = ['e/2', 'g/2', 'b/2', 'a/2', 'b/2', 'g/2', 'b/2', 'g/2',
             'e/2', 'g/2', 'b/2', 'a/2', 'b/2', 'g/2', 'b/2', 'g/2'];

// Measure 15: E minor continued (E-G-C#-B pattern)
const m15 = ['e/2', 'g/2', 'c#/3', 'b/2', 'c#/3', 'g/2', 'c#/3', 'g/2',
             'e/2', 'g/2', 'c#/3', 'b/2', 'c#/3', 'g/2', 'c#/3', 'g/2'];

// Measure 16: Return to G (G-G-B-A pattern leading back)
const m16 = ['g/2', 'g/3', 'b/3', 'a/3', 'b/3', 'g/3', 'b/3', 'g/3',
             'g/2', 'g/3', 'b/3', 'a/3', 'b/3', 'g/3', 'f#/3', 'g/3'];

// Combine all measures
export const allNotes = [
  ...generateMeasureNotes(1, m1),
  ...generateMeasureNotes(2, m2),
  ...generateMeasureNotes(3, m3),
  ...generateMeasureNotes(4, m4),
  ...generateMeasureNotes(5, m5),
  ...generateMeasureNotes(6, m6),
  ...generateMeasureNotes(7, m7),
  ...generateMeasureNotes(8, m8),
  ...generateMeasureNotes(9, m9),
  ...generateMeasureNotes(10, m10),
  ...generateMeasureNotes(11, m11),
  ...generateMeasureNotes(12, m12),
  ...generateMeasureNotes(13, m13),
  ...generateMeasureNotes(14, m14),
  ...generateMeasureNotes(15, m15),
  ...generateMeasureNotes(16, m16),
];

// Group notes by measure for rendering
export const notesByMeasure = {
  1: generateMeasureNotes(1, m1),
  2: generateMeasureNotes(2, m2),
  3: generateMeasureNotes(3, m3),
  4: generateMeasureNotes(4, m4),
  5: generateMeasureNotes(5, m5),
  6: generateMeasureNotes(6, m6),
  7: generateMeasureNotes(7, m7),
  8: generateMeasureNotes(8, m8),
  9: generateMeasureNotes(9, m9),
  10: generateMeasureNotes(10, m10),
  11: generateMeasureNotes(11, m11),
  12: generateMeasureNotes(12, m12),
  13: generateMeasureNotes(13, m13),
  14: generateMeasureNotes(14, m14),
  15: generateMeasureNotes(15, m15),
  16: generateMeasureNotes(16, m16),
};

// Layout configuration for rendering
export const layoutConfig = {
  measuresPerSystem: 4,  // 4 measures per row
  systems: 4,            // 4 rows total
  staveWidth: 340,       // Width per measure (wider to fit 16 sixteenth notes)
  staveHeight: 120,      // Height per system (row)
  startX: 10,            // Left margin
  startY: 40,            // Top margin
  clefWidth: 70,         // Space for clef on first measure of each system
};

// Get total duration in seconds
export const totalDuration = 16 * MEASURE_DURATION; // ~58 seconds for 16 bars

// Find note at a given time
export function getNoteAtTime(time) {
  return allNotes.find(note => time >= note.timeStart && time < note.timeEnd);
}

// Find all notes in a time range
export function getNotesInRange(startTime, endTime) {
  return allNotes.filter(note => 
    note.timeStart >= startTime && note.timeStart < endTime
  );
}

// Get notes for a specific measure
export function getNotesForMeasure(measureNum) {
  return notesByMeasure[measureNum] || [];
}

export default {
  pieceInfo,
  allNotes,
  notesByMeasure,
  layoutConfig,
  totalDuration,
  getNoteAtTime,
  getNotesInRange,
  getNotesForMeasure,
  TEMPO,
  QUARTER_NOTE_DURATION,
  SIXTEENTH_NOTE_DURATION,
  MEASURE_DURATION,
};