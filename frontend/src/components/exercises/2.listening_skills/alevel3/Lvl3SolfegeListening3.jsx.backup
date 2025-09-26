// /src/components/exercises/2.listening_skills/alevel3/Lvl3SolfegeListening3.jsx - G MAJOR VERSION
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-La range in G Major (Level 3)
const EXERCISE_CONFIG = {
  id: 'lvl3_solfege_listening3',
  title: 'Level 3 Solfege Listening #3',
  totalQuestions: 6,
  notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'], // G Major: Do-La range
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'],
  noteSyllableMap: {
    'G4': 'Do',
    'A4': 'Re',
    'B4': 'Mi',
    'C5': 'Fa',
    'D5': 'Sol',
    'E5': 'La'
  },
  keySignature: 'G' // Key signature with one sharp (F#)
};

// Question Bank - All patterns transposed to G Major
const QUESTION_BANK = [
  // Question 1 - Original patterns with Do-Sol focus (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },
  
  // Question 2 - La emphasis with stepwise patterns (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 3 - Skip patterns with syncopation (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 4 - Repeated patterns with variations (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
    ]
  },

  // Question 5 - Scalar passages with rhythm variations (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Fa', duration: 'h' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Mi', duration: 'h' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Fa', duration: 'h' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'C5', syllable: 'Fa', duration: 'h' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
      ],
    ]
  },

  // Question 6 - Mixed intervals and leaps (G Major)
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'e' },
        { pitch: 'D5', syllable: 'Sol', duration: 'e' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'e' },
        { pitch: 'B4', syllable: 'Mi', duration: 'e' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
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

// Pattern generation function - UPDATED for random correct answers
const generatePatternSet = () => {
  questionCounter++;
  
  // Use modulo to cycle through the 6 questions
  const questionIndex = (questionCounter - 1) % QUESTION_BANK.length;
  const currentQuestion = QUESTION_BANK[questionIndex];
  
  console.log(`🎵 QUESTION ${questionIndex + 1} | Overall Question ${questionCounter}`);
  console.log(`📝 Current Question Index: ${questionIndex}`);
  
  // Create copies of all patterns
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
const Lvl3SolfegeListening3 = ({ onClose }) => {
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

export default Lvl3SolfegeListening3;