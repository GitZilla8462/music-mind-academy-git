import React from 'react';
import { useAdminData } from './AdminDataContext';

const LessonAnalyticsPage = () => {
  const { pilotSessions, formatDuration } = useAdminData();

  const lessonData = {};
  const lessons = ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5'];

  lessons.forEach(lessonId => {
    lessonData[lessonId] = { sessions: [], totalDuration: 0, stageTimes: {}, completed: 0 };
  });

  pilotSessions.forEach(session => {
    const lessonId = session.lessonRoute?.includes('lesson1') ? 'lesson1'
      : session.lessonRoute?.includes('lesson2') ? 'lesson2'
      : session.lessonRoute?.includes('lesson3') ? 'lesson3'
      : session.lessonRoute?.includes('lesson4') ? 'lesson4'
      : session.lessonRoute?.includes('lesson5') ? 'lesson5'
      : null;

    if (lessonId && lessonData[lessonId]) {
      lessonData[lessonId].sessions.push(session);
      lessonData[lessonId].totalDuration += session.duration || 0;
      if (session.completed) lessonData[lessonId].completed++;

      if (session.stageTimes) {
        Object.entries(session.stageTimes).forEach(([stage, time]) => {
          if (!lessonData[lessonId].stageTimes[stage]) {
            lessonData[lessonId].stageTimes[stage] = { total: 0, count: 0 };
          }
          lessonData[lessonId].stageTimes[stage].total += time;
          lessonData[lessonId].stageTimes[stage].count++;
        });
      }
    }
  });

  const lessonNames = {
    lesson1: 'Lesson 1: Mood & Expression', lesson2: 'Lesson 2: Instrumentation',
    lesson3: 'Lesson 3: Texture', lesson4: 'Lesson 4: Form', lesson5: 'Lesson 5: Capstone'
  };
  const lessonColors = {
    lesson1: 'blue', lesson2: 'purple', lesson3: 'green', lesson4: 'orange', lesson5: 'pink'
  };

  return (
    <div className="space-y-6">
      {lessons.map(lessonId => {
        const data = lessonData[lessonId];
        const sessionCount = data.sessions.length;
        const avgDuration = sessionCount > 0 ? data.totalDuration / sessionCount : 0;
        const completionRate = sessionCount > 0 ? Math.round((data.completed / sessionCount) * 100) : 0;

        const sortedStages = Object.entries(data.stageTimes)
          .map(([stage, stats]) => ({ stage, total: stats.total, avg: stats.count > 0 ? stats.total / stats.count : 0, count: stats.count }))
          .sort((a, b) => b.total - a.total);

        const maxTime = sortedStages.length > 0 ? sortedStages[0].total : 0;

        return (
          <div key={lessonId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 border-b bg-${lessonColors[lessonId]}-50 border-${lessonColors[lessonId]}-200`}>
              <h2 className="text-lg font-semibold text-gray-800">{lessonNames[lessonId]}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sessionCount}</div>
                  <div className="text-sm text-gray-500">Sessions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(avgDuration)}</div>
                  <div className="text-sm text-gray-500">Avg Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>

              {sortedStages.length > 0 ? (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Time by Activity</h3>
                  <div className="space-y-2">
                    {sortedStages.map(({ stage, total, avg }) => (
                      <div key={stage} className="flex items-center gap-3">
                        <div className="w-40 text-sm text-gray-600 truncate" title={stage}>{stage}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${maxTime > 0 ? (total / maxTime) * 100 : 0}%`, minWidth: '40px' }}>
                            <span className="text-xs text-white font-medium">{formatDuration(total)}</span>
                          </div>
                        </div>
                        <div className="w-24 text-xs text-gray-500 text-right">avg: {formatDuration(avg)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">No activity data yet</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LessonAnalyticsPage;
