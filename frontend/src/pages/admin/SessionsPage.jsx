import React, { useState } from 'react';
import { Play, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const SessionsPage = () => {
  const { pilotSessions, formatDate, formatDuration, getLessonName } = useAdminData();
  const [expandedSessions, setExpandedSessions] = useState({});

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Play size={20} />
          Session History ({pilotSessions.length})
        </h2>
      </div>

      {pilotSessions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No sessions created yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pilotSessions.map((session) => {
                const isExpanded = expandedSessions[session.sessionCode];
                const hasStageData = session.stageTimes && Object.keys(session.stageTimes).length > 0;

                return (
                  <React.Fragment key={session.sessionCode}>
                    <tr className={`hover:bg-gray-50 ${hasStageData ? 'cursor-pointer' : ''}`}
                      onClick={() => hasStageData && setExpandedSessions(prev => ({
                        ...prev, [session.sessionCode]: !prev[session.sessionCode]
                      }))}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {hasStageData && (isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />)}
                          <span className="font-mono font-bold text-blue-600">{session.sessionCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.teacherEmail?.split('@')[0] || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {getLessonName(session.lessonId, session.lessonRoute).split(':')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.startTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.duration ? formatDuration(session.duration) : (
                          <span className="text-green-500 flex items-center gap-1"><Clock size={14} /> Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">{session.studentsJoined || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {session.completed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                        ) : (
                          <span className="text-gray-500">{session.lastStage}</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && hasStageData && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 mb-2">Time per Stage:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(session.stageTimes)
                                .sort((a, b) => b[1] - a[1])
                                .map(([stage, time]) => (
                                  <span key={stage} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">
                                    <span className="font-medium text-gray-700">{stage}:</span>{' '}
                                    <span className="text-blue-600">{formatDuration(time)}</span>
                                  </span>
                                ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
