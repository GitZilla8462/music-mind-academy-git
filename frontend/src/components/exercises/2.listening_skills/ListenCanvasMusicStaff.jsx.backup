// /src/components/exercises/2.listening_skills/ListenCanvasMusicStaff.jsx
import React from 'react';
import CanvasMusicStaff from '../1.solfege_identification/CanvasMusicStaff';

const ListenCanvasMusicStaff = ({ 
  pattern, 
  label, 
  isCorrect, 
  isSelected, 
  showResult, 
  exerciseComplete, 
  playingNoteIndex, 
  isPlaying,
  patternLength = 4
}) => {
  // Convert listening exercise pattern to solfege identification format
  const convertedPattern = pattern.map(note => ({
    ...note,
    type: note.type || 'note', // Ensure type is set
    duration: note.duration || 'q' // Default to quarter note
  }));

  // Create props that CanvasMusicStaff expects
  const canvasProps = {
    pattern: convertedPattern,
    currentNoteIndex: exerciseComplete ? -1 : (isPlaying ? playingNoteIndex : -1),
    isPlaying: isPlaying || false,
    completedNotes: exerciseComplete ? new Array(pattern.length).fill(true) : new Array(pattern.length).fill(false),
    incorrectNotes: new Array(pattern.length).fill(false),
    bpm: 68,
    exerciseComplete: exerciseComplete || false,
    syllables: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'], // Standard syllables
    onSelect: () => {}, // No selection needed for listening
    disabled: true, // Disable solfege buttons
    selectedAnswer: null,
    correctAnswer: null,
    showResult: false,
    config: {
      timeSignature: patternLength === 8 ? '4/4' : '4/4' // Could be configurable
    }
  };

  // Determine styling based on state
  let containerStyle = "relative bg-white rounded-lg border-2 transition-all duration-200";
  
  if (showResult) {
    if (isCorrect) {
      containerStyle += " border-green-500 shadow-green-200 shadow-lg";
    } else if (isSelected) {
      containerStyle += " border-red-500 shadow-red-200 shadow-lg";
    } else {
      containerStyle += " border-gray-300";
    }
  } else if (isSelected) {
    containerStyle += " border-blue-500 shadow-blue-200 shadow-lg";
  } else {
    containerStyle += " border-gray-300 hover:border-gray-400";
  }

  return (
    <div className={containerStyle} style={{ width: '320px', minHeight: '140px' }}>
      {/* Pattern Label */}
      <div 
        className={`absolute top-2 left-3 text-lg font-bold z-10 ${
          showResult && isCorrect 
            ? 'text-green-600' 
            : showResult && isSelected 
              ? 'text-red-600'
              : 'text-gray-700'
        }`}
      >
        {label}
      </div>

      {/* Main Canvas Music Staff */}
      <div className="p-2 pt-8">
        <CanvasMusicStaff {...canvasProps} />
      </div>

      {/* Solfege syllables display when exercise complete */}
      {exerciseComplete && (
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="text-xs font-bold text-green-600">
            {pattern.map(note => note.syllable).join(' - ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenCanvasMusicStaff;    