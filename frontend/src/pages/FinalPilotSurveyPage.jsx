import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { saveFinalPilotSurveyStandalone } from '../firebase/analytics';

const FinalPilotSurveyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [disappointment, setDisappointment] = useState('');
  const [wouldPay, setWouldPay] = useState('');
  const [biggestFrustration, setBiggestFrustration] = useState('');
  const [wouldMiss, setWouldMiss] = useState('');
  const [weakestLesson, setWeakestLesson] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');
  const [otherComments, setOtherComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const disappointmentOptions = [
    { id: 'very', label: 'Very disappointed' },
    { id: 'somewhat', label: 'Somewhat disappointed' },
    { id: 'not', label: 'Not disappointed' }
  ];

  const payOptions = [
    { id: '0', label: '$0 - I wouldn\'t pay' },
    { id: '25', label: '$25/year' },
    { id: '49', label: '$49/year' },
    { id: '75', label: '$75/year' },
    { id: '99', label: '$99/year' },
    { id: '99+', label: 'More than $99/year' }
  ];

  const canSubmit = disappointment && wouldPay && biggestFrustration.trim() && wouldMiss.trim() && targetTeacher.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await saveFinalPilotSurveyStandalone({
        teacherEmail: email,
        disappointment,
        wouldPay,
        biggestFrustration: biggestFrustration.trim(),
        wouldMiss: wouldMiss.trim(),
        weakestLesson: weakestLesson.trim(),
        targetTeacher: targetTeacher.trim(),
        otherComments: otherComments.trim(),
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
            Your feedback directly shapes what we build next. We truly appreciate you being part of this pilot.
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
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={24} />
            Final Feedback Survey
          </h1>
          <p className="text-amber-100 text-sm mt-1">
            You completed the pilot! Your feedback shapes our future.
          </p>
          {email && (
            <p className="text-amber-200 text-xs mt-2">{email}</p>
          )}
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Q1: PMF Question */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-gray-800 mb-3">
              How disappointed would you be if Music Mind Academy disappeared tomorrow? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {disappointmentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDisappointment(option.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    disappointment === option.id
                      ? option.id === 'very'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : option.id === 'somewhat'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Would Pay */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              How much would you pay for Music Mind Academy per year? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {payOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setWouldPay(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    wouldPay === option.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Biggest Frustration */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's the #1 thing that almost made you quit or frustrated you most? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={biggestFrustration}
              onChange={(e) => setBiggestFrustration(e.target.value)}
              placeholder="Be honest — this helps us fix the biggest problems"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
            />
          </div>

          {/* Q4: Would Miss */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's the #1 thing you'd miss if it went away? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={wouldMiss}
              onChange={(e) => setWouldMiss(e.target.value)}
              placeholder="What's the most valuable part for you?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
            />
          </div>

          {/* Q5: Weakest Lesson */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Which lesson was the weakest, and why?
            </p>
            <textarea
              value={weakestLesson}
              onChange={(e) => setWeakestLesson(e.target.value)}
              placeholder="e.g., Lesson 3 felt too long because..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
            />
          </div>

          {/* Q6: Target Teacher */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What type of teacher would benefit most from Music Mind Academy? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={targetTeacher}
              onChange={(e) => setTargetTeacher(e.target.value)}
              placeholder="e.g., Middle school general music teachers with limited tech experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
            />
          </div>

          {/* Q7: Other Comments */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Any other comments?
            </p>
            <textarea
              value={otherComments}
              onChange={(e) => setOtherComments(e.target.value)}
              placeholder="Optional - anything else you'd like to share"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-16"
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
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit Survey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalPilotSurveyPage;
