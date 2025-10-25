// /src/components/exercises/2.listening_skills/ListenSolfegeIDTemplate.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Play, ArrowLeft, RotateCcw, Star, Trophy, CheckCircle } from 'lucide-react';
import ListenVexFlowStaff from './ListenVexFlowStaff';
import ListenCanvasMusicStaff from './ListenCanvasMusicStaff';
import { useVexFlowLoader } from './Hooks/ListenuseVexFlowLoader';
import { useResponsiveMusic } from './Hooks/ListenuseResponsiveMusic';

// Reusable Components
const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-8">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const AnswerButtons = ({ onSelect, disabled, selectedAnswer, correctAnswer, showResult, needsFirstPlay, isPlaying }) => {
  const options = [
    { letter: 'A' },
    { letter: 'B' },
    { letter: 'C' },
    { letter: 'D' }
  ];

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {options.map((option) => {
        let buttonStyle = "bg-white text-gray-800 border-gray-300 hover:bg-gray-50";
        
        if (showResult) {
          if (option.letter === correctAnswer) {
            buttonStyle = "bg-green-500 text-white border-green-600";
          } else if (option.letter === selectedAnswer && option.letter !== correctAnswer) {
            buttonStyle = "bg-red-500 text-white border-red-600";
          }
        } else if (option.letter === selectedAnswer) {
          buttonStyle = "bg-blue-500 text-white border-blue-600";
        }
        
        const isDisabled = disabled || isPlaying || needsFirstPlay;
        
        return (
          <button
            key={option.letter}
            onClick={() => onSelect(option.letter)}
            disabled={isDisabled}
            className={`px-6 py-3 text-lg font-bold border-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${buttonStyle} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {option.letter}
          </button>
        );
      })}
    </div>
  );
};

const PlayPatternButton = ({ onPlay, isPlaying, disabled, needsFirstPlay, onFirstPlay }) => {
  const handleClick = () => {
    if (needsFirstPlay) {
      onFirstPlay();
    } else {
      onPlay();
    }
  };

  // Determine button color based on state
  const buttonColor = needsFirstPlay 
    ? 'bg-green-600 hover:bg-green-700' // Green for "Start Exercise"
    : 'bg-blue-600 hover:bg-blue-700';  // Blue for "Play Again"

  return (
    <div className="text-center mb-8">
      <button
        onClick={handleClick}
        disabled={disabled || isPlaying}
        className={`flex items-center space-x-3 px-6 py-3 text-base font-semibold rounded-lg transition-all transform hover:scale-105 mx-auto ${
          disabled || isPlaying 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : `${buttonColor} text-white`
        }`}
      >
        <Play className="w-5 h-5" />
        <span>
          {isPlaying 
            ? 'Playing...' 
            : needsFirstPlay 
              ? 'Start Exercise' 
              : 'Play Again'
          }
        </span>
      </button>
    </div>
  );
};

const CompletionPage = ({ score, total, onTryAgain, onClose, exerciseName }) => {
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
            <span className="font-medium">{exerciseName}</span>
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

// Four-Stave Display Component with Mobile Layout Fix and KEY SIGNATURE SUPPORT
const FourStaveDisplay = ({ 
  patternSet, 
  selectedAnswer, 
  showResult, 
  exerciseComplete, 
  playingNoteIndex, 
  isPlaying,
  patternLength = 4,
  useVexFlow = true,
  onStaffClick,
  exerciseConfig // NEW: Added exerciseConfig to access key signature
}) => {
  const { vexFlowLoaded } = useVexFlowLoader();
  const { isMobile, isTablet, isLandscape } = useResponsiveMusic();

  // Debug logging
  console.log('♪ FourStaveDisplay render:', {
    patternSet: !!patternSet,
    vexFlowLoaded,
    useVexFlow,
    keySignature: exerciseConfig?.keySignature, // NEW: Log key signature
    patternSetData: patternSet
  });

  // Don't render until both patternSet and VexFlow are ready (if using VexFlow)
  if (!patternSet) {
    console.log('⏳ Waiting for pattern set...');
    return (
      <div className={`${isMobile ? '' : ''} mb-2`}>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading patterns...</div>
        </div>
      </div>
    );
  }

  if (useVexFlow && !vexFlowLoaded) {
    console.log('⏳ Waiting for VexFlow...');
    return (
      <div className={`${isMobile ? '' : ''} mb-2`}>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading music notation...</div>
        </div>
      </div>
    );
  }

  const labels = ['A', 'B', 'C', 'D'];
  
  // Debug pattern data
  console.log('🎼 Pattern data:', {
    patterns: patternSet.patterns?.length,
    firstPattern: patternSet.patterns?.[0],
    correctAnswerIndex: patternSet.correctAnswerIndex,
    keySignature: exerciseConfig?.keySignature // NEW: Debug key signature
  });

  // Handle touch interactions for pattern selection
  const handlePatternTouch = (label) => {
    if (!showResult && !isPlaying) {
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Call the click handler
      onStaffClick(label);
    }
  };
  
  // Mobile layout - COMPLETELY REMOVE borders and padding between staffs
  if (isMobile) {
    return (
      <div className="w-full mb-2">
        {/* REMOVE all borders and spacing - make staffs touch each other */}
        <div className="grid grid-cols-2 w-full" style={{ gap: '0px', margin: '0px', padding: '0px' }}>
          {patternSet.patterns.map((pattern, index) => {
            const isCorrect = showResult && index === patternSet.correctAnswerIndex;
            const isSelected = selectedAnswer === labels[index];
            
            console.log(`🎶 Rendering pattern ${labels[index]}:`, {
              pattern,
              isCorrect,
              isSelected,
              useVexFlow,
              vexFlowLoaded,
              keySignature: exerciseConfig?.keySignature // NEW: Debug key signature per pattern
            });
            
            return (
              <div 
                key={labels[index]} 
                className="cursor-pointer flex items-center justify-center"
                onClick={() => onStaffClick(labels[index])}
                onTouchStart={() => handlePatternTouch(labels[index])}
                style={{ 
                  touchAction: 'manipulation',
                  height: '100px',
                  minHeight: '100px',
                  width: '100%',
                  margin: '0px',
                  padding: '0px',
                  border: 'none',
                  backgroundColor: 'white',
                  boxShadow: isSelected 
                    ? '0 0 0 3px #3B82F6' 
                    : (showResult && isCorrect) 
                      ? '0 0 0 3px #10B981' 
                      : (showResult && isSelected) 
                        ? '0 0 0 3px #EF4444' 
                        : 'none'
                }}
              >
                {useVexFlow && vexFlowLoaded ? (
                  <ListenVexFlowStaff
                    pattern={pattern}
                    label={labels[index]}
                    isCorrect={isCorrect}
                    isSelected={isSelected}
                    showResult={showResult}
                    exerciseComplete={exerciseComplete}
                    playingNoteIndex={playingNoteIndex}
                    isPlaying={isPlaying}
                    patternLength={patternLength}
                    mobileScale={true}
                    staffHeight={80}
                    forceRedraw={true}
                    keySignature={exerciseConfig?.keySignature} // NEW: Pass key signature
                  />
                ) : (
                  <ListenCanvasMusicStaff
                    pattern={pattern}
                    label={labels[index]}
                    isCorrect={isCorrect}
                    isSelected={isSelected}
                    showResult={showResult}
                    exerciseComplete={exerciseComplete}
                    playingNoteIndex={playingNoteIndex}
                    isPlaying={isPlaying}
                    patternLength={patternLength}
                    mobileScale={true}
                    staffHeight={80}
                    forceRedraw={true}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Mobile-specific instruction */}
        <div className="text-center mt-1 text-xs text-gray-500">
          Tap a staff to select your answer
        </div>
      </div>
    );
  }

  // Desktop/tablet layout - REMOVE LARGE CONTAINER BACKGROUND
  return (
    <div className="flex justify-center items-center w-full mb-4">
      {/* REMOVED: bg-white rounded-lg shadow-md p-6 container */}
      <div className="grid grid-cols-2 gap-6 justify-items-center" style={{ width: '850px', maxWidth: '95vw' }}>
        {patternSet.patterns.map((pattern, index) => {
          const isCorrect = showResult && index === patternSet.correctAnswerIndex;
          const isSelected = selectedAnswer === labels[index];
          
          console.log(`🎶 Rendering pattern ${labels[index]}:`, {
            pattern,
            isCorrect,
            isSelected,
            useVexFlow,
            vexFlowLoaded,
            keySignature: exerciseConfig?.keySignature // NEW: Debug key signature per pattern
          });
          
          return (
            <div 
              key={labels[index]} 
              className="cursor-pointer"
              onClick={() => onStaffClick(labels[index])}
              onTouchStart={() => handlePatternTouch(labels[index])}
              style={{ 
                touchAction: 'manipulation'
              }}
            >
              {useVexFlow && vexFlowLoaded ? (
                <ListenVexFlowStaff
                  pattern={pattern}
                  label={labels[index]}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  showResult={showResult}
                  exerciseComplete={exerciseComplete}
                  playingNoteIndex={playingNoteIndex}
                  isPlaying={isPlaying}
                  patternLength={patternLength}
                  isMobile={isMobile}
                  staffHeight={100}
                  forceRedraw={true}
                  keySignature={exerciseConfig?.keySignature} // NEW: Pass key signature
                />
              ) : (
                <ListenCanvasMusicStaff
                  pattern={pattern}
                  label={labels[index]}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  showResult={showResult}
                  exerciseComplete={exerciseComplete}
                  playingNoteIndex={playingNoteIndex}
                  isPlaying={isPlaying}
                  patternLength={patternLength}
                  isMobile={isMobile}
                  staffHeight={100}
                  forceRedraw={true}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Template Component with Mobile Layout Fix
const ListenSolfegeIDTemplate = ({ 
  exerciseConfig,
  generatePatternSet,
  onClose,
  patternLength = 4,
  useVexFlow = true
}) => {
  const { isMobile, isTablet } = useResponsiveMusic();
  const [synth, setSynth] = useState(null);
  const [solfegeAudio, setSolfegeAudio] = useState(null);
  const [currentPatternSet, setCurrentPatternSet] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [hasPlayedCurrentQuestion, setHasPlayedCurrentQuestion] = useState(false);
  const [needsFirstPlay, setNeedsFirstPlay] = useState(true);
  const [playingNoteIndex, setPlayingNoteIndex] = useState(-1);
  
  // ADD: Refs to track timeouts and prevent double clicks
  const transitionTimeoutRef = useRef(null);
  const isProcessingAnswerRef = useRef(false);
  const audioPlaybackRef = useRef(null);
  
  // Performance optimization: Prevent unnecessary re-renders
  const memoizedGeneratePatternSet = useCallback(generatePatternSet, []);

  // Initialize audio with better mobile support
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        console.log('Initializing components without creating AudioContext...');
        
        // Set up vocal audio (this doesn't require AudioContext)
        const audio = {};
        exerciseConfig.syllables.forEach(syllable => {
          audio[syllable] = new Audio(`/teacher_dashboard/sounds/${syllable.toLowerCase()}.mp3`);
          audio[syllable].preload = isMobile ? 'metadata' : 'auto';
          audio[syllable].volume = isMobile ? 0.9 : 0.8;
          
          if (isMobile) {
            audio[syllable].playsInline = true;
            audio[syllable].muted = false;
          }
        });
        setSolfegeAudio(audio);
        
        // Generate pattern set immediately (doesn't need audio)
        setCurrentPatternSet(memoizedGeneratePatternSet());
        
        console.log('[OK] Components initialized successfully');
      } catch (error) {
        console.error('Failed to initialize components:', error);
        // Still try to set pattern set
        setCurrentPatternSet(memoizedGeneratePatternSet());
      }
    };

    initializeComponents();
    
    // Cleanup function
    return () => {
      if (synth) {
        synth.dispose();
      }
      // Clear any pending timeouts
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [exerciseConfig.syllables, memoizedGeneratePatternSet, isMobile]);

  // FIXED: Stop function that properly cancels audio - MOVED FIRST
  const stopCurrentAudio = useCallback(() => {
    console.log('🛑 Stopping current audio...');
    
    // Cancel ongoing playback immediately
    if (audioPlaybackRef.current) {
      if (typeof audioPlaybackRef.current.cancel === 'function') {
        audioPlaybackRef.current.cancel();
      }
      audioPlaybackRef.current = null;
    }
    
    // Stop any vocal audio that might be playing
    if (solfegeAudio) {
      Object.values(solfegeAudio).forEach(audio => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          // Ignore errors
        }
      });
    }
    
    // Stop synth
    if (synth) {
      try {
        synth.releaseAll();
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Force reset playing state immediately
    setIsPlaying(false);
    setPlayingNoteIndex(-1);
  }, [solfegeAudio, synth]);

  // Enhanced pattern playing with completion callback - FIXED VERSION
  const playPattern = useCallback(async (isAutoPlay = false, onComplete = null) => {
    if (!currentPatternSet) {
      console.log('🛑 Cannot play: missing pattern set');
      return;
    }

    // If already playing, stop current playback first
    if (isPlaying) {
      console.log('🛑 Already playing, stopping current playback...');
      stopCurrentAudio();
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Ensure audio is initialized
    if (!audioInitialized || !synth) {
      console.log('🛑 Audio not ready, attempting to initialize...');
      try {
        await Tone.start();
        setAudioInitialized(true);
        setNeedsFirstPlay(false);
      } catch (error) {
        console.log('Failed to start audio context:', error);
        return;
      }
    }
    
    setIsPlaying(true);
    setHasPlayedCurrentQuestion(true);
    setPlayingNoteIndex(-1);
    const pattern = currentPatternSet.correctPattern;
    
    console.log(`♪ Starting playback with ${pattern.length} notes`);
    
    // Store playback reference for cleanup - use a ref that survives re-renders
    const playbackId = Date.now();
    let playbackCancelled = false;
    
    audioPlaybackRef.current = {
      id: playbackId,
      cancel: () => { 
        playbackCancelled = true;
        console.log(`🛑 Playback ${playbackId} cancelled`);
      }
    };
    
    try {
      for (let i = 0; i < pattern.length; i++) {
        // Check if playback was cancelled
        if (playbackCancelled || audioPlaybackRef.current?.id !== playbackId) {
          console.log(`🛑 Playback cancelled at note ${i + 1}`);
          break;
        }
        
        const noteData = pattern[i];
        console.log(`♪ Playing note ${i + 1}/${pattern.length}: ${noteData.syllable} (${noteData.pitch})`);
        
        // Calculate note duration for playback
        const getNoteDuration = (noteData) => {
          switch (noteData.duration) {
            case 'h': return 2; // Half note = 2 beats
            case 'w': return 4; // Whole note = 4 beats  
            case 'e': return 0.5; // Eighth note = 0.5 beats
            case 'q':
            default: return 1; // Quarter note = 1 beat
          }
        };
        
        const noteDuration = getNoteDuration(noteData);
        const playDurationMs = noteDuration * (isMobile ? 600 : 500); // Duration based on note type
        
        // Only set playing note index if not cancelled
        if (!playbackCancelled && audioPlaybackRef.current?.id === playbackId) {
          setPlayingNoteIndex(i);
        }
        
        let audioPlayed = false;
        
        // Try vocal audio first
        if (solfegeAudio && solfegeAudio[noteData.syllable] && !playbackCancelled) {
          try {
            const audio = solfegeAudio[noteData.syllable];
            audio.currentTime = 0;
            audio.volume = isMobile ? 0.9 : 0.8;
            
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
              await playPromise;
            }
            audioPlayed = true;
            
          } catch (audioError) {
            console.log('Vocal audio failed, using synth:', audioError);
          }
        }
        
        // Fallback to synth with proper duration
        if (!audioPlayed && synth && !playbackCancelled && audioPlaybackRef.current?.id === playbackId) {
          try {
            // Use the calculated duration for synth playback
            const synthDuration = `${noteDuration}n`; // Convert to VexFlow notation (1n, 2n, etc.)
            synth.triggerAttackRelease(noteData.pitch, synthDuration);
          } catch (synthError) {
            console.log('Synth audio failed:', synthError);
          }
        }
        
        // Wait for the full duration of the note with proper cancellation
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            resolve();
          }, playDurationMs);
          
          // Check for cancellation every 50ms
          const checkCancellation = () => {
            if (playbackCancelled || audioPlaybackRef.current?.id !== playbackId) {
              clearTimeout(timeout);
              resolve();
            } else if (!playbackCancelled) {
              setTimeout(checkCancellation, 50);
            }
          };
          checkCancellation();
        });
        
        // Add a small gap between notes (except after the last note)
        if (i < pattern.length - 1 && !playbackCancelled && audioPlaybackRef.current?.id === playbackId) {
          // Small gap between notes
          const gapDuration = isMobile ? 100 : 100;
          await new Promise(resolve => {
            const timeout = setTimeout(() => {
              resolve();
            }, gapDuration);
            
            // Check for cancellation during gap
            const checkCancellation = () => {
              if (playbackCancelled || audioPlaybackRef.current?.id !== playbackId) {
                clearTimeout(timeout);
                resolve();
              }
            };
            setTimeout(checkCancellation, 25);
          });
        }
      }
      
      console.log(`[OK] Playback completed (cancelled: ${playbackCancelled})`);
      
    } catch (error) {
      console.error('Error playing pattern:', error);
    } finally {
      // Only reset state if this is still the current playback
      if (audioPlaybackRef.current?.id === playbackId) {
        setIsPlaying(false);
        setPlayingNoteIndex(-1);
        audioPlaybackRef.current = null;
        
        // Call completion callback if provided and not cancelled
        if (onComplete && !playbackCancelled) {
          console.log('♪ Calling completion callback');
          onComplete();
        }
      } else {
        console.log('🔄 Playback superseded, not resetting state');
      }
    }
  }, [currentPatternSet, solfegeAudio, synth, isPlaying, audioInitialized, patternLength, isMobile, stopCurrentAudio]);

  // Initialize audio context with mobile-specific handling
  const initializeAudioAndPlay = useCallback(async () => {
    if (!audioInitialized) {
      try {
        // Start Tone.js audio context
        await Tone.start();
        console.log('[OK] Tone.js started successfully');
        
        // Additional mobile audio context setup
        if (isMobile && Tone.getContext().state !== 'running') {
          await Tone.getContext().resume();
        }
        
        // NOW create the synth after AudioContext is ready
        if (!synth) {
          const synthSettings = isMobile ? {
            oscillator: { 
              type: "triangle",
              harmonicity: 1.5
            },
            envelope: { 
              attack: 0.01, 
              decay: 0.2, 
              sustain: 0.1, 
              release: 1.5 
            },
            filter: {
              type: "lowpass",
              frequency: 1500,
              rolloff: -12
            }
          } : {
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
          };

          const newSynth = new Tone.Synth(synthSettings).toDestination();
          
          // Add reverb for better sound quality
          const reverb = new Tone.Reverb({
            decay: isMobile ? 1.0 : 1.5,
            wet: isMobile ? 0.2 : 0.3
          }).toDestination();
          
          newSynth.connect(reverb);
          setSynth(newSynth);
          console.log('[OK] Synth created successfully after user interaction');
        }
        
        setAudioInitialized(true);
        setNeedsFirstPlay(false);
        
        // Play the pattern immediately after audio initialization
        // Wait a bit longer to ensure everything is ready
        setTimeout(async () => {
          if (currentPatternSet) {
            console.log('♪ Playing pattern after Start Exercise clicked');
            await playPattern(true); // Play immediately after initialization
          }
        }, isMobile ? 500 : 400); // Longer delay to ensure audio is ready
      } catch (error) {
        console.error('[Error] Failed to start audio context:', error);
      }
    }
  }, [audioInitialized, currentPatternSet, hasPlayedCurrentQuestion, isMobile, synth, playPattern]);

  // Auto-play pattern for new questions - FIXED to prevent race conditions
  useEffect(() => {
    // Only auto-play if ALL conditions are met and no answer has been selected
    if (currentPatternSet && 
        audioInitialized && 
        !showResult && 
        !isPlaying && 
        !hasPlayedCurrentQuestion &&
        !needsFirstPlay &&
        !isProcessingAnswerRef.current && // ADDED: Don't auto-play if processing answer
        currentQuestionIndex > 0) {
      
      console.log(`♪ Auto-playing pattern for question ${currentQuestionIndex + 1}`);
      
      const autoPlayDelay = isMobile ? 1000 : 800;
      const autoPlayTimer = setTimeout(() => {
        // Double-check conditions before playing (prevent race conditions)
        if (!showResult && !isPlaying && !isProcessingAnswerRef.current) {
          playPattern(true);
        } else {
          console.log('🛑 Auto-play cancelled - conditions changed');
        }
      }, autoPlayDelay);
      
      return () => {
        console.log('🧹 Cleaning up auto-play timer');
        clearTimeout(autoPlayTimer);
      };
    }
  }, [currentPatternSet, audioInitialized, showResult, isPlaying, hasPlayedCurrentQuestion, needsFirstPlay, currentQuestionIndex, playPattern, isMobile]);

  // FIXED: Handle answer selection with immediate response and guaranteed progression
  const handleAnswerSelect = useCallback(async (selectedLetter) => {
    // Prevent double clicks and multiple rapid selections
    if (showResult || !currentPatternSet || needsFirstPlay || isProcessingAnswerRef.current) {
      console.log('🛑 Answer selection blocked:', { 
        showResult, 
        hasPatternSet: !!currentPatternSet, 
        needsFirstPlay, 
        isProcessing: isProcessingAnswerRef.current 
      });
      return;
    }
    
    // Set processing flag to prevent rapid clicks and auto-play conflicts
    isProcessingAnswerRef.current = true;
    console.log(`👆 Answer selected: ${selectedLetter} - Setting processing flag`);
    
    // Stop current audio immediately and completely
    stopCurrentAudio();
    
    // Clear any pending transition timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Provide haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Set answer state immediately
    setSelectedAnswer(selectedLetter);
    setShowResult(true);
    
    const isCorrect = selectedLetter === currentPatternSet.correctLetter;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Success haptic feedback
      if (isMobile && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    }
    
    console.log(`🎯 Answer ${isCorrect ? 'CORRECT' : 'INCORRECT'}: ${selectedLetter} (Expected: ${currentPatternSet.correctLetter})`);
    
    // FIXED: Single transition handler to prevent duplicate calls
    const handleTransition = () => {
      console.log('🔄 Executing transition...');
      
      // Clear processing flag immediately to prevent hanging
      const wasProcessing = isProcessingAnswerRef.current;
      isProcessingAnswerRef.current = false;
      
      if (!wasProcessing) {
        console.log('⚠️ Transition called but not processing - skipping');
        return;
      }
      
      if (currentQuestionIndex + 1 >= exerciseConfig.totalQuestions) {
        console.log('🏁 Exercise complete!');
        setExerciseComplete(true);
      } else {
        console.log(`➡️ Moving to question ${currentQuestionIndex + 2}`);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentPatternSet(memoizedGeneratePatternSet());
        setShowResult(false);
        setSelectedAnswer(null);
        setHasPlayedCurrentQuestion(false);
      }
      
      transitionTimeoutRef.current = null;
    };
    
    // Set guaranteed transition timeout first (fallback) - INCREASED TIME
    const guaranteedTransitionTime = 6000; // 6 seconds maximum wait (increased)
    transitionTimeoutRef.current = setTimeout(() => {
      console.log('⚠️ Fallback transition triggered after 6s');
      handleTransition();
    }, guaranteedTransitionTime);
    
    // Try to play pattern with completion callback
    const handlePlaybackComplete = () => {
      console.log('♪ Playback completed, clearing fallback and transitioning...');
      
      // Clear the fallback timeout since playback completed
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Set new transition timeout - SHORTER delay since audio finished
      transitionTimeoutRef.current = setTimeout(() => {
        handleTransition();
      }, 1000); // Reduced from 1500ms to 1000ms for faster progression
    };
    
    // FIXED: Wait longer before playing to ensure state is stable
    setTimeout(() => {
      // Double-check we should still proceed
      if (!isProcessingAnswerRef.current) {
        console.log('⚠️ Processing cancelled during delay, skipping playback');
        return;
      }
      
      console.log('♪ Starting answer playback...');
      playPattern(false, handlePlaybackComplete).catch((error) => {
        console.error('[Error] Playback failed:', error);
        // If playback fails, still trigger transition after short delay
        if (isProcessingAnswerRef.current) {
          setTimeout(() => {
            if (isProcessingAnswerRef.current) {
              console.log('🔄 Playback failed, forcing transition...');
              handleTransition();
            }
          }, 1000);
        }
      });
    }, 500); // Increased delay for better state stability
    
  }, [currentPatternSet, needsFirstPlay, showResult, stopCurrentAudio, isMobile, currentQuestionIndex, exerciseConfig.totalQuestions, memoizedGeneratePatternSet, playPattern]);

  // Reset exercise
  const handleTryAgain = () => {
    console.log('🔄 Resetting exercise...');
    
    // Stop all audio and clear timeouts
    stopCurrentAudio();
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Reset processing flag FIRST
    isProcessingAnswerRef.current = false;
    
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setExerciseComplete(false);
    setHasPlayedCurrentQuestion(false);
    setNeedsFirstPlay(false);
    setPlayingNoteIndex(-1);
    setCurrentPatternSet(memoizedGeneratePatternSet());
    
    console.log('[OK] Exercise reset completed');
  };

  // FIXED: Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all audio
      stopCurrentAudio();
      
      // Clear timeouts
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Reset processing flag
      isProcessingAnswerRef.current = false;
      
      // Dispose synth
      if (synth) {
        synth.dispose();
      }
    };
  }, [stopCurrentAudio, synth]);

  if (exerciseComplete) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
          <CompletionPage
            score={score}
            total={exerciseConfig.totalQuestions}
            onTryAgain={handleTryAgain}
            onClose={onClose}
            exerciseName={exerciseConfig.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className={`mx-auto ${isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-6xl'}`}>
        {/* Tighter container for mobile */}
        <div className={`${isMobile ? 'space-y-2' : 'space-y-6'}`}>
          {/* Header with responsive layout */}
          <div className={`${isMobile ? 'mb-2 space-y-1' : 'mb-6'} ${
            isMobile ? 'space-y-1' : 'flex items-center justify-between'
          }`}>
            {/* Mobile: Title first */}
            {isMobile && (
              <h1 className="text-xl font-bold text-gray-800 text-center">
                {exerciseConfig.title}
              </h1>
            )}
            
            {/* Navigation buttons row */}
            <div className={`flex items-center justify-between ${
              isMobile ? '' : 'w-full'
            }`}>
              <button
                onClick={onClose}
                onTouchStart={() => {}}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 active:text-gray-900"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              {/* Desktop: Title in center */}
              {!isMobile && (
                <h1 className={`font-bold text-gray-800 text-center ${
                  isTablet ? 'text-xl' : 'text-2xl'
                }`}>
                  {exerciseConfig.title}
                </h1>
              )}
              
              <button
                onClick={handleTryAgain}
                onTouchStart={() => {}}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 active:text-gray-900"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`${isMobile ? 'mb-2' : 'mb-8'}`}>
            <ProgressBar current={currentQuestionIndex + 1} total={exerciseConfig.totalQuestions} />
          </div>

          {/* Four-Stave Display - Mobile: directly under progress bar with no container */}
          <FourStaveDisplay 
            patternSet={currentPatternSet}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            exerciseComplete={exerciseComplete}
            playingNoteIndex={playingNoteIndex}
            isPlaying={isPlaying}
            patternLength={patternLength}
            useVexFlow={useVexFlow}
            onStaffClick={handleAnswerSelect}
            exerciseConfig={exerciseConfig} // NEW: Pass exerciseConfig for key signature
          />

          {/* Instructions REMOVED ON MOBILE */}
          {!isMobile && (
            <div className="text-center mb-6">
              <p className={`text-gray-700 ${
                isTablet ? 'text-lg' : 'text-lg'
              }`}>
                Which pattern matches what you heard?
                {patternLength === 8 && " (Two measures)"}
              </p>
            </div>
          )}

          {/* Play/Replay Pattern Button */}
          <div className={`${isMobile ? 'mb-2' : 'mb-8'}`}>
            <PlayPatternButton 
              onPlay={() => playPattern(false)}
              isPlaying={isPlaying}
              disabled={showResult}
              needsFirstPlay={needsFirstPlay}
              onFirstPlay={initializeAudioAndPlay}
            />
          </div>

          {/* Feedback with responsive text */}
          {showResult && currentPatternSet && (
            <div className="text-center">
              {selectedAnswer === currentPatternSet.correctLetter ? (
                <div className={`text-green-600 font-semibold ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  [OK] Correct! Pattern {currentPatternSet.correctLetter}
                </div>
              ) : (
                <div className={`text-red-600 font-semibold ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}>
                  [Error] Incorrect. The correct answer was Pattern {currentPatternSet.correctLetter}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenSolfegeIDTemplate;