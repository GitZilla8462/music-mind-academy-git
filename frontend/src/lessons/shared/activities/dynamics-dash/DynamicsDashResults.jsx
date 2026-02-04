// File: /src/lessons/shared/activities/dynamics-dash/DynamicsDashResults.jsx
// Dynamics Dash - Results Leaderboard (Teacher Presentation View)

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

const DynamicsDashResults = ({ sessionData }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');
  const [leaderboard, setLeaderboard] = useState([]);

  // Subscribe to students for leaderboard
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.dynamicsDashScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      // Sort by score descending
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Split into top 3 and rest
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
      {/* Header */}
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-5xl font-black mb-2">Dynamics Dash Results</h1>
        <p className="text-2xl text-white/70">Congratulations to all players!</p>
      </div>

      {/* Main content */}
      <div className="flex-1 px-8 pb-8 flex flex-col min-h-0">
        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-2 ring-4 ring-gray-300"
                  style={{ backgroundColor: topThree[1].playerColor }}
                >
                  {topThree[1].playerEmoji || topThree[1].name.charAt(0)}
                </div>
                <div className="text-xl font-bold truncate max-w-32">{topThree[1].name}</div>
                <div className="text-3xl font-black text-gray-300">{topThree[1].score}</div>
                <div className="bg-gray-400 w-28 h-24 rounded-t-xl flex items-center justify-center mt-2">
                  <span className="text-5xl">🥈</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-5xl mb-2 ring-4 ring-yellow-400 animate-pulse"
                  style={{ backgroundColor: topThree[0].playerColor }}
                >
                  {topThree[0].playerEmoji || topThree[0].name.charAt(0)}
                </div>
                <div className="text-2xl font-bold truncate max-w-40">{topThree[0].name}</div>
                <div className="text-4xl font-black text-yellow-400">{topThree[0].score}</div>
                <div className="bg-yellow-500 w-32 h-32 rounded-t-xl flex items-center justify-center mt-2">
                  <span className="text-6xl">🥇</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-2 ring-4 ring-amber-600"
                  style={{ backgroundColor: topThree[2].playerColor }}
                >
                  {topThree[2].playerEmoji || topThree[2].name.charAt(0)}
                </div>
                <div className="text-lg font-bold truncate max-w-28">{topThree[2].name}</div>
                <div className="text-2xl font-black text-amber-500">{topThree[2].score}</div>
                <div className="bg-amber-600 w-24 h-16 rounded-t-xl flex items-center justify-center mt-2">
                  <span className="text-4xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of leaderboard */}
        {rest.length > 0 && (
          <div className="flex-1 bg-black/20 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold">All Players</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-64">
              {rest.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5"
                >
                  <span className="w-8 text-center font-bold text-sm text-white/70">
                    #{idx + 4}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: student.playerColor }}
                  >
                    {student.playerEmoji || student.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-sm">{student.name}</span>
                  <span className="font-bold text-sm">{student.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {leaderboard.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl text-white/50">No scores recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicsDashResults;
