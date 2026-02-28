import React from 'react';
import { MessageSquare, Star, BarChart3 } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const SurveysPage = () => {
  const { midPilotSurveys, finalPilotSurveys, quickSurveys, formatDate } = useAdminData();

  return (
    <div className="space-y-6">
      {/* Mid-Pilot Surveys */}
      <div className="bg-white rounded-xl border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-200 bg-purple-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-purple-600" />
            Mid-Pilot Surveys (After Lesson 3)
            <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-700 text-sm rounded-full">{midPilotSurveys.length}</span>
          </h2>
        </div>
        {midPilotSurveys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No mid-pilot surveys submitted yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {midPilotSurveys.map((survey) => (
              <div key={survey.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono font-bold text-purple-600">
                      {survey.teacherEmail || survey.sessionCode || survey.id}
                    </span>
                    {survey.source === 'email-link' ? (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">via email</span>
                    ) : (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{survey.studentCount} students</span>
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{formatDate(survey.savedAt || survey.submittedAt)}</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-700 mb-1">Favorite Feature</p>
                    <p className="text-gray-800">{survey.favoriteFeature || '—'}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-orange-700 mb-1">Improvement Suggestion</p>
                    <p className="text-gray-800">{survey.improvementSuggestion || '—'}</p>
                  </div>
                  {survey.skippedParts && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-700 mb-1">Skipped/Modified Parts</p>
                      <p className="text-gray-800">{survey.skippedParts}</p>
                    </div>
                  )}
                  {survey.studentQuotes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">Student Quotes</p>
                      <p className="text-gray-800 italic">"{survey.studentQuotes}"</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Will finish all 5 lessons?</span>
                    <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                      survey.onTrack === 'yes' ? 'bg-green-100 text-green-700' :
                      survey.onTrack === 'probably' ? 'bg-blue-100 text-blue-700' :
                      survey.onTrack === 'not-sure' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {survey.onTrack === 'yes' ? 'Yes' : survey.onTrack === 'probably' ? 'Probably' :
                       survey.onTrack === 'not-sure' ? 'Not Sure' : survey.onTrack === 'no' ? 'No' : survey.onTrack || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Pilot Surveys */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-green-200 bg-green-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star size={20} className="text-green-600" />
            Final Pilot Surveys (After Lesson 5)
            <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-700 text-sm rounded-full">{finalPilotSurveys.length}</span>
          </h2>
        </div>
        {finalPilotSurveys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No final surveys submitted yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {finalPilotSurveys.map((survey) => (
              <div key={survey.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono font-bold text-green-600">
                      {survey.teacherEmail || survey.sessionCode || survey.id}
                    </span>
                    {survey.source === 'email-link' ? (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">via email</span>
                    ) : (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{survey.studentCount} students</span>
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{formatDate(survey.savedAt || survey.submittedAt)}</span>
                </div>
                <div className="space-y-3">
                  {survey.pmfScore && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-700 mb-1">Product-Market Fit Score</p>
                      <p className="text-gray-800 font-semibold">{survey.pmfScore}</p>
                    </div>
                  )}
                  {survey.wouldRecommend !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Would recommend?</span>
                      <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                        survey.wouldRecommend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {survey.wouldRecommend ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {survey.feedback && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">Feedback</p>
                      <p className="text-gray-800">{survey.feedback}</p>
                    </div>
                  )}
                  {Object.entries(survey).filter(([key]) =>
                    !['id', 'sessionCode', 'studentCount', 'savedAt', 'submittedAt', 'surveyType',
                      'pmfScore', 'wouldRecommend', 'feedback'].includes(key)
                  ).map(([key, value]) => (
                    value && typeof value === 'string' && value.trim() && (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-gray-800">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Feedback */}
      <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Quick Session Feedback
            <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-700 text-sm rounded-full">{quickSurveys.length}</span>
          </h2>
        </div>
        {quickSurveys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No quick feedback submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quickSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-blue-600">{survey.sessionCode || survey.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      {survey.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={16}
                              className={star <= survey.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                      {survey.feedback || survey.comment || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(survey.savedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveysPage;
