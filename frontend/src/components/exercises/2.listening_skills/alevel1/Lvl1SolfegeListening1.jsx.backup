// /src/components/exercises/2.listening_skills/alevel1/Lvl1SolfegeListening1Fixed.jsx - SYNTAX FIXED
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-Sol range
const EXERCISE_CONFIG = {
  id: 'lvl1_solfege_listening1_fixed',
  title: 'Level 1 Solfege Listening #1',
  totalQuestions: 8,
  notes: ['C4', 'D4', 'E4', 'F4', 'G4'],
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol'],
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re',
    'E4': 'Mi',
    'F4': 'Fa',
    'G4': 'Sol'
  }
};

// 6 Question Bank with corrected pitch-syllable mapping
const QUESTION_BANK = [
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' }
      ]
    ],
    correctAnswer: 0
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' }
      ]
    ],
    correctAnswer: 1
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' }
      ]
    ],
    correctAnswer: 2
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ]
    ],
    correctAnswer: 3
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'h' }
      ]
    ],
    correctAnswer: 0
  },
  {
    patterns: [
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'q' },
        { pitch: 'G4', syllable: 'Sol', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'F4', syllable: 'Fa', duration: 'h' }
      ],
      [
        { pitch: 'C4', syllable: 'Do', duration: 'h' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'C4', syllable: 'Do', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'q' },
        { pitch: 'E4', syllable: 'Mi', duration: 'q' },
        { pitch: 'D4', syllable: 'Re', duration: 'h' }
      ]
    ],
    correctAnswer: 1
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

// Pattern generation function
const generatePatternSet = () => {
  questionCounter++;
  
  const currentQuestion = QUESTION_BANK[currentQuestionIndex % QUESTION_BANK.length];
  
  console.log(`🎵 QUESTION ${(currentQuestionIndex % QUESTION_BANK.length) + 1} | Overall Question ${questionCounter}`);
  console.log(`📝 Current Question Index: ${currentQuestionIndex % QUESTION_BANK.length}`);
  console.log(`🎯 Original Correct Answer: Pattern ${['A', 'B', 'C', 'D'][currentQuestion.correctAnswer]}`);
  
  const patterns = currentQuestion.patterns.map(pattern => pattern.map(note => ({ ...note })));
  
  const positionMapping = [0, 1, 2, 3];
  const shuffledPositions = shuffleArray(positionMapping);
  
  const originalCorrectIndex = currentQuestion.correctAnswer;
  const newCorrectIndex = shuffledPositions.indexOf(originalCorrectIndex);
  
  const shuffledPatterns = shuffledPositions.map(originalIndex => patterns[originalIndex]);
  
  const correctPattern = [...shuffledPatterns[newCorrectIndex]];
  const correctLetter = ['A', 'B', 'C', 'D'][newCorrectIndex];

  console.log(`✅ Shuffled Correct Answer: ${correctLetter} (Position ${newCorrectIndex})`);
  console.log(`📍 Pattern Shuffle: Original positions ${positionMapping} → Shuffled to ${shuffledPositions}`);
  console.log(`🔀 Original Pattern ${['A', 'B', 'C', 'D'][originalCorrectIndex]} is now in position ${correctLetter}`);
  console.log(`🎼 Correct pattern length: ${correctPattern.length} notes`);
  
  currentQuestionIndex++;

  return {
    patterns: shuffledPatterns,
    correctAnswerIndex: newCorrectIndex,
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
const Lvl1SolfegeListening1Fixed = ({ onClose }) => {
  React.useEffect(() => {
    resetExerciseSequence();
  }, []);

  return (
    <ListenSolfegeIDTemplate
      exerciseConfig={EXERCISE_CONFIG}
      generatePatternSet={generatePatternSet}
      onClose={onClose}
      patternLength={6}
      useVexFlow={true}
    />
  );
};

export default Lvl1SolfegeListening1Fixed;