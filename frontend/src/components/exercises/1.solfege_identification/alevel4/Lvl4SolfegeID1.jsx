import SolfegeIDTemplate from "../SolfegeIDTemplate.jsx";

const generatePatternLevel4 = (excludePatternIndex = -1) => {
  /**
   * PATTERN RULES FOR LEVEL 4 SOLFEGE IDENTIFICATION:
   * 
   * 1. Each pattern must have exactly 32 quarter note beats total (8 measures of 4/4 time)
   * 2. Must include Do-Mi-Sol (C4-E4-G4) as three consecutive QUARTER NOTES with no rests between them
   * 3. Must include Sol-La-Ti-Do (G4-A4-B4-C5) as four consecutive QUARTER NOTES with no rests between them
   * 4. All other melodic motion must be stepwise (no skips except for the required sequences)
   * 5. Exactly 2 quarter rests total: 1 in first four measures (beats 1-16) and 1 in last four measures (beats 17-32)
   * 6. At least 6-8 half notes in each melody that must occur on beat 1 or beat 3 of any measure
   * 7. Half notes can be used anywhere except in the required sequences (which must be quarter notes)
   * 8. Every pattern must start and end on Do (C4)
   * 9. The last note (beat 32) must be Do
   * 10. The second to last note (beat 31) must be Re
   * 11. The third to last note (beat 30) must be Do or Mi
   * 12. Stepwise motion must be maintained even across rests (note-rest-note must still be stepwise)
   * 13. Must include La (A4) at least once in each pattern
   * 14. Half notes can only occur on beat 1 and 3.
   * 15. Pattern Must include eighth note pairs that are a step apart such as do-re, mi-fa, sol-fa, etc. 
   * 16. Must include at least four eighth note pairs in the pattern.
   * 17. Must include Ti (B4) at least once in each pattern
   * 18. Dynamics: One staff (top or bottom) marked forte (f), the other marked piano (p)
   * 19. Must include exactly one Do-Sol skip in the melody (can be Do-Sol-Do pattern if desired)
   */
  
  const patterns = [
    // Pattern 1 - Following ALL Level 4 rules including the new Do-Sol skip requirement
    {
      notes: [
        // Measure 1 (beats 1-4): Do(h) + Re(e)+Mi(e) + Re(q) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        
        // Measure 2 (beats 5-8): Do(q) + Sol(q) + rest(q) + Fa(q) = 4 beats [Do-Sol skip here!]
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { type: 'rest', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        
        // Measure 3 (beats 9-12): Mi(h) + Re(e)+Do(e) + Re(q) = 4 beats
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'C4', syllable: 'Do', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        
        // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 5 (beats 17-20): Ti(h) + Do(e)+Ti(e) + La(q) = 4 beats
        { pitch: 'B4', syllable: 'Ti', duration: 'h' },
        { pitch: 'C5', syllable: 'Do', duration: 'e' },
        { pitch: 'B4', syllable: 'Ti', duration: 'e' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 6 (beats 21-24): Sol(q) + La(q) + Ti(q) + Do(q) = 4 beats [Sol-La-Ti-Do sequence]
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 7 (beats 25-28): Ti(h) + La(h) = 4 beats
        { pitch: 'G4', syllable: 'Sol', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' },
        
        // Measure 8 (beats 29-32): rest(q) + Mi(q) + Re(q) + Do(q) = 4 beats
        { type: 'rest', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' }
      ],
      dynamics: {
        topStaff: 'f',
        bottomStaff: 'p'
      }
    },
    
    // Pattern 2 - Second exercise with different Do-Sol skip placement
    {
      notes: [
        // Measure 1 (beats 1-4): Do(q) + Re(q) + Mi(h) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        
        // Measure 2 (beats 5-8): Fa(h) + Sol(e)+Fa(e) + Mi(q) = 4 beats
        { pitch: 'F4', syllable: 'Fa', duration: 'h' },
        { pitch: 'G4', syllable: 'Sol', duration: 'e' },
        { pitch: 'F4', syllable: 'Fa', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        
        // Measure 3 (beats 9-12): rest(q) + Re(h) + Do(q) = 4 beats
        { type: 'rest', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        
        // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 5 (beats 17-20): Ti(h) + La(e)+Ti(e) + Do(q) = 4 beats
        { pitch: 'B4', syllable: 'Ti', duration: 'h' },
        { pitch: 'A4', syllable: 'La', duration: 'e' },
        { pitch: 'B4', syllable: 'Ti', duration: 'e' },
        { pitch: 'C5', syllable: 'Do', duration: 'q' },
        
        // Measure 6 (beats 21-24): Ti(h) + Do(q) + Sol(q) = 4 beats [Do-Sol skip here!]
        { pitch: 'B4', syllable: 'Ti', duration: 'h' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        
        // Measure 7 (beats 25-28): La(q) + Ti(q) + Do(q) + rest(q) = 4 beats [Complete Sol-La-Ti-Do]
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { type: 'rest', duration: 'q' },
        
        // Measure 8 (beats 29-32): Ti(e)+La(e) + Mi(q) + Re(q) + Do(q) = 4 beats
        { pitch: 'G4', syllable: 'Sol', duration: 'e' },
        { pitch: 'F4', syllable: 'Fa', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' }
      ],
      dynamics: {
        topStaff: 'p',
        bottomStaff: 'f'
      }
    },
    
    // Pattern 3 - Third exercise ending on half note Do
    {
      notes: [
        // Measure 1 (beats 1-4): Do(h) + Re(e)+Do(e) + Re(q) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'C4', syllable: 'Do', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        
        // Measure 2 (beats 5-8): Mi(h) + Fa(e)+Mi(e) + Re(q) = 4 beats
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        
        // Measure 3 (beats 9-12): Do(q) + rest(q) + Re(h) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { type: 'rest', duration: 'q' },
        { pitch: 'C4', syllable: 'Sol', duration: 'h' },
        
        // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 5 (beats 17-20): Ti(h) + Do(q) + Sol(q) = 4 beats [Do-Sol skip here!]
        { pitch: 'B4', syllable: 'Ti', duration: 'h' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        
        // Measure 6 (beats 21-24): La(q) + Ti(q) + Do(q) + Ti(q) = 4 beats [Sol-La-Ti-Do sequence]
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'C5', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        
        // Measure 7 (beats 25-28): La(h) + Sol(e)+Fa(e) + Mi(q) = 4 beats
        { pitch: 'A4', syllable: 'La', duration: 'h' },
        { pitch: 'G4', syllable: 'Sol', duration: 'e' },
        { pitch: 'F4', syllable: 'Fa', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        
        // Measure 8 (beats 29-32): rest(q) + Re(e)+Do(e) + Do(h) = 4 beats
        { type: 'rest', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'C4', syllable: 'Do', duration: 'e' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' }
      ],
      dynamics: {
        topStaff: 'f',
        bottomStaff: 'p'
      }
    },
    
      // Pattern 4
      {
        notes: [
          // Measure 1 (beats 1-4): Do(q) + Re(e)+Mi(e) + Fa(h) = 4 beats
          { pitch: 'C4', syllable: 'Do', duration: 'q' },
          { pitch: 'D4', syllable: 'Re', duration: 'e' },
          { pitch: 'E4', syllable: 'Mi', duration: 'e' },
          { pitch: 'F4', syllable: 'Fa', duration: 'h' },
          
          // Measure 2 (beats 5-8): Sol(h) + La(e)+Sol(e) + Fa(q) = 4 beats
          { pitch: 'G4', syllable: 'Sol', duration: 'h' },
          { pitch: 'A4', syllable: 'La', duration: 'e' },
          { pitch: 'G4', syllable: 'Sol', duration: 'e' },
          { pitch: 'F4', syllable: 'Fa', duration: 'q' },
          
          // Measure 3 (beats 9-12): Mi(q) + rest(q) + Re(h) = 4 beats
          { pitch: 'E4', syllable: 'Mi', duration: 'q' },
          { type: 'rest', duration: 'q' },
          { pitch: 'D4', syllable: 'Re', duration: 'h' },
          
          // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + Ti(q) = 4 beats [Do-Mi-Sol sequence]
          { pitch: 'C4', syllable: 'Do', duration: 'q' },
          { pitch: 'E4', syllable: 'Mi', duration: 'q' },
          { pitch: 'G4', syllable: 'Sol', duration: 'q' },
          { pitch: 'F4', syllable: 'Fa', duration: 'q' },
          
          // Measure 5 (beats 17-20): Do(h) + Sol(q) + La(q) = 4 beats [Do-Sol skip here!]
          { pitch: 'E4', syllable: 'Mi', duration: 'h' },
          { pitch: 'D4', syllable: 'Re', duration: 'q' },
          { pitch: 'C4', syllable: 'Do', duration: 'q' },
          
          // Measure 6 (beats 21-24): Sol(q) + La(q) + Ti(q) + Do(q) = 4 beats [Sol-La-Ti-Do sequence]
          { pitch: 'G4', syllable: 'Sol', duration: 'q' },
          { pitch: 'A4', syllable: 'La', duration: 'q' },
          { pitch: 'B4', syllable: 'Ti', duration: 'q' },
          { pitch: 'C5', syllable: 'Do', duration: 'q' },
          
          // Measure 7 (beats 25-28): Ti(h) + Sol(e)+Fa(e) + Mi(q) = 4 beats
          { pitch: 'B4', syllable: 'Ti', duration: 'h' },
          { pitch: 'A4', syllable: 'La', duration: 'e' },
          { pitch: 'G4', syllable: 'Sol', duration: 'e' },
          { pitch: 'F4', syllable: 'Fa', duration: 'q' },
          
          // Measure 8 (beats 29-32): Do(q) + rest(q) + Re(q) + Do(q) = 4 beats
          { pitch: 'E4', syllable: 'Mi', duration: 'q' },
          { type: 'rest', duration: 'q' },
          { pitch: 'D4', syllable: 'Re', duration: 'q' },
          { pitch: 'C4', syllable: 'Do', duration: 'q' }
        ],
        dynamics: {
          topStaff: 'f',
          bottomStaff: 'p'
        }
      },
       // Pattern 5 
    {
      notes: [
        // Measure 1 (beats 1-4): Do(h) + Sol(q) + Fa(q) = 4 beats [Do-Sol skip here!]
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        
        // Measure 2 (beats 5-8): Mi(h) + Re(e)+Do(e) + Ti(q) = 4 beats
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'C4', syllable: 'Do', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        
        // Measure 3 (beats 9-12): La(h) + rest(q) + Sol(q) = 4 beats
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { type: 'rest', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        
        // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + Fa(q) = 4 beats [Do-Mi-Sol sequence]
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        
        // Measure 5 (beats 17-20): Mi(h) + Fa(e)+Sol(e) + La(q) = 4 beats
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'e' },
        { pitch: 'G4', syllable: 'Sol', duration: 'e' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 6 (beats 21-24): Sol(q) + La(q) + Ti(q) + Do(q) = 4 beats [Sol-La-Ti-Do sequence]
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'C5', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 7 (beats 25-28): Ti(h) + La(h) = 4 beats
        { pitch: 'G4', syllable: 'Sol', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' },
        
        // Measure 8 (beats 29-32): Sol(e)+Fa(e) + Mi(q) + Re(q) + Do(q) = 4 beats + rest(q)
        { pitch: 'E4', syllable: 'Mi', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { type: 'rest', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
      ],
      dynamics: {
        topStaff: 'p',
        bottomStaff: 'f'
      }
    },

    // Pattern 6 
    {
      notes: [
        // Measure 1 (beats 1-4): Do(q) + Re(e)+Mi(e) + Re(h) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        
        // Measure 2 (beats 5-8): Do(h) + Ti(e)+La(e) + Sol(q) = 4 beats
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa',  duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        
        // Measure 3 (beats 9-12): Fa(h) + Sol(q) + rest(q) = 4 beats
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { type: 'rest', duration: 'q' },
        
        // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        
        // Measure 5 (beats 17-20): Ti(q) + Do(q) + Sol(h) = 4 beats [Do-Sol skip here!]
        { pitch: 'B4', syllable: 'Ti', duration: 'q' },
        { pitch: 'C5', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Ti', duration: 'h' },
        
        // Measure 6 (beats 21-24): Sol(q) + La(q) + Ti(q) + Do(q) = 4 beats [Sol-La-Ti-Do sequence]
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        
        // Measure 7 (beats 25-28): Ti(h) + Do(e)+Ti(e) + La(q) = 4 beats
        { pitch: 'F4', syllable: 'Fa', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'e' },
        { pitch: 'D4', syllable: 'Re', duration: 'e' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        
        // Measure 8 (beats 29-32): Sol(q) + rest(q) + Re(q) + Do(q) = 4 beats
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { type: 'rest', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
      ],
      dynamics: {
        topStaff: 'f',
        bottomStaff: 'p'
      }
    }
  ];
  
  let patternIndex;
  
  if (excludePatternIndex === -1) {
    patternIndex = Math.floor(Math.random() * patterns.length);
    console.log('Initial random selection: pattern', patternIndex + 1, 'of', patterns.length);
  } else {
    patternIndex = (excludePatternIndex + 1) % patterns.length;
    console.log('Cycling to next pattern:', patternIndex + 1, 'of', patterns.length, 
                `(previous was pattern ${excludePatternIndex + 1})`);
  }
  
  const selectedPattern = patterns[patternIndex];
  selectedPattern.notes._patternIndex = patternIndex;
  selectedPattern.notes._dynamics = selectedPattern.dynamics;
  
  console.log('Level 4 Pattern', patternIndex + 1, 'selected with dynamics:', selectedPattern.dynamics);
  
  // Verify the pattern follows all rules
  const notes = selectedPattern.notes;
  let totalBeats = 0;
  notes.forEach(note => {
    if (note.duration === 'h') totalBeats += 2;
    else if (note.duration === 'q') totalBeats += 1;
    else if (note.duration === 'e') totalBeats += 0.5;
  });
  console.log('Pattern has', totalBeats, 'beats (should be 32)');
  
  // Check for required sequences
  const noteSequence = notes.filter(n => n.type !== 'rest');
  
  // Check for Do-Mi-Sol sequence
  let hasDoMiSol = false;
  for (let i = 0; i < noteSequence.length - 2; i++) {
    if (noteSequence[i].syllable === 'Do' && noteSequence[i].duration === 'q' &&
        noteSequence[i+1].syllable === 'Mi' && noteSequence[i+1].duration === 'q' &&
        noteSequence[i+2].syllable === 'Sol' && noteSequence[i+2].duration === 'q') {
      hasDoMiSol = true;
      break;
    }
  }
  
  // Check for Sol-La-Ti-Do sequence
  let hasSolLaTiDo = false;
  for (let i = 0; i < noteSequence.length - 3; i++) {
    if (noteSequence[i].syllable === 'Sol' && noteSequence[i].duration === 'q' &&
        noteSequence[i+1].syllable === 'La' && noteSequence[i+1].duration === 'q' &&
        noteSequence[i+2].syllable === 'Ti' && noteSequence[i+2].duration === 'q' &&
        noteSequence[i+3].syllable === 'Do' && noteSequence[i+3].duration === 'q') {
      hasSolLaTiDo = true;
      break;
    }
  }
  
  // Check for Do-Sol skip
  let hasDoSolSkip = false;
  for (let i = 0; i < noteSequence.length - 1; i++) {
    if (noteSequence[i].syllable === 'Do' && noteSequence[i+1].syllable === 'Sol') {
      hasDoSolSkip = true;
      break;
    }
  }
  
  // Check for required syllables
  const hasLa = noteSequence.some(note => note.syllable === 'La');
  const hasTi = noteSequence.some(note => note.syllable === 'Ti');
  
  // Count eighth note pairs
  let eighthPairs = 0;
  for (let i = 0; i < notes.length - 1; i++) {
    if (notes[i].duration === 'e' && notes[i+1].duration === 'e' && 
        notes[i].type !== 'rest' && notes[i+1].type !== 'rest') {
      eighthPairs++;
    }
  }
  
  // Count half notes
  const halfNotes = notes.filter(note => note.duration === 'h' && note.type !== 'rest').length;
  
  console.log('Has Do-Mi-Sol sequence:', hasDoMiSol);
  console.log('Has Sol-La-Ti-Do sequence:', hasSolLaTiDo);
  console.log('Has Do-Sol skip:', hasDoSolSkip);
  console.log('Contains La:', hasLa);
  console.log('Contains Ti:', hasTi);
  console.log('Number of eighth note pairs:', eighthPairs, '(should be at least 4)');
  console.log('Number of half notes:', halfNotes, '(should be 6-8)');
  
  if (!hasDoMiSol) {
    console.error('ERROR: Pattern missing Do-Mi-Sol sequence as quarter notes');
  }
  if (!hasSolLaTiDo) {
    console.error('ERROR: Pattern missing Sol-La-Ti-Do sequence as quarter notes');
  }
  if (!hasDoSolSkip) {
    console.error('ERROR: Pattern missing required Do-Sol skip');
  }
  if (!hasLa) {
    console.error('ERROR: Pattern missing required La note');
  }
  if (!hasTi) {
    console.error('ERROR: Pattern missing required Ti note');
  }
  if (eighthPairs < 4) {
    console.error('ERROR: Pattern needs at least 4 eighth note pairs, has', eighthPairs);
  }
  if (halfNotes < 6 || halfNotes > 8) {
    console.error('ERROR: Pattern needs 6-8 half notes, has', halfNotes);
  }
  
  return notes;
};

const Lvl4SolfegeID1 = ({ onClose }) => {
  const config = {
    title: 'Level 4 Solfege Identification',
    subtitle: 'Solfege: Do-Do • Rhythm: Quarter, Half, and Eighth Notes • Quarter Rests • Key: C Major • Dynamics: f/p',
    syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'],
    keySignature: null,
    timeSignature: '4/4',
    noteMap: {
      'C4': 'c/4', 
      'D4': 'd/4', 
      'E4': 'e/4', 
      'F4': 'f/4', 
      'G4': 'g/4', 
      'A4': 'a/4',
      'B4': 'b/4',
      'C5': 'c/5'
    },
    audioFiles: {
      'Do': '/teacher_dashboard/sounds/do.mp3',
      'Re': '/teacher_dashboard/sounds/re.mp3',
      'Mi': '/teacher_dashboard/sounds/mi.mp3',
      'Fa': '/teacher_dashboard/sounds/fa.mp3',
      'Sol': '/teacher_dashboard/sounds/sol.mp3',
      'La': '/teacher_dashboard/sounds/la.mp3',
      'Ti': '/teacher_dashboard/sounds/ti.mp3'
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
        case 'b/4': return stave.getYForLine(2);
        case 'c/5': return stave.getYForLine(1.5);
        default: return stave.getYForLine(3);
      }
    },
    bpm: 120,
    hasRests: true,
    hasDynamics: true
  };

  return <SolfegeIDTemplate config={config} onClose={onClose} />;
};

export default Lvl4SolfegeID1;