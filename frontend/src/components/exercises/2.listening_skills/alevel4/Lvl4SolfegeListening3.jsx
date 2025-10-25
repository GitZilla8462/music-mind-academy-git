// /src/components/exercises/2.listening_skills/alevel4/Lvl4SolfegeListening3.jsx - TRANSPOSED UP A PERFECT FIFTH (G MAJOR)
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-Ti range (Level 4) - TRANSPOSED UP A PERFECT FIFTH
const EXERCISE_CONFIG = {
  id: 'lvl4_solfege_listening3',
  title: 'Level 4 Solfege Listening #3',
  totalQuestions: 6,
  notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'], // Do-Ti range extended to high Do (G major)
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'],
  keySignature: 'G', // G major key signature (one sharp - F#)
  noteSyllableMap: {
    'G4': 'Do',
    'A4': 'Re',
    'B4': 'Mi',
    'C5': 'Fa',
    'D5': 'Sol',
    'E5': 'La',
    'F#5': 'Ti',
    'G5': 'Do'
  }
};

// Question Bank - Now with 6 different question sets - ALL NOTES TRANSPOSED UP A PERFECT FIFTH
const QUESTION_BANK = [
  // Question 1 - Original patterns with Ti and high Do emphasis
  {
    patterns: [
      // Pattern A - Original: Do, Mi, Sol, La, Ti, Do, Ti, La, rest
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern B - Variation: Do, Mi, Sol, La, Ti, Do, Ti, Do, rest
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern C - Variation: Do, Re, Mi, Fa, Sol, La, Ti, Do, rest
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern D - Variation: Do, Re, Mi, Fa, Sol, La, Sol, Fa, rest
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 2 - Scalar patterns with Ti resolution
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 3 - Arpeggiated patterns with Ti emphasis
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
      ],
    ]
  },

  // Question 4 - Leading tone patterns with Ti-Do resolution
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 5 - Syncopated patterns with extended range
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },

      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'e' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'e' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'q' },

      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
      ],
    ]
  },

  // Question 6 - Complex melodic patterns with full range
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'G5', syllable: 'Do', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'F#5', syllable: 'Ti', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
      ],
    ]
  }
];

// Function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Exercise state management
let currentQuestionIndex = 0;
let questionCounter = 0;

// Pattern generation function - UPDATED for 6 questions with random correct answers
const generatePatternSet = () => {
  questionCounter++;
  
  // Use modulo to cycle through the 6 questions
  const questionIndex = (questionCounter - 1) % QUESTION_BANK.length;
  const currentQuestion = QUESTION_BANK[questionIndex];
  
  console.log(`♪ QUESTION ${questionIndex + 1} | Overall Question ${questionCounter}`);
  console.log(`📝 Current Question Index: ${questionIndex}`);
  
  // Create copies of all four patterns
  const patterns = currentQuestion.patterns.map(pattern => pattern.map(note => ({ ...note })));
  
  // Shuffle the patterns randomly
  const shuffledPatterns = shuffleArray(patterns);
  
  // Randomly select which position will be the correct answer (0, 1, 2, or 3)
  const randomCorrectIndex = Math.floor(Math.random() * 4);
  const correctLetter = ['A', 'B', 'C', 'D'][randomCorrectIndex];
  
  // The correct pattern is whatever ended up in the randomly selected position
  const correctPattern = [...shuffledPatterns[randomCorrectIndex]];

  console.log(`🎲 Randomly Selected Correct Answer: ${correctLetter} (Position ${randomCorrectIndex})`);
  console.log(`🎼 Correct pattern length: ${correctPattern.length} notes`);
  
  // Log the correct pattern for debugging
  const patternDescription = correctPattern
    .filter(note => !note.isRest)
    .map(note => note.syllable)
    .join(', ');
  console.log(`♪ Correct pattern: ${patternDescription}`);

  return {
    patterns: shuffledPatterns,
    correctAnswerIndex: randomCorrectIndex,
    correctPattern,
    correctLetter
  };
};

// Reset function
const resetExerciseSequence = () => {
  currentQuestionIndex = 0;
  questionCounter = 0;
  console.log(`🔄 Exercise sequence reset. Starting with Question 1`);
};

// Main Exercise Component
const Lvl4SolfegeListening3 = ({ onClose }) => {
  React.useEffect(() => {
    resetExerciseSequence();
  }, []);

  return (
    <ListenSolfegeIDTemplate
      exerciseConfig={EXERCISE_CONFIG}
      generatePatternSet={generatePatternSet}
      onClose={onClose}
      patternLength={8}
      useVexFlow={true}
    />
  );
};

export default Lvl4SolfegeListening3;