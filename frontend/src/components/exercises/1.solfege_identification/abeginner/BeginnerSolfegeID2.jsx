// /src/components/exercises/SolfegeExerciseTwo.jsx - Do-Re-Mi Exercise
import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, ArrowLeft, RotateCcw, Volume2, Star, Trophy, CheckCircle } from 'lucide-react';
import VexFlowStaff from '../VexFlowStaff';

// Exercise 2: Do-Re-Mi Configuration
const EXERCISE_CONFIG = {
  id: 2,
  title: 'Do-Re-Mi',
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
const generatePattern = () => {
  const pattern = [];
  const noteOrder = ['C4', 'D4', 'E4']; // Do, Re, Mi,  in order
  const syllableOrder = ['Do', 'Re', 'Mi'];
  
  // Always start on Do (index 0)
  let currentNoteIndex = 0;
  
  for (let i = 0; i < EXERCISE_CONFIG.totalQuestions; i++) {
    // Add current note to pattern
    pattern.push({
      pitch: noteOrder[currentNoteIndex],
      syllable: syllableOrder[currentNoteIndex]
    });
    
    // For next note, only move to adjacent notes (step up or down)
    if (i < EXERCISE_CONFIG.totalQuestions - 1) {
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

// Progress Bar Component
const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm font-medium text-gray-700">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Solfege Buttons Component
const SolfegeButtons = ({ syllables, onSelect, disabled, selectedAnswer, correctAnswer, showResult }) => {
  return (
    <div className="flex justify-center space-x-6 mb-8">
      {syllables.map((syllable) => {
        let buttonStyle = "bg-white text-gray-800 border-gray-300 hover:bg-gray-50";
        
        if (showResult) {
          if (syllable === correctAnswer) {
            buttonStyle = "bg-green-500 text-white border-green-600";
          } else if (syllable === selectedAnswer && syllable !== correctAnswer) {
            buttonStyle = "bg-red-500 text-white border-red-600";
          }
        }
        
        return (
          <button
            key={syllable}
            onClick={() => onSelect(syllable)}
            disabled={disabled}
            className={`px-8 py-4 text-2xl font-bold border-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${buttonStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {syllable}
          </button>
        );
      })}
    </div>
  );
};

// Completion Page Component
const CompletionPage = ({ score, total, onTryAgain, onClose }) => {
  const percentage = Math.round((score / total) * 100);
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;
  
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        {isExcellent ? (
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
        ) : isGood ? (
          <Star className="w-24 h-24 text-blue-500 mx-auto" />
        ) : (
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        )}
        
        <h1 className="text-4xl font-bold text-gray-800">
          {isExcellent ? 'Excellent!' : isGood ? 'Well Done!' : 'Good Try!'}
        </h1>
        
        <div className="space-y-2">
          <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
          <div className="text-xl text-gray-600">
            {score} out of {total} correct
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Exercise Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Exercise:</span>
            <span className="font-medium">Do-Re-Mi Identification</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Questions:</span>
            <span className="font-medium">{total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Correct Answers:</span>
            <span className="font-medium text-green-600">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Incorrect Answers:</span>
            <span className="font-medium text-red-600">{total - score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accuracy:</span>
            <span className="font-medium">{percentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onTryAgain}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Exercise Component
const SolfegeExerciseTwo = ({ onClose }) => {
  const [synth, setSynth] = useState(null);
  const [solfegeAudio, setSolfegeAudio] = useState(null);
  const [pattern, setPattern] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [completedNotes, setCompletedNotes] = useState(new Array(8).fill(false));
  const [incorrectNotes, setIncorrectNotes] = useState(new Array(8).fill(false));
  const [playingFullPattern, setPlayingFullPattern] = useState(false);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(-1);

  // Initialize
  useEffect(() => {
    const initSynth = async () => {
      await Tone.start();
      // Create a nice piano-like sound
      const newSynth = new Tone.Synth({
        oscillator: { 
          type: "triangle",
          harmonicity: 2
        },
        envelope: { 
          attack: 0.02, 
          decay: 0.3, 
          sustain: 0.2, 
          release: 2 
        },
        filter: {
          type: "lowpass",
          frequency: 2000,
          rolloff: -12
        }
      }).toDestination();
      
      // Add some reverb for a nicer sound
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.3
      }).toDestination();
      
      newSynth.connect(reverb);
      setSynth(newSynth);
    };

    // Initialize vocal audio samples with better debugging
    const initVocalAudio = async () => {
      try {
        console.log('🎵 Initializing vocal audio...');
        
        const audio = {
          'Do': new Audio('/teacher_dashboard/sounds/do.mp3'),
          'Re': new Audio('/teacher_dashboard/sounds/re.mp3'),
          'Mi': new Audio('/teacher_dashboard/sounds/mi.mp3') // NEW: Mi audio file
        };
        
        // Test each audio file with detailed logging
        for (const [key, audioFile] of Object.entries(audio)) {
          audioFile.preload = 'auto';
          audioFile.volume = 0.8;
          
          audioFile.onloadeddata = () => {
            console.log(`✅ ${key} audio loaded successfully`);
          };
          
          audioFile.onerror = (e) => {
            console.log(`❌ ${key} audio failed to load:`, audioFile.src);
          };
          
          audioFile.oncanplaythrough = () => {
            console.log(`✅ ${key} audio ready to play`);
          };
        }
        
        setSolfegeAudio(audio);
        console.log('🎵 Vocal audio initialization complete');
      } catch (error) {
        console.log('❌ Vocal audio initialization failed:', error);
      }
    };

    initSynth();
    initVocalAudio();
    setPattern(generatePattern());
    
    return () => {
      if (synth) {
        synth.dispose();
      }
    };
  }, []);

  // Play current note
  const playCurrentNote = useCallback(() => {
    if (synth && pattern.length > 0 && currentIndex < pattern.length) {
      setIsPlaying(true);
      const currentNote = pattern[currentIndex];
      synth.triggerAttackRelease(currentNote.pitch, "4n");
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 600);
    }
  }, [synth, pattern, currentIndex]);

  // Play full pattern with vocals instead of synth
  const playFullPattern = useCallback(() => {
    if ((solfegeAudio || synth) && pattern.length > 0) {
      setPlayingFullPattern(true);
      setCurrentPlaybackIndex(-1);
      
      pattern.forEach((noteData, index) => {
        setTimeout(() => {
          setCurrentPlaybackIndex(index);
          
          // Use vocal audio if available, otherwise fallback to synth
          if (solfegeAudio && solfegeAudio[noteData.syllable]) {
            solfegeAudio[noteData.syllable].currentTime = 0;
            solfegeAudio[noteData.syllable].play().catch(() => {
              // Fallback to synth if vocal fails
              if (synth) {
                synth.triggerAttackRelease(noteData.pitch, "4n");
              }
            });
          } else if (synth) {
            synth.triggerAttackRelease(noteData.pitch, "4n");
          }
          
          if (index === pattern.length - 1) {
            setTimeout(() => {
              setPlayingFullPattern(false);
              setCurrentPlaybackIndex(-1);
              setExerciseComplete(true);
            }, 600);
          }
        }, index * 800);
      });
    }
  }, [synth, pattern, solfegeAudio]);

  // Handle answer selection with better audio handling
  const handleAnswerSelect = async (selectedSyllable) => {
    if (showResult || exerciseComplete || playingFullPattern) return;
    
    const currentNote = pattern[currentIndex];
    const isCorrect = selectedSyllable === currentNote.syllable;
    
    console.log(`🔘 Button clicked: ${selectedSyllable}`);
    
    // Play the vocal solfege when button is clicked
    if (solfegeAudio && solfegeAudio[selectedSyllable]) {
      try {
        console.log(`🎵 Attempting to play ${selectedSyllable} vocal...`);
        
        // Reset and play the vocal sample
        solfegeAudio[selectedSyllable].currentTime = 0;
        
        const playPromise = solfegeAudio[selectedSyllable].play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log(`✅ ${selectedSyllable} vocal played successfully`);
        }
      } catch (error) {
        console.log(`❌ Vocal audio failed for ${selectedSyllable}:`, error.message);
        // Fallback to piano sound if vocal fails
        if (synth) {
          console.log('🎹 Using piano fallback');
          synth.triggerAttackRelease(currentNote.pitch, "4n");
        }
      }
    } else {
      console.log('❌ No vocal audio available, using piano');
      // Fallback to piano if no vocal audio
      if (synth) {
        synth.triggerAttackRelease(currentNote.pitch, "4n");
      }
    }
    
    setSelectedAnswer(selectedSyllable);
    setShowResult(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCompletedNotes(prev => {
        const newCompleted = [...prev];
        newCompleted[currentIndex] = true;
        return newCompleted;
      });
    } else {
      setIncorrectNotes(prev => {
        const newIncorrect = [...prev];
        newIncorrect[currentIndex] = true;
        return newIncorrect;
      });
    }
    
    // Move to next question after delay (faster for correct answers)
    setTimeout(() => {
      if (currentIndex + 1 >= EXERCISE_CONFIG.totalQuestions) {
        setTimeout(() => {
          playFullPattern();
        }, 1000);
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      }
    }, isCorrect ? 800 : 1500); // 800ms for correct, 1500ms for incorrect
  };

  // Reset exercise
  const handleTryAgain = () => {
    setPattern(generatePattern());
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setExerciseComplete(false);
    setPlayingFullPattern(false);
    setCurrentPlaybackIndex(-1);
    setCompletedNotes(new Array(8).fill(false));
    setIncorrectNotes(new Array(8).fill(false));
  };

  // No auto-play - user must click buttons to hear sounds

  if (exerciseComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <CompletionPage
            score={score}
            total={EXERCISE_CONFIG.totalQuestions}
            onTryAgain={handleTryAgain}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  const currentNote = pattern[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">
            Exercise 2: {EXERCISE_CONFIG.title}
          </h1>
          
          <button
            onClick={handleTryAgain}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar current={currentIndex + (showResult ? 1 : 0)} total={EXERCISE_CONFIG.totalQuestions} />

        {/* VexFlow Staff */}
        <VexFlowStaff 
          pattern={pattern}
          currentNoteIndex={currentIndex}      
          isPlaying={isPlaying}               
          completedNotes={completedNotes}
          incorrectNotes={incorrectNotes}
          playingFullPattern={playingFullPattern}
          currentPlaybackIndex={currentPlaybackIndex}
          width={900}
          height={300}
        />

        {/* Solfege Buttons */}
        <SolfegeButtons
          syllables={EXERCISE_CONFIG.syllables}
          onSelect={handleAnswerSelect}
          disabled={showResult || playingFullPattern}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentNote?.syllable}
          showResult={showResult}
        />

        {/* Feedback */}
        {showResult && (
          <div className="text-center">
            {selectedAnswer === currentNote?.syllable ? (
              <div className="text-green-600 text-xl font-semibold">
                ✅ Correct!
              </div>
            ) : (
              <div className="text-red-600 text-xl font-semibold">
                ❌ Incorrect. The answer was: {currentNote?.syllable}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolfegeExerciseTwo;