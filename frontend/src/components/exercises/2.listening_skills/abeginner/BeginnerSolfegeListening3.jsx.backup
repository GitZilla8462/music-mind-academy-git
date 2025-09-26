// /src/components/exercises/2.listening_skills/abeginner/BeginnerSolfegeListening3.jsx - Updated title to Do-Fa
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Updated title
const EXERCISE_CONFIG = {
  id: 'listening3',
  title: 'Listening Skills: Do-Fa', // Changed from "Do-Re-Mi (Extended)"
  totalQuestions: 8,
  notes: ['C4', 'D4', 'E4', 'F4'], // Added F4 for Do-Fa range
  syllables: ['Do', 'Re', 'Mi', 'Fa'], // Added Fa
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re',
    'E4': 'Mi',
    'F4': 'Fa' // Added Fa mapping
  }
};

// Generate stepwise pattern - now includes Do through Fa, always start on Do, 8 notes
const generateStepwisePattern = () => {
  const pattern = [];
  const noteOrder = ['C4', 'D4', 'E4', 'F4']; // Do, Re, Mi, Fa in order
  const syllableOrder = ['Do', 'Re', 'Mi', 'Fa'];
  
  // Always start on Do (index 0)
  let currentNoteIndex = 0;
  
  for (let i = 0; i < 8; i++) { // 8-note patterns (two measures)
    // Add current note to pattern
    pattern.push({
      pitch: noteOrder[currentNoteIndex],
      syllable: syllableOrder[currentNoteIndex]
    });
    
    // For next note, only move to adjacent notes (step up or down)
    if (i < 7) {
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

// Generate 4 different 8-note stepwise patterns
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
const BeginnerSolfegeListening3 = ({ onClose }) => {
  return (
    <ListenSolfegeIDTemplate
      exerciseConfig={EXERCISE_CONFIG}
      generatePatternSet={generatePatternSet}
      onClose={onClose}
      patternLength={8} // Two measures
      useVexFlow={true}
    />
  );
};

export default BeginnerSolfegeListening3;