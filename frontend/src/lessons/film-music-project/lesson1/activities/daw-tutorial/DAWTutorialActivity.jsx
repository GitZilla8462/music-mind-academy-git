// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/DAWTutorialActivity.jsx
// Main orchestration component for the DAW tutorial - FIXED with proper cleanup

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MusicComposer from "../../../../../pages/projects/film-music-score/composer/MusicComposer";
import { DAW_CHALLENGES } from './challengeDefinitions';
import { useChallengeHandlers } from './challengeHandlers';
import { speakText } from '../../../../components/shared/textToSpeech';
import ChallengePanel from './ChallengePanel';

const DAWTutorialActivity = ({ onComplete }) => {
  // Refs for lifecycle management - CRITICAL for preventing crashes
  const hasInitialized = useRef(false);
  const completionCalledRef = useRef(false);
  const isMountedRef = useRef(true);
  const cleanupCalledRef = useRef(false);
  const timeoutsRef = useRef([]);
  
  // State
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [isDAWReady, setIsDAWReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const [dawContext, setDawContext] = useState({
    placedLoops: [],
    action: null,
    trackIndex: null,
    zoomLevel: 1,
    zoomDirection: null
  });

  const currentChallenge = DAW_CHALLENGES[currentChallengeIndex];
  const progressPercent = (completedChallenges.size / DAW_CHALLENGES.length) * 100;

  // CRITICAL: Safe timeout helper
  const setSafeTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !cleanupCalledRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  // CRITICAL: Cleanup on unmount - prevents crashes during activity transitions
  useEffect(() => {
    isMountedRef.current = true;
    cleanupCalledRef.current = false;
    
    return () => {
      console.log('🧹 DAWTutorialActivity unmounting - cleaning up...');
      isMountedRef.current = false;
      cleanupCalledRef.current = true;
      
      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      
      // Stop all speech synthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          console.error('Error canceling speech:', error);
        }
      }
      
      // CRITICAL: Stop Tone.js transport to prevent seek errors
      try {
        if (window.Tone && window.Tone.Transport) {
          window.Tone.Transport.stop();
          window.Tone.Transport.cancel();
          console.log('✅ Tone.js Transport stopped');
        }
      } catch (error) {
        console.error('Error stopping Tone.js:', error);
      }
      
      console.log('✅ DAWTutorialActivity cleanup complete');
    };
  }, []);

  // Initialize only once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('DAW Tutorial initialized - Total challenges:', DAW_CHALLENGES.length);
    }
  }, []);

  // Auto-ready after short delay
  useEffect(() => {
    const timer = setSafeTimeout(() => {
      if (isMountedRef.current) {
        setIsDAWReady(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [setSafeTimeout]);

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Speak first challenge question after DAW is ready
  useEffect(() => {
    if (isDAWReady && currentChallenge && currentChallengeIndex === 0 && voiceEnabled && isMountedRef.current) {
      const timer = setSafeTimeout(() => {
        if (isMountedRef.current) {
          speakText(currentChallenge.question, voiceEnabled);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDAWReady, currentChallenge, currentChallengeIndex, voiceEnabled, setSafeTimeout]);

  // Idle timer
  useEffect(() => {
    if (!feedback && currentChallenge && currentChallenge.type !== 'multiple-choice' && isMountedRef.current) {
      const timer = setInterval(() => {
        if (isMountedRef.current) {
          setIdleTime(prev => prev + 1);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setIdleTime(0);
    }
  }, [feedback, currentChallenge]);

  // Navigate to next challenge - MUST BE DEFINED BEFORE handleMultipleChoiceAnswer
  const nextChallenge = useCallback(() => {
    if (!isMountedRef.current || cleanupCalledRef.current) {
      console.log('Component unmounted, skipping nextChallenge');
      return;
    }
    
    setCurrentChallengeIndex(prev => {
      const newIndex = prev + 1;
      
      setSafeTimeout(() => {
        if (newIndex < DAW_CHALLENGES.length && isMountedRef.current) {
          const newChallenge = DAW_CHALLENGES[newIndex];
          speakText(newChallenge.question, voiceEnabled);
        }
      }, 500);
      
      return newIndex;
    });
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setIdleTime(0);
    setDawContext(prev => ({ ...prev, action: null }));
  }, [voiceEnabled, setSafeTimeout]);

  // Success handler with rapid-fire protection and safe cleanup
  const handleCorrectAction = useCallback(() => {
    if (!isMountedRef.current || cleanupCalledRef.current) {
      console.log('Component unmounted, skipping handleCorrectAction');
      return;
    }
    
    if (isProcessingSuccess) {
      console.log('Already processing success, ignoring duplicate call');
      return;
    }
    
    setIsProcessingSuccess(true);
    setFeedback({ type: 'success', message: 'Correct! Well done!' });
    setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
    setIdleTime(0);
    
    setSafeTimeout(() => {
      if (!isMountedRef.current || cleanupCalledRef.current) {
        console.log('Component unmounted during success timeout, aborting');
        return;
      }
      
      if (currentChallengeIndex < DAW_CHALLENGES.length - 1) {
        nextChallenge();
        setSafeTimeout(() => {
          if (isMountedRef.current) {
            setIsProcessingSuccess(false);
          }
        }, 100);
      } else {
        // Tutorial complete - CRITICAL: Clean up BEFORE calling onComplete
        if (!completionCalledRef.current && isMountedRef.current) {
          completionCalledRef.current = true;
          console.log('✅ DAW Tutorial completed - preparing for transition...');
          
          // Stop all audio and speech FIRST
          if ('speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
            } catch (error) {
              console.error('Error canceling speech:', error);
            }
          }
          
          // Stop Tone.js transport BEFORE transitioning
          try {
            if (window.Tone && window.Tone.Transport) {
              window.Tone.Transport.stop();
              window.Tone.Transport.cancel();
              console.log('✅ Tone.js stopped before transition');
            }
          } catch (error) {
            console.error('Error stopping Tone.js:', error);
          }
          
          // Small delay to ensure cleanup completes, then transition
          setSafeTimeout(() => {
            if (isMountedRef.current) {
              console.log('📤 Calling onComplete() to transition to next activity');
              onComplete();
            }
          }, 200);
        }
      }
    }, 1500);
  }, [isProcessingSuccess, currentChallenge, currentChallengeIndex, nextChallenge, onComplete, setSafeTimeout]);

  // Use challenge handlers hook
  const handlers = useChallengeHandlers(
    currentChallenge,
    dawContext,
    setDawContext,
    handleCorrectAction,
    isProcessingClick,
    setIsProcessingClick
  );

  // Multiple choice answer handler
  const handleMultipleChoiceAnswer = useCallback((choiceIndex) => {
    if (!isMountedRef.current || cleanupCalledRef.current) {
      console.log('Component unmounted, skipping answer handler');
      return;
    }
    
    // Prevent clicking the same wrong answer repeatedly
    if (userAnswer === choiceIndex && feedback?.type === 'error') {
      return;
    }
    
    setUserAnswer(choiceIndex);
    
    const isCorrect = choiceIndex === currentChallenge.correctIndex;
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Correct!' });
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      setShowExplanation(true);
      
      setSafeTimeout(() => {
        if (currentChallenge.autoAdvanceOnCorrect && isMountedRef.current) {
          nextChallenge();
        }
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: 'Not quite. Try again!' });
      
      // Clear the feedback after 1.5 seconds to allow re-attempt
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          setFeedback(null);
          setUserAnswer(null);
        }
      }, 1500);
    }
  }, [currentChallenge, userAnswer, feedback, nextChallenge, setSafeTimeout]);

  // Skip challenge
  const skipChallenge = useCallback(() => {
    if (currentChallenge.allowSkip && isMountedRef.current) {
      nextChallenge();
    }
  }, [currentChallenge, nextChallenge]);

  // DEV: Skip to any challenge
  const devSkipToChallenge = useCallback((index) => {
    if (index < 0 || index >= DAW_CHALLENGES.length || !isMountedRef.current) return;
    
    setCurrentChallengeIndex(index);
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setIdleTime(0);
    setIsProcessingSuccess(false);
    setIsProcessingClick(false);
    setDawContext(prev => ({ ...prev, action: null }));
    
    setSafeTimeout(() => {
      if (isMountedRef.current) {
        const newChallenge = DAW_CHALLENGES[index];
        if (newChallenge) {
          speakText(newChallenge.question, voiceEnabled);
        }
      }
    }, 500);
  }, [voiceEnabled, setSafeTimeout]);

  // DEV: Complete tutorial immediately
  const devCompleteAll = useCallback(() => {
    if (!completionCalledRef.current && isMountedRef.current) {
      completionCalledRef.current = true;
      console.log('DEV: Force completing tutorial - calling onComplete()');
      
      // Clean up before completing
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      try {
        if (window.Tone && window.Tone.Transport) {
          window.Tone.Transport.stop();
          window.Tone.Transport.cancel();
        }
      } catch (error) {
        console.error('Error stopping Tone.js:', error);
      }
      
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          onComplete();
        }
      }, 100);
    }
  }, [onComplete, setSafeTimeout]);

  // Repeat question
  const repeatQuestion = useCallback(() => {
    if (isMountedRef.current && currentChallenge) {
      speakText(currentChallenge.question, true);
    }
  }, [currentChallenge]);

  // Check if challenge can be attempted
  const canAttemptChallenge = useCallback(() => {
    if (currentChallenge && currentChallenge.requiresLoopPlaced && dawContext.placedLoops.length === 0) {
      return false;
    }
    return true;
  }, [currentChallenge, dawContext.placedLoops.length]);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">The tutorial encountered an error. Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state with safety check
  if (!currentChallenge && !hasError) {
    console.error('❌ No current challenge found at index:', currentChallengeIndex);
    console.log('Total challenges:', DAW_CHALLENGES.length);
    
    // If we're past the last challenge, complete immediately
    if (currentChallengeIndex >= DAW_CHALLENGES.length && !completionCalledRef.current && isMountedRef.current) {
      completionCalledRef.current = true;
      console.log('Past last challenge, completing tutorial');
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          onComplete();
        }
      }, 100);
    }
    
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-lg mb-4">Loading challenge...</div>
          <div className="text-sm text-gray-400">
            Challenge {currentChallengeIndex + 1} of {DAW_CHALLENGES.length}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            If this persists, please refresh the page
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 relative">
      {/* Loading Overlay */}
      {!isDAWReady && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Initializing DAW Tutorial...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ TEMPORARY DEV TOOLS - REMOVE AFTER TESTING ⚠️ */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-colors shadow-lg border-2 border-yellow-400 animate-pulse"
          >
            {showDevTools ? 'Hide' : 'Show'} Dev Tools [TEMPORARY]
          </button>
          
          {showDevTools && (
            <div className="mt-2 bg-gray-800 border-2 border-red-500 rounded-lg p-3 shadow-xl max-w-xs">
              <div className="text-red-400 text-xs font-mono mb-2 font-bold">⚠️ TEMPORARY DEV TOOLS ⚠️</div>
              <div className="text-yellow-300 text-xs mb-2 font-semibold">REMOVE AFTER TESTING!</div>
              
              {/* Challenge Navigator */}
              <div className="mb-3">
                <div className="text-gray-300 text-xs mb-1 font-semibold">Jump to Challenge:</div>
                <div className="grid grid-cols-5 gap-1">
                  {DAW_CHALLENGES.map((challenge, index) => (
                    <button
                      key={index}
                      onClick={() => devSkipToChallenge(index)}
                      className={`text-xs px-2 py-1 rounded font-mono transition-colors ${
                        currentChallengeIndex === index
                          ? 'bg-purple-600 text-white font-bold'
                          : completedChallenges.has(challenge.id)
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title={challenge.question}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-1">
                <button
                  onClick={() => devSkipToChallenge(currentChallengeIndex + 1)}
                  disabled={currentChallengeIndex >= DAW_CHALLENGES.length - 1}
                  className="w-full bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Skip Next
                </button>
                <button
                  onClick={devCompleteAll}
                  className="w-full bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition-colors font-semibold border-2 border-yellow-400"
                >
                  🚀 COMPLETE ALL → SchoolBeneathActivity
                </button>
              </div>
              
              {/* Current Status */}
              <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
                <div>Challenge: {currentChallengeIndex + 1}/{DAW_CHALLENGES.length}</div>
                <div>Completed: {completedChallenges.size}</div>
                <div>DAW Ready: {isDAWReady ? 'Yes' : 'No'}</div>
                <div>Mounted: {isMountedRef.current ? 'Yes' : 'No'}</div>
                <div className="text-purple-400 mt-1 truncate" title={currentChallenge.question}>
                  {currentChallenge.question.slice(0, 30)}...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Idle Reminder */}
      {idleTime > 30 && !feedback && isDAWReady && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Need some help?</h3>
            <p className="mb-4 text-gray-600">{currentChallenge.instruction}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (isMountedRef.current) {
                    setShowHint(true);
                    setIdleTime(0);
                  }
                }}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Show Hint
              </button>
              <button
                onClick={() => {
                  if (isMountedRef.current) {
                    setIdleTime(0);
                  }
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                I've Got This
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grey overlay for multiple choice questions */}
      {currentChallenge.greyOutDAW && isDAWReady && (
        <div className="absolute inset-0 bg-black/40 z-30 pointer-events-none" />
      )}

      {/* Challenge Panel */}
      {isDAWReady && (
        <ChallengePanel
          currentChallenge={currentChallenge}
          currentChallengeIndex={currentChallengeIndex}
          totalChallenges={DAW_CHALLENGES.length}
          progressPercent={progressPercent}
          isPanelCollapsed={isPanelCollapsed}
          setIsPanelCollapsed={setIsPanelCollapsed}
          userAnswer={userAnswer}
          feedback={feedback}
          showHint={showHint}
          setShowHint={setShowHint}
          showExplanation={showExplanation}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          onMultipleChoiceAnswer={handleMultipleChoiceAnswer}
          onNextChallenge={nextChallenge}
          onSkipChallenge={skipChallenge}
          onRepeatQuestion={repeatQuestion}
        />
      )}

      {/* Main DAW Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MusicComposer
          onLoopDropCallback={handlers.handleLoopDrop}
          onLoopDeleteCallback={handlers.handleLoopDelete}
          onLoopUpdateCallback={handlers.handleLoopMove}
          onLoopResizeCallback={handlers.handleLoopResize}
          onTrackHeaderClickCallback={handlers.handleTrackHeaderClick}
          onTrackVolumeChangeCallback={handlers.handleTrackVolumeChange}
          onTrackSoloToggleCallback={handlers.handleSoloToggle}
          onZoomChangeCallback={handlers.handleZoomChange}
          onLoopLibraryClickCallback={handlers.handleLoopLibraryClick}
          onVideoPlayerClickCallback={handlers.handleVideoPlayerClick}
          onLoopPreviewCallback={handlers.handleLoopPreview}
          onPlaybackStartCallback={handlers.handlePlaybackStart}
          onPlaybackStopCallback={handlers.handlePlaybackStop}
          tutorialMode={true}
          highlightSelector={currentChallenge.highlightSelector}
          lockFeatures={currentChallenge.lockFeatures}
          preselectedVideo={{
            id: 'video-playback-area',
            title: 'Video Playback Area',
            duration: 30,
            videoPath: '/lessons/film-music-project/lesson1/VideoPlaybackArea.mp4'
          }}
          hideHeader={true}
          hideSubmitButton={true}
          showToast={(msg, type) => console.log(msg, type)}
        />
      </div>

      {/* Requirement Warning */}
      {!canAttemptChallenge() && isDAWReady && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-40">
          <p className="text-sm font-medium">
            Please place at least one loop on the timeline before attempting this challenge
          </p>
        </div>
      )}
    </div>
  );
};

export default DAWTutorialActivity;