// /src/components/exercises/2.listening_skills/abeginner/BeginnerSolfegeListening2.jsx - Updated to use modular components
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration
const EXERCISE_CONFIG = {
  id: 'listening2',
  title: 'Listening Skills: Do-Re-Mi',
  totalQuestions: 8,
  notes: ['C4', 'D4', 'E4'],
  syllables: ['Do', 'Re', 'Mi'],
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re',
    'E4': 'Mi'
  }
};

// Generate stepwise pattern - only adjacent notes allowed, always start on Do
const generateStepwisePattern = () => {
  const pattern = [];
  const noteOrder = ['C4', 'D4', 'E4']; // Do, Re, Mi in order
  const syllableOrder = ['Do', 'Re', 'Mi'];
  
  // Always start on Do (index 0)
  let currentNoteIndex = 0;
  
  for (let i = 0; i < 4; i++) { // 4-note patterns
    // Add current note to pattern
    pattern.push({
      pitch: noteOrder[currentNoteIndex],
      syllable: syllableOrder[currentNoteIndex]
    });
    
    // For next note, only move to adjacent notes (step up or down)
    if (i < 3) {
      const possibleMoves = [];
      
      // Can go down one step (if not at bottom)
      if (currentNoteIndex > 0) {
        possibleMoves.push(currentNoteIndex - 1);
      }
      
      // Can go up one step (if not at top)
      if (currentNoteIndex < noteOrder.length - 1) {
        possibleMoves.push(currentNoteIndex + 1);
      }
      
      // Can stay on same note
      possibleMoves.push(currentNoteIndex);
      
      // Choose random adjacent move
      currentNoteIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
  }
  
  return pattern;
};

// Generate 4 different 4-note stepwise patterns
const generatePatternSet = () => {
  const patterns = [];
  const usedPatterns = new Set();
  
  // Generate 4 unique patterns (A, B, C, D)
  while (patterns.length < 4) {
    const pattern = generateStepwisePattern();
    
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
const BeginnerSolfegeListening2 = ({ onClose }) => {
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

export default BeginnerSolfegeListening2;