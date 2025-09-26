// /src/components/exercises/2.listening_skills/alevel2/Lvl2SolfegeListening3.jsx - G MAJOR VERSION
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-La range (Level 2) in G Major
const EXERCISE_CONFIG = {
  id: 'lvl2_solfege_listening3',
  title: 'Level 2 Solfege Listening #3 (G Major)',
  totalQuestions: 6,
  notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'], // G Major scale: Do-La
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'],
  noteSyllableMap: {
    'G4': 'Do',   // G is Do
    'A4': 'Re',   // A is Re
    'B4': 'Mi',   // B is Mi
    'C5': 'Fa',   // C is Fa
    'D5': 'Sol',  // D is Sol
    'E5': 'La'    // E is La
  },
  keySignature: 'G' // One sharp (F#) for G Major
};

// Question Bank - All patterns transposed to G Major
const QUESTION_BANK = [
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' }
      ]
    ]
  },
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true } 
      ]
    ]
  },
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' }
      ],
    ]
  },
  // NEW PATTERN SET 4 - La-focused descending patterns in G Major
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },   
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'h' }
      ]
    ]
  },
  // NEW PATTERN SET 5 - Skip patterns with La in G Major
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: 'C5', syllable: 'Fa', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: 'C5', syllable: 'Fa', duration: 'h' },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'h' },
        { pitch: 'E5', syllable: 'La', duration: 'h' },
      ],
    ]
  },
  // NEW PATTERN SET 6 - Rhythmic variations with rests in G Major
  {
    patterns: [
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'E5', syllable: 'La', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' }
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },
      ],
      [
        { pitch: 'G4', syllable: 'Do', duration: 'q' },
        { pitch: 'A4', syllable: 'Re', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true },
        { pitch: 'B4', syllable: 'Mi', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
        { pitch: 'D5', syllable: 'Sol', duration: 'q' },
        { pitch: 'C5', syllable: 'Fa', duration: 'q' },
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
let currentQuestionIndex = Math.floor(Math.random() * QUESTION_BANK.length);
let questionCounter = 0;

// Pattern generation function - UPDATED for random correct answers
const generatePatternSet = () => {
  questionCounter++;
  
  const currentQuestion = QUESTION_BANK[currentQuestionIndex % QUESTION_BANK.length];
  
  console.log(`🎵 QUESTION ${(currentQuestionIndex % QUESTION_BANK.length) + 1} | Overall Question ${questionCounter}`);
  console.log(`📝 Current Question Index: ${currentQuestionIndex % QUESTION_BANK.length}`);
  
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
  
  currentQuestionIndex++;

  return {
    patterns: shuffledPatterns,
    correctAnswerIndex: randomCorrectIndex,
    correctPattern,
    correctLetter
  };
};

// Reset function
const resetExerciseSequence = () => {
  currentQuestionIndex = Math.floor(Math.random() * QUESTION_BANK.length);
  questionCounter = 0;
  console.log(`🔄 Exercise sequence reset. Starting with Question ${(currentQuestionIndex % QUESTION_BANK.length) + 1}`);
};

// Main Exercise Component
const Lvl2SolfegeListening3 = ({ onClose }) => {
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

export default Lvl2SolfegeListening3;