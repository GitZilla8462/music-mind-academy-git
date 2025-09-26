import SolfegeIDTemplate from "../SolfegeIDTemplate.jsx";

const generatePatternLevel2 = (excludePatternIndex = -1) => {
  /**
   * PATTERN RULES FOR LEVEL 3 SOLFEGE IDENTIFICATION:
   * 
   * 1. Each pattern must have exactly 32 quarter note beats total (8 measures of 4/4 time)
   * 2. Must include Do-Mi-Sol (F4-A4-C5) as three consecutive QUARTER NOTES with no rests between them
   * 3. All other melodic motion must be stepwise (no skips except for the required Do-Mi-Sol sequence)
   * 4. Exactly 2 quarter rests total: 1 in first four measures (beats 1-16) and 1 in last four measures (beats 17-32)
   * 5. At least 6-8 half notes in each melody that must occur on beat 1 or beat 3 of any measure
   * 6. Half notes can be used anywhere except in the Do-Mi-Sol sequence (which must be quarter notes)
   * 7. Every pattern must start and end on Do (F4)
   * 8. The last note (beat 32) must be Do
   * 9. The second to last note (beat 31) must be Re
   * 10. The third to last note (beat 30) must be Do or Mi
   * 11. Stepwise motion must be maintained even across rests (note-rest-note must still be stepwise)
   * 12. Must include La (D5) at least once in each pattern
   * 13. Half notes can only occur on beat 1 and 3.
   * 14. Pattern Must include eighth note pairs that are a step apart such as do-re, mi-fa, sol-fa, etc. 
   * 15. Must include at least four eighth note pairs in the pattern.
   */
  
  const patterns = [
    // Pattern 1 - Corrected to follow ALL rules
    [
      // Measure 1 (beats 1-4): Do(h) + Re(q) + Mi(q) = 4 beats
      { pitch: 'F4', syllable: 'Do', duration: 'h' },     // Beats 1-2 (valid half note placement)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 3
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 4
      
      // Measure 2 (beats 5-8): Fa(q) + Mi(q) + rest(q) + Re(q) = 4 beats
      { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 5
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 6 (stepwise before rest)
      { type: 'rest', duration: 'q' },                     // Beat 7 (first rest)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 8 (stepwise after rest: Mi-rest-Re)
      
      // Measure 3 (beats 9-12): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
      { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 9 (Do-Mi-Sol starts)
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 10
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 11 (Do-Mi-Sol ends)
      { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 12 (required La, stepwise from Sol)
      
      // Measure 4 (beats 13-16): Sol(h) + Fa(e)+Mi(e) = 2 + 1 + 1 = 4 beats
      { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 13-14 (valid half note placement, stepwise from La)
      { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 15.0 (eighth pair 1)
      { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 15.5 (eighth pair 1: Fa-Mi)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 16 (stepwise from Mi)
      
      // Measure 5 (beats 17-20): Do(h) + Re(e)+Do(e) = 2 + 1 + 1 = 4 beats  
      { pitch: 'F4', syllable: 'Do', duration: 'h' },     // Beats 17-18 (valid half note placement, stepwise from Re)
      { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 19.0 (eighth pair 2)
      { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 19.5 (eighth pair 2: Re-Do)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 20 (stepwise from Do)
      
      // Measure 6 (beats 21-24): Mi(h) + Fa(h) = 2 + 2 = 4 beats (ADDED 6th HALF NOTE)
      { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 21-22 (valid half note placement, stepwise from Re)
      { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 23-24 (6th half note, stepwise from Mi)
      
      // Measure 7 (beats 25-28): Sol(q) + rest(q) + La(h) = 1 + 1 + 2 = 4 beats
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 25 (stepwise from Fa)
      { type: 'rest', duration: 'q' },                     // Beat 26 (second rest)
      { pitch: 'D5', syllable: 'La', duration: 'h' },     // Beats 27-28 (valid half note placement, stepwise after rest: Sol-rest-La)
      
      // Measure 8 (beats 29-32): Sol(e)+Fa(e) + Mi(e)+Re(e) = 1 + 1 = 2 beats + Do(q) + Do(q) = 4 beats
      { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 29.0 (eighth pair 3: Sol-Fa)
      { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 29.5 (eighth pair 3)
      { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 30.0 (eighth pair 4: Mi-Re)
      { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 30.5 (eighth pair 4)
      { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 31 (second to last)
      { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last)
    ],

    // Pattern 2 - Final version following ALL rules
    [
      // Measure 1 (beats 1-4): Do(q) + Re(q) + Mi(h) = 1 + 1 + 2 = 4 beats
      { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 1 (starts on Do)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 2 (stepwise)
      { pitch: 'G4', syllable: 'Re', duration: 'h' },     // Beats 3-4 (1st half note, valid placement)
      
      // Measure 2 (beats 5-8): Do(q) + Mi(q) + Sol(q) + rest(q) = 4 beats [Do-Mi-Sol sequence]
      { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 5 (Do-Mi-Sol starts - skip from Mi to Do)
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 6
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 7 (Do-Mi-Sol ends)
      { type: 'rest', duration: 'q' },                     // Beat 8 (first rest in beats 1-16)
      
      // Measure 3 (beats 9-12): La(h) + Sol(e)+La(e) = 2 + 1 = 3 beats + Sol(q) = 4 beats
      { pitch: 'D5', syllable: 'La', duration: 'h' },     // Beats 9-10 (2nd half note, valid placement, stepwise after rest: Sol-rest-La)
      { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 11.0 (eighth pair 1)
      { pitch: 'D5', syllable: 'La', duration: 'e' },     // Beat 11.5 (eighth pair 1: Sol-La)
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 12 (stepwise from La)
      
      // Measure 4 (beats 13-16): Fa(h) + Sol(e)+Fa(e) = 2 + 1 = 3 beats + Mi(q) = 4 beats
      { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 13-14 (3rd half note, valid placement, stepwise from Sol)
      { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 15.0 (eighth pair 2)
      { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 15.5 (eighth pair 2: Sol-Fa)
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 16 (stepwise from Fa)
      
      // Measure 5 (beats 17-20): Re(h) + Do(e)+Re(e) = 2 + 1 = 3 beats + Mi(q) = 4 beats
      { pitch: 'G4', syllable: 'Re', duration: 'h' },     // Beats 17-18 (4th half note, valid placement, stepwise from Mi)
      { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 19.0 (eighth pair 3)
      { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 19.5 (eighth pair 3: Do-Re)
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 20 (stepwise from Re)
      
      // Measure 6 (beats 21-24): Fa(h) + Sol(h) = 2 + 2 = 4 beats
      { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 21-22 (5th half note, valid placement, stepwise from Mi)
      { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 23-24 (6th half note, valid placement, stepwise from Fa)
      
      // Measure 7 (beats 25-28): La(h) + rest(q) + Sol(q) = 2 + 1 + 1 = 4 beats
      { pitch: 'D5', syllable: 'La', duration: 'h' },     // Beats 25-26 (7th half note, valid placement, stepwise from Sol)
      { type: 'rest', duration: 'q' },                     // Beat 27 (second rest in beats 17-32)
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 28 (stepwise after rest: La-rest-Sol)
      
      // Measure 8 (beats 29-32): Fa(e)+Mi(e) + Mi(q) + Re(q) + Do(q) = 1 + 1 + 1 + 1 = 4 beats
      { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 29.0 (eighth pair 4)
      { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 29.5 (eighth pair 4: Fa-Mi)
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 30 (third to last - rule 10: must be Do or Mi ✓)
      { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 31 (second to last - rule 9: must be Re ✓)
      { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last - rule 8: must be Do ✓)
    ],
   // Pattern 3 - Following ALL Level 3 rules
[
  // Measure 1 (beats 1-4): Do(h) + Mi(e)+Re(e) = 2 + 1 = 3 beats + Do(q) = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'h' },     // Beats 1-2 (starts on Do, 1st half note, valid placement)
  { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 3.0 (eighth pair 1)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 3.5 (eighth pair 1: Do-Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 4 (stepwise from Re)
  
  // Measure 2 (beats 5-8): Re(q) + Mi(q) + rest(q) + Fa(q) = 4 beats
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 5 (stepwise from Do)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 6 (stepwise before rest)
  { type: 'rest', duration: 'q' },                     // Beat 7 (first rest in beats 1-16)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 8 (stepwise after rest: Mi-rest-Fa)
  
  // Measure 3 (beats 9-12): Sol(h) + La(e)+Sol(e) = 2 + 1 = 3 beats + Fa(q) = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 9-10 (2nd half note, valid placement, stepwise from Fa)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 11.0 (eighth pair 2)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 11.5 (eighth pair 2: Fa-Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 12 (stepwise from Mi)
  
  // Measure 4 (beats 13-16): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 13 (Do-Mi-Sol starts - skip from Re to Do)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 14
  { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 15 (Do-Mi-Sol ends)
  { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 16 (stepwise from Sol)
  
  // Measure 5 (beats 17-20): Sol(h) + Fa(e)+Sol(e) = 2 + 1 = 3 beats + La(q) = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 17-18 (3rd half note, valid placement, stepwise from La)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 19.0 (eighth pair 3)
  { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 19.5 (eighth pair 3: Fa-Sol)
  { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 20 (stepwise from Sol)
  
  // Measure 6 (beats 21-24): Sol(h) + Fa(h) = 2 + 2 = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 21-22 (4th half note, valid placement, stepwise from La)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 23-24 (5th half note, valid placement, stepwise from Sol)
  
  // Measure 7 (beats 25-28): Mi(h) + rest(q) + Re(q) = 2 + 1 + 1 = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 25-26 (6th half note, valid placement, stepwise from Fa)
  { type: 'rest', duration: 'q' },                     // Beat 27 (second rest in beats 17-32)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 28 (stepwise after rest: Mi-rest-Re)
  
  // Measure 8 (beats 29-32): Do(e)+Re(e) + Do(q) + Re(q) + Do(q) = 1 + 1 + 1 + 1 = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 29.0 (eighth pair 4)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 29.5 (eighth pair 4: Do-Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 30 (third to last - rule 10: must be Do or Mi ✓)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 31 (second to last - rule 9: must be Re ✓)
  { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last - rule 8: must be Do ✓)
],
// Pattern 4 - Following ALL Level 3 rules with STRICT stepwise motion
[
  // Measure 1 (beats 1-4): Do(q) + Re(q) + Do(h) = 1 + 1 + 2 = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 1 (starts on Do)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 2 (stepwise: Do→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'h' },     // Beats 3-4 (1st half note, valid placement, stepwise: Re→Do)
  
  // Measure 2 (beats 5-8): Re(q) + Mi(q) + rest(q) + Re(q) = 4 beats
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 5 (stepwise: Do→Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 6 (stepwise: Re→Mi, before rest)
  { type: 'rest', duration: 'q' },                     // Beat 7 (first rest in beats 1-16)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 8 (stepwise after rest: Mi-rest-Re)
  
  // Measure 3 (beats 9-12): Mi(h) + Re(e)+Mi(e) = 2 + 1 = 3 beats + Fa(q) = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 9-10 (2nd half note, valid placement, stepwise: Re→Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 11.0 (eighth pair 1, stepwise: Mi→Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 11.5 (eighth pair 1: Re-Mi)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 12 (stepwise: Mi→Fa)
  
  // Measure 4 (beats 13-16): Sol(h) + La(e)+Sol(e) = 2 + 1 = 3 beats + Fa(q) = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 13-14 (3rd half note, valid placement, stepwise: Fa→Sol)
  { pitch: 'D5', syllable: 'La', duration: 'e' },     // Beat 15.0 (eighth pair 2, required La, stepwise: Sol→La)
  { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 15.5 (eighth pair 2: La-Sol)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 16 (stepwise: Sol→Fa)
  
  // Measure 5 (beats 17-20): Mi(h) + Fa(e)+Mi(e) = 2 + 1 = 3 beats + Re(q) = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 17-18 (4th half note, valid placement, stepwise: Fa→Mi)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 19.0 (eighth pair 3, stepwise: Mi→Fa)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 19.5 (eighth pair 3: Fa-Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 20 (stepwise: Mi→Re)
  
  // Measure 6 (beats 21-24): Do(q) + Mi(q) + Sol(q) + La(q) = 4 beats [Do-Mi-Sol sequence]
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 21 (Do-Mi-Sol starts, stepwise: Re→Do)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 22 (Do-Mi-Sol continues, SKIP: Do→Mi)
  { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 23 (Do-Mi-Sol ends, SKIP: Mi→Sol)
  { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 24 (stepwise: Sol→La)
  
  // Measure 7 (beats 25-28): Sol(h) + rest(q) + Fa(q) = 2 + 1 + 1 = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 25-26 (5th half note, valid placement, stepwise: La→Sol)
  { type: 'rest', duration: 'q' },                     // Beat 27 (second rest in beats 17-32)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 28 (stepwise after rest: Sol-rest-Fa)
  
  // Measure 8 (beats 29-32): Mi(e)+Re(e) + Do(q) + Re(q) + Do(q) = 1 + 1 + 1 + 1 = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 29.0 (eighth pair 4, stepwise: Fa→Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 29.5 (eighth pair 4: Mi-Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 30 (third to last - rule 10: must be Do or Mi ✓, stepwise: Re→Do)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 31 (second to last - rule 9: must be Re ✓, stepwise: Do→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last - rule 8: must be Do ✓, stepwise: Re→Do)
],

// Pattern 5 - Following ALL Level 3 rules with STRICT stepwise motion
[
  // Measure 1 (beats 1-4): Do(h) + Re(e)+Mi(e) = 2 + 1 = 3 beats + Re(q) = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'h' },     // Beats 1-2 (starts on Do, 1st half note, valid placement)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 3.0 (eighth pair 1, stepwise: Do→Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 3.5 (eighth pair 1: Re-Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 4 (stepwise: Mi→Re)
  
  // Measure 2 (beats 5-8): Do(q) + Re(q) + rest(q) + Do(q) = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 5 (stepwise: Re→Do)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 6 (stepwise: Do→Re, before rest)
  { type: 'rest', duration: 'q' },                     // Beat 7 (first rest in beats 1-16)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 8 (stepwise after rest: Re-rest-Do)
  
  // Measure 3 (beats 9-12): Re(h) + Do(q) + Mi(q) = 2 + 1 + 1 = 4 beats [Start of Do-Mi-Sol]
  { pitch: 'G4', syllable: 'Re', duration: 'h' },     // Beats 9-10 (2nd half note, valid placement, stepwise: Do→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 11 (Do-Mi-Sol starts, stepwise: Re→Do)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 12 (Do-Mi-Sol continues, SKIP: Do→Mi)
  
  // Measure 4 (beats 13-16): Sol(q) + La(q) + Sol(h) = 1 + 1 + 2 = 4 beats [Complete Do-Mi-Sol]
  { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 13 (Do-Mi-Sol ends, SKIP: Mi→Sol)
  { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 14 (required La, stepwise: Sol→La)
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 15-16 (3rd half note, valid placement, stepwise: La→Sol)
  
  // Measure 5 (beats 17-20): Fa(h) + Sol(e)+Fa(e) = 2 + 1 = 3 beats + Mi(q) = 4 beats
  { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 17-18 (4th half note, valid placement, stepwise: Sol→Fa)
  { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 19.0 (eighth pair 2, stepwise: Fa→Sol)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 19.5 (eighth pair 2: Sol-Fa)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 20 (stepwise: Fa→Mi)
  
  // Measure 6 (beats 21-24): Re(h) + Mi(h) = 2 + 2 = 4 beats
  { pitch: 'G4', syllable: 'Re', duration: 'h' },     // Beats 21-22 (5th half note, valid placement, stepwise: Mi→Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 23-24 (6th half note, valid placement, stepwise: Re→Mi)
  
  // Measure 7 (beats 25-28): Fa(h) + rest(q) + Mi(q) = 2 + 1 + 1 = 4 beats
  { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },    // Beats 25-26 (7th half note, valid placement, stepwise: Mi→Fa)
  { type: 'rest', duration: 'q' },                     // Beat 27 (second rest in beats 17-32)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 28 (stepwise after rest: Fa-rest-Mi)
  
  // Measure 8 (beats 29-32): Re(e)+Do(e) + Do(q) + Re(q) + Do(q) = 1 + 1 + 1 + 1 = 4 beats
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 29.0 (eighth pair 3, stepwise: Mi→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 29.5 (eighth pair 3: Re-Do)
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 30 (third to last - rule 10: must be Do or Mi ✓)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 31 (second to last - rule 9: must be Re ✓, stepwise: Do→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last - rule 8: must be Do ✓, stepwise: Re→Do)
],

// Pattern 6 - Following ALL Level 3 rules with STRICT stepwise motion
[
  // Measure 1 (beats 1-4): Do(q) + Re(q) + Mi(h) = 1 + 1 + 2 = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 1 (starts on Do)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 2 (stepwise: Do→Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 3-4 (1st half note, valid placement, stepwise: Re→Mi)
  
  // Measure 2 (beats 5-8): Fa(q) + Sol(q) + rest(q) + Fa(q) = 4 beats
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 5 (stepwise: Mi→Fa)
  { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 6 (stepwise: Fa→Sol, before rest)
  { type: 'rest', duration: 'q' },                     // Beat 7 (first rest in beats 1-16)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 8 (stepwise after rest: Sol-rest-Fa)
  
  // Measure 3 (beats 9-12): Mi(h) + Fa(e)+Sol(e) = 2 + 1 = 3 beats + La(q) = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 9-10 (2nd half note, valid placement, stepwise: Fa→Mi)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 11.0 (eighth pair 1, stepwise: Mi→Fa)
  { pitch: 'C5', syllable: 'Sol', duration: 'e' },    // Beat 11.5 (eighth pair 1: Fa-Sol)
  { pitch: 'D5', syllable: 'La', duration: 'q' },     // Beat 12 (required La, stepwise: Sol→La)
  
  // Measure 4 (beats 13-16): Sol(h) + Fa(e)+Mi(e) = 2 + 1 = 3 beats + Fa(q) = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 13-14 (3rd half note, valid placement, stepwise: La→Sol)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 15.0 (eighth pair 2, stepwise: Sol→Fa)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 15.5 (eighth pair 2: Fa-Mi)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 16 (stepwise: Mi→Fa)
  
  // Measure 5 (beats 17-20): Sol(h) + Fa(e)+Mi(e) = 2 + 1 = 3 beats + Re(q) = 4 beats
  { pitch: 'C5', syllable: 'Sol', duration: 'h' },    // Beats 17-18 (4th half note, valid placement, stepwise: Fa→Sol)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },    // Beat 19.0 (eighth pair 3, stepwise: Sol→Fa)
  { pitch: 'A4', syllable: 'Mi', duration: 'e' },     // Beat 19.5 (eighth pair 3: Fa-Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 20 (stepwise: Mi→Re)
  
  // Measure 6 (beats 21-24): Do(q) + Mi(q) + Sol(q) + Fa(q) = 4 beats [Do-Mi-Sol sequence]
  { pitch: 'F4', syllable: 'Do', duration: 'q' },     // Beat 21 (Do-Mi-Sol starts, stepwise: Re→Do)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 22 (Do-Mi-Sol continues, SKIP: Do→Mi)
  { pitch: 'C5', syllable: 'Sol', duration: 'q' },    // Beat 23 (Do-Mi-Sol ends, SKIP: Mi→Sol)
  { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },    // Beat 24 (stepwise: Sol→Fa)
  
  // Measure 7 (beats 25-28): Mi(h) + rest(q) + Re(q) = 2 + 1 + 1 = 4 beats
  { pitch: 'A4', syllable: 'Mi', duration: 'h' },     // Beats 25-26 (5th half note, valid placement, stepwise: Fa→Mi)
  { type: 'rest', duration: 'q' },                     // Beat 27 (second rest in beats 17-32)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 28 (stepwise after rest: Mi-rest-Re)
  
  // Measure 8 (beats 29-32): Do(e)+Re(e) + Mi(q) + Re(q) + Do(q) = 1 + 1 + 1 + 1 = 4 beats
  { pitch: 'F4', syllable: 'Do', duration: 'e' },     // Beat 29.0 (eighth pair 4, stepwise: Re→Do)
  { pitch: 'G4', syllable: 'Re', duration: 'e' },     // Beat 29.5 (eighth pair 4: Do-Re)
  { pitch: 'A4', syllable: 'Mi', duration: 'q' },     // Beat 30 (third to last - rule 10: must be Do or Mi ✓, stepwise: Re→Mi)
  { pitch: 'G4', syllable: 'Re', duration: 'q' },     // Beat 31 (second to last - rule 9: must be Re ✓, stepwise: Mi→Re)
  { pitch: 'F4', syllable: 'Do', duration: 'q' }      // Beat 32 (last - rule 8: must be Do ✓, stepwise: Re→Do)
],
  ];
  let patternIndex;
  
  if (excludePatternIndex === -1) {
    // First time: random selection
    patternIndex = Math.floor(Math.random() * patterns.length);
    console.log('Initial random selection: pattern', patternIndex + 1, 'of', patterns.length);
  } else {
    // Subsequent times: cycle to next pattern
    patternIndex = (excludePatternIndex + 1) % patterns.length;
    console.log('Cycling to next pattern:', patternIndex + 1, 'of', patterns.length, 
                `(previous was pattern ${excludePatternIndex + 1})`);
  }
  
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
    console.log('Pattern has', totalBeats, 'beats (should be 32)');
    
    // Count half notes and eighth note pairs, verify half note placement
    let halfNoteCount = 0;
    let eighthNotePairCount = 0;
    let currentBeat = 1;
    let invalidHalfNotePlacements = [];
    
    for (let i = 0; i < selectedPattern.length; i++) {
      const note = selectedPattern[i];
      
      if (note.duration === 'h') {
        halfNoteCount++;
        // Half notes must start on beat 1 or 3 of any measure (beats 1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31)
        const beatInMeasure = ((currentBeat - 1) % 4) + 1;
        if (beatInMeasure !== 1 && beatInMeasure !== 3) {
          invalidHalfNotePlacements.push(`beat ${currentBeat}`);
        }
        currentBeat += 2;
      } else if (note.duration === 'e') {
        // Check if this eighth note is part of a stepwise pair
        if (i < selectedPattern.length - 1 && selectedPattern[i + 1].duration === 'e' && 
            note.type !== 'rest' && selectedPattern[i + 1].type !== 'rest') {
          const noteOrder = ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'];
          const currentIndex = noteOrder.indexOf(note.pitch);
          const nextIndex = noteOrder.indexOf(selectedPattern[i + 1].pitch);
          if (Math.abs(currentIndex - nextIndex) === 1) {
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
      console.error('ERROR: Pattern', patternIndex + 1, 'has', halfNoteCount, 'half notes instead of 6-8');
    }
    
    if (eighthNotePairCount < 4) {
      console.error('ERROR: Pattern', patternIndex + 1, 'has', eighthNotePairCount, 'eighth note pairs instead of at least 4');
    }
    
    if (invalidHalfNotePlacements.length > 0) {
      console.error('ERROR: Pattern', patternIndex + 1, 'has half notes on invalid beats:', invalidHalfNotePlacements.join(', '));
    }
    
    // Verify it's stepwise and has Do-Mi-Sol sequence (as quarter notes)
    const notes = selectedPattern.filter(p => p.type !== 'rest');
    const noteOrder = ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'];
    
    // Check for Do-Mi-Sol sequence (must be quarter notes)
    let hasDoMiSolQuarters = false;
    for (let i = 0; i < notes.length - 2; i++) {
      if (notes[i].pitch === 'F4' && notes[i].syllable === 'Do' && notes[i].duration === 'q' &&
          notes[i+1].pitch === 'A4' && notes[i+1].syllable === 'Mi' && notes[i+1].duration === 'q' &&
          notes[i+2].pitch === 'C5' && notes[i+2].syllable === 'Sol' && notes[i+2].duration === 'q') {
        hasDoMiSolQuarters = true;
        break;
      }
    }
    
    if (!hasDoMiSolQuarters) {
      console.error('ERROR: Pattern', patternIndex + 1, 'missing Do-Mi-Sol sequence as quarter notes');
    }
    
    // Check for La (D5) requirement
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
      if (note.duration === 'h') beatCounter += 2;
      else if (note.duration === 'q') beatCounter += 1;
      else if (note.duration === 'e') beatCounter += 0.5;
    });
    
    if (restBeat1 > 16) {
      console.error('ERROR: Pattern', patternIndex + 1, 'first rest at beat', restBeat1, 'should be in beats 1-16');
    }
    if (restBeat2 <= 16) {
      console.error('ERROR: Pattern', patternIndex + 1, 'second rest at beat', restBeat2, 'should be in beats 17-32');
    }
    
    console.log('Pattern sequence:', notes.map(n => n.syllable).join('-'));
    console.log('Rest positions: beats', restBeat1, 'and', restBeat2);
    console.log('Half note count:', halfNoteCount);
    console.log('Eighth note pairs:', eighthNotePairCount);
    console.log('Contains La:', hasLa ? 'Yes' : 'No');
    return selectedPattern;
  };
  
  const Lvl3SolfegeID2 = ({ onClose }) => {
    const config = {
      title: 'Level 3 Solfege Identification',
      subtitle: 'Solfege: Do-La • Rhythm: Quarter, Half, and Eighth Notes • Quarter Rests • Key: F Major',
      syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'],
      keySignature: 'Bb',
      timeSignature: '4/4',
      noteMap: {
        'F4': 'f/4', 
        'G4': 'g/4', 
        'A4': 'a/4', 
        'Bb4': 'bb/4', 
        'C5': 'c/5', 
        'D5': 'd/5'
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
          case 'f/4': return stave.getYForLine(5);
          case 'g/4': return stave.getYForLine(4.5);
          case 'a/4': return stave.getYForLine(4);
          case 'bb/4': return stave.getYForLine(3.5);
          case 'c/5': return stave.getYForLine(3);
          case 'd/5': return stave.getYForLine(2.5);
          default: return stave.getYForLine(3);
        }
      },
      bpm: 120,
      hasRests: true
    };
  
    return <SolfegeIDTemplate config={config} onClose={onClose} />;
  };
  
  export default Lvl3SolfegeID2;