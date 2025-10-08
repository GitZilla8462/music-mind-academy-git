// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/DAWTutorialActivity.jsx
// Main orchestration component for the DAW tutorial

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MusicComposer from "../../../../../pages/projects/film-music-score/composer/MusicComposer";
import { DAW_CHALLENGES } from './challengeDefinitions';
import { useChallengeHandlers } from './challengeHandlers';
import { speakText } from '../../../../components/shared/textToSpeech';
import ChallengePanel from './ChallengePanel';
import CompletionScreen from './CompletionScreen';

const DAWTutorialActivity = ({ onComplete }) => {
  const hasInitialized = useRef(false);
  const completionCalledRef = useRef(false);
  
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
  
  const [dawContext, setDawContext] = useState({
    placedLoops: [],
    action: null,
    trackIndex: null,
    zoomLevel: 1,
    zoomDirection: null
  });

  const currentChallenge = DAW_CHALLENGES[currentChallengeIndex];
  const progressPercent = (completedChallenges.size / DAW_CHALLENGES.length) * 100;

  // Initialize only once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('DAW Tutorial initialized - Total challenges:', DAW_CHALLENGES.length);
    }
  }, []);

  // Auto-ready after short delay (simulates DAW initialization)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDAWReady(true);
    }, 2000); // 2 second delay to allow DAW to initialize
    
    return () => clearTimeout(timer);
  }, []);

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Speak first challenge question after DAW is ready
  useEffect(() => {
    if (isDAWReady && currentChallenge && currentChallengeIndex === 0 && voiceEnabled) {
      const timer = setTimeout(() => {
        speakText(currentChallenge.question, voiceEnabled);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDAWReady, currentChallenge, currentChallengeIndex, voiceEnabled]);

  // Idle timer
  useEffect(() => {
    if (!feedback && currentChallenge && currentChallenge.type !== 'multiple-choice') {
      const timer = setInterval(() => {
        setIdleTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setIdleTime(0);
    }
  }, [feedback, currentChallenge]);

  // Success handler with rapid-fire protection
  const handleCorrectAction = useCallback(() => {
    if (isProcessingSuccess) {
      console.log('Already processing success, ignoring duplicate call');
      return;
    }
    
    setIsProcessingSuccess(true);
    setFeedback({ type: 'success', message: 'Correct! Well done!' });
    setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
    setIdleTime(0);
    
    setTimeout(() => {
      if (currentChallengeIndex < DAW_CHALLENGES.length - 1) {
        nextChallenge();
        setTimeout(() => setIsProcessingSuccess(false), 100);
      } else {
        if (!completionCalledRef.current) {
          completionCalledRef.current = true;
          setTimeout(() => {
            onComplete();
          }, 1500);
        }
      }
    }, 1500);
  }, [isProcessingSuccess, currentChallenge, currentChallengeIndex, onComplete]);

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
    setUserAnswer(choiceIndex);
    
    const isCorrect = choiceIndex === currentChallenge.correctIndex;
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Correct!' });
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.id]));
      setShowExplanation(true);
      
      setTimeout(() => {
        if (currentChallenge.autoAdvanceOnCorrect) {
          nextChallenge();
        }
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: 'Not quite. Try again!' });
    }
  }, [currentChallenge]);

  // Navigate to next challenge
  const nextChallenge = useCallback(() => {
    setCurrentChallengeIndex(prev => {
      const newIndex = prev + 1;
      
      setTimeout(() => {
        if (newIndex < DAW_CHALLENGES.length) {
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
  }, [voiceEnabled]);

  // Skip challenge
  const skipChallenge = useCallback(() => {
    if (currentChallenge.allowSkip) {
      nextChallenge();
    }
  }, [currentChallenge, nextChallenge]);

  // DEV: Skip to any challenge
  const devSkipToChallenge = useCallback((index) => {
    if (index < 0 || index >= DAW_CHALLENGES.length) return;
    
    setCurrentChallengeIndex(index);
    setUserAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setIdleTime(0);
    setIsProcessingSuccess(false);
    setIsProcessingClick(false);
    setDawContext(prev => ({ ...prev, action: null }));
    
    setTimeout(() => {
      const newChallenge = DAW_CHALLENGES[index];
      if (newChallenge) {
        speakText(newChallenge.question, voiceEnabled);
      }
    }, 500);
  }, [voiceEnabled]);

  // DEV: Complete tutorial immediately
  const devCompleteAll = useCallback(() => {
    if (!completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  // Repeat question
  const repeatQuestion = useCallback(() => {
    speakText(currentChallenge.question, true);
  }, [currentChallenge]);

  // Check if challenge can be attempted
  const canAttemptChallenge = useCallback(() => {
    if (currentChallenge && currentChallenge.requiresLoopPlaced && dawContext.placedLoops.length === 0) {
      return false;
    }
    return true;
  }, [currentChallenge, dawContext.placedLoops.length]);

  // Completion screen
  if (currentChallengeIndex >= DAW_CHALLENGES.length) {
    return <CompletionScreen />;
  }

  // Loading state
  if (!currentChallenge) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading challenge...</div>
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

      {/* DEV TOOLS - Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-purple-700 transition-colors shadow-lg"
        >
          {showDevTools ? 'Hide' : 'Show'} Dev Tools
        </button>
        
        {showDevTools && (
          <div className="mt-2 bg-gray-800 border-2 border-purple-500 rounded-lg p-3 shadow-xl max-w-xs">
            <div className="text-purple-400 text-xs font-mono mb-2 font-bold">DEV TOOLS</div>
            
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
                className="w-full bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                Complete All
              </button>
            </div>
            
            {/* Current Status */}
            <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
              <div>Challenge: {currentChallengeIndex + 1}/{DAW_CHALLENGES.length}</div>
              <div>Completed: {completedChallenges.size}</div>
              <div>DAW Ready: {isDAWReady ? 'Yes' : 'No'}</div>
              <div className="text-purple-400 mt-1 truncate" title={currentChallenge.question}>
                {currentChallenge.question.slice(0, 30)}...
              </div>
            </div>
          </div>
        )}
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
                  setShowHint(true);
                  setIdleTime(0);
                }}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Show Hint
              </button>
              <button
                onClick={() => setIdleTime(0)}
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