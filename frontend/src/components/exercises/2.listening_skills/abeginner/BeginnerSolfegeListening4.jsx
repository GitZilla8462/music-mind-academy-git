// /src/components/exercises/2.listening_skills/abeginner/BeginnerSolfegeListening4.jsx - Do-Sol
import React from 'react';
import ListenSolfegeIDTemplate from '../ListenSolfegeIDTemplate';

// Exercise Configuration - Do-Sol range
const EXERCISE_CONFIG = {
  id: 'listening4',
  title: 'Listening Skills: Do-Sol',
  totalQuestions: 8,
  notes: ['C4', 'D4', 'E4', 'F4', 'G4'], // Added G4 for Do-Sol range
  syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol'], // Added Sol
  noteSyllableMap: {
    'C4': 'Do',
    'D4': 'Re',
    'E4': 'Mi',
    'F4': 'Fa',
    'G4': 'Sol' // Added Sol mapping
  }
};

// Generate stepwise pattern - now includes Do through Sol, always start on Do, 8 notes
// Ensures Sol appears at least once in the pattern
const generateStepwisePattern = () => {
  const pattern = [];
  const noteOrder = ['C4', 'D4', 'E4', 'F4', 'G4']; // Do, Re, Mi, Fa, Sol in order
  const syllableOrder = ['Do', 'Re', 'Mi', 'Fa', 'Sol'];
  
  // Always start on Do (index 0)
  let currentNoteIndex = 0;
  let hasSol = false; // Track if Sol has been used
  
  for (let i = 0; i < 8; i++) { // 8-note patterns (two measures)
    // Add current note to pattern
    pattern.push({
      pitch: noteOrder[currentNoteIndex],
      syllable: syllableOrder[currentNoteIndex]
    });
    
    // Track if we've used Sol
    if (currentNoteIndex === 4) { // Sol is at index 4
      hasSol = true;
    }
    
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
      
      // Force movement toward Sol if we haven't used it and we're in the later part of the pattern
      if (!hasSol && i >= 4) {
        // If we're not at Sol yet and we're past halfway, bias toward moving up
        if (currentNoteIndex < 4) {
          // Remove staying in place and moving down to encourage upward movement
          const upwardMoves = possibleMoves.filter(move => move > currentNoteIndex);
          if (upwardMoves.length > 0) {
            possibleMoves.length = 0; // Clear array
            possibleMoves.push(...upwardMoves);
          }
        }
      }
      
      // Choose random adjacent move
      currentNoteIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
  }
  
  // If Sol still hasn't appeared, force it into one of the last few positions
  if (!hasSol) {
    // Find a position where we can insert Sol with stepwise motion
    for (let i = 6; i >= 4; i--) { // Check positions 6, 5, 4 (later in the pattern)
      const prevNote = pattern[i - 1];
      const nextNote = i < 7 ? pattern[i + 1] : null;
      
      const prevIndex = noteOrder.indexOf(prevNote.pitch);
      const nextIndex = nextNote ? noteOrder.indexOf(nextNote.pitch) : null;
      
      // Check if Sol (index 4) can fit stepwise between previous and next notes
      const canUseSol = (
        Math.abs(prevIndex - 4) <= 1 && // Previous note is adjacent to Sol
        (nextIndex === null || Math.abs(nextIndex - 4) <= 1) // Next note is adjacent to Sol or doesn't exist
      );
      
      if (canUseSol) {
        pattern[i] = {
          pitch: noteOrder[4], // Sol
          syllable: syllableOrder[4]
        };
        break;
      }
    }
  }
  
  return pattern;
};

// Generate 4 different 8-note stepwise patterns
// Ensures at least one pattern (including the correct answer) contains Sol
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
  
  // Ensure the correct answer contains Sol
  const correctHasSol = correctPattern.some(note => note.pitch === 'G4');
  if (!correctHasSol) {
    // Force Sol into the correct pattern
    for (let i = 6; i >= 4; i--) { // Check positions 6, 5, 4
      const prevNote = correctPattern[i - 1];
      const nextNote = i < 7 ? correctPattern[i + 1] : null;
      
      const prevIndex = ['C4', 'D4', 'E4', 'F4', 'G4'].indexOf(prevNote.pitch);
      const nextIndex = nextNote ? ['C4', 'D4', 'E4', 'F4', 'G4'].indexOf(nextNote.pitch) : null;
      
      // Check if Sol (index 4) can fit stepwise
      const canUseSol = (
        Math.abs(prevIndex - 4) <= 1 && 
        (nextIndex === null || Math.abs(nextIndex - 4) <= 1)
      );
      
      if (canUseSol) {
        correctPattern[i] = {
          pitch: 'G4',
          syllable: 'Sol'
        };
        break;
      }
    }
    // Update the patterns array with the modified correct pattern
    patterns[correctAnswerIndex] = correctPattern;
  }
  
  return {
    patterns,
    correctAnswerIndex,
    correctPattern,
    correctLetter: ['A', 'B', 'C', 'D'][correctAnswerIndex]
  };
};

// Main Exercise Component
const BeginnerSolfegeListening4 = ({ onClose }) => {
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

export default BeginnerSolfegeListening4;