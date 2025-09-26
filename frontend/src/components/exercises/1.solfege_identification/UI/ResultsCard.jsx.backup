import React from 'react';
import { RotateCcw, Star, Trophy, CheckCircle } from 'lucide-react';

const ResultsCard = ({
  exerciseComplete,
  score,
  pattern,
  onTryAgain,
  onClose
}) => {
  if (!exerciseComplete) return null;

  const percentage = Math.round(
    (score / pattern.filter((n) => n.type !== 'rest').length) * 100
  );
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div
            className={`${
              isExcellent ? 'bg-yellow-500' : isGood ? 'bg-blue-500' : 'bg-green-500'
            } text-white p-4 rounded-lg`}
          >
            {isExcellent ? (
              <Trophy className="w-8 h-8" />
            ) : isGood ? (
              <Star className="w-8 h-8" />
            ) : (
              <CheckCircle className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isExcellent ? 'Excellent!' : isGood ? 'Well Done!' : 'Good Try!'}
            </h2>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {percentage}%
            </div>
            <div className="text-gray-600">
              {score} out of {pattern.filter((n) => n.type !== 'rest').length} correct
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onTryAgain}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Submit Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;