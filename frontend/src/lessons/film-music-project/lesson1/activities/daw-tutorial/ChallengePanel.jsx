// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/ChallengePanel.jsx

import React from 'react';
import { Volume2, VolumeX, HelpCircle, ChevronDown, ChevronUp, SkipForward, CheckCircle, XCircle } from 'lucide-react';

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
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-bold text-gray-800">
            Challenge {currentChallengeIndex + 1} of {totalChallenges}
          </h2>
          
          {/* Repeat Question Button */}
          <button
            onClick={onRepeatQuestion}
            className="text-blue-600 hover:text-blue-700 text-xs underline"
          >
            Repeat Question
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300"></div>

          {/* Volume Toggle - Small */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded transition-colors ${
              voiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}
            title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Hint Button - Small */}
          {currentChallenge.hint && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              title="Show hint"
            >
              <HelpCircle size={14} />
              <span className="text-xs font-medium">Hint</span>
            </button>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isPanelCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Main Content - Compact with Fixed Height */}
      {!isPanelCollapsed && (
        <div className="px-6 pb-4">
          {/* Question and Feedback Row */}
          <div className="flex items-start gap-4 mb-3">
            {/* Question - Left Side */}
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {currentChallenge.question}
              </p>
              <p className="text-sm text-gray-600">
                {currentChallenge.instruction}
              </p>
            </div>

            {/* Feedback Badge - Right Side (Fixed Position) */}
            {feedback && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 whitespace-nowrap ${
                feedback.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0" />
                ) : (
                  <XCircle size={20} className="flex-shrink-0" />
                )}
                <span className="font-semibold text-sm">{feedback.message}</span>
              </div>
            )}
          </div>

          {/* Answer choices - HORIZONTAL LAYOUT */}
          {currentChallenge.type === 'multiple-choice' && (
            <div className="flex gap-3 mb-3">
              {currentChallenge.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onMultipleChoiceAnswer(index)}
                  disabled={feedback !== null && userAnswer === index}
                  className={`flex-1 text-center px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
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

          {/* Explanation - Only shows when needed */}
          {showExplanation && currentChallenge.explanation && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <p className="text-blue-900 text-sm">{currentChallenge.explanation}</p>
            </div>
          )}

          {/* Hint Content - Only shows when requested */}
          {showHint && currentChallenge.hint && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
              <p className="text-yellow-900 text-sm"><strong>Hint:</strong> {currentChallenge.hint}</p>
            </div>
          )}

          {/* Action Buttons Row - Only Skip and Next */}
          <div className="flex items-center space-x-3">
            {/* Skip button - NOW BLUE */}
            {currentChallenge.allowSkip && (
              <button
                onClick={onSkipChallenge}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              >
                <SkipForward size={16} />
                <span className="text-xs font-medium">Skip</span>
              </button>
            )}

            {/* Next button (for multiple choice after correct answer) */}
            {currentChallenge.type === 'multiple-choice' && 
             feedback?.type === 'success' && 
             !currentChallenge.autoAdvanceOnCorrect && (
              <button
                onClick={onNextChallenge}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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