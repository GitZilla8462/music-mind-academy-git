import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const ExerciseHeader = ({
  config,
  onClose,
  onTryAgain,
  exerciseComplete,
  pattern,
  currentIndex
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {config.title || 'Solfege Exercise'}
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              {config.subtitle || 'Solfege Identification Exercise'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!exerciseComplete && (
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Progress:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {pattern.filter(
                  (note, idx) => idx <= currentIndex && note.type !== 'rest'
                ).length}{' '}
                / {pattern.filter((n) => n.type !== 'rest').length}
              </span>
            </div>
          )}
          <button
            onClick={onTryAgain}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseHeader;