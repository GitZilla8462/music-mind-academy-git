import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { saveMidPilotSurveyStandalone } from '../firebase/analytics';

const MidPilotSurveyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [favoriteOther, setFavoriteOther] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [skippedParts, setSkippedParts] = useState('');
  const [studentQuotes, setStudentQuotes] = useState('');
  const [onTrack, setOnTrack] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const featureOptions = [
    { id: 'daw', label: 'The DAW (composition tool)' },
    { id: 'layer-detective', label: 'Layer Detective game' },
    { id: 'video-scoring', label: 'Video scoring activities' },
    { id: 'loop-library', label: 'Loop library' },
    { id: 'other', label: 'Other' }
  ];

  const trackOptions = [
    { id: 'yes', label: 'Yes' },
    { id: 'probably', label: 'Probably' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'no', label: 'No' }
  ];

  const canSubmit = favoriteFeature && improvementSuggestion.trim() && onTrack;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await saveMidPilotSurveyStandalone({
        teacherEmail: email,
        favoriteFeature: favoriteFeature === 'other' ? `Other: ${favoriteOther}` : favoriteFeature,
        improvementSuggestion: improvementSuggestion.trim(),
        skippedParts: skippedParts.trim(),
        studentQuotes: studentQuotes.trim(),
        onTrack,
        submittedAt: Date.now()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to save survey:', err);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your feedback helps us make Music Mind Academy better for you and your students.
          </p>
          <p className="text-gray-500 text-sm mt-4">You can close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            Mid-Pilot Check-In
          </h1>
          <p className="text-purple-100 text-sm mt-1">
            You're halfway through! Help us make this better.
          </p>
          {email && (
            <p className="text-purple-200 text-xs mt-2">{email}</p>
          )}
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Q1: Favorite Feature */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Which feature do students enjoy most? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {featureOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFavoriteFeature(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    favoriteFeature === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {favoriteFeature === 'other' && (
                <input
                  type="text"
                  value={favoriteOther}
                  onChange={(e) => setFavoriteOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mt-2"
                />
              )}
            </div>
          </div>

          {/* Q2: Improvement (required) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's ONE thing that would make this significantly better? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Your most important suggestion..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-20"
            />
          </div>

          {/* Q3: Skipped Parts (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Have you had to skip or modify any parts? If so, why?
            </p>
            <textarea
              value={skippedParts}
              onChange={(e) => setSkippedParts(e.target.value)}
              placeholder="Optional - helps us understand pacing issues"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q4: Student Quotes (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-1">
              Any student quotes or reactions worth sharing?
            </p>
            <p className="text-sm text-gray-500 mb-2">These help us understand what's working!</p>
            <textarea
              value={studentQuotes}
              onChange={(e) => setStudentQuotes(e.target.value)}
              placeholder="e.g., 'This is actually fun!' or 'Can we do this again?'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q5: On Track */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Are you on track to finish all 5 lessons by end of the pilot? <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {trackOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setOnTrack(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    onTrack === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !canSubmit || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit Survey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MidPilotSurveyPage;
