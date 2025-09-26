import SolfegeIDTemplate from "../SolfegeIDTemplate.jsx";

const generatePatternLevel4 = (excludePatternIndex = -1) => {
  /**
   * PATTERN RULES FOR LEVEL 3 SOLFEGE IDENTIFICATION (3/4 TIME) - LEVEL 4:
   * 
   * 1. Each pattern must have exactly 24 quarter note beats total (8 measures of 3/4 time)
   * 2. Must include Do-Mi-Sol (C4-E4-G4) as three consecutive QUARTER NOTES with no rests between them
   * 3. All other melodic motion must be stepwise (no skips except for the required Do-Mi-Sol sequence)
   * 4. Exactly 2 quarter rests total: 1 in first four measures (beats 1-12) and 1 in last four measures (beats 13-24)
   * 5. At least 6-8 half notes in each melody that must occur on beat 1 of any measure
   * 6. Half notes can be used anywhere except in the Do-Mi-Sol sequence (which must be quarter notes)
   * 7. Every pattern must start and end on Do (C4)
   * 8. The last note (beat 24) must be Do
   * 9. The second to last note (beat 23) must be Re
   * 10. The third to last note (beat 22) must be Do or Mi
   * 11. Stepwise motion must be maintained even across rests (note-rest-note must still be stepwise)
   * 12. Must include La (A4) at least once in each pattern
   * 13. Half notes can only occur on beat 1 of any measure
   * 14. Pattern Must include eighth note pairs that are a step apart such as do-re, mi-fa, sol-fa, etc.
   * 15. Must include at least four eighth note pairs in the pattern.
   * 16. Eighth note pairs must not span across measure boundaries (no beaming across barlines)
   */
  
  const patterns = [
    // Pattern 1 - Following ALL rules for 3/4 time
    [
      // Measure 1 (beats 1-3): Do(h) + Re(q) = 2 + 1 = 3 beats
      { pitch: 'C4', syllable: 'Do', duration: 'h' },     // Beats 1-2 (starts on Do, 1st half note, valid placement on beat 1)
      { pitch: 'D4', syllable: 'Re', duration: 'q' },     // Beat 3 (stepwise from Do)
      
      // Measure 2 (beats 4-6): Mi(q) + Re(q) + rest(q) = 3 beats
      { pitch: 'E4', syllable: 'Mi', duration: 'q' },     // Beat 4 (stepwise from Re)
      { pitch: 'D4', syllable: 'Re', duration: 'q' },     // Beat 5 (stepwise before rest)
      { type: 'rest', duration: 'q' },                     // Beat 6 (first rest in beats 1-12)
      
      // Measure 3 (beats 7-9): Do(q) + Mi(q) + Sol(q) = 3 beats [Do-Mi-Sol sequence]
      { pitch: 'C4', syllable: 'Do', duration: 'q' },     // Beat 7 (Do-Mi-Sol starts, stepwise after rest: Re-rest-Do)
      { pitch: 'E4', syllable: 'Mi', duration: 'q' },     // Beat 8 (Do-Mi-Sol continues)
      { pitch: 'G4', syllable: 'Sol', duration: 'q' },    // Beat 9 (Do-Mi-Sol ends)
      
      // Measure 4 (beats 10-12): La(h) + Sol(q) = 2 + 1 = 3 beats
      { pitch: 'A4', syllable: 'La', duration: 'h' },     // Beats 10-11 (2nd half note, valid placement on beat 1 of measure, stepwise from Sol, required La)
      { pitch: 'G4', syllable: 'Sol', duration: 'q' },    // Beat 12 (stepwise from La)
      
      // Measure 5 (beats 13-15): Fa(h) + Mi(q) = 2 + 1 = 3 beats
      { pitch: 'F4', syllable: 'Fa', duration: 'h' },     // Beats 13-14 (3rd half note, valid placement on beat 1 of measure, stepwise from Sol)
      { pitch: 'E4', syllable: 'Mi', duration: 'q' },     // Beat 15 (stepwise from Fa)
      
      // Measure 6 (beats 16-18): Re(e)+Do(e) + Re(e)+Mi(e) + Fa(q) = 1 + 1 + 1 = 3 beats
      { pitch: 'D4', syllable: 'Re', duration: 'e' },     // Beat 16.0 (eighth pair 1, stepwise from Mi)
      { pitch: 'C4', syllable: 'Do', duration: 'e' },     // Beat 16.5 (eighth pair 1: Re-Do)
      { pitch: 'D4', syllable: 'Re', duration: 'e' },     // Beat 17.0 (eighth pair 2, stepwise from Do)
      { pitch: 'E4', syllable: 'Mi', duration: 'e' },     // Beat 17.5 (eighth pair 2: Re-Mi)
      { pitch: 'F4', syllable: 'Fa', duration: 'q' },     // Beat 18 (stepwise from Mi)
      
      // Measure 7 (beats 19-21): Sol(h) + rest(q) = 2 + 1 = 3 beats
      { pitch: 'G4', syllable: 'Sol', duration: 'h' },    // Beats 19-20 (4th half note, valid placement on beat 1 of measure, stepwise from Fa)
      { type: 'rest', duration: 'q' },                     // Beat 21 (second rest in beats 13-24)
      
      // Measure 8 (beats 22-24): Do(q) + Re(q) + Do(q) = 3 beats [Final ending sequence]
      { pitch: 'C4', syllable: 'Do', duration: 'q' },     // Beat 22 (third to last - rule 10: must be Do or Mi ✓, stepwise after rest: Sol-rest-Do)
      { pitch: 'D4', syllable: 'Re', duration: 'q' },     // Beat 23 (second to last - rule 9: must be Re ✓, stepwise from Do)
      { pitch: 'C4', syllable: 'Do', duration: 'q' }      // Beat 24 (last - rule 8: must be Do ✓, stepwise from Re)
    ]
  ];

  let patternIndex = 0; // Only one pattern for now
  
  const selectedPattern = patterns[patternIndex];
  
  // Store the selected pattern index for next time
  selectedPattern._patternIndex = patternIndex;
    
  // Verify beat count
  let totalBeats = 0;
  selectedPattern.forEach(note => {
    if (note.duration === 'h') totalBeats += 2;
    else if (note.duration === 'q') totalBeats += 1;
    else if (note.duration === 'e') totalBeats += 0.5;
  });
  console.log('Pattern has', totalBeats, 'beats (should be 24)');
  
  if (totalBeats !== 24) {
    console.error('ERROR: Pattern has', totalBeats, 'beats instead of 24');
  }
  
  // Count half notes and eighth note pairs, verify half note placement
  let halfNoteCount = 0;
  let eighthNotePairCount = 0;
  let currentBeat = 1;
  let invalidHalfNotePlacements = [];
  let invalidEighthPairPlacements = [];
  
  for (let i = 0; i < selectedPattern.length; i++) {
    const note = selectedPattern[i];
    
    if (note.duration === 'h') {
      halfNoteCount++;
      // Half notes must start on beat 1 of any measure (beats 1,4,7,10,13,16,19,22)
      const beatInMeasure = ((currentBeat - 1) % 3) + 1;
      if (beatInMeasure !== 1) {
        invalidHalfNotePlacements.push(`beat ${currentBeat}`);
      }
      currentBeat += 2;
    } else if (note.duration === 'e') {
      // Check if this eighth note is part of a stepwise pair
      if (i < selectedPattern.length - 1 && selectedPattern[i + 1].duration === 'e' && 
          note.type !== 'rest' && selectedPattern[i + 1].type !== 'rest') {
        const noteOrder = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
        const currentIndex = noteOrder.indexOf(note.pitch);
        const nextIndex = noteOrder.indexOf(selectedPattern[i + 1].pitch);
        
        // Check if pair is stepwise
        if (Math.abs(currentIndex - nextIndex) === 1) {
          // Check if pair spans across measure boundary
          const currentMeasure = Math.floor((currentBeat - 1) / 3) + 1;
          const nextBeat = currentBeat + 0.5;
          const nextMeasure = Math.floor((nextBeat - 1) / 3) + 1;
          
          if (currentMeasure !== nextMeasure) {
            invalidEighthPairPlacements.push(`beats ${currentBeat}-${nextBeat} (measures ${currentMeasure}-${nextMeasure})`);
          }
          
          eighthNotePairCount++;
          i++; // Skip the next note since we've counted it as part of this pair
          currentBeat += 1; // Two eighth notes = 1 beat
        } else {
          currentBeat += 0.5;
        }
      } else {
        currentBeat += 0.5;
      }
    } else {
      currentBeat += 1;
    }
  }
  
  console.log('Pattern has', halfNoteCount, 'half notes (should be 6-8)');
  console.log('Pattern has', eighthNotePairCount, 'eighth note pairs (should be at least 4)');
  
  if (halfNoteCount < 6 || halfNoteCount > 8) {
    console.error('ERROR: Pattern has', halfNoteCount, 'half notes instead of 6-8');
  }
  
  if (eighthNotePairCount < 4) {
    console.error('ERROR: Pattern has', eighthNotePairCount, 'eighth note pairs instead of at least 4');
  }
  
  if (invalidHalfNotePlacements.length > 0) {
    console.error('ERROR: Pattern has half notes on invalid beats:', invalidHalfNotePlacements.join(', '));
  }
  
  if (invalidEighthPairPlacements.length > 0) {
    console.error('ERROR: Pattern has eighth note pairs spanning measure boundaries:', invalidEighthPairPlacements.join(', '));
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
    console.error('ERROR: Pattern missing Do-Mi-Sol sequence as quarter notes');
  }
  
  // Check for La (A4) requirement
  const hasLa = notes.some(note => note.syllable === 'La');
  if (!hasLa) {
    console.error('ERROR: Pattern missing required La note');
  }
  
  console.log('Pattern sequence:', selectedPattern.map(n => n.syllable || 'rest').join('-'));
  return selectedPattern;
};

const Lvl3SolfegeID4 = ({ onClose }) => {
  const config = {
    title: 'Level 3 Solfege Identification (3/4 Time)',
    subtitle: 'Solfege: Do-La • Rhythm: Quarter, Half, and Eighth Notes • Quarter Rests • Key: C Major • Time: 3/4',
    syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'],
    keySignature: null,
    timeSignature: '3/4',
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
    generatePattern: generatePatternLevel4,
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

export default Lvl3SolfegeID4;