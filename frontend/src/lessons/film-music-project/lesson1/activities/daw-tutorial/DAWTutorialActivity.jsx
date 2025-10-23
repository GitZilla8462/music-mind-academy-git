// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/DAWTutorialActivity.jsx
// FINAL: Navigation tools dropdown from top right, exploration mode with timer after tutorial complete

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MusicComposer from '../../../../../pages/projects/film-music-score/composer/MusicComposer';
import ChallengePanel from './ChallengePanel';
import { DAW_CHALLENGES } from './challengeDefinitions';

const DAW_TUTORIAL_DURATION = 13 * 60 * 1000; // 13 minutes in milliseconds

const DAWTutorialActivity = ({ onComplete, navToolsEnabled = false, canAccessNavTools = false, lessonStartTime }) => {
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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.3);
  const [hasError, setHasError] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  
  // Timer and exploration mode state
  const [showExplorationMode, setShowExplorationMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Refs
  const isMountedRef = useRef(true);
  const completionCalledRef = useRef(false);
  const hasInitialized = useRef(false);
  const timeoutsRef = useRef([]);
  const hasSpokenFirstChallenge = useRef(false);
  const dawReadyTimeoutRef = useRef(null);
  const explorationTimerRef = useRef(null);

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

  // Fallback timeout to force DAW ready state after 5 seconds
  useEffect(() => {
    if (!isDAWReady) {
      console.log('⏱️ Starting 5-second fallback timer for DAW initialization...');
      dawReadyTimeoutRef.current = setTimeout(() => {
        if (!isDAWReady && isMountedRef.current) {
          console.warn('⚠️ DAW callback not received after 5s, forcing ready state');
          setIsDAWReady(true);
        }
      }, 5000);
    }

    return () => {
      if (dawReadyTimeoutRef.current) {
        clearTimeout(dawReadyTimeoutRef.current);
      }
    };
  }, [isDAWReady]);

  // Text-to-speech function
  const speakText = useCallback((text, enabled) => {
    if (!enabled || !('speechSynthesis' in window) || !isMountedRef.current) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = voiceVolume;

    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize US English voices to avoid weird accents
    const preferredVoice = voices.find(voice => 
      voice.lang === 'en-US' && (
        voice.name.includes('Google US English') ||
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Microsoft Mark') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex')
      )
    ) || voices.find(voice => voice.lang === 'en-US') || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('🎤 Using voice:', preferredVoice.name, preferredVoice.lang);
    }

    if (isMountedRef.current) {
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceVolume]);

  // Speak first challenge on DAW ready
  useEffect(() => {
    if (isDAWReady && !hasSpokenFirstChallenge.current && currentChallenge && voiceEnabled && isMountedRef.current) {
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          speakText(currentChallenge.question, voiceEnabled);
          hasSpokenFirstChallenge.current = true;
        }
      }, 1000);
    }
  }, [isDAWReady, currentChallenge, voiceEnabled, speakText, setSafeTimeout]);

  // Calculate time remaining when tutorial completes
  const calculateTimeRemaining = useCallback(() => {
    if (!lessonStartTime) return 0;
    
    const elapsed = Date.now() - lessonStartTime;
    const remaining = DAW_TUTORIAL_DURATION - elapsed;
    
    return Math.max(0, remaining);
  }, [lessonStartTime]);

  // Start exploration mode timer
  const startExplorationMode = useCallback(() => {
    const remaining = calculateTimeRemaining();
    
    console.log('🎉 Tutorial complete! Time remaining:', Math.floor(remaining / 1000), 'seconds');
    
    if (remaining <= 0) {
      // No time left, advance immediately
      console.log('⏰ No time remaining, advancing to next activity');
      setSafeTimeout(() => {
        if (isMountedRef.current && !completionCalledRef.current) {
          completionCalledRef.current = true;
          onComplete();
        }
      }, 2000); // Brief 2-second delay to show completion message
    } else {
      // Time remaining, show exploration mode
      setTimeRemaining(remaining);
      setShowExplorationMode(true);
      
      // Start countdown timer
      explorationTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          
          if (newTime <= 0) {
            // Time's up!
            if (explorationTimerRef.current) {
              clearInterval(explorationTimerRef.current);
            }
            
            console.log('⏰ Exploration time complete, advancing to next activity');
            
            if (isMountedRef.current && !completionCalledRef.current) {
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
              
              onComplete();
            }
            
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
  }, [calculateTimeRemaining, onComplete, setSafeTimeout]);

  // Next challenge
  const nextChallenge = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsProcessingSuccess(true);
    
    if (currentChallengeIndex >= DAW_CHALLENGES.length - 1) {
      // Tutorial complete - check time and start exploration or advance
      startExplorationMode();
      return;
    }
    
    setCurrentChallengeIndex(prev => prev + 1);
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setDawContext(prev => ({ ...prev, action: null }));
    
    // Speak the new challenge question
    const nextChallengeData = DAW_CHALLENGES[currentChallengeIndex + 1];
    if (nextChallengeData && voiceEnabled && isMountedRef.current) {
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          speakText(nextChallengeData.question, voiceEnabled);
        }
      }, 500);
    }
  }, [currentChallengeIndex, isProcessingSuccess, startExplorationMode, setSafeTimeout, voiceEnabled, speakText]);

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
    }, []),

    handleLoopDelete: useCallback((loopId) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        placedLoops: prev.placedLoops.filter(l => l.loop.id !== loopId),
        action: 'loop-deleted',
        lastInteraction: Date.now()
      }));
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
    }, []),

    handleLoopResize: useCallback((loopId, newDuration) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-resized',
        lastInteraction: Date.now()
      }));
    }, []),

    handleTrackHeaderClick: useCallback((trackIndex) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-header-clicked',
        lastInteraction: Date.now()
      }));
    }, []),

    handleTrackVolumeChange: useCallback((trackIndex, volume) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-volume-changed',
        lastInteraction: Date.now()
      }));
    }, []),

    handleSoloToggle: useCallback((trackIndex) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'track-solo-toggled',
        lastInteraction: Date.now()
      }));
    }, []),

    handleZoomChange: useCallback((zoomLevel) => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'zoom-changed',
        lastInteraction: Date.now()
      }));
    }, []),

    handleLoopLibraryClick: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-library-clicked',
        lastInteraction: Date.now()
      }));
    }, []),

    handleVideoPlayerClick: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'video-player-clicked',
        lastInteraction: Date.now()
      }));
    }, []),

    handleLoopPreview: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'loop-previewed',
        lastInteraction: Date.now()
      }));
    }, []),

    handlePlaybackStart: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'playback-started',
        lastInteraction: Date.now()
      }));
    }, []),

    handlePlaybackStop: useCallback(() => {
      if (!isMountedRef.current) return;
      
      setDawContext(prev => ({
        ...prev,
        action: 'playback-stopped',
        lastInteraction: Date.now()
      }));
    }, [])
  };

  // Validate and advance challenge
  useEffect(() => {
    if (!currentChallenge || !dawContext.action || isProcessingClick || !isMountedRef.current) return;
    if (currentChallenge.type === 'multiple-choice') return;
    if (feedback) return;

    setIsProcessingClick(true);

    const isValid = currentChallenge.validation?.(dawContext);

    if (isValid) {
      setFeedback({ type: 'success', message: 'Perfect! Great job!' });
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          setIsProcessingClick(false);
          nextChallenge();
        }
      }, 1500);
    } else {
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          setIsProcessingClick(false);
        }
      }, 100);
    }
  }, [dawContext.action, currentChallenge, feedback, isProcessingClick, nextChallenge, setSafeTimeout, dawContext]);

  // Handle multiple choice answers
  const handleMultipleChoiceAnswer = useCallback((answer, index) => {
    if (feedback || !currentChallenge || !isMountedRef.current) return;

    setUserAnswer(answer);
    const isCorrect = index === currentChallenge.correctIndex;

    if (isCorrect) {
      setFeedback({ 
        type: 'success', 
        message: currentChallenge.explanation || 'Perfect! Great job!' 
      });
      
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          nextChallenge();
        }
      }, 1500);
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

  // Navigation: Skip to any challenge
  const navSkipToChallenge = useCallback((index) => {
    if (index < 0 || index >= DAW_CHALLENGES.length || !isMountedRef.current) return;
    
    setCurrentChallengeIndex(index);
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setIsProcessingSuccess(false);
    setIsProcessingClick(false);
    setDawContext(prev => ({ ...prev, action: null }));
    hasSpokenFirstChallenge.current = false;
    
    // Speak the new challenge
    const newChallenge = DAW_CHALLENGES[index];
    if (newChallenge && voiceEnabled && isMountedRef.current) {
      setSafeTimeout(() => {
        if (isMountedRef.current) {
          speakText(newChallenge.question, voiceEnabled);
          hasSpokenFirstChallenge.current = true;
        }
      }, 500);
    }
  }, [voiceEnabled, speakText, setSafeTimeout]);

  // Navigation: Complete all immediately
  const navCompleteAll = useCallback(() => {
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
    if (currentChallenge && voiceEnabled && isMountedRef.current) {
      speakText(currentChallenge.question, voiceEnabled);
    }
  }, [currentChallenge, voiceEnabled, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
      if (dawReadyTimeoutRef.current) {
        clearTimeout(dawReadyTimeoutRef.current);
      }
      
      if (explorationTimerRef.current) {
        clearInterval(explorationTimerRef.current);
      }
      
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

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      loadVoices();
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // DAW ready callback
  const handleDAWReady = useCallback(() => {
    console.log('✅ DAW is ready for challenges (callback received)');
    
    // Clear the fallback timeout since we got the callback
    if (dawReadyTimeoutRef.current) {
      clearTimeout(dawReadyTimeoutRef.current);
      dawReadyTimeoutRef.current = null;
    }
    
    setIsDAWReady(true);
  }, []);

  // Format time for display
  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Error state
  if (hasError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-red-500 text-xl mb-4">Something went wrong</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state with safety check
  if (!currentChallenge && !hasError && !showExplorationMode) {
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
            <div className="text-gray-400 text-sm mt-4">This should only take a moment</div>
          </div>
        </div>
      )}

      {/* Navigation Tools Panel - Dropdown from top right */}
      {navToolsEnabled && canAccessNavTools && !showExplorationMode && (
        <div className="fixed top-16 right-4 z-50">
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-xl max-w-xs">
            <div className="text-blue-400 text-xs font-mono mb-2 font-bold">🧭 TUTORIAL NAVIGATION</div>
            
            {/* Activity Navigator */}
            <div className="mb-3">
              <div className="text-gray-300 text-xs mb-2 font-semibold">Jump to Challenge:</div>
              <div className="grid grid-cols-5 gap-1">
                {DAW_CHALLENGES.map((challenge, index) => (
                  <button
                    key={index}
                    onClick={() => navSkipToChallenge(index)}
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
                onClick={() => navSkipToChallenge(currentChallengeIndex + 1)}
                disabled={currentChallengeIndex >= DAW_CHALLENGES.length - 1}
                className="w-full bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Skip to Next Challenge
              </button>
              <button
                onClick={navCompleteAll}
                className="w-full bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                🚀 Complete All → Next Activity
              </button>
            </div>
            
            {/* Current Status */}
            <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
              <div>Challenge: {currentChallengeIndex + 1}/{DAW_CHALLENGES.length}</div>
              <div>Completed: {completedChallenges.size}</div>
              <div>DAW Ready: {isDAWReady ? 'Yes' : 'No'}</div>
              <div>Voice: {voiceEnabled ? 'ON' : 'OFF'}</div>
              <div>Volume: {Math.round(voiceVolume * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Opaque overlay when question is active - ONLY FOR MULTIPLE CHOICE */}
      {isDAWReady && !showExplorationMode && currentChallenge?.type === 'multiple-choice' && (
        <div className="absolute inset-0 bg-black/50 z-30 pointer-events-none" />
      )}

      {/* Message directing users to challenge bar - ONLY FOR MULTIPLE CHOICE */}
      {isDAWReady && !showExplorationMode && currentChallenge?.type === 'multiple-choice' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none">
          <div className="bg-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl border-4 border-orange-600 animate-pulse">
            <div className="text-xl font-bold text-center mb-2">👆 Answer the Question Above 👆</div>
            <div className="text-sm text-center">Look at the orange challenge bar at the top of the screen</div>
          </div>
        </div>
      )}

      {/* Challenge Panel - Show during tutorial or exploration mode */}
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
          voiceVolume={voiceVolume}
          setVoiceVolume={setVoiceVolume}
          onMultipleChoiceAnswer={handleMultipleChoiceAnswer}
          onNextChallenge={nextChallenge}
          onSkipChallenge={skipChallenge}
          onRepeatQuestion={repeatQuestion}
          showExplorationMode={showExplorationMode}
          timeRemaining={timeRemaining}
          formatTime={formatTime}
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
          onDAWReadyCallback={handleDAWReady}
          tutorialMode={!showExplorationMode}
          preselectedVideo={{
            id: 'daw-tutorial',
            title: 'DAW Tutorial',
            duration: 60,
            videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
          }}
          lockFeatures={showExplorationMode ? {} : (currentChallenge?.lockFeatures || {})}
        />
      </div>
    </div>
  );
};

export default DAWTutorialActivity;