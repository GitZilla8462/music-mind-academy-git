// Feedback Prompt Component
// src/components/teacher/FeedbackPrompt.jsx
// Quick feedback collection after key milestones

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const FEEDBACK_GIVEN_KEY = 'teacher-feedback-given';
const FEEDBACK_DISMISSED_KEY = 'teacher-feedback-dismissed';

// Milestone types
export const MILESTONES = {
  FIRST_CLASS: 'first-class',
  FIRST_SESSION: 'first-session',
  FIRST_SUBMISSION: 'first-submission'
};

// Milestone messages
const MILESTONE_MESSAGES = {
  [MILESTONES.FIRST_CLASS]: {
    title: 'Nice! You created your first class',
    question: 'How was the experience?'
  },
  [MILESTONES.FIRST_SESSION]: {
    title: 'Great! You started your first session',
    question: 'How easy was it to get started?'
  },
  [MILESTONES.FIRST_SUBMISSION]: {
    title: 'You received your first submission!',
    question: 'How is the platform working for you?'
  }
};

const FeedbackPrompt = ({
  milestone,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(null); // 'positive' | 'negative' | null
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const milestoneData = MILESTONE_MESSAGES[milestone] || MILESTONE_MESSAGES[MILESTONES.FIRST_CLASS];

  // Check if feedback was already given for this milestone
  useEffect(() => {
    const feedbackData = localStorage.getItem(FEEDBACK_GIVEN_KEY);
    if (feedbackData) {
      try {
        const parsed = JSON.parse(feedbackData);
        if (parsed[milestone]) {
          // Already gave feedback for this milestone
          onClose?.();
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [milestone]);

  const handleRating = (type) => {
    setRating(type);
    if (type === 'negative') {
      setShowComment(true);
    }
  };

  const handleSubmit = () => {
    // Save that feedback was given
    const feedbackData = JSON.parse(localStorage.getItem(FEEDBACK_GIVEN_KEY) || '{}');
    feedbackData[milestone] = {
      rating,
      comment: comment || null,
      timestamp: Date.now()
    };
    localStorage.setItem(FEEDBACK_GIVEN_KEY, JSON.stringify(feedbackData));

    // Call the onSubmit callback
    onSubmit?.({
      milestone,
      rating,
      comment: comment || null
    });

    setSubmitted(true);

    // Auto-close after showing thank you
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  const handleDismiss = () => {
    // Mark as dismissed so we don't show again for this milestone
    const dismissedData = JSON.parse(localStorage.getItem(FEEDBACK_DISMISSED_KEY) || '{}');
    dismissedData[milestone] = true;
    localStorage.setItem(FEEDBACK_DISMISSED_KEY, JSON.stringify(dismissedData));
    onClose?.();
  };

  if (!isOpen) return null;

  // Show thank you message after submission
  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Thank you!</div>
              <div className="text-sm text-gray-500">Your feedback helps us improve</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{milestoneData.title}</div>
            <div className="text-xs text-gray-500">{milestoneData.question}</div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rating buttons */}
        <div className="px-4 py-4">
          {!showComment ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleRating('positive')}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                  rating === 'positive'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <ThumbsUp className={`w-8 h-8 ${rating === 'positive' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${rating === 'positive' ? 'text-green-700' : 'text-gray-600'}`}>
                  Great!
                </span>
              </button>

              <button
                onClick={() => handleRating('negative')}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                  rating === 'negative'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <ThumbsDown className={`w-8 h-8 ${rating === 'negative' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${rating === 'negative' ? 'text-red-700' : 'text-gray-600'}`}>
                  Could be better
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                We'd love to know how we can improve:
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be better?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                autoFocus
              />
            </div>
          )}

          {/* Submit button - show after rating or with comment */}
          {(rating === 'positive' || showComment) && (
            <div className="mt-4 flex justify-end gap-2">
              {showComment && (
                <button
                  onClick={() => setShowComment(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Send size={14} />
                Send Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Check if feedback prompt should be shown for a milestone
export const shouldShowFeedbackPrompt = (milestone) => {
  // Check if already gave feedback
  const feedbackData = localStorage.getItem(FEEDBACK_GIVEN_KEY);
  if (feedbackData) {
    try {
      const parsed = JSON.parse(feedbackData);
      if (parsed[milestone]) return false;
    } catch (e) {
      // Ignore
    }
  }

  // Check if dismissed
  const dismissedData = localStorage.getItem(FEEDBACK_DISMISSED_KEY);
  if (dismissedData) {
    try {
      const parsed = JSON.parse(dismissedData);
      if (parsed[milestone]) return false;
    } catch (e) {
      // Ignore
    }
  }

  return true;
};

// Reset feedback state (for testing)
export const resetFeedbackPrompts = () => {
  localStorage.removeItem(FEEDBACK_GIVEN_KEY);
  localStorage.removeItem(FEEDBACK_DISMISSED_KEY);
};

export default FeedbackPrompt;
