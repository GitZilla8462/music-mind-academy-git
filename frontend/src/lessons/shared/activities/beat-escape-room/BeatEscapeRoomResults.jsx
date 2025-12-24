// BeatEscapeRoomResults.jsx - Final score and results screen (Chromebook optimized)

import React, { useEffect, useState } from 'react';
import { RotateCcw, Plus, Copy, Check, Save } from 'lucide-react';
import { sounds } from './beatEscapeRoomConfig';

const BeatEscapeRoomResults = ({
  score,
  totalLocks,
  roomCode,
  mode,
  onPlayAgain,
  onCreateNew,
  onExit,
  onSave,
  isSaved = false
}) => {
  const [copied, setCopied] = useState(false);
  const maxScore = totalLocks * 100;
  const percentage = Math.round((score / maxScore) * 100);

  const getRating = () => {
    if (percentage >= 90) return { stars: 3, emoji: '🏆', message: 'Perfect!' };
    if (percentage >= 70) return { stars: 2, emoji: '🎉', message: 'Great!' };
    if (percentage >= 50) return { stars: 1, emoji: '👍', message: 'Nice!' };
    return { stars: 0, emoji: '🎵', message: 'Keep trying!' };
  };

  const rating = getRating();

  useEffect(() => {
    sounds.escape();
  }, []);

  const handleCopyCode = async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4 overflow-auto">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2 animate-bounce">{rating.emoji}</div>
        <h1 className="text-2xl font-bold text-white">ESCAPED!</h1>
        <p className="text-purple-200 text-sm">{rating.message}</p>
      </div>

      {/* Compact Score Card */}
      <div className="bg-gray-800 rounded-xl p-4 w-full max-w-sm mb-4">
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-3">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className={`text-3xl ${i <= rating.stars ? 'text-yellow-400' : 'text-gray-600'}`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="text-center mb-3">
          <div className="text-4xl font-bold text-white">{score}</div>
          <div className="text-gray-400 text-xs">of {maxScore} pts</div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-gray-700 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-400">{totalLocks}</div>
            <div className="text-gray-400 text-xs">Locks</div>
          </div>
          <div className="flex-1 bg-gray-700 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-400">{percentage}%</div>
            <div className="text-gray-400 text-xs">Accuracy</div>
          </div>
        </div>

        {/* Share Code */}
        {roomCode && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-gray-400 text-xs">Code:</span>
            <div className="bg-gray-900 px-3 py-1 rounded text-lg font-mono font-bold text-white tracking-wider">
              {roomCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copied ? <Check className="text-green-400" size={16} /> : <Copy className="text-gray-300" size={16} />}
            </button>
          </div>
        )}

        {/* Save Status */}
        {isSaved && (
          <div className="text-center text-green-400 text-xs flex items-center justify-center gap-1">
            <Check size={14} /> Saved
          </div>
        )}

        {onSave && !isSaved && (
          <button
            onClick={onSave}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Again
          </button>
        )}
        <button
          onClick={onCreateNew}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold flex items-center justify-center gap-2"
        >
          <Plus size={18} /> New
        </button>
      </div>

      {onExit && (
        <button
          onClick={onExit}
          className="mt-4 text-gray-400 hover:text-white text-sm"
        >
          Exit
        </button>
      )}
    </div>
  );
};

export default BeatEscapeRoomResults;
