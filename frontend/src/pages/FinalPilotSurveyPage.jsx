import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { saveFinalPilotSurveyStandalone } from '../firebase/analytics';

const FinalPilotSurveyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [disappointment, setDisappointment] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');
  const [primaryBenefit, setPrimaryBenefit] = useState('');
  const [previousTool, setPreviousTool] = useState('');
  const [previousOther, setPreviousOther] = useState('');
  const [comparison, setComparison] = useState('');
  const [wouldBuy, setWouldBuy] = useState('');
  const [npsScore, setNpsScore] = useState(0);
  const [testimonialConsent, setTestimonialConsent] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(1);

  const disappointmentOptions = [
    { id: 'very', label: 'Very disappointed' },
    { id: 'somewhat', label: 'Somewhat disappointed' },
    { id: 'not', label: 'Not disappointed' }
  ];

  const previousToolOptions = [
    { id: 'nothing', label: 'Nothing' },
    { id: 'chrome-music-lab', label: 'Chrome Music Lab' },
    { id: 'bandlab', label: 'BandLab' },
    { id: 'soundtrap', label: 'Soundtrap' },
    { id: 'garageband', label: 'GarageBand' },
    { id: 'noteflight', label: 'Noteflight' },
    { id: 'other', label: 'Other' }
  ];

  const comparisonOptions = [
    { id: 'much-worse', label: 'Much worse' },
    { id: 'somewhat-worse', label: 'Somewhat worse' },
    { id: 'same', label: 'About the same' },
    { id: 'somewhat-better', label: 'Somewhat better' },
    { id: 'much-better', label: 'Much better' }
  ];

  const buyOptions = [
    { id: 'definitely-yes', label: 'Definitely yes' },
    { id: 'probably-yes', label: 'Probably yes' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'probably-not', label: 'Probably not' },
    { id: 'definitely-not', label: 'Definitely not' }
  ];

  const testimonialOptions = [
    { id: 'yes-named', label: 'Yes, with my name and school' },
    { id: 'yes-anonymous', label: 'Yes, but keep it anonymous' },
    { id: 'no', label: 'No' }
  ];

  const canSubmitPage1 = disappointment && targetTeacher.trim() && primaryBenefit.trim();
  const canSubmitPage2 = previousTool && comparison && wouldBuy && npsScore > 0 && testimonialConsent;

  const handleSubmit = async () => {
    if (!canSubmitPage2) return;
    setSubmitting(true);
    try {
      await saveFinalPilotSurveyStandalone({
        teacherEmail: email,
        disappointment,
        targetTeacher: targetTeacher.trim(),
        primaryBenefit: primaryBenefit.trim(),
        previousTool: previousTool === 'other' ? `Other: ${previousOther}` : previousTool,
        comparison,
        wouldBuy,
        npsScore,
        testimonialConsent,
        finalFeedback: finalFeedback.trim(),
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
          <div className="flex gap-1 mt-3">
            <div className={`h-1 flex-1 rounded ${page >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1 flex-1 rounded ${page >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {page === 1 && (
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Q1: PMF Question */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-3">
                How would you feel if you could no longer use Music Mind Academy? <span className="text-red-500">*</span>
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

            {/* Q2: Target Teacher */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What type of teacher would benefit MOST from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={targetTeacher}
                onChange={(e) => setTargetTeacher(e.target.value)}
                placeholder="e.g., Middle school general music teachers with limited tech experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>

            {/* Q3: Primary Benefit */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What is the PRIMARY benefit you got from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={primaryBenefit}
                onChange={(e) => setPrimaryBenefit(e.target.value)}
                placeholder="e.g., Students can create music without instrument skills..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Q4: Previous Tool */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Before this pilot, what were you using for digital composition? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {previousToolOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPreviousTool(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      previousTool === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {previousTool === 'other' && (
                <input
                  type="text"
                  value={previousOther}
                  onChange={(e) => setPreviousOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 mt-2"
                />
              )}
            </div>

            {/* Q5: Comparison */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Compared to what you used before, Music Mind Academy is: <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {comparisonOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setComparison(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      comparison === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q6: Would Buy */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                If Music Mind Academy cost $49/year, would you buy it? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {buyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setWouldBuy(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      wouldBuy === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q7: NPS */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Would you recommend Music Mind Academy to a colleague? <span className="text-red-500">*</span>
              </p>
              <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNpsScore(num)}
                    className={`w-9 h-9 rounded-lg border-2 text-sm font-medium transition-all ${
                      npsScore === num
                        ? num <= 6
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : num <= 8
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Q8: Testimonial */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Can we use your feedback as a testimonial? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {testimonialOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTestimonialConsent(option.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm transition-all ${
                      testimonialConsent === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q9: Final Feedback */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                Any final feedback or suggestions?
              </p>
              <textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                placeholder="Optional - anything else you'd like to share"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-16"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {page === 1 ? (
            <button
              onClick={() => setPage(2)}
              disabled={!canSubmitPage1}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !canSubmitPage1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              Next
            </button>
          ) : (
            <>
              <button
                onClick={() => setPage(1)}
                className="flex-1 py-3 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmitPage2 || submitting}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  !canSubmitPage2 || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {submitting ? 'Saving...' : 'Submit Survey'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalPilotSurveyPage;
