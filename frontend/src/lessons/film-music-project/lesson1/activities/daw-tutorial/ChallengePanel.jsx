// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengePanel.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, SkipForward, CheckCircle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';

const ChallengePanel = ({
  currentChallenge,
  currentChallengeIndex,
  totalChallenges,
  progressPercent,
  isPanelCollapsed,
  setIsPanelCollapsed,
  userAnswer,
  feedback,
  showHint,
  setShowHint,
  showExplanation,
  voiceEnabled,
  setVoiceEnabled,
  voiceVolume,
  setVoiceVolume,
  onMultipleChoiceAnswer,
  onNextChallenge,
  onSkipChallenge,
  onRepeatQuestion,
  showExplorationMode = false,
  timeRemaining = 0,
  formatTime = (ms) => '0:00'
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(() => {
    // Start in bottom right corner
    const panelWidth = 400;
    const panelHeight = 400;
    return {
      x: window.innerWidth - panelWidth - 20,
      y: window.innerHeight - panelHeight - 20
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e) => {
    // Only drag if clicking directly on the drag-handle, not on buttons or slider
    const target = e.target;
    const isDragHandleText = target.classList.contains('drag-handle') || 
                            (target.closest('.drag-handle') && !target.closest('button') && !target.closest('input'));
    
    if (isDragHandleText) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: position.x,
        initialY: position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setPosition({
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const needsClickThrough = !showExplorationMode && (currentChallenge?.type === 'interactive-task' || 
                           currentChallenge?.type === 'identify-click');

  const handleVolumeChange = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    const newVolume = parseFloat(e.target.value);
    setVoiceVolume(newVolume);
    
    console.log('Volume changed to:', newVolume);
    
    // If currently speaking, cancel and restart with new volume
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        if (voiceEnabled && currentChallenge) {
          const utterance = new SpeechSynthesisUtterance(currentChallenge.question);
          utterance.volume = newVolume;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
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
          }
          
          window.speechSynthesis.speak(utterance);
          console.log('🎙️ Restarted speech with new volume:', newVolume);
        }
      }, 100);
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setVoiceEnabled(!voiceEnabled);
    console.log('Voice toggled:', !voiceEnabled);
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          width: '250px',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
        className="bg-white rounded-lg shadow-2xl border-4 border-orange-500"
        onMouseDown={handleMouseDown}
      >
        <div className="drag-handle bg-orange-500 px-4 py-2 flex items-center justify-between cursor-move">
          <div className="text-white font-bold text-sm">
            {showExplorationMode ? 'Exploration Mode' : `Challenge ${currentChallengeIndex + 1}/${totalChallenges}`}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
            title="Restore panel"
          >
            <Maximize2 size={16} className="text-white" />
          </button>
        </div>
        <div className="px-4 py-2 text-sm text-gray-600">
          Click to restore
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: '400px',
        zIndex: 1000,
        pointerEvents: needsClickThrough ? 'none' : 'auto'
      }}
      className="bg-white rounded-lg shadow-2xl border-4 border-orange-500 overflow-hidden flex flex-col"
      onMouseDown={handleMouseDown}
    >
      <div 
        className="h-1 bg-gray-200 flex-shrink-0"
        style={{ pointerEvents: 'auto' }}
      >
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div 
        className="drag-handle bg-orange-500 px-4 py-1.5 flex items-center justify-between cursor-move flex-shrink-0"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="text-white font-bold text-xs pointer-events-none">
          {showExplorationMode ? 'Exploration Mode' : 'Challenge Question'}
        </div>
        
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <div 
            className="flex items-center gap-1 bg-white/20 rounded px-2 py-1"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Volume2 size={14} className="text-white flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceVolume}
              onChange={handleVolumeChange}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${voiceVolume * 100}%, rgba(255,255,255,0.3) ${voiceVolume * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
              title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
            />
          </div>

          <button
            onClick={handleMuteToggle}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded transition-colors ${
              voiceEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={voiceEnabled ? "Mute voice" : "Unmute voice"}
          >
            {voiceEnabled ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
          </button>

          {!showExplorationMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(!showHint);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1.5 bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
              title="Show hint"
            >
              <HelpCircle size={16} className="text-white" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
            title="Minimize panel"
          >
            <Minimize2 size={16} className="text-white" />
          </button>
        </div>
      </div>

      {!showExplorationMode && (
        <div 
          className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-xs font-semibold text-gray-600">
            Challenge {currentChallengeIndex + 1} of {totalChallenges}
          </div>
        </div>
      )}

      <div 
        className="px-4 py-4 flex-1 overflow-y-auto"
        style={{ pointerEvents: 'auto' }}
      >
        {showExplorationMode ? (
          // EXPLORATION MODE CONTENT
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="animate-bounce">
              <Sparkles className="text-yellow-500 mx-auto" size={64} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Tutorial Complete!
              </h2>
              <p className="text-gray-700 text-base leading-relaxed">
                Excellent work! Use the remaining time to explore and create music freely.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 w-full">
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                Time Remaining:
              </div>
              <div className="text-5xl font-bold text-green-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-gray-500">
                The DAW is fully unlocked - experiment!
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <div className="font-semibold mb-2">💡 Try these ideas:</div>
              <ul className="text-left space-y-1 text-xs">
                <li>• Add more loops and layer different sounds</li>
                <li>• Adjust volume levels on each track</li>
                <li>• Move loops around to different times</li>
                <li>• Use the solo button to hear one track</li>
              </ul>
            </div>
          </div>
        ) : (
          // CHALLENGE QUESTION CONTENT
          <>
            <p className="text-gray-800 text-base leading-relaxed mb-4">
              {currentChallenge?.question}
            </p>

            {currentChallenge?.type === 'multiple-choice' && (
              <div className="space-y-2 mt-4">
                {currentChallenge.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => onMultipleChoiceAnswer(choice, index)}
                    disabled={feedback !== null && userAnswer === choice}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                      userAnswer === choice
                        ? feedback?.type === 'success'
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-800'
                    } ${feedback !== null && userAnswer === choice ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {currentChallenge?.type === 'interactive-task' && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm font-medium">
                  {currentChallenge.instruction}
                </p>
              </div>
            )}

            {currentChallenge?.type === 'identify-click' && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm font-medium">
                  {currentChallenge.instruction}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {!showExplorationMode && showHint && (
        <div 
          className="px-4 py-3 bg-yellow-50 border-t-2 border-yellow-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-sm text-yellow-900">
            <span className="font-semibold">💡 Hint:</span> {currentChallenge?.hint}
          </div>
        </div>
      )}

      {!showExplorationMode && feedback && (
        <div 
          className={`px-4 py-3 border-t-2 flex items-center gap-2 flex-shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          ) : (
            <XCircle className="text-red-600 flex-shrink-0" size={20} />
          )}
          <span className={`text-sm font-medium ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {feedback.message}
          </span>
        </div>
      )}

      {!showExplorationMode && showExplanation && currentChallenge?.explanation && (
        <div 
          className="px-4 py-3 bg-green-50 border-t-2 border-green-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-sm text-green-900">
            <span className="font-semibold">✓ Explanation:</span> {currentChallenge.explanation}
          </div>
        </div>
      )}

      {!showExplorationMode && currentChallenge?.allowSkip && (
        <div 
          className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={onSkipChallenge}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <SkipForward size={16} />
            Skip Challenge
          </button>
        </div>
      )}
    </div>
  );
};

export default ChallengePanel;