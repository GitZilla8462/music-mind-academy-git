// src/components/student-dashboard/StudentProgressTab.jsx
import React from 'react';

const StudentProgressTab = ({ progress = {}, showToast }) => {
  // Mock progress data
  const mockProgress = {
    overallScore: 87,
    completedAssignments: 12,
    totalAssignments: 15,
    practiceHours: 24,
    currentStreak: 5,
    badges: ['Perfect Pitch', 'Practice Streak', 'Early Bird'],
    recentScores: [85, 92, 78, 96, 88]
  };

  const displayProgress = Object.keys(progress).length > 0 ? progress : mockProgress;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Progress</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {displayProgress.overallScore}%
          </div>
          <div className="text-gray-600">Overall Score</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {displayProgress.completedAssignments}/{displayProgress.totalAssignments}
          </div>
          <div className="text-gray-600">Assignments</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {displayProgress.practiceHours}h
          </div>
          <div className="text-gray-600">Practice Time</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {displayProgress.currentStreak}
          </div>
          <div className="text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Recent Scores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scores</h3>
        <div className="flex items-end space-x-2">
          {displayProgress.recentScores.map((score, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-green-500 rounded-t"
                style={{ height: `${score}px`, width: '24px' }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">{score}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges Earned</h3>
        <div className="flex flex-wrap gap-2">
          {displayProgress.badges.map((badge, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
            >
              🏆 {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressTab;