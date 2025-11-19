// Layer Detective Presentation View - ONLY for Layer Detective activity
// Shows ALL students in scrollable list with generated names
// src/lessons/shared/activities/layer-detective/LayerDectectivePresentationView.jsx
// ✅ FIXED: Now correctly reads playerName from Firebase (not displayName)

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Music, Star } from 'lucide-react';

const LayerDetectivePresentationView = ({ sessionData, onEndActivity }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  
  // Update leaderboard with ALL students - NOW WITH GENERATED NAMES
  useEffect(() => {
    if (!sessionData?.studentsJoined) return;
    
    const students = Object.entries(sessionData.studentsJoined)
      .map(([id, data]) => ({
        id,
        name: data.playerName || data.displayName || data.name || 'Student',  // ✅ Check playerName FIRST
        score: data.score || 0,
        playerColor: data.playerColor || '#3B82F6',        // ✅ Player color
        playerEmoji: data.playerEmoji || '🎵',             // ✅ Player emoji
        joinedAt: data.joinedAt
      }))
      .sort((a, b) => b.score - a.score);
    
    console.log('📊 Leaderboard updated:', students.length, 'students');
    console.log('🎮 Sample student data:', students[0]); // Debug: see what data we're getting
    
    setLeaderboard(students);
  }, [sessionData]);
  
  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const totalStudents = leaderboard.length;
  const totalPoints = leaderboard.reduce((sum, s) => sum + s.score, 0);
  const averageScore = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;
  
  return (
    <div className="h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold flex items-center mb-2">
              <Music className="mr-4" size={56} />
              Layer Detective
            </h1>
            <p className="text-2xl opacity-80">
              How many layers can you hear?
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className="bg-white/10 px-6 py-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Clock size={32} />
                <div>
                  <div className="text-3xl font-mono font-bold">{formatTime(timeElapsed)}</div>
                  <div className="text-sm opacity-80">Time Playing</div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-white/10 px-6 py-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users size={32} />
                <div>
                  <div className="text-3xl font-bold">{totalStudents}</div>
                  <div className="text-sm opacity-80">Players</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100%-180px)]">
        {/* Left: Top 3 Winners */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30">
          <h2 className="text-4xl font-bold mb-8 text-center flex items-center justify-center">
            <Trophy className="mr-3 text-yellow-400" size={48} />
            Top Players
          </h2>
          
          <div className="space-y-6">
            {leaderboard.slice(0, 3).map((student, index) => (
              <div
                key={student.id}
                className={`
                  bg-gradient-to-r from-yellow-500/30 to-orange-500/30 
                  rounded-2xl p-6 border-2 border-yellow-400/50
                  transform transition-all duration-500 hover:scale-105
                  ${index === 0 ? 'shadow-2xl shadow-yellow-500/40' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Player Emoji Badge */}
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                      style={{ backgroundColor: `${student.playerColor}20` }}
                    >
                      {student.playerEmoji}
                    </div>
                    
                    <div className="text-6xl">{getMedal(index + 1)}</div>
                    <div>
                      <div 
                        className="text-3xl font-bold"
                        style={{ color: student.playerColor }}
                      >
                        {student.name}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(3 - index)].map((_, i) => (
                          <Star key={i} size={20} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-yellow-400">{student.score}</div>
                    <div className="text-lg opacity-80">points</div>
                  </div>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Music size={64} className="mx-auto mb-4 opacity-40" />
                <p className="text-2xl">Waiting for players to start...</p>
              </div>
            )}
          </div>
          
          {/* Class Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm opacity-80">Total Points</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{averageScore}</div>
              <div className="text-sm opacity-80">Average Score</div>
            </div>
          </div>
        </div>

        {/* Right: ALL Players (Scrollable) */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-2xl font-bold mb-4 sticky top-0 bg-black/20 p-4 -m-4 mb-4 rounded-t-2xl">
            All Players ({totalStudents})
          </h3>
          
          <div className="h-[calc(100%-80px)] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {leaderboard.map((student, index) => {
              const isTop3 = index < 3;
              
              return (
                <div
                  key={student.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${isTop3 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' : 'bg-white/5'}
                    hover:bg-white/10 transition-all duration-200
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {/* Player Emoji */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${student.playerColor}20` }}
                    >
                      {student.playerEmoji}
                    </div>
                    
                    <div className={`font-bold w-12 text-center ${isTop3 ? 'text-2xl' : 'text-lg opacity-60'}`}>
                      {getMedal(index + 1)}
                    </div>
                    <div 
                      className={`font-semibold ${isTop3 ? 'text-xl' : 'text-lg'}`}
                      style={{ color: isTop3 ? student.playerColor : 'white' }}
                    >
                      {student.name}
                    </div>
                  </div>
                  <div className={`font-bold ${isTop3 ? 'text-2xl' : 'text-xl'}`}>
                    {student.score}
                  </div>
                </div>
              );
            })}
            
            {/* Spacer at bottom for scroll */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LayerDetectivePresentationView;