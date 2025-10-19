// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengePanel.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, SkipForward, CheckCircle, XCircle } from 'lucide-react';

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
  onRepeatQuestion
}) => {
  const [position, setPosition] = useState({ 
    x: window.innerWidth / 2 - 200, 
    y: 200
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

  const needsClickThrough = currentChallenge.type === 'interactive-task' || 
                           currentChallenge.type === 'identify-click';

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
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.lang.startsWith('en')
          );
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
          console.log('🔊 Restarted speech with new volume:', newVolume);
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
          Challenge Question
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
        </div>
      </div>

      <div 
        className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex-shrink-0"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="text-xs font-semibold text-gray-600">
          Challenge {currentChallengeIndex + 1} of {totalChallenges}
        </div>
      </div>

      <div 
        className="px-4 py-4 flex-1 overflow-y-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <p className="text-gray-800 text-base leading-relaxed mb-4">
          {currentChallenge.question}
        </p>

        {currentChallenge.type === 'multiple-choice' && (
          <div className="space-y-2 mt-4">
            {currentChallenge.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onMultipleChoiceAnswer(index)}
                disabled={feedback !== null && userAnswer === index}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                  userAnswer === index
                    ? feedback?.type === 'success'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-red-500 bg-red-50 text-red-900'
                    : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-800'
                } ${feedback !== null && userAnswer === index ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {currentChallenge.type === 'interactive-task' && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm font-medium">
              {currentChallenge.instruction}
            </p>
          </div>
        )}

        {currentChallenge.type === 'identify-click' && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm font-medium">
              {currentChallenge.instruction}
            </p>
          </div>
        )}
      </div>

      {showHint && (
        <div 
          className="px-4 py-3 bg-yellow-50 border-t-2 border-yellow-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-sm text-yellow-900">
            <span className="font-semibold">💡 Hint:</span> {currentChallenge.hint}
          </div>
        </div>
      )}

      {feedback && (
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

      {showExplanation && currentChallenge.explanation && (
        <div 
          className="px-4 py-3 bg-green-50 border-t-2 border-green-200 flex-shrink-0"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-sm text-green-900">
            <span className="font-semibold">✓ Explanation:</span> {currentChallenge.explanation}
          </div>
        </div>
      )}

      {currentChallenge.allowSkip && (
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