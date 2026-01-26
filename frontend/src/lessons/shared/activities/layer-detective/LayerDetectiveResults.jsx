// Layer Detective Results View - Shows when teacher ends activity
// Full ranked list of all students
// src/lessons/shared/activities/layer-detective/LayerDetectiveResults.jsx

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const LayerDetectiveResults = ({ sessionData, onPlayAgain, onNextActivity }) => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!sessionData?.studentsJoined) return;

    // Get all students sorted by score
    const allStudents = Object.entries(sessionData.studentsJoined)
      .map(([id, data]) => ({
        id,
        name: data.playerName || data.displayName || data.name || 'Student',
        score: data.layerDetectiveScore || data.score || 0,
        playerColor: data.playerColor || '#3B82F6',
        playerEmoji: data.playerEmoji || '🎵'
      }))
      .sort((a, b) => b.score - a.score);

    setStudents(allStudents);
  }, [sessionData]);

  const getRankDisplay = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRowStyle = (index) => {
    if (index === 0) return 'bg-yellow-500/30 border-yellow-500/50';
    if (index === 1) return 'bg-gray-400/20 border-gray-400/40';
    if (index === 2) return 'bg-orange-500/20 border-orange-500/40';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 flex items-center justify-center gap-4">
          <Trophy className="text-yellow-400" size={56} />
          Layer Detective Results
        </h1>
        <p className="text-xl opacity-70">{students.length} players</p>
      </div>

      {/* Ranked List */}
      <div className="w-full max-w-2xl max-h-[60vh] overflow-y-auto rounded-2xl bg-black/20 p-4">
        <div className="space-y-2">
          {students.map((student, idx) => (
            <div
              key={student.id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${getRowStyle(idx)}`}
            >
              {/* Rank */}
              <span className={`w-12 text-center font-bold ${idx < 3 ? 'text-3xl' : 'text-xl text-white/60'}`}>
                {getRankDisplay(idx)}
              </span>

              {/* Player Badge */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: `${student.playerColor}30`, border: `2px solid ${student.playerColor}` }}
              >
                {student.playerEmoji}
              </div>

              {/* Name */}
              <span className={`flex-1 font-semibold truncate ${idx === 0 ? 'text-2xl' : 'text-xl'}`}>
                {student.name}
              </span>

              {/* Score */}
              <span className={`font-bold ${idx === 0 ? 'text-3xl text-yellow-400' : idx < 3 ? 'text-2xl' : 'text-xl text-white/80'}`}>
                {student.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayerDetectiveResults;
