// /src/components/exercises/2.listening_skills/abeginner/BeginnerSolfegeListening1.jsx - Updated to use modular components
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration
const EXERCISE_CONFIG = {
  id: 'listening1',
  title: 'Listening Skills: Do-Re',
  totalQuestions: 8,
  notes: ['C4', 'D4'],
  syllables: ['Do', 'Re'],
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re'
  }
};

// Generate 4 different 4-note patterns
const generatePatternSet = () => {
  const patterns = [];
  const usedPatterns = new Set();
  
  // Generate 4 unique patterns (A, B, C, D)
  while (patterns.length < 4) {
    const pattern = [];
    for (let j = 0; j < 4; j++) {
      const randomNote = EXERCISE_CONFIG.notes[Math.floor(Math.random() * EXERCISE_CONFIG.notes.length)];
      pattern.push({
        pitch: randomNote,
        syllable: EXERCISE_CONFIG.noteSyllableMap[randomNote]
      });
    }
    
    // Create a string representation to check for duplicates
    const patternString = pattern.map(note => note.pitch).join('-');
    
    // Only add if this pattern is unique
    if (!usedPatterns.has(patternString)) {
      usedPatterns.add(patternString);
      patterns.push(pattern);
    }
  }
  
  // Choose one as the correct answer
  const correctAnswerIndex = Math.floor(Math.random() * 4);
  const correctPattern = [...patterns[correctAnswerIndex]];
  
  return {
    patterns,
    correctAnswerIndex,
    correctPattern,
    correctLetter: ['A', 'B', 'C', 'D'][correctAnswerIndex]
  };
};

// Main Exercise Component
const BeginnerSolfegeListening1 = ({ onClose }) => {
  return (
    <ListenSolfegeIDTemplate
      exerciseConfig={EXERCISE_CONFIG}
      generatePatternSet={generatePatternSet}
      onClose={onClose}
      patternLength={4}
      useVexFlow={true}
    />
  );
};

export default BeginnerSolfegeListening1;