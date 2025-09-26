// /src/components/exercises/2.listening_skills/alevel2/Lvl2SolfegeListening1.jsx - CORRECTED WITH LA
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-La range (Level 2)
const EXERCISE_CONFIG = {
  id: 'lvl2_solfege_listening1',
  title: 'Level 2 Solfege Listening #1',
  totalQuestions: 8,
  notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'], // Added A4 for La
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'], // Added La
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re',
    'E4': 'Mi',
    'F4': 'Fa',
    'G4': 'Sol',
    'A4': 'La' // Added La mapping
  }
};

// Question Bank - YOUR ORIGINAL 2 QUESTIONS with same correct patterns, randomized positions
const QUESTION_BANK = [
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'A4', syllable: 'La', duration: 'q' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' }
      ]
    ],
    // REMOVED: correctAnswer - now completely random (A, B, C, or D)
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' }, // FIXED: was 'Fa', now 'Re'
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' }, // FIXED: was 'D4', 'Fa', now 'F4', 'Fa'
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true }   
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' }, // FIXED: was 'D4', 'Fa', now 'F4', 'Fa'
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: null, syllable: null, duration: 'q', isRest: true } 
      ]
    ],
    // REMOVED: correctAnswer - now completely random (A, B, C, or D)
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

// Pattern generation function - CACHE BUSTER v2.1
const generatePatternSet = () => {
  console.log('🔄 CACHE BUSTER: generatePatternSet v2.1 loaded successfully!');
  questionCounter++;
  
  const currentQuestion = QUESTION_BANK[currentQuestionIndex % QUESTION_BANK.length];
  
  console.log(`🎵 QUESTION ${(currentQuestionIndex % QUESTION_BANK.length) + 1} | Overall Question ${questionCounter}`);
  console.log(`📝 Current Question Index: ${currentQuestionIndex % QUESTION_BANK.length}`);
  
  // FIXED: Randomly choose which pattern will be correct (0, 1, 2, or 3)
  const randomCorrectIndex = Math.floor(Math.random() * 4);
  console.log(`🎯 Randomly Selected Correct Answer: Pattern ${['A', 'B', 'C', 'D'][randomCorrectIndex]}`);
  
  const patterns = currentQuestion.patterns.map(pattern => pattern.map(note => ({ ...note })));
  
  // FIXED: Make sure the correct pattern is the one that will be played
  const correctPattern = [...patterns[randomCorrectIndex]];
  const correctLetter = ['A', 'B', 'C', 'D'][randomCorrectIndex];

  // DEBUG: Log what pattern will be played
  const patternDescription = correctPattern.map(note => 
    note.isRest ? 'REST' : note.syllable
  ).join('-');
  console.log(`🎵 Pattern that will be PLAYED: ${patternDescription}`);
  console.log(`✅ Correct Answer: ${correctLetter} (Position ${randomCorrectIndex})`);
  console.log(`🎼 Correct pattern length: ${correctPattern.length} notes`);
  
  currentQuestionIndex++;

  return {
    patterns: patterns, // Keep original order A, B, C, D
    correctAnswerIndex: randomCorrectIndex,
    correctPattern, // This is what gets played - should match the random selection
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
const Lvl2SolfegeListening1 = ({ onClose }) => {
  React.useEffect(() => {
    resetExerciseSequence();
  }, []);

  return (
    <ListenSolfegeIDTemplate
      exerciseConfig={EXERCISE_CONFIG}
      generatePatternSet={generatePatternSet}
      onClose={onClose}
      patternLength={8} // FIXED: Changed from 6 to 8 to match actual pattern lengths
      useVexFlow={true}
    />
  );
};

export default Lvl2SolfegeListening1;