import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { saveMidPilotSurveyStandalone } from '../firebase/analytics';

const MidPilotSurveyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [confidence, setConfidence] = useState('');
  const [easeOfUse, setEaseOfUse] = useState('');
  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [favoriteOther, setFavoriteOther] = useState('');
  const [lessonTiming, setLessonTiming] = useState('');
  const [hadIssues, setHadIssues] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [colleagueResponse, setColleagueResponse] = useState('');
  const [studentQuotes, setStudentQuotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const confidenceOptions = [
    { id: 'very-confident', label: 'Very confident' },
    { id: 'somewhat-confident', label: 'Somewhat confident' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'not-very-confident', label: 'Not very confident' },
    { id: 'not-confident', label: 'Not confident at all' }
  ];

  const easeOptions = [
    { id: 'very-easy', label: 'Very easy' },
    { id: 'easy', label: 'Easy' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'difficult', label: 'Difficult' },
    { id: 'very-difficult', label: 'Very difficult' }
  ];

  const featureOptions = [
    { id: 'daw', label: 'The DAW (composition tool)' },
    { id: 'layer-detective', label: 'Layer Detective game' },
    { id: 'video-scoring', label: 'Video scoring activities' },
    { id: 'loop-library', label: 'Loop library' },
    { id: 'other', label: 'Other' }
  ];

  const timingOptions = [
    { id: 'too-short', label: 'Too short' },
    { id: 'just-right', label: 'Just right' },
    { id: 'too-long', label: 'Too long' },
    { id: 'varies', label: 'Varies by lesson' }
  ];

  const issueOptions = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' }
  ];

  const canSubmit = confidence && easeOfUse && favoriteFeature && improvementSuggestion.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await saveMidPilotSurveyStandalone({
        teacherEmail: email,
        confidence,
        easeOfUse,
        favoriteFeature: favoriteFeature === 'other' ? `Other: ${favoriteOther}` : favoriteFeature,
        lessonTiming,
        hadIssues,
        issueDescription: issueDescription.trim(),
        improvementSuggestion: improvementSuggestion.trim(),
        colleagueResponse: colleagueResponse.trim(),
        studentQuotes: studentQuotes.trim(),
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
          {/* Q1: Confidence */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              How confident do you feel teaching with Music Mind Academy? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {confidenceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setConfidence(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    confidence === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Ease of Use */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              How easy is it to teach with Music Mind Academy? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {easeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setEaseOfUse(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    easeOfUse === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Favorite Feature */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Which feature do your students enjoy most? <span className="text-red-500">*</span>
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

          {/* Q4: Lesson Timing */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Are the lessons taking the expected amount of time?
            </p>
            <div className="flex flex-wrap gap-2">
              {timingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLessonTiming(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    lessonTiming === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Technical Issues */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Did you encounter any technical issues or bugs in Lessons 1-3?
            </p>
            <div className="flex gap-2">
              {issueOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setHadIssues(option.id)}
                  className={`px-6 py-2 rounded-lg border-2 transition-all ${
                    hadIssues === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {hadIssues === 'yes' && (
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Briefly describe what happened..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16 mt-2"
              />
            )}
          </div>

          {/* Q6: Improvement (required) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's ONE thing that would make Music Mind Academy significantly better? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Your most important suggestion..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-20"
            />
          </div>

          {/* Q7: Colleague Response */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              If a colleague asked you about Music Mind Academy right now, what would you tell them?
            </p>
            <textarea
              value={colleagueResponse}
              onChange={(e) => setColleagueResponse(e.target.value)}
              placeholder="What would you say?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-20"
            />
          </div>

          {/* Q8: Student Quotes */}
          <div>
            <p className="font-medium text-gray-800 mb-1">
              Any quotes from your students about Music Mind Academy?
            </p>
            <p className="text-sm text-gray-500 mb-2">These help us understand what's working!</p>
            <textarea
              value={studentQuotes}
              onChange={(e) => setStudentQuotes(e.target.value)}
              placeholder="e.g., 'This is actually fun!' or 'Can we do this again?'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
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
