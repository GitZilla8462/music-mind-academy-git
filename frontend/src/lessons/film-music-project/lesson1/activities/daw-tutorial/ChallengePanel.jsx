// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengePanel.jsx

import React from 'react';
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
  onMultipleChoiceAnswer,
  onNextChallenge,
  onSkipChallenge,
  onRepeatQuestion
}) => {
  return (
    <div className="bg-white border-8 border-orange-500 shadow-2xl z-40 relative">
      {/* Progress Bar - Ultra Thin */}
      <div className="h-0.5 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Single Row - Everything Horizontal */}
      <div className="px-3 py-1.5 flex items-center gap-3 overflow-x-auto">
        {/* Challenge Number - Far Left */}
        <div className="text-xs font-bold text-gray-700 whitespace-nowrap flex-shrink-0">
          Challenge {currentChallengeIndex + 1}/{totalChallenges}
        </div>
        
        {/* Divider */}
        <div className="h-4 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Question */}
        <div className="text-xs text-gray-800 whitespace-nowrap flex-shrink-0">
          {currentChallenge.question}
        </div>

        {/* Skip button - Right after question */}
        {currentChallenge.allowSkip && (
          <button
            onClick={onSkipChallenge}
            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            <SkipForward size={12} />
            <span className="text-xs font-medium">Skip</span>
          </button>
        )}

        {/* Answer Choices - After skip button */}
        {currentChallenge.type === 'multiple-choice' && (
          <>
            {currentChallenge.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onMultipleChoiceAnswer(index)}
                disabled={feedback !== null && userAnswer === index}
                className={`px-2 py-1 rounded border text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
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
          </>
        )}

        {/* Spacer to push buttons right */}
        <div className="flex-1"></div>

        {/* Feedback Icon */}
        {feedback && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {feedback.type === 'success' ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <XCircle className="text-red-600" size={16} />
            )}
            <span className={`text-xs font-medium ${
              feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback.message}
            </span>
          </div>
        )}

        {/* Hint Button */}
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex-shrink-0"
          title="Show hint"
        >
          <HelpCircle size={12} />
          <span className="text-xs font-medium">Hint</span>
        </button>

        {/* Voice Toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors flex-shrink-0"
          title={voiceEnabled ? "Disable voice" : "Enable voice"}
        >
          {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </button>

        {/* Repeat Question Button */}
        <button
          onClick={onRepeatQuestion}
          className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0 text-xs font-medium"
          title="Repeat question"
        >
          🔊
        </button>
      </div>

      {/* Hint Panel - Slides down below the main row */}
      {showHint && (
        <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="text-xs text-yellow-900">
            <span className="font-semibold">Hint:</span> {currentChallenge.hint}
          </div>
        </div>
      )}

      {/* Explanation Panel - Shows after correct answer */}
      {showExplanation && currentChallenge.explanation && (
        <div className="px-3 py-2 bg-green-50 border-t border-green-200">
          <div className="text-xs text-green-900">
            <span className="font-semibold">Explanation:</span> {currentChallenge.explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengePanel;