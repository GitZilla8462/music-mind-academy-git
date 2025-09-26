import SolfegeIDTemplate from "../SolfegeIDTemplate.jsx";

const generatePatternLevel2 = () => {
/**
 * PATTERN RULES FOR LEVEL 2 SOLFEGE IDENTIFICATION:
 * 
 * 1. Each pattern must have exactly 32 quarter note beats total (8 measures of 4/4 time)
 * 2. Must include Do-Mi-Sol (C4-E4-G4) as three consecutive QUARTER NOTES with no rests between them
 * 3. All other melodic motion must be stepwise (no skips except for the required Do-Mi-Sol sequence)
 * 4. Exactly 2 quarter rests total: 1 in first four measures (beats 1-16) and 1 in last four measures (beats 17-32)
 * 5. At least 6-8 half notes in each melody that must occur on beat 1 or beat 3 of any measure
 * 6. Half notes can be used anywhere except in the Do-Mi-Sol sequence (which must be quarter notes)
 * 7. Every pattern must start and end on Do (C4)
 * 8. The last note (beat 32) must be Do
 * 9. The second to last note (beat 31) must be Re
 * 10. The third to last note (beat 30) must be Do or Mi
 * 11. Stepwise motion must be maintained even across rests (note-rest-note must still be stepwise)
 * 12. Must include La (A4) at least once in each pattern
 * 13. Half notes can only occur on beat 1 and 3.
 */


const patterns = [
  // Pattern 1 - Do-Mi-Sol at beats 5-7, Rest at beat 4, Rest at beat 20 (32 beats total, 7 half notes)
  [
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 1-2
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 3
  { type: 'rest', duration: 'q' },                      // Beat 4
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 5 - Do-Mi-Sol sequence starts
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 6
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 7 - Do-Mi-Sol sequence ends
  { pitch: 'A4', syllable: 'La', duration: 'q' },      // Beat 8 - Added La
  { pitch: 'G4', syllable: 'Sol', duration: 'h' },     // Beat 9-10
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 11
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 12
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 13-14
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 15
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 16
  { pitch: 'G4', syllable: 'Sol', duration: 'h' },     // Beat 17-18
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 19
  { type: 'rest', duration: 'q' },                      // Beat 20
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 21-22
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 23
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 24
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 25-26
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 27
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 28
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 29-30 (3rd to last is Do)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
],
// Pattern 2 - Do-Mi-Sol at beats 9-11, Rest at beat 12, Rest at beat 25 (32 beats total, 8 half notes)
[
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 1-2
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 3-4
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 5
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 6
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 7
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 8
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 9 - Do-Mi-Sol sequence starts
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 10
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 11 - Do-Mi-Sol sequence ends
  { type: 'rest', duration: 'q' },                     // Beat 12
  { pitch: 'A4', syllable: 'La', duration: 'h' },      // Beat 13-14 - Added La
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 15
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 16
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 17-18
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 19
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 20
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 21-22
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 23
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 24
  { type: 'rest', duration: 'q' },                     // Beat 25
  { pitch: 'G4', syllable: 'Sol', duration: 'h' },     // Beat 26-27 - Changed to half note
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 28
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 29-30 - Changed to half note (3rd to last is Mi)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
],
// Pattern 3 - Do-Mi-Sol at beats 16-18, Rest at beat 8, Rest at beat 28 (32 beats total, 7 half notes)
[
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 1
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 2
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 3-4
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 5
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 6
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 7 - Changed from half note to quarter
  { type: 'rest', duration: 'q' },                     // Beat 8
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 9 - stepwise up from Fa (across rest)
  { pitch: 'A4', syllable: 'La', duration: 'q' },      // Beat 10 - Added La
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 11
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 12
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 13-14
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 15
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 16 - Do-Mi-Sol sequence starts
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 17
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 18 - Do-Mi-Sol sequence ends
  { pitch: 'F4', syllable: 'Fa', duration: 'h' },      // Beat 19-20
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 21
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 22
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 23-24
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 25-26
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 27
  { type: 'rest', duration: 'q' },                     // Beat 28
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 29-30 - Changed to half note (3rd to last is Re/Do)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
],

// Pattern 4 - Do-Mi-Sol at beats 6-8, Rest at beat 15, Rest at beat 19 (32 beats total, 7 half notes)
[
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 1-2
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 3
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 4
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 5 - stepwise down from Mi
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 6 - Do-Mi-Sol sequence starts (stepwise down from Re)
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 7
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 8 - Do-Mi-Sol sequence ends
  { pitch: 'A4', syllable: 'La', duration: 'h' },      // Beat 9-10 - Added La
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 11
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 12
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 13-14
  { type: 'rest', duration: 'q' },                     // Beat 15
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 16 - stepwise down from Mi (across rest)
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 17-18
  { type: 'rest', duration: 'q' },                     // Beat 19
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 20 - stepwise up from Do (across rest)
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 21-22
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 23
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 24
  { pitch: 'F4', syllable: 'Fa', duration: 'h' },      // Beat 25-26
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 27
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 28
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 29-30 (3rd to last is Do)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
],

// Pattern 5 - Do-Mi-Sol at beats 21-23, Rest at beat 11, Rest at beat 29 (32 beats total, 8 half notes)
[
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 1
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 2
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 3-4
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 5
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 6 - changed to quarter note
  { pitch: 'A4', syllable: 'La', duration: 'h' },      // Beat 7-8 - Added La, moved to valid half note position
  { pitch: 'G4', syllable: 'Sol', duration: 'h' },     // Beat 9-10
  { type: 'rest', duration: 'q' },                     // Beat 11
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 12 - stepwise down from Sol (across rest)
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 13-14
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 15
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 16
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 17-18
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 19
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 20
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 21 - Do-Mi-Sol sequence starts
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 22
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 23 - Do-Mi-Sol sequence ends
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 24
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 25-26
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 27
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 28
  { type: 'rest', duration: 'q' },                     // Beat 29 - rest in second half
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 30 (3rd to last is Mi)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
],

 // Pattern 6 - Do-Mi-Sol at beats 14-16, Rest at beat 7, Rest at beat 24 (32 beats total, 7 half notes)
[
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 1-2
  { pitch: 'D4', syllable: 'Re', duration: 'h' },      // Beat 3-4
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 5
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 6
  { type: 'rest', duration: 'q' },                     // Beat 7
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 8 - stepwise up from Fa (across rest)
  { pitch: 'A4', syllable: 'La', duration: 'q' },      // Beat 9 - Added La
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 10
  { pitch: 'F4', syllable: 'Fa', duration: 'q' },      // Beat 11
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 12
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 13
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 14 - Do-Mi-Sol sequence starts (stepwise down from Re)
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 15
  { pitch: 'G4', syllable: 'Sol', duration: 'q' },     // Beat 16 - Do-Mi-Sol sequence ends
  { pitch: 'F4', syllable: 'Fa', duration: 'h' },      // Beat 17-18
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 19
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 20
  { pitch: 'C4', syllable: 'Do', duration: 'h' },      // Beat 21-22
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 23
  { type: 'rest', duration: 'q' },                     // Beat 24
  { pitch: 'E4', syllable: 'Mi', duration: 'h' },      // Beat 25-26 - stepwise up from Re (across rest)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 27
  { pitch: 'C4', syllable: 'Do', duration: 'q' },      // Beat 28
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 29
  { pitch: 'E4', syllable: 'Mi', duration: 'q' },      // Beat 30 (3rd to last is Mi)
  { pitch: 'D4', syllable: 'Re', duration: 'q' },      // Beat 31 (2nd to last is Re)
  { pitch: 'C4', syllable: 'Do', duration: 'q' }       // Beat 32 (last is Do)
]

];

  // Pick a random pattern
  const patternIndex = Math.floor(Math.random() * patterns.length);
  const selectedPattern = patterns[patternIndex];
  console.log('Selected pattern', patternIndex + 1, 'of', patterns.length);
  
  // Verify beat count
  let totalBeats = 0;
  selectedPattern.forEach(note => {
    totalBeats += note.duration === 'h' ? 2 : 1;
  });
  console.log('Pattern has', totalBeats, 'beats (should be 32)');
  
  // Count half notes and verify they're on beats 1 or 3
  let halfNoteCount = 0;
  let currentBeat = 1;
  let invalidHalfNotePlacements = [];
  
  selectedPattern.forEach((note, index) => {
    if (note.duration === 'h') {
      halfNoteCount++;
      // Half notes must start on beat 1 or 3 of any measure (beats 1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31)
      const beatInMeasure = ((currentBeat - 1) % 4) + 1;
      if (beatInMeasure !== 1 && beatInMeasure !== 3) {
        invalidHalfNotePlacements.push(`beat ${currentBeat}`);
      }
    }
    currentBeat += note.duration === 'h' ? 2 : 1;
  });
  
  console.log('Pattern has', halfNoteCount, 'half notes (should be 6-8)');
  if (halfNoteCount < 6 || halfNoteCount > 8) {
    console.error('ERROR: Pattern', patternIndex + 1, 'has', halfNoteCount, 'half notes instead of 6-8');
  }
  
  if (invalidHalfNotePlacements.length > 0) {
    console.error('ERROR: Pattern', patternIndex + 1, 'has half notes on invalid beats:', invalidHalfNotePlacements.join(', '));
  }
  
  // Verify it's stepwise and has Do-Mi-Sol sequence (as quarter notes)
  const notes = selectedPattern.filter(p => p.type !== 'rest');
  const noteOrder = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
  
  // Check for Do-Mi-Sol sequence (must be quarter notes)
  let hasDoMiSolQuarters = false;
  for (let i = 0; i < notes.length - 2; i++) {
    if (notes[i].pitch === 'C4' && notes[i].syllable === 'Do' && notes[i].duration === 'q' &&
        notes[i+1].pitch === 'E4' && notes[i+1].syllable === 'Mi' && notes[i+1].duration === 'q' &&
        notes[i+2].pitch === 'G4' && notes[i+2].syllable === 'Sol' && notes[i+2].duration === 'q') {
      hasDoMiSolQuarters = true;
      break;
    }
  }
  
  if (!hasDoMiSolQuarters) {
    console.error('ERROR: Pattern', patternIndex + 1, 'missing Do-Mi-Sol sequence as quarter notes');
  }
  
  // Check for La (A4) requirement
  const hasLa = notes.some(note => note.syllable === 'La');
  if (!hasLa) {
    console.error('ERROR: Pattern', patternIndex + 1, 'missing required La note');
  }
  
  // Check stepwise motion (excluding Do-Mi-Sol sequence)
  for (let i = 1; i < notes.length; i++) {
    const prevIndex = noteOrder.indexOf(notes[i-1].pitch);
    const currIndex = noteOrder.indexOf(notes[i].pitch);
    const interval = Math.abs(currIndex - prevIndex);
    
    // Allow Do-Mi and Mi-Sol skips only in the required sequence
    const isDoMiSkip = (notes[i-1].syllable === 'Do' && notes[i].syllable === 'Mi');
    const isMiSolSkip = (notes[i-1].syllable === 'Mi' && notes[i].syllable === 'Sol');
    const isAllowedSkip = isDoMiSkip || isMiSolSkip;
    
    if (interval > 1 && !isAllowedSkip) {
      console.error('ERROR: Pattern', patternIndex + 1, 'has invalid skip:', notes[i-1].syllable, 'to', notes[i].syllable);
    }
  }
  
  // Verify rest placement
  const rests = selectedPattern.map((note, index) => ({ note, index })).filter(item => item.note.type === 'rest');
  if (rests.length !== 2) {
    console.error('ERROR: Pattern', patternIndex + 1, 'has', rests.length, 'rests instead of 2');
  }
  
  let restBeat1 = 0, restBeat2 = 0;
  let beatCounter = 1;
  selectedPattern.forEach((note, index) => {
    if (note.type === 'rest') {
      if (restBeat1 === 0) restBeat1 = beatCounter;
      else restBeat2 = beatCounter;
    }
    beatCounter += note.duration === 'h' ? 2 : 1;
  });
  
  if (restBeat1 > 16) {
    console.error('ERROR: Pattern', patternIndex + 1, 'first rest at beat', restBeat1, 'should be in beats 1-16');
  }
  if (restBeat2 <= 16) {
    console.error('ERROR: Pattern', patternIndex + 1, 'second rest at beat', restBeat2, 'should be in beats 17-32');
  }
  
  console.log('Pattern sequence:', notes.map(n => n.syllable).join('-'));
  console.log('Rest positions: beats', restBeat1, 'and', restBeat2);
  console.log('Half note positions:', selectedPattern.map((note, i) => note.duration === 'h' ? `beat ${i+1}` : null).filter(x => x).join(', '));
  console.log('Contains La:', hasLa ? 'Yes' : 'No');
  return selectedPattern;
};

const Lvl2SolfegeID1 = ({ onClose }) => {
  const config = {
    title: 'Level 2 Solfege Identification',
    subtitle: 'Solfege: Do-La • Rhythm: Quarter and Half Notes • Quarter Rests • Key: C Major',
    syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'],
    keySignature: null,
    timeSignature: '4/4',
    noteMap: {
      'C4': 'c/4', 
      'D4': 'd/4', 
      'E4': 'e/4', 
      'F4': 'f/4', 
      'G4': 'g/4', 
      'A4': 'a/4'
    },
    audioFiles: {
      'Do': '/teacher_dashboard/sounds/do.mp3',
      'Re': '/teacher_dashboard/sounds/re.mp3',
      'Mi': '/teacher_dashboard/sounds/mi.mp3',
      'Fa': '/teacher_dashboard/sounds/fa.mp3',
      'Sol': '/teacher_dashboard/sounds/sol.mp3',
      'La': '/teacher_dashboard/sounds/la.mp3'
    },
    generatePattern: generatePatternLevel2,
    getLinePosition: (pitch, stave) => {
      switch(pitch) {
        case 'c/4': return stave.getYForLine(5);
        case 'd/4': return stave.getYForLine(4.5);
        case 'e/4': return stave.getYForLine(4);
        case 'f/4': return stave.getYForLine(3.5);
        case 'g/4': return stave.getYForLine(3);
        case 'a/4': return stave.getYForLine(2.5);
        default: return stave.getYForLine(3);
      }
    },
    bpm: 120,
    hasRests: true
  };

  return <SolfegeIDTemplate config={config} onClose={onClose} />;
};

export default Lvl2SolfegeID1;