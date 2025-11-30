// Sectional Loop Builder Results View - Shows when teacher advances to results
// Big celebration for top 3 winners with generated names
// src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderResults.jsx

import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';

const SectionalLoopBuilderResults = ({ sessionData }) => {
  const [winners, setWinners] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (!sessionData?.studentsJoined) return;
    
    // Get top 3 winners
    const students = Object.entries(sessionData.studentsJoined)
      .map(([id, data]) => ({
        id,
        name: data.playerName || data.displayName || data.name || 'Student',
        score: data.score || 0,
        playerColor: data.playerColor || '#3B82F6',
        playerEmoji: data.playerEmoji || '🎵'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    setWinners(students);
    
    // Trigger animation
    setTimeout(() => setShowAnimation(true), 100);
  }, [sessionData]);
  
  const getMedal = (rank) => {
    if (rank === 1) return { icon: '🥇', label: '1st Place', color: 'from-yellow-400 to-yellow-600' };
    if (rank === 2) return { icon: '🥈', label: '2nd Place', color: 'from-gray-300 to-gray-400' };
    if (rank === 3) return { icon: '🥉', label: '3rd Place', color: 'from-orange-400 to-orange-600' };
  };
  
  const totalStudents = sessionData?.studentsJoined ? Object.keys(sessionData.studentsJoined).length : 0;
  const totalPoints = winners.reduce((sum, w) => sum + w.score, 0);
  
  return (
    <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white flex items-center justify-center overflow-hidden">
      {/* Confetti Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 ${showAnimation ? 'animate-confetti' : ''}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#10B981', '#14B8A6', '#22D3EE', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)]
            }}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <div className={`mb-12 ${showAnimation ? 'animate-bounce-in' : 'opacity-0'}`}>
          <h1 className="text-7xl font-bold mb-4 flex items-center justify-center">
            <Trophy className="mr-4 text-yellow-400" size={80} />
            Epic Wildlife Champions!
          </h1>
          <p className="text-3xl opacity-80">Congratulations to our winners!</p>
        </div>
        
        {/* Winners Podium */}
        <div className="flex items-end justify-center space-x-8 mb-12">
          {/* 2nd Place */}
          {winners[1] && (
            <div className={`${showAnimation ? 'animate-slide-up-1' : 'opacity-0'}`}>
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-2xl p-8 shadow-2xl">
                {/* Player Emoji */}
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${winners[1].playerColor}20` }}
                >
                  {winners[1].playerEmoji}
                </div>
                
                <div className="text-6xl mb-4">{getMedal(2).icon}</div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: winners[1].playerColor }}
                >
                  {winners[1].name}
                </h3>
                <div className="text-4xl font-bold">{winners[1].score}</div>
                <div className="text-lg opacity-80">points</div>
              </div>
              <div className="bg-gray-500 h-32 w-full"></div>
            </div>
          )}
          
          {/* 1st Place */}
          {winners[0] && (
            <div className={`${showAnimation ? 'animate-slide-up-0' : 'opacity-0'} transform scale-110`}>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-2xl p-10 shadow-2xl">
                {/* Player Emoji */}
                <div 
                  className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl animate-pulse"
                  style={{ backgroundColor: `${winners[0].playerColor}20` }}
                >
                  {winners[0].playerEmoji}
                </div>
                
                <div className="text-7xl mb-4 animate-pulse">{getMedal(1).icon}</div>
                <h3 
                  className="text-3xl font-bold mb-2"
                  style={{ color: winners[0].playerColor }}
                >
                  {winners[0].name}
                </h3>
                <div className="text-5xl font-bold">{winners[0].score}</div>
                <div className="text-xl opacity-90">points</div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} className="text-white fill-current" />
                  ))}
                </div>
              </div>
              <div className="bg-yellow-700 h-40 w-full"></div>
            </div>
          )}
          
          {/* 3rd Place */}
          {winners[2] && (
            <div className={`${showAnimation ? 'animate-slide-up-2' : 'opacity-0'}`}>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-2xl p-8 shadow-2xl">
                {/* Player Emoji */}
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${winners[2].playerColor}20` }}
                >
                  {winners[2].playerEmoji}
                </div>
                
                <div className="text-6xl mb-4">{getMedal(3).icon}</div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: winners[2].playerColor }}
                >
                  {winners[2].name}
                </h3>
                <div className="text-4xl font-bold">{winners[2].score}</div>
                <div className="text-lg opacity-80">points</div>
              </div>
              <div className="bg-orange-700 h-24 w-full"></div>
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 inline-block ${showAnimation ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="flex items-center justify-center space-x-12">
            <div>
              <div className="text-4xl font-bold text-green-400">{totalStudents}</div>
              <div className="text-lg opacity-80">Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-lg opacity-80">Total Points</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0) translateY(-50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateY(0);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up-0 {
          0% {
            transform: translateY(100px) scale(1.1);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes slide-up-1 {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up-2 {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        .animate-confetti {
          animation: confetti 4s linear infinite;
        }
        
        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
        }
        
        .animate-slide-up-0 {
          animation: slide-up-0 0.8s ease-out 0.5s forwards;
        }
        
        .animate-slide-up-1 {
          animation: slide-up-1 0.8s ease-out 0.7s forwards;
        }
        
        .animate-slide-up-2 {
          animation: slide-up-2 0.8s ease-out 0.9s forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out 1.2s forwards;
        }
      `}</style>
    </div>
  );
};

export default SectionalLoopBuilderResults;