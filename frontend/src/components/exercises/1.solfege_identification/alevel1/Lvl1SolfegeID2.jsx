import SolfegeIDTemplate from "../SolfegeIDTemplate.jsx";

// F Major pattern generation function 
const generatePatternF = () => {
  const noteOrder = ['F4', 'G4', 'A4', 'Bb4', 'C5'];
  const syllableOrder = ['Do', 'Re', 'Mi', 'Fa', 'Sol'];
  
  let pattern = [];
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    pattern = [];
    let currentNoteIndex = 0;
    
    const measurePatterns = [
      ['h', 'h'],
      ['q', 'q', 'h'],
      ['q', 'q', 'q', 'q']
    ];
    
    let quarterCount = 0;
    let halfCount = 0;
    
    for (let measure = 0; measure < 8; measure++) {
      let rhythmChoice;
      const remainingMeasures = 8 - measure;
      
      if (quarterCount < 12 && remainingMeasures <= 3) {
        rhythmChoice = Math.random() < 0.7 ? 2 : 1;
      } else if (halfCount < 5 && remainingMeasures <= 3) {
        rhythmChoice = Math.random() < 0.5 ? 0 : 1;
      } else {
        rhythmChoice = Math.floor(Math.random() * measurePatterns.length);
      }
      
      const measureRhythm = measurePatterns[rhythmChoice];
      
      for (let noteInMeasure = 0; noteInMeasure < measureRhythm.length; noteInMeasure++) {
        const duration = measureRhythm[noteInMeasure];
        
        if (pattern.length === 0) {
          currentNoteIndex = 0;
        }
        
        const isLastNote = (measure === 7 && noteInMeasure === measureRhythm.length - 1);
        if (isLastNote) {
          currentNoteIndex = 0;
        }
        
        const isMeasure6or7 = (measure === 6 || measure === 7);
        const isSecondToLastNote = (measure === 7 && noteInMeasure === measureRhythm.length - 2);
        
        if (isSecondToLastNote) {
          currentNoteIndex = 1;
        }
        
        pattern.push({
          pitch: noteOrder[currentNoteIndex],
          syllable: syllableOrder[currentNoteIndex],
          duration: duration
        });
        
        if (duration === 'q') quarterCount++;
        if (duration === 'h') halfCount++;
        
        if (!isLastNote && pattern.length < 30) {
          const possibleMoves = [];
          
          if (currentNoteIndex > 0) {
            possibleMoves.push(currentNoteIndex - 1);
          }
          
          if (currentNoteIndex < noteOrder.length - 1) {
            possibleMoves.push(currentNoteIndex + 1);
          }
          
          const canStayOnSame = () => {
            if (pattern.length < 2) return true;
            
            const lastNote = pattern[pattern.length - 1];
            const secondLastNote = pattern[pattern.length - 2];
            
            if (lastNote.syllable === syllableOrder[currentNoteIndex] && 
                secondLastNote.syllable === syllableOrder[currentNoteIndex]) {
              return false;
            }
            return true;
          };
          
          if (canStayOnSame()) {
            possibleMoves.push(currentNoteIndex);
          }
          
          if (isMeasure6or7 && !isSecondToLastNote) {
            if (currentNoteIndex > 1) {
              const downwardMoves = possibleMoves.filter(move => move < currentNoteIndex);
              if (downwardMoves.length > 0 && Math.random() < 0.7) {
                possibleMoves.length = 0;
                possibleMoves.push(...downwardMoves);
              }
            }
          }
          
          currentNoteIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
      }
    }
    
    const syllablesInPattern = new Set(pattern.map(note => note.syllable));
    const hasAllSyllables = syllableOrder.every(syllable => syllablesInPattern.has(syllable));
    const actualQuarterCount = pattern.filter(note => note.duration === 'q').length;
    const actualHalfCount = pattern.filter(note => note.duration === 'h').length;
    
    const hasNoSkips = pattern.every((note, index) => {
      if (index === 0) return true;
      const prevNoteIndex = noteOrder.indexOf(pattern[index - 1].pitch);
      const currentNoteIndex = noteOrder.indexOf(note.pitch);
      const interval = Math.abs(currentNoteIndex - prevNoteIndex);
      return interval <= 1;
    });
    
    const hasNoTripleRepeats = pattern.every((note, index) => {
      if (index < 2) return true;
      const current = note.syllable;
      const prev1 = pattern[index - 1].syllable;
      const prev2 = pattern[index - 2].syllable;
      return !(current === prev1 && prev1 === prev2);
    });
    
    if (hasAllSyllables && actualQuarterCount >= 12 && actualHalfCount >= 5 && hasNoSkips && hasNoTripleRepeats) {
      break;
    }
    
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    pattern = [
      { pitch: 'F4', syllable: 'Do', duration: 'h' },
      { pitch: 'G4', syllable: 'Re', duration: 'h' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
      { pitch: 'C5', syllable: 'Sol', duration: 'h' },
      { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'G4', syllable: 'Re', duration: 'h' },
      { pitch: 'A4', syllable: 'Mi', duration: 'h' },
      { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
      { pitch: 'C5', syllable: 'Sol', duration: 'q' },
      { pitch: 'Bb4', syllable: 'Fa', duration: 'h' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'G4', syllable: 'Re', duration: 'q' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'G4', syllable: 'Re', duration: 'q' },
      { pitch: 'F4', syllable: 'Do', duration: 'h' },
      { pitch: 'G4', syllable: 'Re', duration: 'h' },
      { pitch: 'A4', syllable: 'Mi', duration: 'q' },
      { pitch: 'G4', syllable: 'Re', duration: 'q' },
      { pitch: 'F4', syllable: 'Do', duration: 'h' }
    ];
  }
  
  return pattern;
};

const Lvl1SolfegeID2 = ({ onClose }) => {
  const config = {
    title: 'Level 1 Solfege Identification',
    subtitle: 'Solfege: Do-Sol • Rhythm: Quarter and Half Notes • Key: F Major',
    syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol'],
    keySignature: 'F', // This adds the F Major key signature (1 flat)
    timeSignature: '4/4',
    noteMap: {
      'F4': 'f/4', 
      'G4': 'g/4', 
      'A4': 'a/4', 
      'Bb4': 'bb/4', 
      'C5': 'c/5'
    },
    audioFiles: {
      'Do': '/teacher_dashboard/sounds/doFmajor.mp3',
      'Re': '/teacher_dashboard/sounds/reFmajor.mp3',
      'Mi': '/teacher_dashboard/sounds/miFmajor.mp3',
      'Fa': '/teacher_dashboard/sounds/faFmajor.mp3',
      'Sol': '/teacher_dashboard/sounds/solFmajor.mp3'
    },
    generatePattern: generatePatternF,
    getLinePosition: (pitch, stave) => {
      switch(pitch) {
        case 'f/4': return stave.getYForLine(3.5);
        case 'g/4': return stave.getYForLine(3);
        case 'a/4': return stave.getYForLine(2.5);
        case 'bb/4': return stave.getYForLine(2);
        case 'c/5': return stave.getYForLine(1.5);
        default: return stave.getYForLine(3);
      }
    },
    bpm: 120
  };

  return <SolfegeIDTemplate config={config} onClose={onClose} />;
};

export default Lvl1SolfegeID2;