// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengePanel.jsx

import React from 'react';
import { Volume2, HelpCircle, ChevronDown, ChevronUp, SkipForward } from 'lucide-react';

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
    <div className={`bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ${
      isPanelCollapsed ? 'h-16' : 'h-auto'
    } z-40 relative`}>
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold text-gray-800">
            Challenge {currentChallengeIndex + 1} of {totalChallenges}
          </h2>
          <button
            onClick={onRepeatQuestion}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Repeat Question
          </button>
        </div>
        
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isPanelCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Main Content */}
      {!isPanelCollapsed && (
        <div className="px-6 pb-6 space-y-4">
          {/* Question */}
          <div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {currentChallenge.question}
            </p>
            <p className="text-sm text-gray-600">
              {currentChallenge.instruction}
            </p>
          </div>

          {/* Answer choices - UPDATED: max-w-2xl for left alignment */}
          {currentChallenge.type === 'multiple-choice' && (
            <div className="space-y-3 max-w-2xl">
              {currentChallenge.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onMultipleChoiceAnswer(index)}
                  disabled={feedback !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    userAnswer === index
                      ? feedback?.type === 'success'
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'
                  } ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="font-medium text-gray-800">{choice}</span>
                </button>
              ))}
            </div>
          )}

          {/* Feedback - UPDATED: max-w-2xl for left alignment */}
          {feedback && (
            <div className={`p-4 rounded-lg max-w-2xl ${
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.message}
              </p>
            </div>
          )}

          {/* Explanation - UPDATED: max-w-2xl for left alignment */}
          {showExplanation && currentChallenge.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl">
              <p className="text-blue-900">{currentChallenge.explanation}</p>
            </div>
          )}

          {/* Hint - UPDATED: max-w-2xl for left alignment */}
          {showHint && currentChallenge.hint && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl">
              <p className="text-yellow-900"><strong>Hint:</strong> {currentChallenge.hint}</p>
            </div>
          )}

          {/* Icons row - UPDATED: max-w-2xl for left alignment */}
          <div className="flex items-center space-x-3 max-w-2xl">
            {/* Volume button */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              <Volume2 size={20} />
            </button>

            {/* Hint button */}
            {currentChallenge.hint && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <HelpCircle size={18} />
                <span className="text-sm font-medium">Show Hint</span>
              </button>
            )}

            {/* Skip button */}
            {currentChallenge.allowSkip && (
              <button
                onClick={onSkipChallenge}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <SkipForward size={18} />
                <span className="text-sm font-medium">Skip</span>
              </button>
            )}

            {/* Next button (for multiple choice after correct answer) */}
            {currentChallenge.type === 'multiple-choice' && 
             feedback?.type === 'success' && 
             !currentChallenge.autoAdvanceOnCorrect && (
              <button
                onClick={onNextChallenge}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next Challenge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengePanel;