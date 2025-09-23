// /src/components/exercises/2.listening_skills/alevel4/Lvl4SolfegeListening2.jsx - TRANSPOSED UP A PERFECT FOURTH (F MAJOR)
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-Ti range (Level 4) - TRANSPOSED UP A PERFECT FOURTH
const EXERCISE_CONFIG = {
  id: 'lvl4_solfege_listening2',
  title: 'Level 4 Solfege Listening #2',
  totalQuestions: 6,
  notes: ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'], // Do-Ti range extended to high Do (F major)
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'],
  keySignature: 'F', // F major key signature (one flat - Bb)
  noteSyllableMap: {
    'F4': 'Do',
    'G4': 'Re',
    'A4': 'Mi',
    'Bb4': 'Fa',
    'C5': 'Sol',
    'D5': 'La',
    'E5': 'Ti',
    'F5': 'Do'
  }
};

// Question Bank - Now with 6 different question sets - ALL NOTES TRANSPOSED UP A PERFECT FOURTH
const QUESTION_BANK = [
  // Question 1 - Original patterns with Ti and high Do emphasis
  {
    patterns: [
      // Pattern A - Original: Do, Mi, Sol, La, Ti, Do, Ti, La, rest
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern B - Variation: Do, Mi, Sol, La, Ti, Do, Ti, Do, rest
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern C - Variation: Do, Re, Mi, Fa, Sol, La, Ti, Do, rest
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      // Pattern D - Variation: Do, Re, Mi, Fa, Sol, La, Sol, Fa, rest
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 2 - Scalar patterns with Ti resolution
  {
    patterns: [
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 3 - Arpeggiated patterns with Ti emphasis
  {
    patterns: [
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
      ],
    ]
  },

  // Question 4 - Leading tone patterns with Ti-Do resolution
  {
    patterns: [
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 5 - Syncopated patterns with extended range
  {
    patterns: [
      [
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'e' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'D5', syllable: 'La', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'e' },
        { pitch: 'E5', syllable: 'Ti', duration: 'e' },
        { pitch: 'F5', syllable: 'Do', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'q' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'A4', syllable: 'Mi', duration: 'e' },
        { pitch: 'G4', syllable: 'Re', duration: 'e' },
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
      ],
    ]
  },

  // Question 6 - Complex melodic patterns with full range
  {
    patterns: [
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'F5', syllable: 'Do', duration: 'h' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'D5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'Ti', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'h' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'La', duration: 'h' },
      ],
      [
        { pitch: 'F4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Re', duration: 'q' },
        { pitch: 'A4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'Bb4', syllable: 'Fa', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Sol', duration: 'h' },
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
  
  console.log(`🎵 QUESTION ${questionIndex + 1} | Overall Question ${questionCounter}`);
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
  console.log(`🎵 Correct pattern: ${patternDescription}`);

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
const Lvl4SolfegeListening2 = ({ onClose }) => {
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

export default Lvl4SolfegeListening2;