// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/DAWTutorialActivity.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MusicComposer from '../../../../../pages/projects/film-music-score/composer/MusicComposer';
import ChallengePanel from './ChallengePanel';
import { DAW_CHALLENGES } from './challengeDefinitions';

const DAWTutorialActivity = ({ onComplete }) => {
  // Core state
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isDAWReady, setIsDAWReady] = useState(false);
  const [dawContext, setDawContext] = useState({
    placedLoops: [],
    action: null,
    lastInteraction: null
  });
  const [idleTime, setIdleTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Refs
  const isMountedRef = useRef(true);
  const completionCalledRef = useRef(false);
  const hasInitialized = useRef(false);
  const timeoutsRef = useRef([]);

  // Current challenge
  const currentChallenge = DAW_CHALLENGES[currentChallengeIndex];
  const progressPercent = ((currentChallengeIndex) / DAW_CHALLENGES.length) * 100;

  // Safe timeout wrapper
  const setSafeTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  // Text-to-speech
  const speakText = useCallback((text, enabled) => {
    if (!enabled || !('speechSynthesis' in window) || !isMountedRef.current) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Natural')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Next challenge function - DEFINED EARLY
  const nextChallenge = useCallback(() => {
    if (isProcessingSuccess || !isMountedRef.current) return;
    
    if (currentChallengeIndex >= DAW_CHALLENGES.length - 1) {
      if (!completionCalledRef.current) {
        completionCalledRef.current = true;
        
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
        }, 500);
      }
      return;
    }
    
    setCurrentChallengeIndex(prev => prev + 1);
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setIdleTime(0);
    setDawContext(prev => ({ ...prev, action: null }));
    
    setSafeTimeout(() => {
      if (isMountedRef.current) {
        const nextChallenge = DAW_CHALLENGES[currentChallengeIndex + 1];
        if (nextChallenge) {
          speakText(nextChallenge.question, voiceEnabled);
        }
      }
    }, 500);
  }, [currentChallengeIndex, voiceEnabled, isProcessingSuccess, onComplete, setSafeTimeout, speakText]);

  // Challenge interaction handlers
  const handlers = {
    handleLoopDrop: useCallback((loop, trackIndex, timePosition) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        placedLoops: [...prev.placedLoops, { loop, trackIndex, timePosition }],
        action: 'loop-placed',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleLoopDelete: useCallback((loopId) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        placedLoops: prev.placedLoops.filter(l => l.loop.id !== loopId),
        action: 'loop-deleted',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleLoopMove: useCallback((loopId, newTimePosition) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        placedLoops: prev.placedLoops.map(l =>
          l.loop.id === loopId ? { ...l, timePosition: newTimePosition } : l
        ),
        action: 'loop-moved',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleLoopResize: useCallback((loopId, newDuration) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-resized',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleTrackHeaderClick: useCallback((trackIndex) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-header-clicked',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleTrackVolumeChange: useCallback((trackIndex, volume) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-volume-changed',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleSoloToggle: useCallback((trackIndex) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-solo-toggled',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleZoomChange: useCallback((zoomLevel) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'zoom-changed',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleLoopLibraryClick: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-library-clicked',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleVideoPlayerClick: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'video-player-clicked',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handleLoopPreview: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-previewed',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handlePlaybackStart: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'playback-started',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, []),

    handlePlaybackStop: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'playback-stopped',
        lastInteraction: Date.now()
      }));
      setIdleTime(0);
    }, [])
  };

  // Validate and advance challenge
  useEffect(() => {
    if (!currentChallenge || !dawContext.action || isProcessingClick || !isMountedRef.current) return;
    if (currentChallenge.type === 'multiple-choice') return;
    if (feedback) return;

    setIsProcessingClick(true);

    const isValid = currentChallenge.validation?.(dawContext) || false;
    
    if (isValid) {
      setIsProcessingSuccess(true);
      setFeedback({ 
        type: 'success', 
        message: currentChallenge.explanation || 'Correct! Well done!' 
      });
      
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      
      // Always auto-advance after showing success message
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          nextChallenge();
          setIsProcessingSuccess(false);
        }
      }, 1500); // 1.5 second delay to show the success message
    }

    setSafeTimeout(() => {
      if (isMountedRef.current) {
        setIsProcessingClick(false);
      }
    }, 300);
  }, [dawContext.action, currentChallenge, feedback, isProcessingClick, nextChallenge, setSafeTimeout]);

  // Handle multiple choice answer
  const handleMultipleChoiceAnswer = useCallback((choiceIndex) => {
    if (feedback || !isMountedRef.current) return;
    
    setUserAnswer(choiceIndex);
    
    const isCorrect = choiceIndex === currentChallenge.correctIndex;
    
    if (isCorrect) {
      setFeedback({ 
        type: 'success', 
        message: currentChallenge.explanation || 'Correct! Great job!' 
      });
      
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      
      // Always auto-advance for multiple choice questions after a brief delay
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          nextChallenge();
        }
      }, 1500); // 1.5 second delay to show the success message
    } else {
      setFeedback({ type: 'error', message: 'Not quite. Try again!' });
      
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          setFeedback(null);
          setUserAnswer(null);
        }
      }, 1500);
    }
  }, [currentChallenge, feedback, nextChallenge, setSafeTimeout]);

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
  }, [voiceEnabled, setSafeTimeout, speakText]);

  // DEV: Complete tutorial immediately
  const devCompleteAll = useCallback(() => {
    if (!completionCalledRef.current && isMountedRef.current) {
      completionCalledRef.current = true;
      
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
  }, [currentChallenge, speakText]);

  // Check if challenge can be attempted
  const canAttemptChallenge = useCallback(() => {
    if (currentChallenge && currentChallenge.requiresLoopPlaced && dawContext.placedLoops.length === 0) {
      return false;
    }
    return true;
  }, [currentChallenge, dawContext.placedLoops.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
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
  }, [isDAWReady, currentChallenge, currentChallengeIndex, voiceEnabled, setSafeTimeout, speakText]);

  // Idle timer
  useEffect(() => {
    if (!feedback && currentChallenge && currentChallenge.type !== 'multiple-choice' && isMountedRef.current) {
      const timer = setSafeTimeout(() => {
        if (isMountedRef.current) {
          setIdleTime(prev => prev + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [idleTime, feedback, currentChallenge, setSafeTimeout]);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">The tutorial encountered an error.</p>
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
    if (currentChallengeIndex >= DAW_CHALLENGES.length && !completionCalledRef.current && isMountedRef.current) {
      completionCalledRef.current = true;
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

      {/* Dev Tools */}
      {true && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-blue-700 transition-colors shadow-lg"
          >
            {showDevTools ? 'Hide' : 'Show'} Dev Tools
          </button>
          
          {showDevTools && (
            <div className="mt-2 bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-xl max-w-xs">
              <div className="text-blue-400 text-xs font-mono mb-2 font-bold">🛠️ DEV TOOLS</div>
              
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
                  className="w-full bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition-colors font-semibold"
                >
                  🚀 Complete All → Next Activity
                </button>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
                <div>Challenge: {currentChallengeIndex + 1}/{DAW_CHALLENGES.length}</div>
                <div>Completed: {completedChallenges.size}</div>
                <div>DAW Ready: {isDAWReady ? 'Yes' : 'No'}</div>
                <div>Mounted: {isMountedRef.current ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Opaque overlay when question is active - ONLY FOR MULTIPLE CHOICE */}
      {isDAWReady && currentChallenge.type === 'multiple-choice' && (
        <div className="absolute inset-0 bg-black/50 z-30 pointer-events-none" />
      )}

      {/* Message directing users to challenge bar - ONLY FOR MULTIPLE CHOICE */}
      {isDAWReady && currentChallenge.type === 'multiple-choice' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none">
          <div className="bg-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl border-4 border-orange-600 animate-pulse">
            <div className="text-xl font-bold text-center mb-2">👆 Answer the Question Above 👆</div>
            <div className="text-sm text-center">Look at the orange challenge bar at the top of the screen</div>
          </div>
        </div>
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