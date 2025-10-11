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
    <div className="bg-white border-b border-gray-200 shadow-lg z-40 relative">
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

        {/* Feedback Badge - Inline */}
        {feedback && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded border whitespace-nowrap flex-shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle size={12} />
            ) : (
              <XCircle size={12} />
            )}
            <span className="font-semibold text-xs">{feedback.message}</span>
          </div>
        )}

        {/* Next button (for multiple choice after correct answer) */}
        {currentChallenge.type === 'multiple-choice' && 
         feedback?.type === 'success' && 
         !currentChallenge.autoAdvanceOnCorrect && (
          <button
            onClick={onNextChallenge}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-xs whitespace-nowrap flex-shrink-0"
          >
            Next
          </button>
        )}

        {/* Spacer to push right-side items to the end */}
        <div className="flex-1 min-w-4"></div>

        {/* Right Side - Hint and Volume only */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Hint Button */}
          {currentChallenge.hint && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              title="Show hint"
            >
              <HelpCircle size={12} />
              <span className="text-xs font-medium">Hint</span>
            </button>
          )}

          {/* Volume Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1 rounded transition-colors ${
              voiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}
            title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Content - Only for Hint/Explanation (shown below when needed) */}
      {(showHint || showExplanation) && (
        <div className="px-3 pb-2 space-y-1">
          {/* Explanation - Compact */}
          {showExplanation && currentChallenge.explanation && (
            <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
              {currentChallenge.explanation}
            </div>
          )}

          {/* Hint Content - Compact */}
          {showHint && currentChallenge.hint && (
            <div className="p-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-900">
              <strong>Hint:</strong> {currentChallenge.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengePanel;